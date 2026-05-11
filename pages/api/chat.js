import Groq from 'groq-sdk';
import { supabase } from '../../lib/supabase';

// --- 1. FONCTION GOOGLE PLACES (La Source de Vérité) ---
async function getGooglePlacesInfo(userQuery, fullAddress) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return "Erreur: Clé API Google non configurée dans Vercel.";

  try {
    // On interroge directement la base de données Google Maps
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(userQuery + " à proximité de " + fullAddress)}&key=${apiKey}&language=fr`;
    
    const res = await fetch(searchUrl);
    const data = await res.json();

    if (data.status !== "OK" || !data.results.length) {
      return "Aucun résultat trouvé sur la carte officielle pour cette demande.";
    }

    // On extrait les 5 meilleurs résultats réels
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
    'manger', 'pharmacie', 'supermarché', 'proche', 'près', 'quartier'
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

    // ✅ A. CHANGEMENT ICI : On utilise Google au lieu de Tavily
    let verifiedData = "";
    if (isLocalQuery(lastUserMsg)) {
      verifiedData = await getGooglePlacesInfo(lastUserMsg, fullAddress);
    }

    const { data: kb } = await supabase.from('knowledge_base').select('category, content').eq('property_id', propertyData.id);
    const formattedKB = kb?.map(item => `${item.category}: ${item.content}`).join('\n') || "";

    const hostRecos = [propertyData.local_shops, propertyData.transport_info, propertyData.recommendations].filter(Boolean).join('\n');
    
    // ✅ B. BLOC DE VÉRIFICATION SÉCURISÉ
    const neighborhoodContext = `
━━━ DONNÉES RÉELLES (Source: Google Maps & Hôte) ━━━
INFOS HÔTE : ${hostRecos || "Néant"}
RÉSULTATS CARTE OFFICIELLE : 
${verifiedData || "Aucune donnée trouvée à proximité."}
`.trim();

    // ✅ C. PROMPT "ZÉRO HALLUCINATION"
    const systemPrompt = `Tu es Marc, le majordome de "${propertyData.name}" à ${city}.
Tu es un humain professionnel, pas une IA. Tu ne dois JAMAIS inventer.

RÈGLES ABSOLUES :
1. Ne cite QUE les lieux ou arrêts présents dans les "DONNÉES RÉELLES" ci-dessus.
2. Si un lieu n'est pas dans la liste, dis : "Je n'ai pas d'information précise sur ce point, je préfère demander à votre hôte."
3. INTERDICTION : Ne mentionne jamais de Tramway s'il n'est pas dans la liste "RÉSULTATS CARTE OFFICIELLE".
4. Ne transforme jamais "Saint-Estèphe" en "Saint-Étienne".
5. Sois très concis (3 phrases max).`;

    const chatResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: 'system', content: systemPrompt }, ...messagesHistory.map(m => ({ role: m.role === 'marc' ? 'assistant' : 'user', content: m.text }))],
      temperature: 0, 
      max_tokens: 400,
    });

    const responseText = chatResponse.choices[0].message.content;

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
    console.error("ERREUR:", error);
    res.status(200).json({ answer: "Petit souci technique, je reviens vers vous." });
  }
}
