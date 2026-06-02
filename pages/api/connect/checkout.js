// pages/api/upsells/checkout.js
// Crée une session Stripe Checkout pour l'achat d'un upsell par le voyageur.
// Le paiement va directement sur le compte Stripe Connect de l'hôte.

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { upsellId, propertySlug, guestName, guestEmail, notes } = req.body;
  if (!upsellId) return res.status(400).json({ error: 'upsellId requis' });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.alfredmajor.com';

  try {
    // 1. Récupérer l'upsell
    const { data: upsell, error: upsellError } = await supabaseAdmin
      .from('upsells')
      .select('*, properties(name, owner_id)')
      .eq('id', upsellId)
      .eq('is_active', true)
      .single();

    if (upsellError || !upsell) {
      return res.status(404).json({ error: 'Upsell introuvable ou inactif' });
    }

    // 2. Récupérer le compte Stripe Connect de l'hôte
    const { data: ownerProfile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_account_id, stripe_connect_status')
      .eq('id', upsell.properties.owner_id)
      .single();

    if (!ownerProfile?.stripe_account_id) {
      return res.status(400).json({ error: "L'hôte n'a pas encore connecté son compte Stripe" });
    }

    if (ownerProfile.stripe_connect_status !== 'active') {
      return res.status(400).json({ error: "Le compte Stripe de l'hôte n'est pas encore activé" });
    }

    // 3. Créer la commande en base (status: pending)
    const { data: order } = await supabaseAdmin
      .from('upsell_orders')
      .insert({
        upsell_id:        upsellId,
        property_id:      upsell.property_id,
        owner_id:         upsell.properties.owner_id,
        guest_name:       guestName || null,
        guest_email:      guestEmail || null,
        amount:           upsell.price,
        currency:         upsell.currency || 'eur',
        stripe_account_id: ownerProfile.stripe_account_id,
        notes:            notes || null,
        status:           'pending',
      })
      .select()
      .single();

    // 4. Créer la session Stripe Checkout
    // Le paiement va DIRECTEMENT sur le compte Connect de l'hôte
    const session = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: upsell.currency || 'eur',
              product_data: {
                name: `${upsell.emoji || '✨'} ${upsell.name}`,
                description: upsell.description || `Service pour ${upsell.properties.name}`,
                metadata: {
                  upsell_id: upsellId,
                  property_id: upsell.property_id,
                  order_id: order.id,
                },
              },
              unit_amount: Math.round(upsell.price * 100), // En centimes
            },
            quantity: 1,
          },
        ],
        customer_email: guestEmail || undefined,
        metadata: {
          order_id:    order.id,
          upsell_id:   upsellId,
          property_id: upsell.property_id,
          owner_id:    upsell.properties.owner_id,
        },
        success_url: `${siteUrl}/upsells/${propertySlug}?success=true&order=${order.id}`,
        cancel_url:  `${siteUrl}/upsells/${propertySlug}?cancelled=true`,
      },
      {
        // Paiement sur le compte Connect de l'hôte (0% commission Alfred Major)
        stripeAccount: ownerProfile.stripe_account_id,
      }
    );

    // 5. Mettre à jour la commande avec l'ID de session Stripe
    await supabaseAdmin
      .from('upsell_orders')
      .update({ stripe_session_id: session.id })
      .eq('id', order.id);

    return res.status(200).json({ url: session.url, orderId: order.id });

  } catch (error) {
    console.error('Erreur checkout upsell:', error);
    return res.status(500).json({ error: error.message });
  }
}
