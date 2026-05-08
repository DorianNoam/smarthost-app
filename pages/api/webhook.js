import Stripe from 'stripe';
import { supabase } from '../../lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ⚠️ Configuration obligatoire pour Next.js avec les Webhooks Stripe
export const config = {
  api: { bodyParser: false },
};

// Fonction pour lire le message brut (nécessaire pour la sécurité Stripe)
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
  
  // Clé secrète du Webhook (à ajouter sur Vercel)
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // On vérifie que le message vient bien de Stripe (Sécurité)
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error('Erreur de signature Webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Si le paiement est réussi
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // On récupère l'ID Supabase de l'hôte (qu'on avait caché dans client_reference_id)
    const userId = session.client_reference_id; 
    const customerId = session.customer;
    const subscriptionId = session.subscription;

    if (userId) {
      // On met à jour le profil de l'hôte dans Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          subscription_status: 'active'
        })
        .eq('id', userId);

      if (error) console.error('Erreur de mise à jour Supabase:', error);
      else console.log(`✅ Abonnement activé pour l'utilisateur ${userId}`);
    }
  }

  // Si le client annule son abonnement plus tard
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    
    // On repasse le profil en inactif
    const { error } = await supabase
      .from('profiles')
      .update({ subscription_status: 'inactive' })
      .eq('stripe_subscription_id', subscription.id);
      
    if (error) console.error('Erreur désactivation Supabase:', error);
  }

  res.status(200).json({ received: true });
}
