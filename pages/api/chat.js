import Groq from 'groq-sdk';
import { supabase } from '../../lib/supabase';

// --- FONCTION DE RECHERCHE WEB (Uniquement si pas dans la BDD) ---
async function searchLocalInfo(userQuery, fullAddress) {
  const apiKey = process.env.TAVILY_API_KEY; 
  if (!apiKey) return ""; 
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query: `${userQuery} à proximité de ${fullAddress}`,
        search_depth: "advanced",
        max_results: 5,
        include_answer: true
      })
    });
    const data = await res.json();
    return data.answer || data.results?.map(r => r.content).join('\n') || "";
  } catch (e) { return ""; }
}

// --- ALERTE TELEGRAM ---
async function sendTelegramAlert(originalMsg, translatedMsg, propertyData, lang) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  try {
    const { data: profile } = await supabase.from('profiles').select('telegram_chat_id').eq('id', propertyData.owner_id).single();
    if (!profile?.telegram_chat_id) return;
    let text = `🚨 *ALERTE MAJOR MARC*\n\n🏠 *Logement :* ${propertyData.name}\n💬 *Client :*\n"${originalMsg}"`;
    if (translatedMsg) { text += `\n\n🇫🇷 *Traduction :*\n"${translatedMsg}"`; }
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: profile.telegram_chat_id, text, parse_mode: 'Markdown' })
    });
  } catch (e) { console.error("Erreur Telegram:", e); }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Méthode non autorisée');
  
  const { messagesHistory, propertyData, userLanguage } = req.body;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const langCode = userLanguage ? userLanguage.split('-')[0] : 'fr';

  try {
    const city = propertyData.city || '';
    const fullAddress = `${propertyData.street_number || ''} ${propertyData.address || ''}, ${city}`;
    const lastUserMsg = messagesHistory[messagesHistory.length - 1]?.text || "";
    
    // ÉTAPE 1 : On regarde si la question concerne l'extérieur pour savoir si on aura besoin de Google
    let searchResults = "";
    const isLocalRequest = lastUserMsg.toLowerCase().match(/(restaurant|supermarché|magasin|bus|tram|transport|pharmacie|boulangerie)/);
    
    if (isLocalRequest) {
      searchResults = await searchLocalInfo(lastUserMsg, fullAddress);
    }

    const systemMessage = { 
      role: 'system', 
      content: `Tu es Marc, le majordome de "${propertyData.name}". 
      
      TON PROTOCOLE DE RÉPONSE (Respecte cet ordre) :
      
      1. INFOS LOGEMENT (Priorité Absolue) : Si la réponse est ici, utilise-la exclusivement.
         - Adresse : ${fullAddress}
         - Wifi : ${propertyData.wifi_name} | Pass : ${propertyData.wifi_password}
         - Check-in : ${propertyData.check_in_hour} | Check-out : ${propertyData.check_out_hour}
         - Autres notes hôte : ${propertyData.description || "Aucune note spécifique."}

      2. INFOS EXTÉRIEURES (Recherche Web) : Si la réponse n'est pas au-dessus, utilise ceci :
         ${searchResults || "Aucun résultat web trouvé."}

      3. SI AUCUNE INFO : Si ni les notes de l'hôte ni le web ne répondent, dis : "Je n'ai pas cette information précise, je demande immédiatement à votre hôte pour vous répondre."

      4. URGENCE : Si le client signale une panne ou un problème, conclus par : "Je préviens immédiatement votre hôte."

      STYLE : Majordome raffiné, poli, pas de blabla inutile.`
    };

    const chatResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", 
      messages: [systemMessage, ...messagesHistory.map(msg => ({
        role: msg.role === 'marc' ? 'assistant' : 'user',
        content: msg.text || ''
      }))],
      temperature: 0.1,
    });

    const responseText = chatResponse.choices[0].message.content;

    // Sauvegarde History
    const newHistory = [...messagesHistory, { role: 'marc', text: responseText, timestamp: new Date().toISOString() }];
    await supabase.from('conversations').upsert({ property_id: propertyData.id, history: newHistory, last_message_at: new Date().toISOString() }, { onConflict: 'property_id' });

    // Alerte Telegram
    if (responseText.toLowerCase().includes("préviens") || responseText.toLowerCase().includes("votre hôte")) {
      let translatedMsg = null;
      if (langCode !== 'fr') {
        const transRes = await groq.chat.completions.create({
          model: "llama-3.3-8b-instant",
          messages: [{ role: 'system', content: "Traduis en FR." }, { role: 'user', content: lastUserMsg }],
        });
        translatedMsg = transRes.choices[0].message.content;
      }
      await sendTelegramAlert(lastUserMsg, translatedMsg, propertyData, langCode);
    }

    res.status(200).json({ answer: responseText });
  } catch (error) {
    res.status(200).json({ answer: `Désolé : ${error.message}` });
  }
}
