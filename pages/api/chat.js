import { Mistral } from '@mistralai/mistralai';
import { supabase } from '../../lib/supabase';

// Fonction d'alerte Telegram Premium 🚨
async function sendTelegramAlert(originalMsg, translatedMsg, propertyData, lang) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('telegram_chat_id')
      .eq('id', propertyData.owner_id)
      .single();

    if (!profile?.telegram_chat_id) return;

    const text = `🚨 *ALERTE MAJOR MARC*\n\n` +
                 `🏠 *Logement :* ${propertyData.name}\n` +
                 `🌍 *Langue :* ${lang}\n\n` +
                 `💬 *Message Client :*\n"${originalMsg}"\n\n` +
                 `🇫🇷 *Traduction Marc :*\n"${translatedMsg}"`;

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
    // LE CERVEAU : On lui dit quoi faire s'il n'a pas l'info
    const systemMessage = { 
      role: 'system', 
      content: `Tu es Marc, le majordome de "${propertyData.name}". 
      Réponds en ${langCode}.
      
      INFOS DISPONIBLES :
      - Wifi : ${propertyData.wifi_name} / ${propertyData.wifi_password}
      - Check-in/out : ${propertyData.check_in_hour} / ${propertyData.check_out_hour}
      - Adresse : ${propertyData.address}, ${propertyData.city}

      RÈGLE CRITIQUE :
      - Si le client pose une question dont la réponse N'EST PAS dans les infos ci-dessus, ou s'il y a un problème technique, réponds poliment que tu ne connais pas la réponse et dis EXACTEMENT : "Je préviens immédiatement votre hôte pour vous aider."`
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

    // 💾 SAUVEGARDE HISTORIQUE (JSONB)
    const newHistory = [
      ...messagesHistory,
      { role: 'marc', text: responseText, timestamp: new Date().toISOString() }
    ];

    await supabase.from('conversations').upsert({
      property_id: propertyData.id,
      history: newHistory,
      last_message_at: new Date().toISOString()
    }, { onConflict: 'property_id' }); 

    // 🔔 L'ALERTE : Uniquement si Marc dit qu'il prévient l'hôte
    // (C'est-à-dire quand il n'a pas trouvé l'info dans la base)
    if (responseText.toLowerCase().includes("préviens") || responseText.toLowerCase().includes("hôte")) {
      const lastUserMsg = messagesHistory[messagesHistory.length - 1]?.text || "";
      
      const translation = await mistral.chat.complete({
        model: 'mistral-small-2506',
        messages: [{ role: 'system', content: "Traduis en Français simple." }, { role: 'user', content: lastUserMsg }],
      });
      
      await sendTelegramAlert(lastUserMsg, translation.choices[0].message.content, propertyData, langCode);
    }

    res.status(200).json({ answer: responseText });

  } catch (error) {
    res.status(500).json({ answer: "Désolé, petit souci technique." });
  }
}
