// pages/api/notify-admin-signup.js
// Envoie un email a contact@alfredmajor.com quand un nouvel utilisateur s'inscrit.

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { firstName, email, referralCode } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requis' });

  try {
    const now = new Date().toLocaleString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    await resend.emails.send({
      from: 'Alfred Major <noreply@alfredmajor.com>',
      to: 'contact@alfredmajor.com',
      subject: `🆕 Nouvel inscrit — ${firstName || 'Inconnu'} (${email})`,
      html: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;">
          <h2 style="color:#1d1d1f;font-size:20px;">🎩 Nouvel inscrit sur Alfred Major</h2>
          <div style="background:#f5f5f7;border-radius:12px;padding:20px;margin:16px 0;">
            <p style="margin:0 0 8px;font-size:14px;color:#6e6e73;"><strong style="color:#1d1d1f;">Nom :</strong> ${firstName || '—'}</p>
            <p style="margin:0 0 8px;font-size:14px;color:#6e6e73;"><strong style="color:#1d1d1f;">Email :</strong> ${email}</p>
            <p style="margin:0 0 8px;font-size:14px;color:#6e6e73;"><strong style="color:#1d1d1f;">Date :</strong> ${now}</p>
            ${referralCode ? `<p style="margin:0;font-size:14px;color:#6e6e73;"><strong style="color:#1d1d1f;">Parrainage :</strong> ${referralCode}</p>` : ''}
          </div>
          <p style="font-size:13px;color:#aeaeb2;">Notification automatique Alfred Major</p>
        </div>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erreur notify-admin-signup:', error);
    return res.status(500).json({ error: error.message });
  }
}
