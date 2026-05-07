import { Mistral } from '@mistralai/mistralai';
import { supabase } from '../../lib/supabase';

// Fonction pour envoyer l'alerte au BON propriétaire
async function sendTelegramAlert(originalMsg, translatedMsg, propertyData, lang) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  try {
    // 1. Recherche du Chat ID via l'owner_id du logement
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('telegram_chat_id')
      .eq('id', propertyData.owner_id)
      .single();

    if (error || !profile?.telegram_chat_id) {
      console.log("⚠️ Alerte non envoyée : Pas de Telegram lié.");
      return;
    }

    const chatId = profile.telegram_chat_id;
    const text = `🚨 *ALERTE MAJOR MARC*\n\n` +
                 `🏠 *Logement :* ${propertyData.name}\n` +
                 `🌍 *Langue :* ${lang}\n\n` +
                 `💬 *Message Client :*\n"${originalMsg}"\n\n` +
                 `🇫🇷 *Traduction Marc :*\n"${translatedMsg}"`;

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' })
    });
    
    console.log(`✅ Alerte envoyée au propriétaire de : ${propertyData.name}`);
  } catch (e) { 
    console.error("Erreur Telegram Alert:", e); 
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Méthode non autorisée');

  const { messagesHistory, propertyData, userLanguage } = req.body;
  const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
  const langCode = userLanguage ? userLanguage.split('-')[0] : 'fr';
  
  // On récupère le dernier message du client
  const lastUserMsg = messagesHistory[messagesHistory.length - 1]?.text || "";

  try {
    // --- 💾 ARCHIVAGE : ENREGISTRER LE MESSAGE DU CLIENT ---
    if (lastUserMsg) {
      await supabase.from('conversations').insert({
        property_id: propertyData.id,
        role: 'guest',
        text: lastUserMsg
      });
    }

    // --- 🤖 IA : GÉNÉRATION DE LA RÉPONSE ---
    const systemMessage = { 
      role: 'system', 
      content: `Tu es Marc, le majordome raffiné de "${propertyData.name}". 
      Réponds en ${langCode}. Ton ton est élégant.
      
      LOGEMENT :
      - Adresse : ${propertyData.address}, ${propertyData.city}
      - Wifi : ${propertyData.wifi_name} / ${propertyData.wifi_password}
      
      INCIDENTS : Si le client a un souci, dis-lui que tu préviens son hôte.`
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

    // --- 💾 ARCHIVAGE : ENREGISTRER LA RÉPONSE DE MARC ---
    await supabase.from('conversations').insert({
      property_id: propertyData.id,
      role: 'marc',
      text: responseText
    });

    // --- 🔔 ALERTE : DÉTECTION D'URGENCE ---
    const triggerWords = ["hôte", "navré", "sorry", "lo siento", "désolé", "urgence", "problème", "fuite", "panne"];
    const shouldAlert = triggerWords.some(word => responseText.toLowerCase().includes(word));

    if (shouldAlert) {
      const translationResponse = await mistral.chat.complete({
        model: 'mistral-small-2506',
        messages: [
          { role: 'system', content: "Résume ce problème de client en Français pour son hôte. Sois très court." }, 
          { role: 'user', content: lastUserMsg }
        ],
      });
      
      const translatedMsg = translationResponse.choices[0].message.content;
      await sendTelegramAlert(lastUserMsg, translatedMsg, propertyData, langCode);
    }

    // --- ENVOI AU CLIENT ---
    res.status(200).json({ answer: responseText });

  } catch (error) {
    console.error("Erreur Chat API:", error);
    res.status(500).json({ answer: "Une erreur technique est survenue." });
  }
}
