// pages/api/support.js
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  // Auth
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Non authentifié' });

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData?.user) return res.status(401).json({ error: 'Token invalide' });

  const { subject, message, category } = req.body;
  if (!subject || !message) return res.status(400).json({ error: 'Sujet et message requis' });

  const user = userData.user;

  // Récupérer le profil
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single();

  const senderName = profile?.full_name || 'Hôte';
  const senderEmail = profile?.email || user.email;

  try {
    // 1. Sauvegarder en base (table support_tickets)
    await supabaseAdmin
      .from('support_tickets')
      .insert([{
        user_id: user.id,
        user_email: senderEmail,
        user_name: senderName,
        category: category || 'general',
        subject,
        message,
        status: 'open',
      }])
      .then(() => {})
      .catch(() => {}); // table optionnelle, on ignore si elle n'existe pas encore

    // 2. Email à Alfred Major (toi)
    await resend.emails.send({
      from: 'Alfred Major Support <noreply@alfredmajor.com>',
      to: 'contact@alfredmajor.com',
      replyTo: senderEmail,
      subject: `[Support] ${category ? `[${category}] ` : ''}${subject}`,
      html: `
        <!DOCTYPE html><html><head><meta charset="utf-8"></head>
        <body style="margin:0;padding:0;background:#f5f5f7;font-family:'Inter',Arial,sans-serif;">
          <div style="max-width:600px;margin:32px auto;padding:0 20px;">
            <div style="background:white;border-radius:16px;padding:32px;border:1px solid #e8e8ed;">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;">
                <span style="font-size:32px;">🎩</span>
                <div>
                  <p style="margin:0;font-size:18px;font-weight:700;color:#1d1d1f;">Nouveau ticket support</p>
                  <p style="margin:0;font-size:13px;color:#86868b;">Alfred Major — Service client</p>
                </div>
              </div>
              <div style="background:#f5f5f7;border-radius:12px;padding:16px;margin-bottom:20px;">
                <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#86868b;text-transform:uppercase;letter-spacing:0.5px;">De</p>
                <p style="margin:0;font-size:15px;font-weight:600;color:#1d1d1f;">${senderName}</p>
                <p style="margin:2px 0 0;font-size:14px;color:#86868b;">${senderEmail}</p>
              </div>
              ${category ? `<div style="margin-bottom:16px;"><span style="background:#faf6e8;border:1px solid #e8d88a;color:#92710a;padding:4px 12px;border-radius:980px;font-size:12px;font-weight:600;">${category}</span></div>` : ''}
              <div style="margin-bottom:16px;">
                <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#86868b;text-transform:uppercase;letter-spacing:0.5px;">Sujet</p>
                <p style="margin:0;font-size:16px;font-weight:600;color:#1d1d1f;">${subject}</p>
              </div>
              <div style="border-top:1px solid #e8e8ed;padding-top:16px;">
                <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#86868b;text-transform:uppercase;letter-spacing:0.5px;">Message</p>
                <p style="margin:0;font-size:15px;color:#1d1d1f;line-height:1.65;white-space:pre-wrap;">${message}</p>
              </div>
              <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e8e8ed;">
                <a href="mailto:${senderEmail}?subject=Re: ${subject}" style="display:inline-block;background:#1d1d1f;color:white;text-decoration:none;padding:12px 20px;border-radius:980px;font-weight:600;font-size:14px;">
                  Répondre à ${senderName} →
                </a>
              </div>
            </div>
          </div>
        </body></html>
      `,
    });

    // 3. Email de confirmation à l'hôte
    await resend.emails.send({
      from: 'Alfred Major <noreply@alfredmajor.com>',
      to: senderEmail,
      subject: `✅ Votre message a bien été reçu`,
      html: `
        <!DOCTYPE html><html><head><meta charset="utf-8"></head>
        <body style="margin:0;padding:0;background:#f5f5f7;font-family:'Inter',Arial,sans-serif;">
          <div style="max-width:560px;margin:40px auto;padding:0 20px;">
            <div style="text-align:center;margin-bottom:32px;">
              <div style="font-size:48px;margin-bottom:8px;">🎩</div>
              <div style="font-size:22px;font-weight:600;color:#1d1d1f;">Alfred<span style="color:#c9a227;">Major</span></div>
            </div>
            <div style="background:white;border-radius:20px;padding:36px;border:1px solid #e8e8ed;">
              <h1 style="margin:0 0 12px;font-size:22px;font-weight:600;color:#1d1d1f;">Message bien reçu ✅</h1>
              <p style="margin:0 0 20px;font-size:15px;color:#6e6e73;line-height:1.65;">
                Bonjour ${senderName},<br><br>
                Nous avons bien reçu votre message concernant <strong>"${subject}"</strong> et vous répondrons dans les meilleurs délais (généralement sous 24h).
              </p>
              <div style="background:#f5f5f7;border-radius:12px;padding:16px;margin-bottom:20px;">
                <p style="margin:0;font-size:14px;color:#6e6e73;font-style:italic;line-height:1.6;">"${message.length > 200 ? message.substring(0, 200) + '...' : message}"</p>
              </div>
              <a href="https://www.alfredmajor.com/dashboard" style="display:inline-block;background:#1d1d1f;color:white;text-decoration:none;padding:12px 20px;border-radius:980px;font-weight:500;font-size:15px;">
                Retour au dashboard
              </a>
            </div>
            <p style="text-align:center;font-size:12px;color:#aeaeb2;margin-top:24px;">© 2026 Alfred Major · L'excellence du service, à portée de clic</p>
          </div>
        </body></html>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erreur support:', error);
    return res.status(500).json({ error: error.message });
  }
}
