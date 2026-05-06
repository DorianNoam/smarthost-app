import { Mistral } from '@mistralai/mistralai';

/**
 * Envoie une alerte sur Telegram si Marc ne connaît pas la réponse
 * ou si le système rencontre une erreur.
 */
async function sendTelegramAlert(userQuery, propertyName) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  if (!token || !chatId) return;

  const text = `🚨 *ALERTE MAJOR MARC*\n\n*Logement :* ${propertyName || 'Inconnu'}\n*Demande :* "${userQuery}"`;
  
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: chatId, 
        text: text, 
        parse_mode: 'Markdown' 
      })
    });
  } catch (e) { 
    console.error("Erreur d'envoi Telegram:", e); 
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { messagesHistory, propertyData } = req.body;

  // SÉCURITÉ : Vérification des données entrantes
  if (!messagesHistory || !propertyData) {
    return res.status(200).json({ 
      answer: "Bonjour ! Je suis prêt à vous aider, mais je n'ai pas reçu les informations du logement. Pourriez-vous rafraîchir la page ?" 
    });
  }

  const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

  try {
    const systemMessage = { 
      role: 'system', 
      content: `Tu es MajorMarc, concierge de luxe pour le logement "${propertyData.name || 'notre villa'}". 

      RÈGLES DE STYLE ET LISIBILITÉ (OBLIGATOIRE) :
      - NE FAIS JAMAIS de longs paragraphes. Maximum 2 lignes par bloc.
      - Saute SYSTÉMATIQUEMENT une ligne entre chaque idée.
      - Utilise des listes à puces (•) pour énumérer des choix ou des lieux.
      - Mets les informations cruciales en **GRAS** (noms, horaires, codes).

      ZONE 1 : INFOS LOGEMENT (Priorité absolue)
      - Adresse : ${propertyData.street_number || ''} ${propertyData.address || ''}
      - Wifi : Nom "${propertyData.wifi_name || 'Non configuré'}", MDP "${propertyData.wifi_password || 'Non configuré'}"
      - Arrivée : Dès ${propertyData.check_in_hour || '15h'}.
      - Départ : Avant ${propertyData.check_out_hour || '11h'}.
      - Règles : ${propertyData.noise_rules || 'Respect du voisinage.'}

      ZONE 2 : GUIDE LOCAL (Expertise)
      - Pour les restaurants, bus ou activités, utilise tes connaissances.
      - Format recommandé : "• **Nom** : Brève description."
      - Précise toujours de vérifier les horaires en temps réel.

      ZONE 3 : CAS D'URGENCE OU PANNE
      - Pour toute panne technique, demande de remboursement ou info absente de la Zone 1 :
      Réponds exactement : "Je me renseigne immédiatement auprès de votre hôte."

      TON : Prestigieux, chaleureux, expert et très synthétique.` 
    };

    // Conversion de l'historique pour le format Mistral
    const formattedHistory = messagesHistory.map(msg => ({
      role: msg.role === 'marc' ? 'assistant' : 'user',
      content: msg.text || ''
    }));

    // Appel à Mistral avec le modèle à haute capacité (mistral-small-2506)
    const chatResponse = await mistral.chat.complete({
      model: 'mistral-small-2506', 
      messages: [systemMessage, ...formattedHistory],
      temperature: 0.7,
    });

    const responseText = chatResponse.choices[0].message.content;

    // Déclenchement de l'alerte Telegram si Marc passe le relais à l'hôte
    if (responseText.toLowerCase().includes("hôte") || responseText.toLowerCase().includes("renseigne")) {
      const lastUserQuery = messagesHistory[messagesHistory.length - 1]?.text || "Question non identifiée";
      await sendTelegramAlert(lastUserQuery, propertyData.name);
    }

    res.status(200).json({ answer: responseText });

  } catch (error) {
    console.error("ERREUR API MISTRAL:", error);
    
    // Alerte d'urgence si l'IA crash (ex: quota dépassé)
    const lastUserQuery = messagesHistory[messagesHistory.length - 1]?.text || "Inconnue";
    await sendTelegramAlert(`⚠️ CRASH SYSTÈME : "${lastUserQuery}"`, propertyData.name);

    res.status(500).json({ 
      answer: "Pardonnez-moi, je rencontre une petite difficulté technique. Je contacte immédiatement votre hôte pour vous répondre." 
    });
  }
}
