// pages/api/cleaning/notify.js
// Envoie une notification email au prestataire de ménage via Resend.
// Remplace l'ancienne version Telegram.

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  // Sécurité : appelé depuis le cron ou depuis le dashboard hôte
  const cronSecret = req.headers['x-cron-secret'];
  const authToken = req.headers.authorization?.replace('Bearer ', '');

  if (cronSecret !== process.env.CRON_SECRET && !authToken) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  const { jobId, propertyId, checkoutTime, nextCheckinTime, guestName } = req.body;
  if (!propertyId) return res.status(400).json({ error: 'propertyId requis' });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.alfredmajor.com';

  try {
    // 1. Récupérer le logement
    const { data: property } = await supabaseAdmin
      .from('properties')
      .select('name, city, owner_id')
      .eq('id', propertyId)
      .single();

    if (!property) return res.status(404).json({ error: 'Logement introuvable' });

    // 2. Récupérer la config ménage + prestataire
    const { data: cleaningConfig } = await supabaseAdmin
      .from('property_cleaning')
      .select('*, cleaning_providers(*)')
      .eq('property_id', propertyId)
      .single();

    if (!cleaningConfig?.cleaning_providers) {
      return res.status(404).json({ error: 'Aucun prestataire configuré' });
    }

    const provider = cleaningConfig.cleaning_providers;

    // 3. Créer le job si pas encore créé (appel manuel depuis dashboard)
    let currentJobId = jobId;
    if (!currentJobId) {
      const { data: job } = await supabaseAdmin
        .from('cleaning_jobs')
        .insert({
          property_id:   propertyId,
          provider_id:   provider.id,
          checkout_time: checkoutTime || new Date().toISOString(),
          next_checkin:  nextCheckinTime || null,
          status:        'pending',
          notified_at:   new Date().toISOString(),
        })
        .select()
        .single();
      currentJobId = job?.id;
    }

    // 4. Lien de confirmation pour le prestataire
    const confirmLink = `${siteUrl}/cleaning/${currentJobId}`;
    const cleanerDashboardLink = `${siteUrl}/cleaner/dashboard`;

    // 5. Formater les horaires
    const formatDateTime = (iso) => {
      if (!iso) return 'Non précisé';
      return new Date(iso).toLocaleString('fr-FR', {
        weekday: 'long', day: '2-digit', month: 'long',
        hour: '2-digit', minute: '2-digit'
      });
    };

    // 6. Checklist
    const checklist = cleaningConfig.checklist || [];
    const checklistHtml = checklist.length > 0
      ? `<div style="margin-bottom:20px;">
          <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Checklist</p>
          ${checklist.map(item => `<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:6px;font-size:14px;color:#1e293b;">☐ ${item}</div>`).join('')}
        </div>`
      : '';

    // 7. Envoyer l'email au prestataire
    if (provider.email) {
      await resend.emails.send({
        from: 'Alfred Major <noreply@alfredmajor.com>',
        to: provider.email,
        subject: `🧹 Ménage à effectuer — ${property.name}`,
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
                <div style="display:inline-block;background:#fff7ed;border:1px solid #f97316;color:#c2410c;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:800;margin-bottom:16px;">🧹 MISSION MÉNAGE</div>
                <h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#1a2a6c;">${property.name}</h1>
                ${property.city ? `<p style="margin:0 0 24px;font-size:14px;color:#64748b;">📍 ${property.city}</p>` : '<div style="margin-bottom:24px;"></div>'}

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">
                  <div style="background:#fff7ed;border-radius:12px;padding:14px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;">Départ voyageur</p>
                    <p style="margin:0;font-size:14px;font-weight:800;color:#c2410c;">${formatDateTime(checkoutTime)}</p>
                  </div>
                  <div style="background:#f0fdf4;border-radius:12px;padding:14px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;">Prochain voyageur</p>
                    <p style="margin:0;font-size:14px;font-weight:800;color:#15803d;">${formatDateTime(nextCheckinTime)}</p>
                  </div>
                </div>

                ${guestName ? `<p style="margin:0 0 20px;font-size:14px;color:#64748b;">👤 Voyageur sortant : <strong style="color:#1e293b;">${guestName}</strong></p>` : ''}

                ${checklistHtml}

                <a href="${confirmLink}" style="display:block;background:#1a2a6c;color:white;text-decoration:none;text-align:center;padding:16px;border-radius:14px;font-size:16px;font-weight:800;margin-bottom:12px;">
                  ✅ Confirmer le ménage terminé
                </a>
                <a href="${cleanerDashboardLink}" style="display:block;background:#f8fafc;color:#1a2a6c;text-decoration:none;text-align:center;padding:12px;border-radius:14px;font-size:14px;font-weight:700;border:1px solid #e2e8f0;">
                  📅 Voir mon planning complet
                </a>
              </div>

              <p style="text-align:center;font-size:12px;color:#cbd5e1;margin-top:24px;">
                🎩 Alfred Major — L'excellence du service, à portée de clic
              </p>
            </div>
          </body>
          </html>
        `,
      });

      // Marquer comme notifié
      if (currentJobId) {
        await supabaseAdmin
          .from('cleaning_jobs')
          .update({ cleaner_notified_at: new Date().toISOString() })
          .eq('id', currentJobId);
      }
    }

    return res.status(200).json({ success: true, jobId: currentJobId });

  } catch (error) {
    console.error('Erreur notify cleaning:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
