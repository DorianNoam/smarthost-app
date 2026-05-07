import Groq from 'groq-sdk';
import { supabase } from '../../lib/supabase';

// --- 1. FONCTION DE RECHERCHE (Tavily) ---
async function searchLocalInfo(query, location) {
  const apiKey = process.env.TAVILY_API_KEY; 
  if (!apiKey) return ""; 

  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query: `${query} à proximité de ${location} Bordeaux TBM bus tram`,
        search_depth: "basic", 
        max_results: 5,
        include_answer: true
      })
    });
    
    if (!res.ok) return "";
    const data = await res.json();
    return data.answer || data.results?.map(r => r.content).join('\n\n---\n\n') || "";
  } catch (e) { return ""; }
}

// --- 2. CODE D'ALERTE TELEGRAM ---
async function sendTelegramAlert(originalMsg, translatedMsg, propertyData, lang) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  try {
    const { data: profile } = await supabase.from('profiles').select('telegram_chat_id').eq('id', propertyData.owner_id).single();
    if (!profile?.telegram_chat_id) return;

    let text = `🚨 *ALERTE MAJOR MARC*\n\n` +
               `🏠 *Logement :* ${propertyData.name}\n` + 
               `🌍 *Langue client :* ${lang}\n\n` + 
               `💬 *Message Client :*\n"${originalMsg}"`;

    if (translatedMsg) { text += `\n\n` + `🇫🇷 *Traduction Marc :*\n"${translatedMsg}"`; }

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: profile.telegram_chat_id, text, parse_mode: 'Markdown' })
    });
  } catch (e) { console.error("Erreur Telegram:", e); }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Méthode non autorisée');
  
  // SÉCURITÉ : Vérification de la clé avant de lancer Groq
  if (!process.env.GROQ_API_KEY) {
    return res.status(200).json({ answer: "⚠️ Erreur de configuration : La variable GROQ_API_KEY est introuvable sur Vercel." });
  }

  const { messagesHistory, propertyData, userLanguage } = req.body;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const langCode = userLanguage ? userLanguage.split('-')[0] : 'fr';

  try {
    const fullAddress = `${propertyData.street_number || ''} ${propertyData.address || ''}, ${propertyData.city}`;
    const lastUserMsg = messagesHistory[messagesHistory.length - 1]?.text || "";
    
    let searchResults = "";
    const needsSearch = lastUserMsg.toLowerCase().match(/(restaurant|bus|tram|transport|manger|visite|activité|proche|autour|aller|faire|voir)/);
    
    if (needsSearch) {
      searchResults = await searchLocalInfo(lastUserMsg, fullAddress);
    }

    const systemMessage = { 
      role: 'system', 
      content: `Tu es Marc, le majordome de "${propertyData.name}" à FLOIRAC. 

      DONNÉES DU LOGEMENT :
      - Ton adresse : ${fullAddress}
      - Wifi : ${propertyData.wifi_name} / ${propertyData.wifi_password}

      CONSIGNES :
      1. ADRESSE : Si on te la demande, donne-la : "${fullAddress}".
      2. TRANSPORTS : Ne cite JAMAIS le Tram C à Floirac. C'est le Tram A.
      3. VÉRITÉ : Ne donne pas de temps de trajet (ex: 3 min) si ce n'est pas écrit dans les résultats web.
      4. STYLE : Raffiné, double saut de ligne.

      RÉSULTATS WEB :
      ${searchResults || "AUCUN RÉSULTAT."}

      LOGIQUE D'ALERTE :
      - Si problème, dis : "Je préviens immédiatement votre hôte."`
    };

    // APPEL À GROQ
    const chatResponse = await groq.chat.completions.create({
      model: "llama-3.1-70b-versatile",
      messages: [
        systemMessage,
        ...messagesHistory.map(msg => ({
          role: msg.role === 'marc' ? 'assistant' : 'user',
          content: msg.text || ''
        }))
      ],
      temperature: 0.1,
    });

    const responseText = chatResponse.choices[0].message.content;

    // Sauvegarde History Supabase
    const newHistory = [...messagesHistory, { role: 'marc', text: responseText, timestamp: new Date().toISOString() }];
    await supabase.from('conversations').upsert({
      property_id: propertyData.id,
      history: newHistory,
      last_message_at: new Date().toISOString()
    }, { onConflict: 'property_id' });

    // --- ALERTE TELEGRAM ---
    const alertTrigger = responseText.toLowerCase().includes("préviens") || 
                        responseText.toLowerCase().includes("prévenir") || 
                        responseText.toLowerCase().includes("votre hôte");

    if (alertTrigger) {
      let translatedMsg = null;
      if (langCode !== 'fr') {
        const transRes = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [{ role: 'system', content: "Traduis en FR." }, { role: 'user', content: lastUserMsg }],
        });
        translatedMsg = transRes.choices[0].message.content;
      }
      await sendTelegramAlert(lastUserMsg, translatedMsg, propertyData, langCode);
    }

    res.status(200).json({ answer: responseText });

  } catch (error) {
    console.error("Erreur Chat:", error);
    res.status(200).json({ answer: `Désolé, Marc a un petit souci technique : ${error.message}` });
  }
}
