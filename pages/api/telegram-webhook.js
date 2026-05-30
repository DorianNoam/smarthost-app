// pages/api/telegram-webhook.js
import { createClient } from '@supabase/supabase-js';

// ⚠️ Client ADMIN pour bypasser la RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─────────────────────────────────────────────
// MESSAGES DE LIAISON LOCALISÉS
// ─────────────────────────────────────────────
function getLinkMessages(lang) {
  const messages = {
    fr: {
      success: "✅ *Alfred Major est connecté !*\n\nVotre compte est désormais lié. Vous recevrez toutes les alertes urgentes ici.",
      invalidLink: "❌ Lien invalide. Retournez sur Alfred Major et recliquez sur 'Lier mon compte Telegram'.",
      dbError: "❌ Erreur de liaison. Réessayez depuis Alfred Major.",
      notFound: "❌ Compte introuvable. Êtes-vous bien connecté sur alfredmajor.com ?",
      instructions: "👋 Bonjour ! Pour lier votre compte, retournez sur *alfredmajor.com → Paramètres* et cliquez sur *'Lier mon compte Telegram'*.",
    },
    it: {
      success: "✅ *Alfred Major è connesso!*\n\nIl suo account è ora collegato. Riceverà tutte le allerte urgenti qui.",
      invalidLink: "❌ Link non valido. Torna su Alfred Major e fai nuovamente clic su 'Collega il mio account Telegram'.",
      dbError: "❌ Errore di collegamento. Riprova da Alfred Major.",
      notFound: "❌ Account non trovato. Sei connesso su alfredmajor.com?",
      instructions: "👋 Ciao! Per collegare il tuo account, torna su *alfredmajor.com → Impostazioni* e clicca su *'Collega il mio account Telegram'*.",
    },
    en: {
      success: "✅ *Alfred Major is connected!*\n\nYour account is now linked. You will receive all urgent alerts here.",
      invalidLink: "❌ Invalid link. Go back to Alfred Major and click 'Link my Telegram account' again.",
      dbError: "❌ Linking error. Please try again from Alfred Major.",
      notFound: "❌ Account not found. Are you logged in on alfredmajor.com?",
      instructions: "👋 Hello! To link your account, go back to *alfredmajor.com → Settings* and click *'Link my Telegram account'*.",
    },
    es: {
      success: "✅ *¡Alfred Major está conectado!*\n\nSu cuenta ya está vinculada. Recibirá todas las alertas urgentes aquí.",
      invalidLink: "❌ Enlace no válido. Vuelve a Alfred Major y haz clic en 'Vincular mi cuenta de Telegram' de nuevo.",
      dbError: "❌ Error de vinculación. Inténtalo de nuevo desde Alfred Major.",
      notFound: "❌ Cuenta no encontrada. ¿Estás conectado en alfredmajor.com?",
      instructions: "👋 ¡Hola! Para vincular tu cuenta, vuelve a *alfredmajor.com → Configuración* y haz clic en *'Vincular mi cuenta de Telegram'*.",
    },
    de: {
      success: "✅ *Alfred Major ist verbunden!*\n\nIhr Konto ist jetzt verknüpft. Sie erhalten alle dringenden Benachrichtigungen hier.",
      invalidLink: "❌ Ungültiger Link. Gehen Sie zu Alfred Major zurück und klicken Sie erneut auf 'Mein Telegram-Konto verknüpfen'.",
      dbError: "❌ Verknüpfungsfehler. Bitte versuchen Sie es erneut von Alfred Major.",
      notFound: "❌ Konto nicht gefunden. Sind Sie auf alfredmajor.com eingeloggt?",
      instructions: "👋 Hallo! Um Ihr Konto zu verknüpfen, gehen Sie zu *alfredmajor.com → Einstellungen* und klicken Sie auf *'Mein Telegram-Konto verknüpfen'*.",
    },
    pt: {
      success: "✅ *Alfred Major está conectado!*\n\nA sua conta está agora ligada. Receberá todos os alertas urgentes aqui.",
      invalidLink: "❌ Link inválido. Volte ao Alfred Major e clique novamente em 'Ligar a minha conta Telegram'.",
      dbError: "❌ Erro de ligação. Tente novamente a partir do Alfred Major.",
      notFound: "❌ Conta não encontrada. Está ligado em alfredmajor.com?",
      instructions: "👋 Olá! Para ligar a sua conta, volte a *alfredmajor.com → Definições* e clique em *'Ligar a minha conta Telegram'*.",
    },
    nl: {
      success: "✅ *Alfred Major is verbonden!*\n\nUw account is nu gekoppeld. U ontvangt alle urgente meldingen hier.",
      invalidLink: "❌ Ongeldige link. Ga terug naar Alfred Major en klik opnieuw op 'Mijn Telegram-account koppelen'.",
      dbError: "❌ Koppelfout. Probeer het opnieuw vanuit Alfred Major.",
      notFound: "❌ Account niet gevonden. Bent u ingelogd op alfredmajor.com?",
      instructions: "👋 Hallo! Om uw account te koppelen, gaat u terug naar *alfredmajor.com → Instellingen* en klikt u op *'Mijn Telegram-account koppelen'*.",
    },
    ar: {
      success: "✅ *تم توصيل ألفريد ماجور!*\n\nتم ربط حسابك الآن. ستتلقى جميع التنبيهات العاجلة هنا.",
      invalidLink: "❌ رابط غير صالح. عد إلى Alfred Major وانقر مرة أخرى على 'ربط حساب Telegram الخاص بي'.",
      dbError: "❌ خطأ في الربط. يرجى المحاولة مرة أخرى من Alfred Major.",
      notFound: "❌ الحساب غير موجود. هل أنت متصل على alfredmajor.com؟",
      instructions: "👋 مرحباً! لربط حسابك، عد إلى *alfredmajor.com → الإعدادات* وانقر على *'ربط حساب Telegram الخاص بي'*.",
    },
  };
  return messages[lang] || messages['en'];
}

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

      // Détection de la langue de l'hôte via son Telegram
      const userLang = message.from?.language_code?.split('-')[0] || 'fr';
      const m = getLinkMessages(userLang);

      // Cas 1 : Deep link "/start UUID"
      if (text.startsWith('/start ')) {
        const userId = text.replace('/start ', '').trim();
        console.log('🔗 Liaison pour userId:', userId, 'chatId:', chatId, 'lang:', userLang);

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(userId)) {
          await sendTelegramMessage(chatId, m.invalidLink);
          return res.status(200).send('OK');
        }

        // ── Sauvegarde du telegram_chat_id ET de la langue préférée de l'hôte ──
        const { data, error } = await supabaseAdmin
          .from('profiles')
          .update({
            telegram_chat_id: chatId.toString(),
            preferred_language: userLang,  // ← on stocke la langue de l'hôte
          })
          .eq('id', userId)
          .select();

        console.log('📊 Résultat update:', { data, error });

        if (error) {
          console.error('❌ Erreur Supabase:', error);
          await sendTelegramMessage(chatId, m.dbError);
        } else if (!data || data.length === 0) {
          await sendTelegramMessage(chatId, m.notFound);
        } else {
          await sendTelegramMessage(chatId, m.success);
        }
      }

      // Cas 2 : "/start" tout seul
      else if (text === '/start') {
        await sendTelegramMessage(chatId, m.instructions);
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
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
    });
    const result = await r.json();
    console.log('📤 Réponse Telegram:', result);
  } catch (err) {
    console.error("Erreur sendMessage:", err);
  }
}
