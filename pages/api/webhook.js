import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Configuration Vercel pour Stripe
export const config = { api: { bodyParser: false } };

// Client Admin pour bypasser les sécurités RLS en production
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
        // 1. Mise à jour du profil (Ajout d'une licence)
        const { data: profile } = await supabaseAdmin.from('profiles').select('active_licenses').eq('id', userId).single();
        const newCount = (profile?.active_licenses || 0) + 1;

        await supabaseAdmin.from('profiles').update({ 
          stripe_customer_id: stripeCustomerId, 
          active_licenses: newCount,
          subscription_status: 'active'
        }).eq('id', userId);

        // 2. Activation du logement le plus ancien en attente
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

        // 3. Enregistrement de l'événement pour l'admin
        await supabaseAdmin.from('license_events').insert([{ user_id: userId }]);

      } catch (error) {
        console.error("Erreur Webhook Database:", error);
      }
    }
  }

  res.status(200).json({ received: true });
}
