import Groq from 'groq-sdk';
import { supabase } from '../../lib/supabase';

// --- 1. RECHERCHE WEB UNIVERSELLE ---
async function searchLocalInfo(userQuery, address, city) {
  const apiKey = process.env.TAVILY_API_KEY; 
  if (!apiKey) return ""; 
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query: `${userQuery} near ${address}, ${city} exact location and opening hours`,
        search_depth: "advanced",
        max_results: 5,
        include_answer: true
      })
    });
    const data = await res.json();
    return data.answer || data.results?.map(r => r.content).join('\n\n') || "";
  } catch (e) { return ""; }
}

// --- 2. ALERTE TELEGRAM ---
async function sendTelegramAlert(originalMsg, translatedMsg, propertyData, lang) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  try {
    const { data: profile } = await supabase.from('profiles').select('telegram_chat_id').eq('id', propertyData.owner_id).single();
    if (!profile?.telegram_chat_id) return;
    let text = `🚨 *ALERTE MAJOR MARC*\n\n🏠 *Logement :* ${propertyData.name}\n🌍 *Langue :* ${lang}\n\n💬 *Message :*\n"${originalMsg}"`;
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

    // --- 3. DÉTECTION D'INTENTION (Modèle stable : llama-3.1-8b-instant) ---
    const intentCheck = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", 
      messages: [
        { 
          role: 'system', 
          content: "Does the user message require a local search for shops, restaurants, transport, health, or tourism? Answer ONLY 'YES' or 'NO'." 
        },
        { role: 'user', content: lastUserMsg }
      ],
      temperature: 0,
    });

    const needsSearch = intentCheck.choices[0].message.content.includes("YES");
    
    let searchResults = "";
    if (needsSearch) {
      searchResults = await searchLocalInfo(lastUserMsg, fullAddress, city);
    }

    // --- 4. RÉPONSE FINALE ---
    const systemMessage = { 
      role: 'system', 
      content: `Tu es Marc, le majordome de "${propertyData.name}" à ${city}.
      
      HIÉRARCHIE D'INFORMATION :
      1. TA BASE DE DONNÉES : Adresse: ${fullAddress}, Wifi: ${propertyData.wifi_name}, Check-in: ${propertyData.check_in_hour}.
      2. RECHERCHE WEB : Utilise ceci pour les commerces/transports :
         ${searchResults || "Aucune info web trouvée."}
      3. SI INCONNU : Dis poliment que tu ne sais pas et que tu contactes l'hôte.

      STYLE : Majordome élégant, concis. Saute deux lignes entre les paragraphes.`
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
          model: "llama-3.1-8b-instant",
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
