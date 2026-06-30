// pages/api/connect/webhook.js
// Webhook Stripe Connect pour les paiements upsell (comptes connectés).
// Séparé du webhook principal (abonnements, pages/api/webhooks/stripe.js).
// ⚠️ NE PAS déplacer sans mettre à jour l'endpoint configuré sur le Dashboard Stripe
// (Developers → Webhooks → Connect → events on connected accounts).
// MODIF : confirme/complète le rattachement reservation_id si celui-ci n'a pas
// pu être déterminé au moment du checkout (ex: réservation créée après coup).

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const resend = new Resend(process.env.RESEND_API_KEY);

export const config = { api: { bodyParser: false } };

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

// Filet de sécurité : si reservation_id n'a pas pu être déterminé au checkout,
// on retente le matching ici (la réservation a pu être synchronisée entre-temps).
async function ensureReservationLink(orderId, propertyId, existingReservationId) {
  if (existingReservationId) return existingReservationId;

  try {
    const today = new Date().toISOString().split('T')[0];

    const { data: activeStay } = await supabaseAdmin
      .from('reservations')
      .select('id')
      .eq('property_id', propertyId)
      .eq('status', 'confirmed')
      .lte('check_in', today)
      .gte('check_out', today)
      .limit(1)
      .maybeSingle();

    let reservationId = activeStay?.id || null;

    if (!reservationId) {
      const { data: upcomingStay } = await supabaseAdmin
        .from('reservations')
        .select('id')
        .eq('property_id', propertyId)
        .eq('status', 'confirmed')
        .gte('check_out', today)
        .order('check_in', { ascending: true })
        .limit(1)
        .maybeSingle();
      reservationId = upcomingStay?.id || null;
    }

    if (reservationId) {
      await supabaseAdmin
        .from('upsell_orders')
        .update({ reservation_id: reservationId })
        .eq('id', orderId);
    }

    return reservationId;
  } catch (err) {
    console.error('Erreur ensureReservationLink:', err);
    return existingReservationId;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_CONNECT_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Erreur signature webhook upsell:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { order_id, upsell_id, property_id, owner_id, reservation_id } = session.metadata || {};

    if (!order_id) return res.status(200).json({ received: true });

    try {
      // 1. Mettre à jour la commande
      await supabaseAdmin
        .from('upsell_orders')
        .update({
          status:               'paid',
          stripe_payment_intent: session.payment_intent,
          paid_at:              new Date().toISOString(),
          guest_email:          session.customer_email || null,
        })
        .eq('id', order_id);

      // 1bis. S'assurer que la commande est bien rattachée à une réservation
      // (utile pour la coordination avec l'équipe ménage — voir cleaning/notify.js)
      const linkedReservationId = await ensureReservationLink(
        order_id,
        property_id,
        reservation_id || null
      );

      // 2. Récupérer les détails pour les notifications
      const { data: order } = await supabaseAdmin
        .from('upsell_orders')
        .select('*, upsells(name, emoji, price, affects_cleaning), properties(name, owner_id)')
        .eq('id', order_id)
        .single();

      if (!order) return res.status(200).json({ received: true });

      // 3. Récupérer le profil de l'hôte
      const { data: ownerProfile } = await supabaseAdmin
        .from('profiles')
        .select('email, full_name, telegram_chat_id, expo_push_token')
        .eq('id', order.properties.owner_id)
        .single();

      const upsellName = order.upsells?.name || 'Service';
      const upsellEmoji = order.upsells?.emoji || '✨';
      const affectsCleaning = order.upsells?.affects_cleaning || false;
      const amount = order.amount?.toFixed(2);
      const propertyName = order.properties?.name || 'Logement';
      const guestName = order.guest_name || 'Un voyageur';
      const paidAt = new Date().toLocaleString('fr-FR', {
        day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit'
      });

      // 4. Email à l'hôte via Resend
      if (ownerProfile?.email) {
        await resend.emails.send({
          from: 'Alfred Major <noreply@alfredmajor.com>',
          to: ownerProfile.email,
          subject: `💰 Nouvel upsell acheté — ${upsellName}`,
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
                  <div style="display:inline-block;background:#f0fdf4;border:1px solid #22c55e;color:#15803d;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:800;margin-bottom:16px;">💰 UPSELL ACHETÉ</div>
                  <h1 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#1a2a6c;">${upsellEmoji} ${upsellName}</h1>
                  <p style="margin:0 0 24px;font-size:14px;color:#64748b;">🏠 ${propertyName}</p>

                  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:20px;margin-bottom:20px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                      <span style="font-size:14px;color:#64748b;">Montant encaissé</span>
                      <span style="font-size:24px;font-weight:900;color:#15803d;">${amount} €</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                      <span style="font-size:13px;color:#64748b;">Voyageur</span>
                      <span style="font-size:13px;font-weight:700;color:#1e293b;">${guestName}</span>
                    </div>
                    ${order.guest_email ? `<div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                      <span style="font-size:13px;color:#64748b;">Email</span>
                      <span style="font-size:13px;color:#1e293b;">${order.guest_email}</span>
                    </div>` : ''}
                    ${order.notes ? `<div style="margin-top:12px;padding:10px;background:white;border-radius:8px;border:1px solid #e2e8f0;">
                      <p style="margin:0;font-size:12px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Note du voyageur</p>
                      <p style="margin:0;font-size:13px;color:#1e293b;">${order.notes}</p>
                    </div>` : ''}
                    ${affectsCleaning ? `<div style="margin-top:12px;padding:10px;background:#fffbeb;border-radius:8px;border:1px solid #fde68a;">
                      <p style="margin:0;font-size:12px;color:#92400e;">🧹 Cette commande a été transmise à votre équipe ménage si un prestataire est assigné.</p>
                    </div>` : ''}
                  </div>

                  <p style="margin:0;font-size:13px;color:#64748b;text-align:center;">
                    Payé le ${paidAt} · Virement automatique sous 7 jours
                  </p>
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

      // 5. Telegram à l'hôte
      const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
      if (telegramToken && ownerProfile?.telegram_chat_id) {
        const cleaningNote = affectsCleaning
          ? `\n\n🧹 _Transmis à l'équipe ménage si un prestataire est assigné._`
          : '';
        await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: ownerProfile.telegram_chat_id,
            text: `💰 *UPSELL ACHETÉ*\n\n🏠 *Logement :* ${propertyName}\n${upsellEmoji} *Service :* ${upsellName}\n💶 *Montant :* ${amount} €\n👤 *Voyageur :* ${guestName}${cleaningNote}\n\n_Le paiement sera viré sur votre compte Stripe sous 7 jours._ 🎩`,
            parse_mode: 'Markdown',
          }),
        });
      }

      // 6. Push Expo à l'hôte
      if (ownerProfile?.expo_push_token) {
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: ownerProfile.expo_push_token,
            sound: 'default',
            title: `💰 Nouvel upsell — ${amount} €`,
            body: `${upsellEmoji} ${upsellName} acheté pour ${propertyName}`,
            priority: 'high',
          }),
        });
      }

      // 7. Si cet upsell affecte le ménage ET qu'un prestataire est déjà assigné
      // pour une mission en cours liée à cette réservation, on lui envoie une
      // notification de mise à jour immédiate (plutôt que d'attendre la prochaine
      // notification de ménage classique).
      if (affectsCleaning && linkedReservationId) {
        try {
          const { data: cleaningConfig } = await supabaseAdmin
            .from('property_cleaning')
            .select('provider_id, cleaning_providers(telegram_chat_id, name)')
            .eq('property_id', property_id)
            .maybeSingle();

          const providerChatId = cleaningConfig?.cleaning_providers?.telegram_chat_id;
          if (telegramToken && providerChatId) {
            await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: providerChatId,
                text: `🔔 *Mise à jour de mission* — ${propertyName}\n\n⚠️ ${upsellEmoji} ${upsellName} ajouté au séjour de ${guestName}.\n\nMerci d'en tenir compte lors de votre passage. 🎩`,
                parse_mode: 'Markdown',
              }),
            });
          }
        } catch (err) {
          console.error('Erreur notif prestataire (upsell ménage):', err);
        }
      }

    } catch (error) {
      console.error('Erreur traitement webhook upsell:', error);
    }
  }

  return res.status(200).json({ received: true });
}
