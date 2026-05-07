import { Mistral } from '@mistralai/mistralai';
import { supabase } from '../../lib/supabase';

// --- 1. FONCTION DE RECHERCHE (Optimisée avec plus d'espacement) ---
async function searchLocalInfo(query, location) {
  const apiKey = process.env.TAVILY_API_KEY; 
  if (!apiKey) return ""; 

  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query: `${query} à proximité de ${location}`,
        search_depth: "smart",
        include_answer: true,
        max_results: 5
      })
    });
    const data = await res.json();
    // On ajoute un double saut de ligne et une ligne de séparation entre chaque résultat trouvé sur le web
    return data.answer || data.results.map(r => r.content).join('\n\n---\n\n');
  } catch (e) { return ""; }
}

// --- 2. CODE D'ALERTE TELEGRAM (Intact) ---
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
    // Construction de l'adresse complète
    const fullAddress = `${propertyData.street_number || ''} ${propertyData.address || ''} ${propertyData.residence_name ? `, Résidence ${propertyData.residence_name}` : ''} ${propertyData.building ? `, Bâtiment ${propertyData.building}` : ''} ${propertyData.floor ? `, Étage ${propertyData.floor}` : ''}, ${propertyData.city}`;

    const lastUserMsg = messagesHistory[messagesHistory.length - 1]?.text || "";
    let searchResults = "";
    
    // Déclencheur de recherche
    const needsSearch = lastUserMsg.toLowerCase().match(/(restaurant|bus|tram|transport|manger|visite|activité|proche|autour|aller|faire|voir)/);
    
    if (needsSearch) {
      searchResults = await searchLocalInfo(lastUserMsg, fullAddress);
    }

    const systemMessage = { 
      role: 'system', 
      content: `Tu es Marc, le majordome de "${propertyData.name}".

      RÈGLES D'OR DE MISE EN PAGE :
      1. Ne fais JAMAIS de paragraphes compacts.
      2. Utilise des listes à puces claires.
      3. SAUTE DEUX LIGNES (double retour chariot) entre chaque point ou recommandation.
      4. Utilise le **GRAS** pour les noms de restaurants, les lignes de transport ou les lieux.
      5. Ajoute une ligne de séparation "---" entre les différentes suggestions.

      TON RÔLE :
      - Tu es un majordome raffiné. Ton affichage doit être luxueux et facile à lire sur mobile.
      - Utilise les "RÉSULTATS DE RECHERCHE" pour être précis sur la ville.
      - Pour le Wifi et les accès, utilise les infos du logement.

      INFOS DU LOGEMENT :
      - Adresse : ${fullAddress}
      - Wifi : ${propertyData.wifi_name} / ${propertyData.wifi_password}
      - Check-in/out : ${propertyData.check_in_hour} / ${propertyData.check_out_hour}

      RÉSULTATS DE TA RECHERCHE WEB (Source de vérité) :
      ${searchResults || "Pas de recherche web nécessaire."}

      LOGIQUE D'ALERTE :
      - Si problème ou mécontentement, dis : "Je préviens immédiatement votre hôte."`
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

    // Sauvegarde History
    const newHistory = [...messagesHistory, { role: 'marc', text: responseText, timestamp: new Date().toISOString() }];
    await supabase.from('conversations').upsert({
      property_id: propertyData.id,
      history: newHistory,
      last_message_at: new Date().toISOString()
    }, { onConflict: 'property_id' });

    // Alerte Telegram
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
