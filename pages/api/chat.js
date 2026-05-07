import { Mistral } from '@mistralai/mistralai';
import { supabase } from '../../lib/supabase';

// --- 1. FONCTION DE RECHERCHE (L'œil de Marc sur Google) ---
async function searchLocalInfo(query, location) {
  const apiKey = process.env.TAVILY_API_KEY; 
  if (!apiKey) return "Pas d'accès recherche configuré.";

  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query: `${query} à proximité de ${location}`,
        search_depth: "smart",
        include_answer: true,
        max_results: 3
      })
    });
    const data = await res.json();
    return data.answer || data.results.map(r => r.content).join('\n');
  } catch (e) { return "Erreur lors de la recherche."; }
}

// --- 2. TON CODE D'ALERTE (Intact) ---
async function sendTelegramAlert(originalMsg, translatedMsg, propertyData, lang) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  try {
    const { data: profile } = await supabase.from('profiles').select('telegram_chat_id').eq('id', propertyData.owner_id).single();
    if (!profile?.telegram_chat_id) return;

    let text = `🚨 *ALERTE MAJOR MARC*\n\n` +
               `🏠 *Logement :* ${propertyData.name}\n` +
               `🌍 *Langue client :* ${lang}\n\n` +
               `💬 *Message Client :*\n"${originalMsg}"`;

    if (translatedMsg) {
      text += `\n\n` + `🇫🇷 *Traduction Marc :*\n"${translatedMsg}"`;
    }

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
    const fullAddress = `${propertyData.street_number || ''} ${propertyData.address || ''} ${propertyData.residence ? `, Résidence ${propertyData.residence}` : ''} ${propertyData.building ? `, Bâtiment ${propertyData.building}` : ''} ${propertyData.floor ? `, Étage ${propertyData.floor}` : ''}, ${propertyData.city}`;

    // --- LOGIQUE DE RECHERCHE ---
    const lastUserMsg = messagesHistory[messagesHistory.length - 1]?.text || "";
    let searchResults = "";
    
    // On lance une recherche si le client demande un truc sur la ville
    const needsSearch = lastUserMsg.toLowerCase().match(/(restaurant|bus|tram|manger|visite|activité|proche|autour)/);
    if (needsSearch) {
      searchResults = await searchLocalInfo(lastUserMsg, fullAddress);
    }

    const systemMessage = { 
      role: 'system', 
      content: `Tu es Marc, le majordome raffiné de "${propertyData.name}" à ${propertyData.city}.

      INFOS DU LOGEMENT (Source prioritaire pour le wifi/check-in) :
      - Adresse complète : ${fullAddress}
      - Wifi : ${propertyData.wifi_name} / ${propertyData.wifi_password}
      - Check-in/out : ${propertyData.check_in_hour} / ${propertyData.check_out_hour}
      - Précisions techniques : ${propertyData.parking_info || ''}

      RÉSULTATS DE TA RECHERCHE WEB (Utilise ça pour les bus/restos) :
      ${searchResults || "Aucune recherche nécessaire pour cette demande."}

      TON RÔLE :
      - Pour l'extérieur, utilise les "RÉSULTATS DE TA RECHERCHE WEB" pour être précis.
      - Ne donne JAMAIS de ligne de tram ou bus que tu n'as pas vérifiée dans la recherche.
      - Style : Chaleureux, élégant, aéré (saute des lignes).

      LOGIQUE D'ALERTE :
      - Si problème (panne, fuite, ménage), dis : "Je préviens immédiatement votre hôte."`
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

    // --- SAUVEGARDE ET ALERTE (Tes codes d'origine) ---
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
