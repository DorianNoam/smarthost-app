import { Mistral } from '@mistralai/mistralai';

async function sendTelegramAlert(userQuery, propertyName) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const text = `🚨 *ALERTE MAJOR MARC*\n\n*Logement :* ${propertyName || 'Inconnu'}\n*Demande :* "${userQuery}"`;
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

  const { messagesHistory, propertyData } = req.body;
  const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

  try {
    const systemMessage = { 
      role: 'system', 
      content: `Tu es Marc, le majordome raffiné de "${propertyData.name}". 

      RÈGLES DE LIENS (TRÈS IMPORTANT) :
      - Dès que tu mentionnes un lieu (restaurant, magasin, monument) ou l'adresse de la villa, ajoute SYSTÉMATIQUEMENT un lien Google Maps.
      - Utilise ce format exact : [Voir l'itinéraire sur Google Maps](https://www.google.com/maps/search/?api=1&query=NOM_DU_LIEU_ET_ADRESSE)
      - Ne donne jamais d'adresse incomplète. Sois précis.

      TON ET STYLE :
      - Sois chaleureux, élégant et prévenant.
      - Saute une ligne entre chaque paragraphe.
      - Utilise des listes à puces (•) pour énumérer des lieux.

      INFOS DU LOGEMENT :
      - Adresse complète : ${propertyData.street_number || ''} ${propertyData.address || ''}, ${propertyData.city || ''}
      - Wifi : ${propertyData.wifi_name} / ${propertyData.wifi_password}
      - Check-in/out : ${propertyData.check_in_hour} / ${propertyData.check_out_hour}

      GESTION DES INCIDENTS :
      - Si le client a un problème technique : "Je suis sincèrement navré. Je préviens immédiatement votre hôte pour résoudre cela."`
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

    if (responseText.toLowerCase().includes("hôte") || responseText.toLowerCase().includes("navré")) {
      const lastMsg = messagesHistory[messagesHistory.length - 1]?.text || "Besoin d'aide";
      await sendTelegramAlert(lastMsg, propertyData.name);
    }

    res.status(200).json({ answer: responseText });
  } catch (error) {
    res.status(500).json({ answer: "Je vous prie de m'excuser, je rencontre une difficulté technique. Je contacte votre hôte immédiatement." });
  }
}
