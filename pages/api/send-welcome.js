// pages/api/send-welcome.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.alfredmajor.com';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { firstName, email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requis' });

  try {
    await resend.emails.send({
      from: 'Dorian — Alfred Major <contact@alfredmajor.com>',
      to: email,
      subject: `Bienvenue sur Alfred Major, ${firstName || ''} 🎩`,
      html: `
        <!DOCTYPE html>
        <html><head><meta charset="utf-8"></head>
        <body style="margin:0;padding:0;background:#f5f5f7;font-family:'Inter',Arial,sans-serif;">
          <div style="max-width:560px;margin:40px auto;padding:0 20px;">

            <!-- Header -->
            <div style="text-align:center;margin-bottom:32px;">
              <div style="font-size:52px;margin-bottom:8px;">🎩</div>
              <div style="font-size:24px;font-weight:600;color:#1d1d1f;letter-spacing:-0.5px;">
                Alfred<span style="color:#c9a227;">Major</span>
              </div>
            </div>

            <!-- Card principale -->
            <div style="background:white;border-radius:20px;padding:36px;border:1px solid #e8e8ed;">

              <h1 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#1d1d1f;letter-spacing:-0.4px;">
                Bienvenue ${firstName || ''} ! 👋
              </h1>

              <p style="margin:0 0 16px;font-size:15px;color:#6e6e73;line-height:1.7;font-weight:400;">
                Je suis Dorian, le fondateur d'Alfred Major. Merci de nous faire confiance pour gérer la communication avec vos voyageurs.
              </p>

              <p style="margin:0 0 24px;font-size:15px;color:#6e6e73;line-height:1.7;font-weight:400;">
                Votre <strong style="color:#1d1d1f;">essai gratuit de 30 jours</strong> vient de démarrer. Pour profiter d'Alfred au maximum, la première étape est de configurer votre logement — ça prend moins de 10 minutes.
              </p>

              <!-- Étapes -->
              <div style="background:#f5f5f7;border-radius:14px;padding:20px;margin-bottom:24px;">
                <p style="margin:0 0 14px;font-size:13px;font-weight:600;color:#1d1d1f;text-transform:uppercase;letter-spacing:0.5px;">Pour bien démarrer</p>
                ${[
                  ['1️⃣', 'Configurez votre logement', 'Renseignez WiFi, accès, règles, bonnes adresses...'],
                  ['2️⃣', 'Copiez le lien voyageur', 'Collez-le dans votre message de bienvenue Airbnb ou Booking'],
                  ['3️⃣', 'Liez votre Telegram', 'Pour recevoir les alertes urgences instantanément'],
                ].map(([num, title, desc]) => `
                  <div style="display:flex;gap:12px;margin-bottom:12px;align-items:flex-start;">
                    <span style="font-size:18px;flex-shrink:0;">${num}</span>
                    <div>
                      <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#1d1d1f;">${title}</p>
                      <p style="margin:0;font-size:13px;color:#86868b;font-weight:300;">${desc}</p>
                    </div>
                  </div>
                `).join('')}
              </div>

              <!-- CTA -->
              <a href="${SITE_URL}/dashboard" style="display:block;background:#1d1d1f;color:white;text-decoration:none;text-align:center;padding:15px;border-radius:12px;font-weight:600;font-size:16px;letter-spacing:-0.2px;margin-bottom:24px;">
                Configurer mon logement →
              </a>

              <!-- Message perso -->
              <div style="border-top:1px solid #e8e8ed;padding-top:20px;">
                <p style="margin:0 0 12px;font-size:15px;color:#6e6e73;line-height:1.7;font-weight:400;">
                 Si vous avez la moindre question sur la configuration ou le fonctionnement d'Alfred, <strong style="color:#1d1d1f;">répondez simplement à cet email</strong> — notre équipe vous répondra dans les meilleurs délais.
                </p>
                <p style="margin:0;font-size:15px;color:#1d1d1f;font-weight:500;">
                  À très vite,<br>
                  <span style="color:#c9a227;">Dorian</span> — Fondateur d'Alfred Major 🎩
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="text-align:center;margin-top:24px;">
              <p style="font-size:12px;color:#aeaeb2;font-weight:300;margin:0 0 8px;">
                Alfred Major · L'excellence du service, à portée de clic
              </p>
              <p style="font-size:12px;color:#aeaeb2;font-weight:300;margin:0;">
                <a href="${SITE_URL}/support" style="color:#aeaeb2;">Support</a>
                &nbsp;·&nbsp;
                <a href="${SITE_URL}/dashboard" style="color:#aeaeb2;">Dashboard</a>
              </p>
            </div>

          </div>
        </body></html>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erreur send-welcome:', error);
    return res.status(500).json({ error: error.message });
  }
}
