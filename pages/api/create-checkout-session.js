import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { userEmail, userId } = req.body;

    // S'il n'y a pas d'origin (cas de l'app mobile), on force ton vrai domaine
    const origin = req.headers.origin || 'https://www.alfredmajor.com';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: userEmail,
      client_reference_id: userId,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',

      // ⚠️ Le 1er mois gratuit est maintenant géré côté trial (30 jours sans CB),
      // donc PAS de coupon Stripe ici — sinon le user aurait 60 jours gratuits.

      success_url: `${origin}/dashboard?success=true`,
      cancel_url: `${origin}/dashboard?canceled=true`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Erreur Stripe:', error);
    res.status(500).json({ error: error.message });
  }
}
