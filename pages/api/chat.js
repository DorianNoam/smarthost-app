import { Mistral } from '@mistralai/mistralai';

// Fonction pour envoyer l'alerte bilingue
async function sendTelegramAlert(originalMsg, translatedMsg, propertyName, lang) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const text = `🚨 *ALERTE MAJOR MARC*\n\n*Logement :* ${propertyName}\n\n*Demande Client (${lang}) :*\n"${originalMsg}"\n\n*Traduction (FR) :*\n"${translatedMsg}"`;

  try {
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
    
    // Si Marc s'excuse ou mentionne l'hôte, on déclenche l'alerte bilingue
    if (responseText.toLowerCase().includes("hôte") || 
        responseText.toLowerCase().includes("navré") || 
        responseText.toLowerCase().includes("sorry") || 
        responseText.toLowerCase().includes("lo siento")) {
      
      // On demande rapidement à Mistral de traduire le problème du client en Français pour le proprio
      const translationResponse = await mistral.chat.complete({
        model: 'mistral-small-2506',
        messages: [{ role: 'system', content: "Traduis ce message de client en Français simple pour son hôte. Ne donne que la traduction." }, { role: 'user', content: lastUserMsg }],
      });
      
      const translatedMsg = translationResponse.choices[0].message.content;
      await sendTelegramAlert(lastUserMsg, translatedMsg, propertyData.name, langCode);
    }

    res.status(200).json({ answer: responseText });
  } catch (error) {
    res.status(500).json({ answer: "Désolé, je rencontre une difficulté technique." });
  }
}
