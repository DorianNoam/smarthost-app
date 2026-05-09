import Stripe from 'stripe';
import { supabase } from '../../lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const config = { api: { bodyParser: false } };

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id;
    const stripeCustomerId = session.customer;

    if (userId) {
      // 1. Mise à jour du profil
      const { data: profile } = await supabase.from('profiles').select('active_licenses').eq('id', userId).single();
      const newCount = (profile?.active_licenses || 0) + 1;

      await supabase.from('profiles').update({ 
        stripe_customer_id: stripeCustomerId, 
        active_licenses: newCount,
        subscription_status: 'active'
      }).eq('id', userId);

      // 2. ACTIVATION AUTOMATIQUE DU LOGEMENT
      const { data: inactiveProp } = await supabase
        .from('properties')
        .select('id')
        .eq('owner_id', userId)
        .eq('is_active', false)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (inactiveProp) {
        await supabase.from('properties').update({ is_active: true }).eq('id', inactiveProp.id);
      }

      // 3. Stats pour l'admin
      await supabase.from('license_events').insert([{ user_id: userId }]);
    }
  }

  res.status(200).json({ received: true });
}
