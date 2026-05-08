import Stripe from 'stripe';
import { supabase } from '../../lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: { bodyParser: false },
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error('Erreur signature:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ CAS 1 : PAIEMENT RÉUSSI (Ajouter une licence)
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id; 

    if (userId) {
      // On récupère le nombre actuel de licences
      const { data: profile } = await supabase
        .from('profiles')
        .select('active_licenses')
        .eq('id', userId)
        .single();

      const newCount = (profile?.active_licenses || 0) + 1;

      // Mise à jour du profil
      await supabase
        .from('profiles')
        .update({
          active_licenses: newCount,
          subscription_status: 'active'
        })
        .eq('id', userId);
      
      console.log(`✅ +1 licence pour ${userId}. Total: ${newCount}`);
    }
  }

  // ❌ CAS 2 : ABONNEMENT ANNULÉ (Retirer une licence)
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    
    // On cherche l'utilisateur par son ID client Stripe
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, active_licenses')
      .eq('stripe_customer_id', subscription.customer)
      .single();

    if (profile) {
      const newCount = Math.max(0, (profile.active_licenses || 0) - 1);
      const newStatus = newCount === 0 ? 'inactive' : 'active';

      await supabase
        .from('profiles')
        .update({ 
          active_licenses: newCount,
          subscription_status: newStatus 
        })
        .eq('id', profile.id);
      
      console.log(`❌ -1 licence pour ${profile.id}. Restant: ${newCount}`);
    }
  }

  res.status(200).json({ received: true });
}
