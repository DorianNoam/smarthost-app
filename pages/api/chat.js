import Groq from 'groq-sdk';
import { supabase } from '../../lib/supabase';

// --- 1. RECHERCHE WEB (Version Ultra-Précise) ---
async function searchLocalInfo(userQuery, fullAddress, city) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return "";
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        // ✅ On force Tavily à chercher des distances réelles et des noms d'arrêts précis
        query: `Noms exacts des arrêts de bus/tram et lignes à moins de 500m du ${fullAddress}, ${city}. Distances à pied précises.`,
        search_depth: "advanced", 
        max_results: 5, 
        include_answer: true
      })
    });
    const data = await res.json();
    return data.answer || data.results?.map(r => r.content).join('\n---\n') || "";
  } catch (e) { return ""; }
}

// --- 2. DÉTECTION D'INTENTION ---
function isLocalQuery(msg) {
  const lower = msg.toLowerCase();
  const keywords = [
    'transport', 'bus', 'tram', 'gare', 'métro', 'vélo', 'boulangerie', 'restaurant', 
    'manger', 'dîner', 'déjeuner', 'pharmacie', 'supermarché', 'courses', 'épicerie', 
    'proche', 'près', 'quartier', 'visiter', 'activité', 'sortie', 'bar', 'café'
  ];
  return keywords.some(k => lower.includes(k)); 
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

    // A. RECHERCHE WEB
    let searchResults = "";
    if (isLocalQuery(lastUserMsg)) {
      searchResults = await searchLocalInfo(lastUserMsg, fullAddress, city);
    }

    // B. RÉCUPÉRATION BASE DE CONNAISSANCES
    const { data: kb } = await supabase.from('knowledge_base').select('category, content').eq('property_id', propertyData.id);
    const formattedKB = kb?.map(item => `${item.category}: ${item.content}`).join('\n') || "";

    // C. CONSTRUCTION DU BLOC ENVIRONNEMENT
    const hostRecos = [propertyData.local_shops, propertyData.transport_info, propertyData.recommendations].filter(Boolean).join('\n');
    const neighborhoodContext = `
━━━ DONNÉES DE RECHERCHE LOCALES (FAITS UNIQUEMENT) ━━━
INFOS HÔTE : ${hostRecos || "Aucune information spécifique."}
RÉSULTATS WEB BRUTS : ${searchResults || "Aucun résultat trouvé sur le web."}
`.trim();

    // D. PROMPT SYSTÈME (Verrouillé ✅)
    const systemPrompt = `Tu es Marc, le majordome de "${propertyData.name}" à ${city}.
Identité : Majordome humain, factuel et précis. Tu ne DOIS PAS inventer.
Règle de langue : Réponds dans la langue du voyageur.

CONSIGNES DE SÉCURITÉ :
1. Ne cite un transport ou un commerce QUE s'il est explicitement écrit dans les "DONNÉES DE RECHERCHE" ci-dessus.
2. Si tu ne vois pas de distance exacte (ex: 200m), ne dis jamais "à quelques minutes". Dis "dans les environs".
3. INTERDICTION : Ne cite jamais le Tramway ou le Bus 1 à Bordeaux par habitude. Si ces noms ne sont pas dans les résultats Web ci-dessus pour cette adresse, ils n'existent pas.
4. Si les données sont manquantes, dis : "Je n'ai pas de confirmation précise pour le moment, je préfère demander à votre hôte pour ne pas vous tromper."

DONNÉES DU LOGEMENT :
- Adresse : ${fullAddress}
- WiFi : ${propertyData.wifi_name || "Non renseigné"} / ${propertyData.wifi_password || "Non renseigné"}
- Accès : ${propertyData.key_code ? `Code ${propertyData.key_code}` : "Non renseigné"}

${neighborhoodContext}

CONSIGNES PARTICULIÈRES :
${formattedKB}

Urgence : Si un problème grave est cité, termine par "Je préviens immédiatement votre hôte."`;

    // ✅ CHANGEMENT MAJEUR : Temperature à 0 pour stopper les hallucinations
    const chatResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: 'system', content: systemPrompt }, ...messagesHistory.map(m => ({ role: m.role === 'marc' ? 'assistant' : 'user', content: m.text }))],
      temperature: 0, 
      max_tokens: 400,
    });

    const responseText = chatResponse.choices[0].message.content;

    // Sauvegarde
    const newHistory = [...messagesHistory, { role: 'marc', text: responseText, timestamp: new Date().toISOString() }];
    await supabase.from('conversations').upsert({ property_id: propertyData.id, history: newHistory, last_message_at: new Date().toISOString() }, { onConflict: 'property_id' });

    // Alerte Telegram
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
    console.error("ERREUR API CHAT:", error);
    res.status(200).json({ answer: "Petit souci technique, je reviens vers vous." });
  }
}
