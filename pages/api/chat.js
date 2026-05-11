import Groq from 'groq-sdk';
import { supabase } from '../../lib/supabase';

// --- 1. FONCTION GOOGLE PLACES (Source de Vérité) ---
async function getGooglePlacesInfo(userQuery, fullAddress) {
  const apiKey = process.env.MAPS_API_KEY; // ✅ Correspond à ton nom sur Vercel
  if (!apiKey) {
    console.error("❌ ERREUR : La variable MAPS_API_KEY est introuvable.");
    return "Erreur de configuration de la clé API.";
  }

  try {
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(userQuery + " à proximité de " + fullAddress)}&key=${apiKey}&language=fr`;
    
    const res = await fetch(searchUrl);
    const data = await res.json();

    if (data.status === "REQUEST_DENIED") {
      console.error("❌ GOOGLE REFUSE LA CLÉ : Vérifie la facturation ou les restrictions.");
      return "Accès à la carte refusé.";
    }

    if (data.status !== "OK" || !data.results.length) {
      return "Aucun résultat trouvé sur la carte officielle.";
    }

    return data.results.slice(0, 5).map(place => {
      return `- ${place.name} (Adresse: ${place.formatted_address})`;
    }).join('\n');

  } catch (e) {
    console.error("❌ ERREUR APPEL GOOGLE :", e.message);
    return "Erreur technique lors de la recherche.";
  }
}

// --- 2. DÉTECTION D'INTENTION ---
function isLocalQuery(msg) {
  const lower = msg.toLowerCase();
  const keywords = ['transport', 'bus', 'tram', 'gare', 'boulangerie', 'restaurant', 'manger', 'supermarché', 'proche', 'près'];
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

  try {
    console.log("🚩 1. Début du traitement pour :", propertyData?.name || "Villa inconnue");

    // Construction de l'adresse
    const city = propertyData?.city || '';
    const fullAddress = `${propertyData?.street_number || ''} ${propertyData?.address || ''}, ${city}`.trim();
    console.log("🚩 2. Adresse cible :", fullAddress);

    // A. RECHERCHE GOOGLE MAPS
    let verifiedData = "";
    if (isLocalQuery(lastUserMsg)) {
      console.log("🚩 3. Question locale détectée. Appel Google...");
      verifiedData = await getGooglePlacesInfo(lastUserMsg, fullAddress);
      console.log("🚩 4. Réponse Google récupérée.");
    }

    // B. BASE DE CONNAISSANCES HÔTE
    const { data: kb } = await supabase.from('knowledge_base').select('category, content').eq('property_id', propertyData.id);
    const formattedKB = kb?.map(item => `${item.category}: ${item.content}`).join('\n') || "";

    const hostInfo = [propertyData.local_shops, propertyData.transport_info, propertyData.recommendations].filter(Boolean).join('\n');
    
    const context = `
━━━ DONNÉES RÉELLES (Google Maps & Hôte) ━━━
INFOS HÔTE : ${hostInfo || "Néant"}
RÉSULTATS CARTE OFFICIELLE : 
${verifiedData || "Aucun point trouvé à proximité immédiate."}
`.trim();

    // C. PROMPT SYSTÈME
    const systemPrompt = `Tu es Marc, le majordome de "${propertyData.name}". 
Tu réponds aux voyageurs de manière pro et factuelle.
INTERDICTION d'inventer des stations de transport. 
Si l'info n'est pas dans le bloc "DONNÉES RÉELLES", tu dis que tu ne sais pas et que tu demandes à l'hôte.
Réponds en 3 phrases maximum.`;

    console.log("🚩 5. Envoi à Groq...");

    // D. APPEL IA
    const chatResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'system', content: `CONTEXTE : ${context}\n\nKB : ${formattedKB}` },
        ...messagesHistory.map(m => ({ role: m.role === 'marc' ? 'assistant' : 'user', content: m.text }))
      ],
      temperature: 0,
      max_tokens: 400,
    });

    const responseText = chatResponse.choices[0].message.content;
    console.log("🚩 6. Réponse générée avec succès.");

    // E. SAUVEGARDE ET RÉPONSE
    const newHistory = [...messagesHistory, { role: 'marc', text: responseText, timestamp: new Date().toISOString() }];
    await supabase.from('conversations').upsert({ property_id: propertyData.id, history: newHistory, last_message_at: new Date().toISOString() }, { onConflict: 'property_id' });

    res.status(200).json({ answer: responseText });

  } catch (error) {
    console.error("❌ ERREUR FATALE HANDLER :", error.message);
    res.status(200).json({ answer: "Petit souci technique. (Erreur logguée)" });
  }
}
