import { createClient } from '@supabase/supabase-js';

// ⚠️ Client ADMIN pour bypasser la RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📨 Webhook Telegram reçu:', JSON.stringify(req.body));
    const { message } = req.body;

    if (message && message.text) {
      const chatId = message.chat.id;
      const text = message.text.trim();

      // Cas 1 : Deep link "/start UUID"
      if (text.startsWith('/start ')) {
        const userId = text.replace('/start ', '').trim();
        console.log('🔗 Liaison pour userId:', userId, 'chatId:', chatId);

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(userId)) {
          await sendTelegramMessage(chatId, "❌ Lien invalide. Retournez sur Alfred Major et recliquez sur 'Lier mon compte Telegram'.");
          return res.status(200).send('OK');
        }

        const { data, error } = await supabaseAdmin
          .from('profiles')
          .update({ telegram_chat_id: chatId.toString() })
          .eq('id', userId)
          .select();

        console.log('📊 Résultat update:', { data, error });

        if (error) {
          console.error('❌ Erreur Supabase:', error);
          await sendTelegramMessage(chatId, "❌ Erreur de liaison. Réessayez depuis Alfred Major.");
        } else if (!data || data.length === 0) {
          await sendTelegramMessage(chatId, "❌ Compte introuvable. Êtes-vous bien connecté sur alfredmajor.com ?");
        } else {
          await sendTelegramMessage(
            chatId,
            "✅ *Alfred Major est connecté !*\n\nVotre compte est désormais lié. Vous recevrez toutes les alertes urgentes ici."
          );
        }
      }
      // Cas 2 : "/start" tout seul
      else if (text === '/start') {
        await sendTelegramMessage(
          chatId,
          "👋 Bonjour ! Pour lier votre compte, retournez sur *alfredmajor.com → Paramètres* et cliquez sur *'Lier mon compte Telegram'*."
        );
      }
    }

    return res.status(200).send('OK');

  } catch (error) {
    console.error("💥 Erreur Webhook:", error);
    return res.status(200).send('OK');
  }
}

async function sendTelegramMessage(chatId, text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error("TELEGRAM_BOT_TOKEN manquant");
    return;
  }
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' })
    });
    const result = await r.json();
    console.log('📤 Réponse Telegram:', result);
  } catch (err) {
    console.error("Erreur sendMessage:", err);
  }
}
