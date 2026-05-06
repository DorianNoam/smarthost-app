import { Mistral } from '@mistralai/mistralai';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Interdit' });

  const { messagesHistory, propertyData } = req.body;

  // Sécurité pour éviter les erreurs Vercel si les données manquent
  if (!messagesHistory || !propertyData) {
    return res.status(400).json({ error: 'Données manquantes' });
  }

  const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

  try {
    const systemMessage = { 
  role: 'system', 
  content: `Tu es MajorMarc, concierge de luxe pour le logement "${propertyData.name}". 

  ZONE 1 : LE LOGEMENT (Infos strictes)
  Utilise uniquement ces données pour les questions techniques :
  - Adresse : ${propertyData.street_number || ''} ${propertyData.address || ''}
  - Wifi : ${propertyData.wifi_name} / MDP : ${propertyData.wifi_password}
  - Arrivée/Départ : ${propertyData.check_in_hour} / ${propertyData.check_out_hour}
  - Règles : ${propertyData.noise_rules}

  ZONE 2 : LES ENVIRONS (Liberté totale)
  - Pour les questions sur les restaurants, les bus, les activités ou l'histoire de la ville, UTILISE TES PROPRES CONNAISSANCES.
  - Sois de bon conseil, suggère des types de cuisine ou des modes de transport courants dans cette zone.
  - Précise que ce sont des suggestions générales.

  ZONE 3 : LES IMPRÉVUS (Alerte Hôte)
  - Si la question concerne un problème technique (fuite, panne), une demande de remboursement, ou une info CRUCIALE sur le logement que tu n'as pas en Zone 1 :
  Réponds exactement : "Je me renseigne immédiatement auprès de votre hôte."

  TON : Prestigieux, chaleureux et expert local.` 
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

    // ALERTE TELEGRAM 
    if (responseText.toLowerCase().includes("hôte") || responseText.toLowerCase().includes("renseigne")) {
      const lastUserMessage = messagesHistory[messagesHistory.length - 1].text;
      await sendTelegramAlert(lastUserMessage, propertyData.name);
    }

    res.status(200).json({ answer: responseText });
  } catch (error) {
    console.error("Erreur API Mistral:", error);
    res.status(500).json({ answer: "Erreur technique, je me renseigne immédiatement auprès de votre hôte." });
  }
}

// Fonction isolée proprement pour Vercel
async function sendTelegramAlert(userQuery, propertyName) {
  const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
  
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) return;

  const text = `🚨 *ALERTE MAJOR MARC*\n\n*Logement :* ${propertyName || 'Inconnu'}\n*Demande :* "${userQuery}"`;
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'Markdown' })
    });
  } catch (e) { 
    console.error("Erreur Telegram:", e); 
  }
}
