import Stripe from 'stripe';

// Initialisation de Stripe avec ta clé secrète Vercel
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // On s'assure que la requête est bien une méthode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // On récupère l'email et l'ID de l'hôte depuis la requête
    const { userEmail, userId } = req.body;

    // Création de la session de paiement Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: userEmail,
      client_reference_id: userId, // Très important pour relier le paiement au bon compte Supabase
      line_items: [
        {
          price: 'price_XXXXX', // ⚠️ Remplacer par ton vrai ID de Prix Stripe
          quantity: 1,
        },
      ],
      mode: 'subscription',
      // Redirection après le paiement
      success_url: `${req.headers.origin}/dashboard?success=true`,
      cancel_url: `${req.headers.origin}/pricing?canceled=true`,
    });

    // On renvoie l'URL de la page de paiement Stripe au navigateur
    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Erreur Stripe:', error);
    res.status(500).json({ error: error.message });
  }
}
