import { Mistral } from '@mistralai/mistralai';
import { supabase } from '../../lib/supabase';

// --- 1. FONCTION DE RECHERCHE ---
async function searchLocalInfo(query, location) {
  const apiKey = process.env.TAVILY_API_KEY; 
  
  if (!apiKey) {
    console.error("ERREUR : Clé TAVILY_API_KEY manquante dans Vercel");
    return "";
  }

  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query: `${query} à proximité de ${location}`,
        search_depth: "basic", // Changé de "smart" à "basic" pour éviter le code 400
        max_results: 5,
        include_images: false,
        include_answer: true
      })
    });
    
    // Si Tavily répond encore une erreur, on veut savoir pourquoi dans les logs
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Erreur Tavily ${res.status}:`, errorText);
      return "";
    }

    const data = await res.json();
    return data.answer || data.results?.map(r => r.content).join('\n\n') || "";
  } catch (e) { 
    console.error("Erreur de connexion Tavily :", e);
    return ""; 
  }
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
  const { messagesHistory, propertyData, userLanguage } = req.body;
  const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
  const langCode = userLanguage ? userLanguage.split('-')[0] : 'fr';

  try {
    const fullAddress = `${propertyData.street_number || ''} ${propertyData.address || ''} ${propertyData.residence_name ? `, Résidence ${propertyData.residence_name}` : ''} ${propertyData.building ? `, Bâtiment ${propertyData.building}` : ''} ${propertyData.floor ? `, Étage ${propertyData.floor}` : ''}, ${propertyData.city}`;

    const lastUserMsg = messagesHistory[messagesHistory.length - 1]?.text || "";
    let searchResults = "";
    
    const needsSearch = lastUserMsg.toLowerCase().match(/(restaurant|bus|tram|transport|manger|visite|activité|proche|autour|aller|faire|voir)/);
    
    if (needsSearch) {
      searchResults = await searchLocalInfo(lastUserMsg, fullAddress);
    }

    const systemMessage = { 
      role: 'system', 
      content: `Tu es Marc, le majordome de "${propertyData.name}". 

      CONSIGNES DE VÉRITÉ ABSOLUE (CRUCIAL) :
      - N'INVENTE JAMAIS de noms ou d'adresses de restaurants/commerces.
      - Si la section "RÉSULTATS DE RECHERCHE WEB" est vide, dis simplement que tu n'as pas d'informations vérifiées pour le moment et propose de prévenir l'hôte.
      - L'adresse du logement (${fullAddress}) ne doit JAMAIS être utilisée pour un restaurant.
      - Ne réponds que sur la base des résultats de recherche fournis.

      CONSIGNE DE MISE EN PAGE :
      - Chaque suggestion doit commencer par un tiret (-).
      - Saute DEUX LIGNES entre chaque point.
      - Insère une ligne "---" entre chaque recommandation.

      INFOS LOGEMENT :
      - Adresse : ${fullAddress}
      - Wifi : ${propertyData.wifi_name} / ${propertyData.wifi_password}

      RÉSULTATS DE RECHERCHE WEB (Ta seule source pour l'extérieur) :
      ${searchResults || "AUCUNE INFORMATION TROUVÉE SUR LE WEB. NE RIEN INVENTER."}`
    };

    const formattedHistory = messagesHistory.map(msg => ({
      role: msg.role === 'marc' ? 'assistant' : 'user',
      content: msg.text || ''
    }));

    const chatResponse = await mistral.chat.complete({
      model: 'mistral-small-2506',
      messages: [systemMessage, ...formattedHistory],
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
        const transRes = await mistral.chat.complete({
          model: 'mistral-small-2506',
          messages: [{ role: 'system', content: "Traduis en FR." }, { role: 'user', content: lastUserMsg }],
        });
        translatedMsg = transRes.choices[0].message.content;
      }
      await sendTelegramAlert(lastUserMsg, translatedMsg, propertyData, langCode);
    }

    res.status(200).json({ answer: responseText });
  } catch (error) {
    res.status(500).json({ answer: "Désolé, j'ai une difficulté technique." });
  }
}
