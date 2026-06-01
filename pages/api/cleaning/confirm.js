// pages/api/cleaning/confirm.js
// Le prestataire confirme que le ménage est effectué.
// Notifie l'hôte par email Resend + Telegram (si configuré).

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { jobId, checklistDone, photos, status } = req.body;
  if (!jobId) return res.status(400).json({ error: 'jobId requis' });

  try {
    // 1. Mettre à jour le job
    const { data: job } = await supabaseAdmin
      .from('cleaning_jobs')
      .update({
        status: status || 'completed',
        checklist_done: checklistDone || [],
        photos: photos || [],
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', jobId)
      .select('*, properties(name, city, owner_id), cleaning_providers(name, email)')
      .single();

    if (!job) return res.status(404).json({ error: 'Job introuvable' });

    // 2. Récupérer le profil de l'hôte
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('telegram_chat_id, email, full_name')
      .eq('id', job.properties.owner_id)
      .single();

    const confirmedTime = new Date().toLocaleString('fr-FR', {
      day: '2-digit', month: 'long',
      hour: '2-digit', minute: '2-digit'
    });

    const photosHtml = (photos || []).length > 0
      ? `<div style="margin-top:16px;">
          <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Photos du ménage</p>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
            ${photos.slice(0, 6).map(url => `<img src="${url}" alt="Photo ménage" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;">`).join('')}
          </div>
        </div>`
      : '';

    const checklistHtml = (checklistDone || []).length > 0
      ? `<div style="margin-bottom:16px;">
          <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Checklist complétée</p>
          ${checklistDone.map(item => `<div style="padding:8px 12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;margin-bottom:6px;font-size:14px;color:#15803d;">✅ ${item}</div>`).join('')}
        </div>`
      : '';

    // 3. Email à l'hôte via Resend
    if (profile?.email) {
      await resend.emails.send({
        from: 'Alfred Major <noreply@alfredmajor.com>',
        to: profile.email,
        subject: `✅ Ménage terminé — ${job.properties.name}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
          <body style="margin:0;padding:0;background:#f8fafc;font-family:'Inter',Arial,sans-serif;">
            <div style="max-width:560px;margin:40px auto;padding:0 20px;">

              <div style="text-align:center;margin-bottom:32px;">
                <div style="font-size:48px;margin-bottom:8px;">🎩</div>
                <div style="font-size:22px;font-weight:900;color:#1a2a6c;">Alfred<span style="color:#d4af37;">Major</span></div>
              </div>

              <div style="background:white;border-radius:24px;padding:36px;border:1px solid #e2e8f0;">
                <div style="display:inline-block;background:#f0fdf4;border:1px solid #22c55e;color:#15803d;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:800;margin-bottom:16px;">✅ MÉNAGE CONFIRMÉ</div>
                <h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#1a2a6c;">${job.properties.name}</h1>
                ${job.properties.city ? `<p style="margin:0 0 20px;font-size:14px;color:#64748b;">📍 ${job.properties.city}</p>` : '<div style="margin-bottom:20px;"></div>'}

                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:16px;margin-bottom:20px;">
                  <p style="margin:0;font-size:15px;color:#15803d;font-weight:700;">
                    Votre logement est prêt pour le prochain voyageur 🏠
                  </p>
                  <p style="margin:6px 0 0;font-size:13px;color:#166534;">
                    Confirmé par <strong>${job.cleaning_providers?.name || 'votre prestataire'}</strong> à ${confirmedTime}
                  </p>
                </div>

                ${checklistHtml}
                ${photosHtml}
              </div>

              <p style="text-align:center;font-size:12px;color:#cbd5e1;margin-top:24px;">
                🎩 Alfred Major — L'excellence du service, à portée de clic
              </p>
            </div>
          </body>
          </html>
        `,
      });
    }

    // 4. Telegram à l'hôte (en plus de l'email, si configuré)
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (token && profile?.telegram_chat_id) {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: profile.telegram_chat_id,
          text: `✅ *MÉNAGE TERMINÉ*\n\n🏠 *Logement :* ${job.properties.name}\n⏰ *Confirmé à :* ${confirmedTime}\n\nVotre logement est prêt pour le prochain voyageur ! 🎩`,
          parse_mode: 'Markdown',
        }),
      });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Erreur confirm cleaning:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
