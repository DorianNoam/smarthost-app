// pages/api/connect/status.js
// Vérifie et met à jour le statut du compte Stripe Connect de l'hôte.

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Non authentifié' });

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Session invalide' });

  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_account_id, stripe_connect_status')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_account_id) {
      return res.status(200).json({ status: 'not_connected', accountId: null });
    }

    // Vérifier le statut réel sur Stripe
    const account = await stripe.accounts.retrieve(profile.stripe_account_id);

    const isActive = account.charges_enabled && account.payouts_enabled;
    const status = isActive ? 'active' : 'pending';

    // Mettre à jour en base si changement
    if (status !== profile.stripe_connect_status) {
      await supabaseAdmin
        .from('profiles')
        .update({ stripe_connect_status: status })
        .eq('id', user.id);
    }

    return res.status(200).json({
      status,
      accountId: profile.stripe_account_id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
    });

  } catch (error) {
    console.error('Erreur status Connect:', error);
    return res.status(500).json({ error: error.message });
  }
}
