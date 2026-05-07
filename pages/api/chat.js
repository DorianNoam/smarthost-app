import { Mistral } from '@mistralai/mistralai';
import { supabase } from '../../lib/supabase';

// 1. Fonction d'alerte Telegram (Ta version fonctionnelle)
async function sendTelegramAlert(originalMsg, translatedMsg, propertyData, lang) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('telegram_chat_id')
      .eq('id', propertyData.owner_id)
      .single();

    if (error || !profile?.telegram_chat_id) return;

    const chatId = profile.telegram_chat_id;
    const text = `🚨 *ALERTE MAJOR MARC*\n\n*Logement :* ${propertyData.name}\n\n*Demande Client (${lang}) :*\n"${originalMsg}"\n\n*Traduction (FR) :*\n"${translatedMsg}"`;

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' })
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
      content: `Tu es Marc, le majordome raffiné de "${propertyData.name}". 
      Réponds en ${langCode}. 
      TON : Chaleureux et élégant.
      INFOS : Wifi ${propertyData.wifi_name} / ${propertyData.wifi_password}.
      INCIDENTS : Si (et seulement si) il y a un problème technique ou une urgence, dis que tu préviens l'hôte.`
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

    // --- 💾 SAUVEGARDE DANS LA COLONNE HISTORY (JSONB) ---
    // On prépare le nouvel historique à enregistrer
    const newHistory = [
      ...messagesHistory,
      { role: 'marc', text: responseText, created_at: new Date().toISOString() }
    ];

    await supabase
      .from('conversations')
      .upsert({
        property_id: propertyData.id,
        history: newHistory,
        last_message_at: new Date().toISOString(),
        traveler_name: 'Voyageur'
      }, { onConflict: 'property_id' }); 


    // --- 🔔 DÉTECTION D'INCIDENT (Version affinée) ---
    const lastUserMsg = messagesHistory[messagesHistory.length - 1]?.text || "";
    
    // On ne déclenche l'alerte que si des mots de "vrai" problème apparaissent
    // pour éviter les notifs quand Marc est juste poli (ex: "Je suis navré de ne pas comprendre")
    const triggerWords = ["urgence", "problème", "panne", "fuite", "cassé", "dysfonctionnement", "préviens votre hôte"];
    const shouldAlert = triggerWords.some(word => responseText.toLowerCase().includes(word));

    if (shouldAlert) {
      const translationResponse = await mistral.chat.complete({
        model: 'mistral-small-2506',
        messages: [
          { role: 'system', content: "Traduis ce problème client en Français simple." }, 
          { role: 'user', content: lastUserMsg }
        ],
      });
      const translatedMsg = translationResponse.choices[0].message.content;
      await sendTelegramAlert(lastUserMsg, translatedMsg, propertyData, langCode);
    }

    res.status(200).json({ answer: responseText });

  } catch (error) {
    console.error("Erreur Chat API:", error);
    res.status(500).json({ answer: "Désolé, je rencontre une difficulté technique." });
  }
}
