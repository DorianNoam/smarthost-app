import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─────────────────────────────────────────────
// CONFIGURATION EMAIL OVH
// ─────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_HOST,
  port: parseInt(process.env.EMAIL_SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─────────────────────────────────────────────
// HELPERS — gestion sans nom ni ville
// ─────────────────────────────────────────────
function getGreeting(prospect) {
  const firstName = prospect.name?.split(' ')[0];
  if (firstName && firstName.toLowerCase() !== 'test') {
    return `Bonjour ${firstName},`;
  }
  return 'Bonjour,';
}

function getIntro(prospect) {
  const city = prospect.city;
  if (city) {
    return `Je m'appelle <strong>Dorian</strong>, je suis le fondateur d'<strong>Alfred Major</strong>. 
        J'ai trouvé votre activité à ${city} et je pense qu'Alfred peut vous faire gagner un temps précieux.`;
  }
  return `Je m'appelle <strong>Dorian</strong>, je suis le fondateur d'<strong>Alfred Major</strong>. 
        Je me permets de vous contacter car je pense qu'Alfred peut transformer votre gestion de locations courte durée.`;
}

function getSubjectInitial(prospect) {
  if (prospect.city) return `Gagnez du temps sur vos locations à ${prospect.city} 🎩`;
  return `Gérez vos locations courte durée sans effort 🎩`;
}

function getSubjectJ3(prospect) {
  if (prospect.city) return `Re: Gagnez du temps sur vos locations à ${prospect.city} 🎩`;
  return `Re: Alfred Major — une question rapide 🎩`;
}

// ─────────────────────────────────────────────
// TEMPLATES D'EMAILS
// ─────────────────────────────────────────────

// Email initial (J0)
function getInitialEmail(prospect) {
  const unsubscribeUrl = `https://www.alfredmajor.com/api/admin/unsubscribe?email=${encodeURIComponent(prospect.email)}`;

  return {
    subject: getSubjectInitial(prospect),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Georgia',serif;">
  <div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;margin-top:20px;margin-bottom:20px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <div style="background:#1a2a6c;padding:30px;text-align:center;">
      <div style="font-size:32px;margin-bottom:8px;">🎩</div>
      <span style="color:white;font-size:24px;font-weight:900;">Alfred</span>
      <span style="color:#d4af37;font-size:24px;font-weight:900;">Major</span>
      <div style="color:rgba(255,255,255,0.6);font-size:13px;margin-top:6px;font-style:italic;">Le majordome IA de votre location</div>
    </div>

    <!-- Corps -->
    <div style="padding:36px 40px;">
      <p style="color:#1e293b;font-size:16px;line-height:1.7;margin:0 0 20px;">
        ${getGreeting(prospect)}
      </p>
      
      <p style="color:#1e293b;font-size:16px;line-height:1.7;margin:0 0 20px;">
        ${getIntro(prospect)}
      </p>

      <p style="color:#1e293b;font-size:16px;line-height:1.7;margin:0 0 24px;">
        <strong>Alfred Major</strong> est un majordome IA qui répond à vos voyageurs 
        <strong>à votre place</strong>, 24h/24 et 7j/7 :
      </p>

      <!-- Promesses -->
      <div style="background:#f8fafc;border-radius:10px;padding:24px;margin-bottom:24px;">
        <div style="display:flex;align-items:flex-start;margin-bottom:14px;">
          <span style="font-size:20px;margin-right:12px;">🌙</span>
          <div>
            <strong style="color:#1a2a6c;">Disponible 24h/24, 7j/7</strong><br>
            <span style="color:#64748b;font-size:14px;">WiFi, code d'accès, restaurants, instructions de départ — Alfred gère tout.</span>
          </div>
        </div>
        <div style="display:flex;align-items:flex-start;margin-bottom:14px;">
          <span style="font-size:20px;margin-right:12px;">🌍</span>
          <div>
            <strong style="color:#1a2a6c;">Plus de 30 langues</strong><br>
            <span style="color:#64748b;font-size:14px;">Vos voyageurs étrangers reçoivent une réponse dans leur langue, instantanément.</span>
          </div>
        </div>
        <div style="display:flex;align-items:flex-start;margin-bottom:14px;">
          <span style="font-size:20px;margin-right:12px;">🚨</span>
          <div>
            <strong style="color:#1a2a6c;">Alertes urgences sur Telegram</strong><br>
            <span style="color:#64748b;font-size:14px;">Fuite d'eau, panne, accès bloqué — vous êtes alerté immédiatement.</span>
          </div>
        </div>
        <div style="display:flex;align-items:flex-start;">
          <span style="font-size:20px;margin-right:12px;">⚡</span>
          <div>
            <strong style="color:#1a2a6c;">Configuration en 5 minutes</strong><br>
            <span style="color:#64748b;font-size:14px;">Aucune compétence technique requise. Un simple formulaire guidé.</span>
          </div>
        </div>
      </div>

      <p style="color:#1e293b;font-size:16px;line-height:1.7;margin:0 0 24px;">
        Essayez Alfred sur un de vos logements — le premier mois est à <strong style="color:#d4af37;">9,90 €</strong> 
        au lieu de 19,90 €. Sans engagement, vous arrêtez quand vous voulez.
      </p>

      <!-- CTA -->
      <div style="text-align:center;margin:32px 0;">
        <a href="https://www.alfredmajor.com/register" 
           style="background:#d4af37;color:#1a2a6c;padding:16px 36px;border-radius:30px;text-decoration:none;font-weight:900;font-size:16px;display:inline-block;">
          Essayer Alfred Major →
        </a>
      </div>

      <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 20px;">
        Si vous avez des questions ou souhaitez une démonstration en 10 minutes, 
        répondez simplement à cet email. Je lis tout personnellement.
      </p>

      <p style="color:#1e293b;font-size:15px;margin:0;">
        Cordialement,<br>
        <strong>Dorian</strong><br>
        <span style="color:#64748b;font-size:13px;">Fondateur — Alfred Major</span><br>
        <a href="https://www.alfredmajor.com" style="color:#1a2a6c;font-size:13px;">www.alfredmajor.com</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;padding:20px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="color:#94a3b8;font-size:12px;margin:0;">
        Vous recevez cet email car votre activité est référencée publiquement.<br>
        <a href="${unsubscribeUrl}" style="color:#94a3b8;">Se désabonner</a>
      </p>
    </div>

  </div>
</body>
</html>
    `
  };
}

// Email de relance J+3
function getFollowupJ3Email(prospect) {
  const unsubscribeUrl = `https://www.alfredmajor.com/api/admin/unsubscribe?email=${encodeURIComponent(prospect.email)}`;

  return {
    subject: getSubjectJ3(prospect),
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Georgia',serif;">
  <div style="max-width:600px;margin:20px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
    
    <div style="background:#1a2a6c;padding:24px;text-align:center;">
      <span style="color:white;font-size:20px;font-weight:900;">Alfred</span>
      <span style="color:#d4af37;font-size:20px;font-weight:900;">Major</span> 🎩
    </div>

    <div style="padding:32px 40px;">
      <p style="color:#1e293b;font-size:16px;line-height:1.7;margin:0 0 16px;">
        ${getGreeting(prospect)}
      </p>
      
      <p style="color:#1e293b;font-size:16px;line-height:1.7;margin:0 0 16px;">
        Je me permets de revenir vers vous au sujet d'<strong>Alfred Major</strong>.
      </p>

      <p style="color:#1e293b;font-size:16px;line-height:1.7;margin:0 0 20px;">
        Une question rapide : <strong>combien de messages voyageurs gérez-vous par semaine ?</strong>
      </p>

      <p style="color:#1e293b;font-size:16px;line-height:1.7;margin:0 0 20px;">
        La plupart des gestionnaires que je rencontre passent entre <strong>1h et 3h par jour</strong> 
        à répondre aux mêmes questions répétitives. Alfred s'occupe de 95% de ces échanges 
        à votre place.
      </p>

      <p style="color:#1e293b;font-size:16px;line-height:1.7;margin:0 0 24px;">
        Vous pouvez tester sur <strong>un seul logement</strong> pour commencer — 
        premier mois à <strong style="color:#d4af37;">9,90 €</strong>, sans engagement.
      </p>

      <div style="text-align:center;margin:28px 0;">
        <a href="https://www.alfredmajor.com/register"
           style="background:#d4af37;color:#1a2a6c;padding:14px 32px;border-radius:30px;text-decoration:none;font-weight:900;font-size:15px;display:inline-block;">
          Essayer gratuitement →
        </a>
      </div>

      <p style="color:#1e293b;font-size:15px;margin:0;">
        Bonne journée,<br>
        <strong>Dorian</strong><br>
        <span style="color:#64748b;font-size:13px;">Fondateur — Alfred Major</span>
      </p>
    </div>

    <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="color:#94a3b8;font-size:12px;margin:0;">
        <a href="${unsubscribeUrl}" style="color:#94a3b8;">Se désabonner</a>
      </p>
    </div>
  </div>
</body>
</html>
    `
  };
}

// Email de relance J+7
function getFollowupJ7Email(prospect) {
  const unsubscribeUrl = `https://www.alfredmajor.com/api/admin/unsubscribe?email=${encodeURIComponent(prospect.email)}`;

  return {
    subject: `Dernier message — Alfred Major 🎩`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Georgia',serif;">
  <div style="max-width:600px;margin:20px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
    
    <div style="background:#1a2a6c;padding:24px;text-align:center;">
      <span style="color:white;font-size:20px;font-weight:900;">Alfred</span>
      <span style="color:#d4af37;font-size:20px;font-weight:900;">Major</span> 🎩
    </div>

    <div style="padding:32px 40px;">
      <p style="color:#1e293b;font-size:16px;line-height:1.7;margin:0 0 16px;">
        ${getGreeting(prospect)}
      </p>

      <p style="color:#1e293b;font-size:16px;line-height:1.7;margin:0 0 16px;">
        C'est mon dernier message, je ne veux pas vous déranger davantage.
      </p>

      <p style="color:#1e293b;font-size:16px;line-height:1.7;margin:0 0 20px;">
        Si vous êtes curieux de voir comment Alfred fonctionne concrètement, 
        voici une démo live — <strong>aucune inscription requise</strong> :
      </p>

      <div style="text-align:center;margin:24px 0;">
        <a href="https://www.alfredmajor.com/m/demo-alfred-major"
           style="background:#1a2a6c;color:white;padding:14px 32px;border-radius:30px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;margin-bottom:12px;">
          🎭 Voir la démo Alfred →
        </a>
        <br><br>
        <a href="https://www.alfredmajor.com/register"
           style="background:#d4af37;color:#1a2a6c;padding:14px 32px;border-radius:30px;text-decoration:none;font-weight:900;font-size:15px;display:inline-block;">
          Essayer à 9,90 € →
        </a>
      </div>

      <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 20px;">
        Si le moment n'est pas le bon, pas de souci. 
        N'hésitez pas à revenir vers moi quand vous le souhaitez.
      </p>

      <p style="color:#1e293b;font-size:15px;margin:0;">
        Bonne continuation,<br>
        <strong>Dorian</strong><br>
        <span style="color:#64748b;font-size:13px;">Fondateur — Alfred Major</span>
      </p>
    </div>

    <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="color:#94a3b8;font-size:12px;margin:0;">
        <a href="${unsubscribeUrl}" style="color:#94a3b8;">Se désabonner</a>
      </p>
    </div>
  </div>
</body>
</html>
    `
  };
}

// ─────────────────────────────────────────────
// HANDLER PRINCIPAL
// ─────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const { secret, type = 'initial' } = req.body;
  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  try {
    await transporter.verify();

    let prospects = [];
    const now = new Date();

    if (type === 'initial') {
      const { data } = await supabaseAdmin
        .from('prospects')
        .select('*')
        .eq('status', 'new')
        .limit(50);
      prospects = data || [];

    } else if (type === 'followup_j3') {
      const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabaseAdmin
        .from('prospects')
        .select('*')
        .eq('status', 'contacted')
        .lt('contacted_at', threeDaysAgo)
        .limit(50);
      prospects = data || [];

    } else if (type === 'followup_j7') {
      const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabaseAdmin
        .from('prospects')
        .select('*')
        .eq('status', 'contacted')
        .lt('contacted_at', sevenDaysAgo)
        .limit(50);
      prospects = data || [];
    }

    let sent = 0;
    let failed = 0;
    const errors = [];

    for (const prospect of prospects) {
      try {
        let emailContent;
        let emailType;

        if (type === 'initial') {
          emailContent = getInitialEmail(prospect);
          emailType = 'initial';
        } else if (type === 'followup_j3') {
          emailContent = getFollowupJ3Email(prospect);
          emailType = 'followup_j3';
        } else {
          emailContent = getFollowupJ7Email(prospect);
          emailType = 'followup_j7';
        }

        await transporter.sendMail({
          from: `"Dorian — Alfred Major" <${process.env.EMAIL_USER}>`,
          to: prospect.email,
          subject: emailContent.subject,
          html: emailContent.html,
        });

        await supabaseAdmin
          .from('prospects')
          .update({
            status: 'contacted',
            contacted_at: type === 'initial' ? now.toISOString() : prospect.contacted_at
          })
          .eq('id', prospect.id);

        await supabaseAdmin
          .from('email_campaigns')
          .insert({
            prospect_id: prospect.id,
            email_type: emailType,
            subject: emailContent.subject,
            sent_at: now.toISOString()
          });

        sent++;
        console.log(`✅ Email envoyé à ${prospect.email}`);

        await new Promise(r => setTimeout(r, 2000));

      } catch (e) {
        failed++;
        errors.push(`${prospect.email}: ${e.message}`);
        console.error(`❌ Erreur envoi ${prospect.email}:`, e.message);
      }
    }

    return res.status(200).json({
      success: true,
      type,
      stats: {
        prospects_trouvés: prospects.length,
        emails_envoyés: sent,
        échecs: failed,
        errors: errors.slice(0, 5)
      }
    });

  } catch (error) {
    console.error('Erreur send-emails:', error);
    return res.status(500).json({ error: error.message });
  }
}
