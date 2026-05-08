import Stripe from 'stripe';

// Initialisation de Stripe avec ta clé secrète stockée sur Vercel
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // On s'assure que la requête est bien une méthode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // On récupère l'email et l'ID de l'hôte depuis la requête envoyée par le bouton
    const { userEmail, userId } = req.body;

    // Création de la session de paiement Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: userEmail,
      client_reference_id: userId, // Relie le paiement au compte utilisateur dans Supabase
      line_items: [
        {
          price: 'price_1TUuCMBkbQjki47UurlknUvJ', // Ton identifiant de produit réel
          quantity: 1,
        },
      ],
      mode: 'subscription',
      // Redirection après le paiement
      success_url: `${req.headers.origin}/dashboard?success=true`,
      cancel_url: `${req.headers.origin}/pricing?canceled=true`,
    });

    // Renvoie l'URL sécurisée vers Stripe pour la redirection
    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Erreur Stripe:', error);
    res.status(500).json({ error: error.message });
  }
}
