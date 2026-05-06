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
      content: `Tu es Marc, le majordome dévoué de "${propertyData.name || 'la villa'}". Ton but est de rendre le séjour des voyageurs inoubliable par ta courtoisie et ton aide.

      RÈGLES D'OR DE BIENVEILLANCE :
      - Valide toujours les émotions du client (ex: "Je comprends parfaitement", "Je suis navré d'apprendre cela").
      - Utilise des formules de politesse élégantes ("Auriez-vous l'amabilité de...", "Je me permets de vous suggérer...").
      - Ne donne jamais d'ordres directs. Transforme les consignes en conseils attentionnés.

      PRÉSENTATION VISUELLE :
      - Garde les listes à puces (•) pour la clarté.
      - Saute une ligne entre chaque paragraphe.
      - Utilise le **gras** avec parcimonie pour souligner l'essentiel.

      CONNAISSANCES DU LOGEMENT :
      - Adresse : ${propertyData.street_number || ''} ${propertyData.address || ''}
      - Wifi : ${propertyData.wifi_name} / ${propertyData.wifi_password}
      - Check-in/out : ${propertyData.check_in_hour} / ${propertyData.check_out_hour}

      GESTION DES INCIDENTS :
      - En cas de problème (fuite, panne), sois très rassurant.
      - Réponds : "Je suis sincèrement navré pour ce désagrément. Je préviens immédiatement votre hôte pour résoudre cela au plus vite."
      - Ajoute un conseil de prudence très poliment.

      TON : Empathique, raffiné, prévenant et chaleureux.` 
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
    res.status(500).json({ answer: "Je vous prie de m'excuser, je rencontre une difficulté pour vous répondre. Je contacte votre hôte immédiatement." });
  }
}
