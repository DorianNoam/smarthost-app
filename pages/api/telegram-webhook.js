// Fichier : pages/api/telegram-webhook.js
import { supabase } from '../../lib/supabase'; // Ton client Supabase admin

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const message = req.body.message;

    // Si on reçoit un message texte
    if (message && message.text) {
      const chatId = message.chat.id;
      const text = message.text;

      // Si le texte commence par "/start " (ce que fait le Deep Link)
      if (text.startsWith('/start ')) {
        const clientId = text.replace('/start ', ''); // On récupère "12345"

        // On sauvegarde le Chat ID dans Supabase pour CE client
        const { error } = await supabase
          .from('profiles') // Ta table de clients
          .update({ telegram_chat_id: chatId })
          .eq('id', clientId);

        if (!error) {
          // On envoie un message de confirmation au client sur Telegram
          await sendTelegramMessage(chatId, "✅ Parfait ! Votre compte MajorMarc est bien lié. Vous recevrez les alertes urgentes ici.");
        }
      }
    }
    // Toujours répondre 200 à Telegram pour dire "C'est bon, j'ai reçu"
    res.status(200).send('OK');
  }
}
