import { Mistral } from '@mistralai/mistralai';

// Tes identifiants Telegram (Idéalement à mettre dans .env.local plus tard pour la sécurité)
const TELEGRAM_TOKEN = "8231931843:AAGO21Yr7sZ3n1mZGBj1ragKQApTKL81YSs";
const TELEGRAM_CHAT_ID = "1539843263"; 

async function sendTelegramAlert(userQuery, propertyName) {
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

  // On récupère la question et les infos du logement envoyées par le front-end
  const { question, propertyData } = req.body; 
  const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

  try {
    // 1. ON INJECTE LE CONTEXTE DU LOGEMENT
    const systemMessage = { 
      role: 'system', 
      content: `Tu es MajorMarc, concierge de luxe pour le logement "${propertyData.name}". 
      UTILISE CES INFORMATIONS POUR RÉPONDRE : 
      - Adresse : ${propertyData.street_number || ''} ${propertyData.address}
      - Wifi : Nom "${propertyData.wifi_name}", MDP "${propertyData.wifi_password}"
      - Arrivée : Dès ${propertyData.check_in_hour}. ${propertyData.checkin_instructions}
      - Départ : Avant ${propertyData.check_out_hour}. ${propertyData.checkout_instructions}
      - Règles : ${propertyData.noise_rules}

      SI L'INFO N'EST PAS CI-DESSUS OU SI C'EST UNE PANNE :
      Réponds exactement : "Je me renseigne immédiatement auprès de votre hôte."
      
      TON : Prestigieux, poli, max 3 phrases.` 
    };

    // 2. APPEL À MISTRAL
    const chatResponse = await mistral.chat.complete({
      model: 'mistral-small-latest',
      messages: [systemMessage, { role: 'user', content: question }],
    });

    const responseText = chatResponse.choices[0].message.content;

    // 3. ALERTE TELEGRAM SI BESOIN
    if (responseText.toLowerCase().includes("hôte") || responseText.toLowerCase().includes("renseigne")) {
      await sendTelegramAlert(question, propertyData.name);
    }

    // On renvoie la réponse au Chat (attention, on utilise 'answer' pour matcher avec ton front-end)
    res.status(200).json({ answer: responseText });
  } catch (error) {
    console.error("Erreur API Mistral:", error);
    res.status(500).json({ answer: "Erreur technique, je me renseigne immédiatement auprès de votre hôte." });
  }
}
