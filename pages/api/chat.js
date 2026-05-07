import Groq from 'groq-sdk';
import { supabase } from '../../lib/supabase';

async function searchLocalInfo(query, location) {
  const apiKey = process.env.TAVILY_API_KEY; 
  if (!apiKey) return ""; 
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query: `transports TBM bus tram depuis ${location} Floirac arrêt le plus proche`,
        search_depth: "advanced",
        max_results: 5,
        include_answer: true
      })
    });
    if (!res.ok) return "";
    const data = await res.json();
    return data.answer || data.results?.map(r => r.content).join('\n\n') || "";
  } catch (e) { return ""; }
}

async function sendTelegramAlert(originalMsg, translatedMsg, propertyData, lang) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  try {
    const { data: profile } = await supabase.from('profiles').select('telegram_chat_id').eq('id', propertyData.owner_id).single();
    if (!profile?.telegram_chat_id) return;
    let text = `🚨 *ALERTE MAJOR MARC*\n\n🏠 *Logement :* ${propertyData.name}\n🌍 *Langue client :* ${lang}\n\n💬 *Message Client :*\n"${originalMsg}"`;
    if (translatedMsg) { text += `\n\n🇫🇷 *Traduction Marc :*\n"${translatedMsg}"`; }
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: profile.telegram_chat_id, text, parse_mode: 'Markdown' })
    });
  } catch (e) { console.error("Erreur Telegram:", e); }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Méthode non autorisée');
  if (!process.env.GROQ_API_KEY) return res.status(200).json({ answer: "⚠️ Erreur : Clé manquante." });

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

      VÉRITÉ GÉOGRAPHIQUE DU LOGEMENT (Priorité n°1) :
      - Adresse : ${fullAddress}.
      - BUS LE PLUS PROCHE : Le **Bus 28**, arrêt "**Jean Jaurès**", est à **1 minute à pied** (juste dans la rue). Il permet de rejoindre le tram ou Bordeaux centre rapidement.
      - TRAM LE PLUS PROCHE : Le **Tram A** (arrêt Floirac Dravemont) est à environ **20-25 minutes à pied**. C'est loin. Conseille toujours le Bus 28 pour rejoindre le tram.
      - TRAM C : N'existe pas à Floirac.

      CONSIGNES :
      1. Ne dis jamais "10 minutes à pied" pour le tram. C'est faux.
      2. Sois honnête : si un trajet est long, dis-le.
      3. Utilise les RÉSULTATS WEB pour les restaurants ou détails de lignes.
      4. STYLE : Élégant, précis, double saut de ligne.

      RÉSULTATS WEB :
      ${searchResults || "Pas de résultats web actuels."}

      LOGIQUE D'ALERTE :
      - Si problème, dis : "Je préviens immédiatement votre hôte."`
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

    const newHistory = [...messagesHistory, { role: 'marc', text: responseText, timestamp: new Date().toISOString() }];
    await supabase.from('conversations').upsert({
      property_id: propertyData.id,
      history: newHistory,
      last_message_at: new Date().toISOString()
    }, { onConflict: 'property_id' });

    const alertTrigger = responseText.toLowerCase().includes("préviens") || responseText.toLowerCase().includes("votre hôte");
    if (alertTrigger) {
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
    res.status(200).json({ answer: `Désolé, souci technique : ${error.message}` });
  }
}
