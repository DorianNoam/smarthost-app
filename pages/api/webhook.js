import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

export const config = { api: { bodyParser: false } };

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Erreur de signature Webhook: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id;
    const stripeCustomerId = session.customer;

    if (userId) {
      try {
        // 1. Récupérer le profil complet
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('active_licenses, referred_by, referral_credits, full_name, email')
          .eq('id', userId)
          .single();

        const newCount = (profile?.active_licenses || 0) + 1;

        // 2. Mise à jour du profil
        await supabaseAdmin.from('profiles').update({
          stripe_customer_id: stripeCustomerId,
          active_licenses: newCount,
          subscription_status: 'active',
        }).eq('id', userId);

        // 3. Activation du logement le plus ancien en attente
        const { data: inactiveProp } = await supabaseAdmin
          .from('properties')
          .select('id')
          .eq('owner_id', userId)
          .eq('is_active', false)
          .order('created_at', { ascending: true })
          .limit(1)
          .single();

        if (inactiveProp) {
          await supabaseAdmin.from('properties').update({ is_active: true }).eq('id', inactiveProp.id);
        }

        // 4. Enregistrement de l'événement pour l'admin
        await supabaseAdmin.from('license_events').insert([{ user_id: userId }]);

        // ── PARRAINAGE ──────────────────────────────────────────
        // Déclencher uniquement au PREMIER paiement (active_licenses passait de 0 à 1)
        const isFirstPayment = (profile?.active_licenses || 0) === 0;

        if (isFirstPayment && profile?.referred_by) {
          const referrerId = profile.referred_by;

          // Vérifier qu'un referral pending existe
          const { data: referral } = await supabaseAdmin
            .from('referrals')
            .select('id, referrer_months, referee_months')
            .eq('referrer_id', referrerId)
            .eq('referee_id', userId)
            .eq('status', 'pending')
            .maybeSingle();

          if (referral) {
            // Marquer le referral comme complété
            await supabaseAdmin
              .from('referrals')
              .update({ status: 'completed', completed_at: new Date().toISOString() })
              .eq('id', referral.id);

            // Créditer le parrain (2 mois)
            const { data: referrerProfile } = await supabaseAdmin
              .from('profiles')
              .select('referral_credits, email, full_name')
              .eq('id', referrerId)
              .single();

            await supabaseAdmin
              .from('profiles')
              .update({ referral_credits: (referrerProfile?.referral_credits || 0) + referral.referrer_months })
              .eq('id', referrerId);

            // Créditer le filleul (1 mois — déjà indiqué à l'inscription, on confirme)
            await supabaseAdmin
              .from('profiles')
              .update({ referral_credits: (profile?.referral_credits || 0) + referral.referee_months })
              .eq('id', userId);

            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.alfredmajor.com';

            // Email au parrain
            if (referrerProfile?.email) {
              await resend.emails.send({
                from: 'Alfred Major <noreply@alfredmajor.com>',
                to: referrerProfile.email,
                subject: '🎉 Votre filleul vient de s\'activer — 2 mois offerts !',
                html: `
                  <!DOCTYPE html>
                  <html>
                  <head><meta charset="utf-8"></head>
                  <body style="margin:0;padding:0;background:#f8fafc;font-family:'Inter',Arial,sans-serif;">
                    <div style="max-width:560px;margin:40px auto;padding:0 20px;">
                      <div style="text-align:center;margin-bottom:32px;">
                        <div style="font-size:48px;margin-bottom:8px;">🎩</div>
                        <div style="font-size:22px;font-weight:900;color:#1a2a6c;">Alfred<span style="color:#d4af37;">Major</span></div>
                      </div>
                      <div style="background:white;border-radius:24px;padding:36px;border:1px solid #e2e8f0;">
                        <h1 style="margin:0 0 8px;font-size:24px;font-weight:900;color:#1a2a6c;">🎉 Félicitations ${referrerProfile.full_name || ''} !</h1>
                        <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">
                          <strong style="color:#1e293b;">${profile.full_name || 'Votre filleul'}</strong> vient d'activer son premier logement sur Alfred Major grâce à votre recommandation.
                        </p>
                        <div style="background:linear-gradient(135deg,#1a2a6c,#2d4a9e);border-radius:16px;padding:24px;text-align:center;margin-bottom:24px;">
                          <p style="margin:0 0 8px;color:rgba(255,255,255,0.7);font-size:13px;text-transform:uppercase;letter-spacing:1px;">Votre récompense</p>
                          <p style="margin:0;font-size:42px;font-weight:900;color:#d4af37;">2 mois</p>
                          <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">offerts sur votre prochain abonnement</p>
                        </div>
                        <p style="margin:0 0 20px;font-size:14px;color:#64748b;text-align:center;">
                          Vos crédits seront automatiquement appliqués lors de votre prochaine facturation.
                        </p>
                        <a href="${siteUrl}/settings" style="display:block;background:#1a2a6c;color:white;text-decoration:none;text-align:center;padding:14px;border-radius:12px;font-weight:800;font-size:15px;">
                          Voir mon compte →
                        </a>
                      </div>
                      <p style="text-align:center;font-size:12px;color:#cbd5e1;margin-top:24px;">🎩 Alfred Major — L'excellence du service, à portée de clic</p>
                    </div>
                  </body>
                  </html>
                `,
              });
            }

            // Email au filleul
            if (profile?.email) {
              await resend.emails.send({
                from: 'Alfred Major <noreply@alfredmajor.com>',
                to: profile.email,
                subject: '🎁 Votre mois offert est activé !',
                html: `
                  <!DOCTYPE html>
                  <html>
                  <head><meta charset="utf-8"></head>
                  <body style="margin:0;padding:0;background:#f8fafc;font-family:'Inter',Arial,sans-serif;">
                    <div style="max-width:560px;margin:40px auto;padding:0 20px;">
                      <div style="text-align:center;margin-bottom:32px;">
                        <div style="font-size:48px;margin-bottom:8px;">🎩</div>
                        <div style="font-size:22px;font-weight:900;color:#1a2a6c;">Alfred<span style="color:#d4af37;">Major</span></div>
                      </div>
                      <div style="background:white;border-radius:24px;padding:36px;border:1px solid #e2e8f0;">
                        <h1 style="margin:0 0 8px;font-size:24px;font-weight:900;color:#1a2a6c;">🎁 Bienvenue ${profile.full_name || ''} !</h1>
                        <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">
                          Grâce au parrainage, vous bénéficiez d'un mois gratuit offert sur votre abonnement Alfred Major.
                        </p>
                        <div style="background:linear-gradient(135deg,#1a2a6c,#2d4a9e);border-radius:16px;padding:24px;text-align:center;margin-bottom:24px;">
                          <p style="margin:0 0 8px;color:rgba(255,255,255,0.7);font-size:13px;text-transform:uppercase;letter-spacing:1px;">Votre cadeau de bienvenue</p>
                          <p style="margin:0;font-size:42px;font-weight:900;color:#d4af37;">1 mois</p>
                          <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">offert sur votre abonnement</p>
                        </div>
                        <p style="margin:0 0 20px;font-size:14px;color:#64748b;text-align:center;">
                          Ce crédit sera appliqué automatiquement sur votre prochaine facturation.
                        </p>
                        <a href="${siteUrl}/dashboard" style="display:block;background:#1a2a6c;color:white;text-decoration:none;text-align:center;padding:14px;border-radius:12px;font-weight:800;font-size:15px;">
                          Accéder à mon dashboard →
                        </a>
                      </div>
                      <p style="text-align:center;font-size:12px;color:#cbd5e1;margin-top:24px;">🎩 Alfred Major — L'excellence du service, à portée de clic</p>
                    </div>
                  </body>
                  </html>
                `,
              });
            }
          }
        }
        // ── FIN PARRAINAGE ──────────────────────────────────────

      } catch (error) {
        console.error("Erreur Webhook Database:", error);
      }
    }
  }

  res.status(200).json({ received: true });
}
