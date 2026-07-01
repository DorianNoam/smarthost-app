// pages/api/cleaning/notify.js
// Envoie une notification email au prestataire de ménage via Resend.
// MODIF : inclut les notes upsells (affects_cleaning = true) liées à la réservation
// pour que le prestataire sache ce qu'il doit préparer en plus (ex: lit bébé, départ tardif).

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

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

    // 4. Récupérer les notes upsells liées à la réservation en cours
    // On cherche la réservation active ou la plus proche pour ce logement
    let cleaningUpsellNotes = [];
    try {
      const today = new Date().toISOString().split('T')[0];

      // Réservation en cours ou prochaine
      let reservation = null;
      const { data: activeRes } = await supabaseAdmin
        .from('reservations')
        .select('id')
        .eq('property_id', propertyId)
        .eq('status', 'confirmed')
        .lte('check_in', today)
        .gte('check_out', today)
        .limit(1)
        .maybeSingle();

      if (activeRes) {
        reservation = activeRes;
      } else {
        const { data: upcomingRes } = await supabaseAdmin
          .from('reservations')
          .select('id')
          .eq('property_id', propertyId)
          .eq('status', 'confirmed')
          .gte('check_out', today)
          .order('check_in', { ascending: true })
          .limit(1)
          .maybeSingle();
        reservation = upcomingRes;
      }

      if (reservation?.id) {
        const { data: orders } = await supabaseAdmin
          .from('upsell_orders')
          .select('*, upsells(name, emoji, affects_cleaning)')
          .eq('reservation_id', reservation.id)
          .eq('status', 'paid');

        cleaningUpsellNotes = (orders || [])
          .filter(o => o.upsells?.affects_cleaning === true)
          .map(o => ({
            name: o.upsells.name,
            emoji: o.upsells.emoji || '⚠️',
            notes: o.notes || null,
            guestName: o.guest_name || null,
          }));
      }
    } catch (err) {
      console.error('Erreur récupération upsells ménage:', err);
      // On continue sans les notes upsells — pas bloquant
    }

    // 5. Lien de confirmation pour le prestataire
    const confirmLink = `${siteUrl}/cleaning/${currentJobId}`;
    const cleanerDashboardLink = `${siteUrl}/cleaner/dashboard`;

    // 6. Formater les horaires
    const formatDateTime = (iso) => {
      if (!iso) return 'Non précisé';
      return new Date(iso).toLocaleString('fr-FR', {
        weekday: 'long', day: '2-digit', month: 'long',
        hour: '2-digit', minute: '2-digit'
      });
    };

    // 7. Checklist HTML
    const checklist = cleaningConfig.checklist || [];
    const checklistHtml = checklist.length > 0
      ? `<div style="margin-bottom:20px;">
          <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Checklist</p>
          ${checklist.map(item => `<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:6px;font-size:14px;color:#1e293b;">☐ ${item}</div>`).join('')}
        </div>`
      : '';

    // 8. Notes upsells HTML — affiché seulement si des upsells concernent le ménage
    const upsellNotesHtml = cleaningUpsellNotes.length > 0
      ? `<div style="margin-bottom:20px;background:#fffbeb;border:2px solid #f59e0b;border-radius:16px;padding:20px;">
          <p style="margin:0 0 12px;font-size:13px;font-weight:800;color:#92400e;text-transform:uppercase;letter-spacing:0.5px;">
            ⚠️ Instructions spéciales pour ce séjour
          </p>
          <p style="margin:0 0 12px;font-size:13px;color:#92400e;">
            Le voyageur a commandé des services qui nécessitent votre attention :
          </p>
          ${cleaningUpsellNotes.map(note => `
            <div style="background:white;border:1px solid #fde68a;border-radius:10px;padding:12px 14px;margin-bottom:8px;">
              <p style="margin:0 0 4px;font-size:15px;font-weight:800;color:#1e293b;">
                ${note.emoji} ${note.name}
              </p>
              ${note.guestName ? `<p style="margin:0 0 4px;font-size:12px;color:#64748b;">👤 ${note.guestName}</p>` : ''}
              ${note.notes ? `<p style="margin:0;font-size:13px;color:#92400e;font-style:italic;">"${note.notes}"</p>` : ''}
            </div>
          `).join('')}
        </div>`
      : '';

    // 9. Envoyer l'email au prestataire
    if (provider.email) {
      await resend.emails.send({
        from: 'Alfred Major <noreply@alfredmajor.com>',
        to: provider.email,
        subject: `🧹 Ménage à effectuer — ${property.name}${cleaningUpsellNotes.length > 0 ? ' ⚠️ Instructions spéciales' : ''}`,
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

                ${upsellNotesHtml}

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

    // 10. Notification Telegram au prestataire si configuré
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    if (telegramToken && provider.telegram_chat_id) {
      const upsellTelegramNotes = cleaningUpsellNotes.length > 0
        ? `\n\n⚠️ *Instructions spéciales :*\n${cleaningUpsellNotes.map(n => `${n.emoji} ${n.name}${n.notes ? ` — "${n.notes}"` : ''}`).join('\n')}`
        : '';

      await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: provider.telegram_chat_id,
          text: `🧹 *MISSION MÉNAGE*\n\n🏠 *Logement :* ${property.name}\n🚪 *Départ :* ${formatDateTime(checkoutTime)}\n✅ *Prochain voyageur :* ${formatDateTime(nextCheckinTime)}${guestName ? `\n👤 *Voyageur sortant :* ${guestName}` : ''}${upsellTelegramNotes}\n\n👉 Confirmez via l'email reçu ou votre dashboard. 🎩`,
          parse_mode: 'Markdown',
        }),
      });
    }

    return res.status(200).json({ success: true, jobId: currentJobId, upsellNotesCount: cleaningUpsellNotes.length });

  } catch (error) {
    console.error('Erreur notify cleaning:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
