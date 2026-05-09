import Stripe from 'stripe';
import { supabase } from '../../lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { userId } = req.body;

  try {
    // 1. On récupère le stripe_customer_id en base
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (!profile?.stripe_customer_id) {
      return res.status(400).json({ error: "Aucun abonnement trouvé." });
    }

    // 2. On crée la session du portail
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${req.headers.origin}/dashboard`, // Où il revient après
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l'accès au portail." });
  }
}
