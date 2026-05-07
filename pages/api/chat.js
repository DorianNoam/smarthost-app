import { Mistral } from '@mistralai/mistralai';
import { supabase } from '../../lib/supabase'; // Import indispensable pour le Cerveau

// Fonction mise à jour pour envoyer l'alerte au BON propriétaire
async function sendTelegramAlert(originalMsg, translatedMsg, propertyData, lang) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  try {
    // 1. On cherche le Telegram Chat ID du propriétaire dans Supabase
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('telegram_chat_id')
      .eq('id', propertyData.owner_id) // On utilise l'owner_id du logement
      .single();

    if (error || !profile?.telegram_chat_id) {
      console.log("⚠️ Alerte non envoyée : Le propriétaire n'a pas lié son Telegram.");
      return;
    }

    const chatId = profile.telegram_chat_id;
    const text = `🚨 *ALERTE MAJOR MARC*\n\n*Logement :* ${propertyData.name}\n\n*Demande Client (${lang}) :*\n"${originalMsg}"\n\n*Traduction (FR) :*\n"${translatedMsg}"`;

    // 2. Envoi du message au chatId dynamique
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' })
    });
    
    console.log(`✅ Alerte envoyée avec succès au propriétaire du logement : ${propertyData.name}`);
  } catch (e) { 
    console.error("Erreur lors de l'aiguillage de l'alerte Telegram:", e); 
  }
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

      LANGUE : 
      - Tu dois impérativement répondre dans la langue du client (Code : ${langCode}).

      RÈGLES DE LIENS :
      - Pour chaque lieu ou adresse, ajoute : [Voir l'itinéraire sur Google Maps](https://www.google.com/maps/search/?api=1&query=NOM_DU_LIEU_ET_ADRESSE)
      
      TON ET STYLE : Chaleureux, élégant, saute des lignes entre paragraphes.

      INFOS DU LOGEMENT :
      - Adresse : ${propertyData.street_number || ''} ${propertyData.address || ''}, ${propertyData.city || ''}
      - Wifi : ${propertyData.wifi_name} / ${propertyData.wifi_password}
      - Check-in/out : ${propertyData.check_in_hour} / ${propertyData.check_out_hour}

      INCIDENTS :
      - Si le client a un problème (technique, urgence, mécontentement), dis-lui poliment dans sa langue que tu préviens immédiatement son hôte.`
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

    // Détection d'incident pour l'alerte Telegram
    const lastUserMsg = messagesHistory[messagesHistory.length - 1]?.text || "";
    
    const triggerWords = ["hôte", "navré", "sorry", "lo siento", "désolé", "urgence", "problème"];
    const shouldAlert = triggerWords.some(word => responseText.toLowerCase().includes(word));

    if (shouldAlert) {
      // Traduction automatique pour le propriétaire
      const translationResponse = await mistral.chat.complete({
        model: 'mistral-small-2506',
        messages: [
          { role: 'system', content: "Traduis ce message de client en Français simple pour son hôte. Ne donne que la traduction." }, 
          { role: 'user', content: lastUserMsg }
        ],
      });
      
      const translatedMsg = translationResponse.choices[0].message.content;
      
      // ON APPELLE NOTRE NOUVELLE FONCTION INTELLIGENTE
      await sendTelegramAlert(lastUserMsg, translatedMsg, propertyData, langCode);
    }

    res.status(200).json({ answer: responseText });
  } catch (error) {
    console.error("Erreur Chat API:", error);
    res.status(500).json({ answer: "Désolé, je rencontre une difficulté technique." });
  }
}
