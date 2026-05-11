import Groq from 'groq-sdk';
import { supabase } from '../../lib/supabase';

// --- 1. RECHERCHE WEB (Tavily) ---
async function searchLocalInfo(userQuery, fullAddress, city) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return "";
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query: `${userQuery} à proximité de ${fullAddress}, ${city}`,
        search_depth: "advanced", max_results: 5, include_answer: true
      })
    });
    const data = await res.json();
    return data.answer || data.results?.map(r => r.content).join('\n---\n') || "";
  } catch (e) { return ""; }
}

// --- 2. DÉTECTION D'INTENTION (Mots-clés suggérés par Claude) ---
function isLocalQuery(msg) {
  const lower = msg.toLowerCase();
  const keywords = [
    'transport', 'bus', 'tram', 'gare', 'métro', 'vélo', 'boulangerie', 'restaurant', 
    'manger', 'dîner', 'déjeuner', 'pharmacie', 'supermarché', 'courses', 'épicerie', 
    'proche', 'près', 'quartier', 'visiter', 'activité', 'sortie', 'bar', 'café'
  ];
  return keywords.some(k => lower.includes(keyword));
}

// --- 3. ALERTE TELEGRAM ---
async function sendTelegramAlert(originalMsg, translatedMsg, propertyData) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  try {
    const { data: profile } = await supabase.from('profiles').select('telegram_chat_id').eq('id', propertyData.owner_id).single();
    if (!profile?.telegram_chat_id) return;
    let text = `🚨 *ALERTE MAJOR MARC*\n\n🏠 *Logement :* ${propertyData.name}\n💬 *Client :*\n"${originalMsg}"`;
    if (translatedMsg) text += `\n\n🇫🇷 *Traduction :*\n"${translatedMsg}"`;
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: profile.telegram_chat_id, text, parse_mode: 'Markdown' })
    });
  } catch (e) { console.error("Telegram Error:", e); }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Non autorisé');
  const { messagesHistory, propertyData, userLanguage } = req.body;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const lastUserMsg = messagesHistory[messagesHistory.length - 1]?.text || "";
  const langCode = userLanguage ? userLanguage.split('-')[0] : 'fr';

  try {
    const city = propertyData.city || '';
    const fullAddress = `${propertyData.street_number || ''} ${propertyData.address || ''}, ${city}`.trim();

    // A. RECHERCHE WEB (Si besoin détecté par le code)
    let searchResults = "";
    if (isLocalQuery(lastUserMsg)) {
      searchResults = await searchLocalInfo(lastUserMsg, fullAddress, city);
    }

    // B. RÉCUPÉRATION BASE DE CONNAISSANCES
    const { data: kb } = await supabase.from('knowledge_base').select('category, content').eq('property_id', propertyData.id);
    const formattedKB = kb?.map(item => `${item.category}: ${item.content}`).join('\n') || "";

    // C. CONSTRUCTION DU BLOC "ENVIRONNEMENT" (La fameuse logique Claude)
    const hostRecos = [propertyData.local_shops, propertyData.transport_info, propertyData.recommendations].filter(Boolean).join('\n');
    const neighborhoodContext = `
━━━ INFOS QUARTIER & ALENTOURS ━━━
${hostRecos || "L'hôte n'a pas laissé de recommandations spécifiques."}
${searchResults ? `\nCompléments trouvés en temps réel :\n${searchResults}` : ""}
`.trim();

    // D. PROMPT SYSTÈME (Épuré et puissant)
    const systemPrompt = `Tu es Marc, le majordome de "${propertyData.name}" à ${city}.
Identité : Humain, professionnel, chaleureux. Pas d'IA.
Règle : Réponds toujours dans la langue du voyageur. Sois concis (3 phrases max).

DONNÉES DU LOGEMENT :
- Adresse : ${fullAddress} (${propertyData.address_complement || ""})
- WiFi : ${propertyData.wifi_name || "Non renseigné"} / ${propertyData.wifi_password || "Non renseigné"}
- Check-in : Dès ${propertyData.check_in_hour || "15:00"} | Check-out : Avant ${propertyData.check_out_hour || "11:00"}
- Accès : ${propertyData.key_code ? `Code ${propertyData.key_code} (${propertyData.entrance_type})` : "Non renseigné"}
- Technique : Parking (${propertyData.parking_info || "Non renseigné"}), Instructions (${propertyData.checkin_instructions || "Non renseigné"}), Urgences (${propertyData.health_emergency_info || "Non renseigné"}).

${neighborhoodContext}

CONSIGNES PARTICULIÈRES :
${formattedKB}

RÈGLES D'OR :
1. Si une info technique (code, wifi, parking) est "Non renseigné", dis que tu contactes l'hôte.
2. Pour le quartier/transports, utilise les données ci-dessus pour répondre comme un expert local.
3. Ne cite JAMAIS tes sources ni les noms des sections.
4. Urgence : Termine par "Je préviens immédiatement votre hôte."`;

    const chatResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: 'system', content: systemPrompt }, ...messagesHistory.map(m => ({ role: m.role === 'marc' ? 'assistant' : 'user', content: m.text }))],
      temperature: 0.2, max_tokens: 400,
    });

    const responseText = chatResponse.choices[0].message.content;

    // Sauvegarde & Telegram (Inchangé)
    const newHistory = [...messagesHistory, { role: 'marc', text: responseText, timestamp: new Date().toISOString() }];
    await supabase.from('conversations').upsert({ property_id: propertyData.id, history: newHistory, last_message_at: new Date().toISOString() }, { onConflict: 'property_id' });

    if (responseText.toLowerCase().includes("je préviens immédiatement votre hôte")) {
        let translated = null;
        if (langCode !== 'fr') {
            const tr = await groq.chat.completions.create({ model: "llama-3.1-8b-instant", messages: [{role:'system', content:'Traduis en FR.'},{role:'user', content:lastUserMsg}]});
            translated = tr.choices[0].message.content;
        }
        await sendTelegramAlert(lastUserMsg, translated, propertyData);
    }

    res.status(200).json({ answer: responseText });

  } catch (error) {
    res.status(200).json({ answer: "Petit souci technique, je reviens vers vous." });
  }
}
