import Groq from 'groq-sdk';
import { supabase } from '../../lib/supabase';

// --- 1. FONCTION GOOGLE PLACES (La Source de Vérité) ---
async function getGooglePlacesInfo(userQuery, fullAddress) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return "Erreur: Clé API Google non configurée.";

  try {
    // On interroge Google pour trouver des lieux précis autour de l'adresse
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(userQuery + " à proximité de " + fullAddress)}&key=${apiKey}&language=fr`;
    
    const res = await fetch(searchUrl);
    const data = await res.json();

    if (data.status !== "OK" || !data.results.length) {
      return "Aucun résultat trouvé sur la carte pour cette demande précise.";
    }

    // On formate les 5 meilleurs résultats (Nom + Adresse) pour Marc
    return data.results.slice(0, 5).map(place => {
      return `- ${place.name} (Adresse: ${place.formatted_address})`;
    }).join('\n');

  } catch (e) {
    console.error("Erreur Google API:", e);
    return "Erreur lors de la récupération des données cartographiques.";
  }
}

// --- 2. DÉTECTION D'INTENTION ---
function isLocalQuery(msg) {
  const lower = msg.toLowerCase();
  const keywords = [
    'transport', 'bus', 'tram', 'gare', 'métro', 'vélo', 'boulangerie', 'restaurant', 
    'manger', 'pharmacie', 'supermarché', 'courses', 'épicerie', 'proche', 'près', 
    'quartier', 'visiter', 'activité', 'sortie', 'bar', 'café'
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

// --- HANDLER PRINCIPAL ---
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Non autorisé');
  
  const { messagesHistory, propertyData, userLanguage } = req.body;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const lastUserMsg = messagesHistory[messagesHistory.length - 1]?.text || "";
  const langCode = userLanguage ? userLanguage.split('-')[0] : 'fr';

  try {
    const city = propertyData.city || '';
    const fullAddress = `${propertyData.street_number || ''} ${propertyData.address || ''}, ${city}`.trim();

    // A. RECHERCHE GOOGLE MAPS
    let verifiedData = "";
    if (isLocalQuery(lastUserMsg)) {
      verifiedData = await getGooglePlacesInfo(lastUserMsg, fullAddress);
    }

    // B. RÉCUPÉRATION BASE DE CONNAISSANCES (Hôte)
    const { data: kb } = await supabase.from('knowledge_base').select('category, content').eq('property_id', propertyData.id);
    const formattedKB = kb?.map(item => `${item.category}: ${item.content}`).join('\n') || "";

    // C. CONSTRUCTION DU BLOC DE VÉRITÉ
    const hostRecos = [propertyData.local_shops, propertyData.transport_info, propertyData.recommendations].filter(Boolean).join('\n');
    const neighborhoodContext = `
━━━ DONNÉES RÉELLES (Google Maps & Hôte) ━━━
INFOS HÔTE : ${hostRecos || "Aucune information spécifique."}
RÉSULTATS CARTE : 
${verifiedData || "Aucune donnée cartographique trouvée pour cette adresse."}
`.trim();

    // D. PROMPT SYSTÈME "ANTI-HALLUCINATION"
    const systemPrompt = `Tu es Marc, le majordome de "${propertyData.name}" à ${city}.
Tu es un majordome humain, factuel et rigoureux.

RÈGLES D'OR :
1. Ne cite JAMAIS un transport ou un lieu qui n'est pas écrit dans les "DONNÉES RÉELLES" ci-dessus.
2. Si un lieu est mentionné dans les résultats carte mais sans distance précise, dis "à proximité" ou "dans les environs". N'invente jamais de minutes.
3. INTERDICTION : Ne cite jamais le Tramway ou le Bus 1 à Bordeaux par habitude. Si Google ne les liste pas pour cette adresse, ils n'existent pas pour toi.
4. Si les données sont manquantes, dis : "Je n'ai pas de confirmation précise pour le moment, je préfère demander à votre hôte pour ne pas vous induire en erreur."
5. Réponds toujours dans la langue du voyageur. Sois concis (3 phrases max).

DONNÉES LOGEMENT :
- Adresse : ${fullAddress}
- WiFi : ${propertyData.wifi_name || "Non renseigné"} / ${propertyData.wifi_password || "Non renseigné"}
- Accès : ${propertyData.key_code ? `Code ${propertyData.key_code}` : "Non renseigné"}

${neighborhoodContext}

CONSIGNES PARTICULIÈRES :
${formattedKB}`;

    // E. APPEL IA (Temperature 0 pour la fiabilité maximale)
    const chatResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: 'system', content: systemPrompt }, ...messagesHistory.map(m => ({ role: m.role === 'marc' ? 'assistant' : 'user', content: m.text }))],
      temperature: 0, 
      max_tokens: 400,
    });

    const responseText = chatResponse.choices[0].message.content;

    // Sauvegarde & Telegram
    const newHistory = [...messagesHistory, { role: 'marc', text: responseText, timestamp: new Date().toISOString() }];
    await supabase.from('conversations').upsert({ property_id: propertyData.id, history: newHistory, last_message_at: new Date().toISOString() }, { onConflict: 'property_id' });

    if (responseText.toLowerCase().includes("préviens immédiatement votre hôte")) {
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
