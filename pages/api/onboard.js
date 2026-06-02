// pages/api/connect/onboard.js
// Génère un lien d'onboarding Stripe Connect pour l'hôte.
// L'hôte clique, remplit son IBAN/identité sur Stripe, et revient sur Alfred Major.

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Non authentifié' });

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Session invalide' });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.alfredmajor.com';

  try {
    // Récupérer le profil pour voir si un compte Connect existe déjà
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_account_id, email, full_name')
      .eq('id', user.id)
      .single();

    let accountId = profile?.stripe_account_id;

    // Créer un compte Connect Standard si pas encore fait
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'standard',
        email: profile?.email || user.email,
        metadata: { alfred_user_id: user.id },
      });

      accountId = account.id;

      // Sauvegarder l'account ID
      await supabaseAdmin
        .from('profiles')
        .update({
          stripe_account_id: accountId,
          stripe_connect_status: 'pending',
        })
        .eq('id', user.id);
    }

    // Générer le lien d'onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${siteUrl}/settings?connect=refresh`,
      return_url: `${siteUrl}/settings?connect=success`,
      type: 'account_onboarding',
    });

    return res.status(200).json({ url: accountLink.url });

  } catch (error) {
    console.error('Erreur onboarding Connect:', error);
    return res.status(500).json({ error: error.message });
  }
}
