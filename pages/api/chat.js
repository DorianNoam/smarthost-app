import { Mistral } from '@mistralai/mistralai';
import { supabase } from '../../lib/supabase';

// 1. Fonction d'alerte Telegram (Format Premium 🚨)
async function sendTelegramAlert(originalMsg, translatedMsg, propertyData, lang) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('telegram_chat_id')
      .eq('id', propertyData.owner_id)
      .single();

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
    // 🧠 SYSTEM MESSAGE : On revient à l'essentiel
    const systemMessage = { 
      role: 'system', 
      content: `Tu es Marc, le majordome de "${propertyData.name}" à ${propertyData.city}.
      
      CONSIGNES :
      - Réponds en ${langCode}.
      - Utilise UNIQUEMENT les infos ci-dessous. N'invente RIEN.
      - Si tu ne sais pas, dis poliment que tu préviens l'hôte.
      - Format : Saute des lignes entre les paragraphes pour la lisibilité.

      INFOS DU LOGEMENT :
      - Adresse : ${propertyData.address}, ${propertyData.city}
      - Wifi : ${propertyData.wifi_name} / ${propertyData.wifi_password}
      - Transports/Détails : ${propertyData.parking_info || 'Non renseigné.'}
      - Arrivée/Départ : ${propertyData.check_in_hour} / ${propertyData.check_out_hour}`
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

    // --- 💾 SAUVEGARDE HISTORIQUE (JSONB) ---
    const newHistory = [
      ...messagesHistory,
      { role: 'marc', text: responseText, timestamp: new Date().toISOString() }
    ];

    await supabase.from('conversations').upsert({
      property_id: propertyData.id,
      history: newHistory,
      last_message_at: new Date().toISOString()
    }, { onConflict: 'property_id' });

    // --- 🔔 DÉTECTION D'ALERTE ---
    const lastUserMsg = messagesHistory[messagesHistory.length - 1]?.text || "";
    // On utilise ta logique de détection par mots-clés dans la réponse de Marc
    const shouldAlert = responseText.toLowerCase().includes("hôte") || 
                        responseText.toLowerCase().includes("préviens") || 
                        responseText.toLowerCase().includes("navré");

    if (shouldAlert) {
      let translatedMsg = null;
      if (langCode !== 'fr') {
        const transRes = await mistral.chat.complete({
          model: 'mistral-small-2506',
          messages: [{ role: 'system', content: "Traduis en Français simple." }, { role: 'user', content: lastUserMsg }],
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
