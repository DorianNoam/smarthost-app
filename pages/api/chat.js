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
    // ON CONSTRUIT L'ADRESSE COMPLÈTE ICI
    const fullAddress = `${propertyData.street_number || ''} ${propertyData.address || ''} ${propertyData.residence ? `, Résidence ${propertyData.residence}` : ''} ${propertyData.building ? `, Bâtiment ${propertyData.building}` : ''} ${propertyData.floor ? `, Étage ${propertyData.floor}` : ''}, ${propertyData.city}`;

    const systemMessage = { 
      role: 'system', 
      content: `Tu es Marc, le majordome raffiné de "${propertyData.name}" à ${propertyData.city}.

      TON RÔLE :
      - Tu es un expert local. Pour les restaurants, activités, transports et culture à ${propertyData.city}, utilise tes connaissances générales pour conseiller le client avec élégance.
      - Pour les questions spécifiques au logement (Wifi, check-in, adresse), utilise UNIQUEMENT les infos ci-dessous.
      - Style : Chaleureux, élégant, saute des lignes pour la lisibilité.

      INFOS DU LOGEMENT (Source prioritaire) :
      - Adresse complète : ${fullAddress}
      - Wifi : ${propertyData.wifi_name} / ${propertyData.wifi_password}
      - Check-in/out : ${propertyData.check_in_hour} / ${propertyData.check_out_hour}
      - Précisions : ${propertyData.parking_info || ''}

      LOGIQUE D'ALERTE :
      - Si le client signale un PROBLÈME (panne, fuite, ménage), un mécontentement, ou s'il demande explicitement à parler à l'hôte, dis : "Je préviens immédiatement votre hôte."
      - Si tu réponds à une question sur la ville ou le wifi, ne préviens PAS l'hôte.`
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

    const alertTrigger = responseText.toLowerCase().includes("préviens") || 
                        responseText.toLowerCase().includes("votre hôte");

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
