import { Mistral } from '@mistralai/mistralai';
import { supabase } from '../../lib/supabase';

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
    const systemMessage = { 
      role: 'system', 
      content: `Tu es Marc, le majordome de "${propertyData.name}" à ${propertyData.city}.

      DIRECTIVES DE STYLE :
      - Sois **très concis** et va droit au but.
      - Ne répète PAS l'adresse du logement au début de tes phrases.
      - Utilise des **listes à puces** simples. Saute des lignes entre les points.
      - N'utilise PAS de gras sur chaque mot, seulement sur les infos vitales (Code WiFi, Ligne de Tram).

      LOGIQUE D'ALERTE (IMPORTANT) :
      - Si tu donnes une réponse utile, ne propose JAMAIS de contacter l'hôte.
      - Ne mentionne l'hôte QUE si tu es totalement incapable de répondre ou s'il y a une urgence réelle (panne, fuite).

      INFOS :
      - Wifi : ${propertyData.wifi_name} / ${propertyData.wifi_password}
      - Localisation : ${propertyData.address}, ${propertyData.city}
      - Transports : ${propertyData.parking_info || 'Utilisez le réseau TBM de Bordeaux.'}`
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

    // 💾 Sauvegarde JSONB
    const newHistory = [...messagesHistory, { role: 'marc', text: responseText, timestamp: new Date().toISOString() }];
    await supabase.from('conversations').upsert({
      property_id: propertyData.id,
      history: newHistory,
      last_message_at: new Date().toISOString()
    }, { onConflict: 'property_id' });

    // 🔔 Alerte : Uniquement si Marc mentionne l'hôte de lui-même (en cas d'échec)
    const shouldAlert = responseText.includes("préviens l'hôte") || responseText.includes("contacter l'hôte");

    if (shouldAlert) {
      const lastUserMsg = messagesHistory[messagesHistory.length - 1]?.text || "";
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
    res.status(500).json({ answer: "Erreur technique." });
  }
}
