import { Mistral } from '@mistralai/mistralai';
import { supabase } from '../../lib/supabase';

async function sendTelegramAlert(originalMsg, translatedMsg, propertyData, lang) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('telegram_chat_id')
      .eq('id', propertyData.owner_id)
      .single();

    if (profile?.telegram_chat_id) {
      const text = `🚨 *ALERTE MAJOR MARC*\n\n*Logement :* ${propertyData.name}\n\n*Demande Client :*\n"${originalMsg}"\n\n*Traduction :*\n"${translatedMsg}"`;
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: profile.telegram_chat_id, text, parse_mode: 'Markdown' })
      });
    }
  } catch (e) { console.error(e); }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Méthode non autorisée');

  const { messagesHistory, propertyData, userLanguage } = req.body;
  const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
  const langCode = userLanguage ? userLanguage.split('-')[0] : 'fr';

  try {
    const systemMessage = { 
      role: 'system', 
      content: `Tu es Marc, le majordome de "${propertyData.name}". Réponds en ${langCode}.` 
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

    // --- MISE À JOUR DE L'HISTORIQUE DANS SUPABASE (JSONB) ---
    const updatedHistory = [
      ...messagesHistory,
      { role: 'marc', text: responseText, timestamp: new Date().toISOString() }
    ];

    await supabase
      .from('conversations')
      .upsert({
        property_id: propertyData.id,
        history: updatedHistory,
        last_message_at: new Date().toISOString(),
        traveler_name: 'Voyageur Actuel'
      }, { onConflict: 'property_id' });

    // Gestion de l'alerte
    const lastUserMsg = messagesHistory[messagesHistory.length - 1]?.text || "";
    if (responseText.toLowerCase().includes("hôte") || responseText.toLowerCase().includes("désolé")) {
      const trans = await mistral.chat.complete({
        model: 'mistral-small-2506',
        messages: [{ role: 'system', content: "Traduis en FR." }, { role: 'user', content: lastUserMsg }],
      });
      await sendTelegramAlert(lastUserMsg, trans.choices[0].message.content, propertyData, langCode);
    }

    res.status(200).json({ answer: responseText });
  } catch (error) {
    res.status(500).json({ answer: "Erreur technique." });
  }
}
