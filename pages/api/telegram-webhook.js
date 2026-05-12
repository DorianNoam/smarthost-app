import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  // Telegram communique uniquement via des requêtes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    // On vérifie si on a reçu un message texte
    if (message && message.text) {
      const chatId = message.chat.id;
      const text = message.text;

      // Si le texte commence par "/start " (cas du Deep Linking)
      if (text.startsWith('/start ')) {
        // On extrait l'ID de l'utilisateur (ex: l'UUID Supabase envoyé dans l'URL)
        const userId = text.replace('/start ', '').trim();

        // 1. Mise à jour du profil utilisateur dans Supabase
        const { error } = await supabase
          .from('profiles')
          .update({ telegram_chat_id: chatId.toString() })
          .eq('id', userId);

        if (!error) {
          // 2. Envoi d'un message de confirmation au client sur Telegram
          await sendTelegramMessage(chatId, "✅ Alfred Major est connecté !\n\nVotre compte est désormais lié. Vous recevrez toutes les alertes urgentes concernant vos logements directement ici.");
        } else {
          console.error("Erreur Supabase lors de la liaison Telegram:", error);
          // On peut envoyer un petit message d'erreur au client si besoin
          await sendTelegramMessage(chatId, "❌ Une erreur est survenue lors de la liaison. Veuillez réessayer depuis votre interface MajorMarc.");
        }
      }
    }

    // On renvoie toujours un statut 200 à Telegram pour accuser réception
    return res.status(200).send('OK');

  } catch (error) {
    console.error("Erreur Webhook Telegram:", error);
    // On renvoie 200 même en cas d'erreur serveur pour éviter que Telegram ne boucle
    return res.status(200).send('OK');
  }
}

/**
 * Fonction utilitaire pour envoyer des messages via l'API Bot Telegram
 */
async function sendTelegramMessage(chatId, text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!token) {
    console.error("TELEGRAM_BOT_TOKEN manquant dans les variables d'environnement");
    return;
  }

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown' // Permet d'utiliser du gras ou de l'italique
      })
    });
  } catch (err) {
    console.error("Erreur lors de l'envoi du message Telegram:", err);
  }
}
