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
      content: `Tu es MajorMarc, concierge de luxe pour "${propertyData.name}". 

      RÈGLES DE MISE EN PAGE :
      - Fais des phrases courtes.
      - Utilise des listes à puces (•) pour les choix.
      - Mets les infos importantes en **GRAS**.
      - Saute une ligne entre chaque paragraphe.

      ZONE 1 : LE LOGEMENT (Infos prioritaires)
      - Adresse : ${propertyData.street_number || ''} ${propertyData.address || ''}
      - Wifi : ${propertyData.wifi_name || 'Non configuré'} / MDP : ${propertyData.wifi_password || 'Non configuré'}
      - Arrivée : Dès ${propertyData.check_in_hour || '15h'}.
      - Départ : Avant ${propertyData.check_out_hour || '11h'}.

      ZONE 2 : GUIDE LOCAL (Suggestions)
      - Pour les restos, les bus ou les activités, utilise tes connaissances générales.
      - Sois précis mais précise que ce sont des suggestions.
      - Format : "• **Nom** : Description rapide."

      ZONE 3 : ALERTE HÔTE
      - Pour les pannes, les réclamations ou les infos techniques que tu n'as pas :
      Réponds exactement : "Je me renseigne immédiatement auprès de votre hôte."

      TON : Prestigieux, expert et concis.` 
    };

    const formattedHistory = messagesHistory.map(msg => ({
      role: msg.role === 'marc' ? 'assistant' : 'user',
      content: msg.text
    }));

    const chatResponse = await mistral.chat.complete({
      model: 'mistral-small-latest',
      messages: [systemMessage, ...formattedHistory],
    });

    const responseText = chatResponse.choices[0].message.content;

    if (responseText.toLowerCase().includes("hôte") || responseText.toLowerCase().includes("renseigne")) {
      const lastUserMessage = messagesHistory[messagesHistory.length - 1].text;
      await sendTelegramAlert(lastUserMessage, propertyData.name);
    }

    res.status(200).json({ answer: responseText });
  } catch (error) {
    console.error(error);
    res.status(500).json({ answer: "Je me renseigne immédiatement auprès de votre hôte." });
  }
}
