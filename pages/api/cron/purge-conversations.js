// pages/api/cron/purge-conversations.js
// Appelé automatiquement chaque nuit à 3h par Vercel Cron
// 1) Purge des historiques de conversations inactives depuis 90 jours (RGPD)
// 2) Gestion des trials : passage en pause à J+30 + rappels emails J+15, J+25, J+29

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.alfredmajor.com';

// ─── Template HTML générique pour les emails ──────────────────────
function emailTemplate({ title, body, cta, ctaUrl, urgent = false }) {
  const ctaColor = urgent ? '#c9a227' : '#1d1d1f';
  const ctaTextColor = urgent ? '#1d1d1f' : '#fff';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:'Inter',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:48px;margin-bottom:8px;">🎩</div>
      <div style="font-size:22px;font-weight:600;color:#1d1d1f;">Alfred<span style="color:#c9a227;">Major</span></div>
    </div>
    <div style="background:white;border-radius:20px;padding:36px;border:1px solid #e8e8ed;">
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#1d1d1f;letter-spacing:-0.4px;">${title}</h1>
      <div style="font-size:15px;color:#6e6e73;line-height:1.65;font-weight:400;">${body}</div>
      <div style="margin-top:28px;">
        <a href="${ctaUrl}" style="display:inline-block;background:${ctaColor};color:${ctaTextColor};text-decoration:none;padding:14px 24px;border-radius:980px;font-weight:600;font-size:15px;">${cta}</a>
      </div>
    </div>
    <p style="text-align:center;font-size:12px;color:#aeaeb2;margin-top:24px;font-weight:300;">© 2026 Alfred Major · L'excellence du service, à portée de clic</p>
  </div>
</body></html>`;
}

// ─── 4 emails trial ───────────────────────────────────────────────
async function sendReminder15(profile) {
  return resend.emails.send({
    from: 'Alfred Major <noreply@alfredmajor.com>',
    to: profile.email,
    subject: 'Vous êtes à mi-parcours de votre essai Alfred Major 🎩',
    html: emailTemplate({
      title: 'Vous êtes à mi-parcours de votre essai 🎩',
      body: `Bonjour ${profile.full_name || ''},<br><br>
        Vous utilisez Alfred Major depuis <strong>15 jours</strong>. Si vos voyageurs sont aussi ravis que nos autres hôtes, c'est le bon moment pour ajouter votre carte et continuer sans interruption après l'essai.<br><br>
        <strong>Rappel : 9,90 € par mois et par logement, sans engagement, résiliable en 1 clic.</strong>`,
      cta: 'Ajouter ma carte',
      ctaUrl: `${SITE_URL}/dashboard`,
    }),
  });
}

async function sendReminder25(profile) {
  return resend.emails.send({
    from: 'Alfred Major <noreply@alfredmajor.com>',
    to: profile.email,
    subject: '⏰ Plus que 5 jours d\'essai gratuit',
    html: emailTemplate({
      title: 'Plus que 5 jours d\'essai gratuit ⏰',
      body: `Bonjour ${profile.full_name || ''},<br><br>
        Votre essai gratuit se termine dans <strong>5 jours</strong>. Pour qu'Alfred continue de répondre à vos voyageurs sans interruption, ajoutez votre carte dès maintenant.<br><br>
        Sans carte ajoutée d'ici la fin de l'essai, votre compte sera mis en pause automatiquement (vos données sont conservées).`,
      cta: 'Ajouter ma carte maintenant',
      ctaUrl: `${SITE_URL}/dashboard`,
      urgent: true,
    }),
  });
}

async function sendReminder29(profile) {
  return resend.emails.send({
    from: 'Alfred Major <noreply@alfredmajor.com>',
    to: profile.email,
    subject: '⚠️ Demain, votre compte Alfred Major sera mis en pause',
    html: emailTemplate({
      title: '⚠️ Demain, votre compte sera mis en pause',
      body: `Bonjour ${profile.full_name || ''},<br><br>
        Votre essai gratuit se termine <strong>demain</strong>. Si aucune carte n'est ajoutée, Alfred cessera de répondre à vos voyageurs et votre compte passera en pause.<br><br>
        <strong>Évitez l'interruption :</strong> ajoutez votre carte en 30 secondes, sans engagement.`,
      cta: 'Ajouter ma carte maintenant',
      ctaUrl: `${SITE_URL}/dashboard`,
      urgent: true,
    }),
  });
}

async function sendPausedEmail(profile) {
  return resend.emails.send({
    from: 'Alfred Major <noreply@alfredmajor.com>',
    to: profile.email,
    subject: '⏸️ Votre compte Alfred Major est en pause',
    html: emailTemplate({
      title: 'Votre compte est en pause — réactivez en 1 clic',
      body: `Bonjour ${profile.full_name || ''},<br><br>
        Votre essai gratuit de 30 jours est terminé. <strong>Vos données sont conservées</strong> (logements, configurations, historique des conversations).<br><br>
        Pour réactiver Alfred immédiatement et qu'il reprenne ses réponses à vos voyageurs, il vous suffit d'ajouter votre carte.`,
      cta: 'Réactiver mon compte',
      ctaUrl: `${SITE_URL}/dashboard`,
      urgent: true,
    }),
  });
}

// ─── HANDLER ──────────────────────────────────────────────────────
export default async function handler(req, res) {
  // Sécurité : seul Vercel Cron peut appeler cette route
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  const results = {
    purgedConversations: 0,
    trialsPaused: 0,
    reminders15: 0,
    reminders25: 0,
    reminders29: 0,
    errors: [],
  };

  // ═══ JOB 1 : Purge RGPD des conversations inactives 90+ jours ═══
  try {
    const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const { error, count } = await supabaseAdmin
      .from('conversations')
      .update({ history: [] })
      .lt('last_message_at', cutoffDate)
      .neq('history', []);
    if (error) throw error;
    results.purgedConversations = count || 0;
    console.log(`✅ Purge RGPD : ${count} conversations vidées`);
  } catch (err) {
    console.error('❌ Erreur purge conversations:', err);
    results.errors.push({ job: 'purge', error: err.message });
  }

  // ═══ JOB 2 : Vérification des trials ═══════════════════════════
  try {
    const now = new Date();

    const { data: trialProfiles, error: profilesErr } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, trial_started_at, trial_expires_at, reminder_15d_sent_at, reminder_25d_sent_at, reminder_29d_sent_at')
      .eq('subscription_status', 'trial');

    if (profilesErr) throw profilesErr;

    for (const profile of trialProfiles || []) {
      if (!profile.email) continue;
      const startedAt = profile.trial_started_at ? new Date(profile.trial_started_at) : null;
      const expiresAt = profile.trial_expires_at ? new Date(profile.trial_expires_at) : null;
      if (!startedAt || !expiresAt) continue;

      const daysElapsed = (now - startedAt) / (1000 * 60 * 60 * 24);

      try {
        // A) Trial expiré → passer en paused + email
        if (expiresAt <= now) {
          await supabaseAdmin
            .from('profiles')
            .update({ subscription_status: 'paused', paused_at: now.toISOString() })
            .eq('id', profile.id);
          await sendPausedEmail(profile);
          results.trialsPaused++;
          continue;
        }

        // B) Rappel J+29 (1 jour avant expiration)
        if (daysElapsed >= 29 && !profile.reminder_29d_sent_at) {
          await sendReminder29(profile);
          await supabaseAdmin
            .from('profiles')
            .update({ reminder_29d_sent_at: now.toISOString() })
            .eq('id', profile.id);
          results.reminders29++;
        }
        // C) Rappel J+25 (5 jours avant expiration)
        else if (daysElapsed >= 25 && !profile.reminder_25d_sent_at) {
          await sendReminder25(profile);
          await supabaseAdmin
            .from('profiles')
            .update({ reminder_25d_sent_at: now.toISOString() })
            .eq('id', profile.id);
          results.reminders25++;
        }
        // D) Rappel J+15 (mi-parcours)
        else if (daysElapsed >= 15 && !profile.reminder_15d_sent_at) {
          await sendReminder15(profile);
          await supabaseAdmin
            .from('profiles')
            .update({ reminder_15d_sent_at: now.toISOString() })
            .eq('id', profile.id);
          results.reminders15++;
        }
      } catch (e) {
        console.error(`Erreur trial user ${profile.id}:`, e.message);
        results.errors.push({ userId: profile.id, error: e.message });
      }
    }
    console.log(`✅ Trials : ${results.trialsPaused} pausés, ${results.reminders15 + results.reminders25 + results.reminders29} rappels envoyés`);
  } catch (err) {
    console.error('❌ Erreur check trials:', err);
    results.errors.push({ job: 'trials', error: err.message });
  }

  return res.status(200).json({ success: true, ...results });
}
