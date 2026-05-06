import { Mistral } from '@mistralai/mistralai';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegramAlert(userQuery, propertyName) {
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) return;
  const text = `🚨 *ALERTE MAJOR MARC*\n\n*Logement :* ${propertyName || 'Inconnu'}\n*Demande :* "${userQuery}"`;
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'Markdown' })
    });
  } catch (e) { console.error("Erreur Telegram:", e); }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Interdit' });

  // On récupère l'historique complet au lieu d'une seule question
  const { messagesHistory, propertyData } = req.body; 
  const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

  try {
    const systemMessage = { 
      role: 'system', 
      content: `Tu es MajorMarc, concierge de luxe pour le logement "${propertyData.name}". 
      
      UTILISE STRICTEMENT CES INFORMATIONS : 
      - Adresse : ${propertyData.street_number || ''} ${propertyData.address}
      - Wifi : Nom "${propertyData.wifi_name}", MDP "${propertyData.wifi_password}"
      - Arrivée : Dès ${propertyData.check_in_hour}. ${propertyData.checkin_instructions}
      - Départ : Avant ${propertyData.check_out_hour}. ${propertyData.checkout_instructions}
      - Règles : ${propertyData.noise_rules}

      CONSIGNES :
      1. Réponds poliment et de manière fluide selon le contexte de la conversation.
      2. Si on te dit "ok" ou "merci", conclus poliment.
      3. POUR TOUTE QUESTION DONT LA RÉPONSE N'EST PAS DANS LA LISTE :
      Réponds exactement : "Je me renseigne immédiatement auprès de votre hôte."
      
      TON : Prestigieux, poli, concis.` 
    };

    // On transforme notre historique (marc/user) dans le format de Mistral (assistant/user)
    const formattedHistory = messagesHistory.map(msg => ({
      role: msg.role === 'marc' ? 'assistant' : 'user',
      content: msg.text
    }));

    // On envoie le message système + tout l'historique
    const chatResponse = await mistral.chat.complete({
      model: 'mistral-small-latest',
      messages: [systemMessage, ...formattedHistory],
    });

    const responseText = chatResponse.choices[0].message.content;

    // ALERTE TELEGRAM 
    if (responseText.toLowerCase().includes("hôte") || responseText.toLowerCase().includes("renseigne")) {
      // On prend la dernière question posée par l'utilisateur pour l'alerte
      const lastUserMessage = messagesHistory[messagesHistory.length - 1].text;
      await sendTelegramAlert(lastUserMessage, propertyData.name);
    }

    res.status(200).json({ answer: responseText });
  } catch (error) {
    console.error("Erreur API Mistral:", error);
    res.status(500).json({ answer: "Erreur technique, je me renseigne immédiatement auprès de votre hôte." });
  }
}
