import Groq from 'groq-sdk';
import { supabase } from '../../lib/supabase';

// --- 1. FONCTION DE RECHERCHE UNIVERSELLE ---
async function searchLocalInfo(userQuery, fullAddress) {
  const apiKey = process.env.TAVILY_API_KEY; 
  if (!apiKey) return ""; 
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        // La recherche se base sur la question client + l'adresse exacte du logement
        query: `${userQuery} à proximité de ${fullAddress} nom du lieu distance et temps de trajet précis`,
        search_depth: "advanced",
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
    let text = `🚨 *ALERTE MAJOR MARC*\n\n🏠 *Logement :* ${propertyData.name}\n🌍 *Langue :* ${lang}\n\n💬 *Message Client :*\n"${originalMsg}"`;
    if (translatedMsg) { text += `\n\n🇫🇷 *Traduction :*\n"${translatedMsg}"`; }
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: profile.telegram_chat_id, text, parse_mode: 'Markdown' })
    });
  } catch (e) { console.error("Erreur Telegram:", e); }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Méthode non autorisée');
  if (!process.env.GROQ_API_KEY) return res.status(200).json({ answer: "⚠️ Erreur : Variable GROQ_API_KEY manquante." });

  const { messagesHistory, propertyData, userLanguage } = req.body;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const langCode = userLanguage ? userLanguage.split('-')[0] : 'fr';

  try {
    // Construction de l'adresse dynamique depuis la base de données
    const city = propertyData.city || '';
    const fullAddress = `${propertyData.street_number || ''} ${propertyData.address || ''}, ${city}`;
    const lastUserMsg = messagesHistory[messagesHistory.length - 1]?.text || "";
    
    let searchResults = "";
    // Détection large pour inclure supermarchés, restos, pharmacies, etc.
    const needsSearch = lastUserMsg.toLowerCase().match(/(restaurant|supermarché|magasin|course|bus|tram|transport|manger|visite|activité|proche|autour|aller|faire|voir|boulangerie|pharmacie)/);
    
    if (needsSearch) {
      searchResults = await searchLocalInfo(lastUserMsg, fullAddress);
    }

    const systemMessage = { 
      role: 'system', 
      content: `Tu es Marc, le majordome de "${propertyData.name}" situé à ${city}. 

      SOURCE DE VÉRITÉ (Logement actuel) :
      - Adresse exacte : ${fullAddress}
      - Wifi : ${propertyData.wifi_name} / ${propertyData.wifi_password}
      - Check-in : ${propertyData.check_in_hour} | Check-out : ${propertyData.check_out_hour}

      CONSIGNES STRICTES :
      1. HONNÊTETÉ : N'invente JAMAIS de noms de commerces, de lignes de transport ou de temps de trajet (ex: "à 5 min"). 
      2. SOURCE WEB : Pour toute question sur l'extérieur (restos, magasins, transports), utilise UNIQUEMENT les "RÉSULTATS WEB" fournis.
      3. SILENCE SI INCONNU : Si les résultats web ne mentionnent pas de temps de trajet ou de nom précis, dis-le franchement : "Je n'ai pas la distance exacte, mais je peux prévenir l'hôte pour plus de précision."
      4. STYLE : Majordome haut de gamme, poli et concis. Double saut de ligne entre les paragraphes.

      RÉSULTATS WEB (Ta source d'information locale) :
      ${searchResults || "Aucune information web trouvée. Ne fais aucune supposition."}

      LOGIQUE D'ALERTE :
      - Si le client signale un problème (panne, fuite, ménage), dis obligatoirement : "Je préviens immédiatement votre hôte."`
    };

    const chatResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", 
      messages: [systemMessage, ...messagesHistory.map(msg => ({
        role: msg.role === 'marc' ? 'assistant' : 'user',
        content: msg.text || ''
      }))],
      temperature: 0.1, // Verrouillage de la précision
    });

    const responseText = chatResponse.choices[0].message.content;

    // Sauvegarde History
    const newHistory = [...messagesHistory, { role: 'marc', text: responseText, timestamp: new Date().toISOString() }];
    await supabase.from('conversations').upsert({
      property_id: propertyData.id,
      history: newHistory,
      last_message_at: new Date().toISOString()
    }, { onConflict: 'property_id' });

    // Bloc Alerte Telegram
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
    res.status(200).json({ answer: `Désolé, j'ai une difficulté technique : ${error.message}` });
  }
}
