// pages/api/push-subscribe.js
// Enregistre ou supprime l'abonnement push d'un hôte dans Supabase
// ✅ Sécurisé : vérifie la session Supabase avant toute modification

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Client standard pour vérifier la session de l'utilisateur
const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function getAuthenticatedUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabaseAuth.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { subscription } = req.body;

    // ✅ Vérification authentification
    const user = await getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Non authentifié' });

    if (!subscription) {
      return res.status(400).json({ error: 'subscription requis' });
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ push_subscription: subscription })
      .eq('id', user.id); // ✅ On utilise l'ID de la session, pas du body

    if (error) {
      console.error('Erreur enregistrement push:', error);
      return res.status(500).json({ error: 'Erreur enregistrement' });
    }

    return res.status(200).json({ success: true });
  }

  if (req.method === 'DELETE') {
    // ✅ Vérification authentification
    const user = await getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Non authentifié' });

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ push_subscription: null })
      .eq('id', user.id); // ✅ On utilise l'ID de la session, pas du body

    if (error) {
      return res.status(500).json({ error: 'Erreur désabonnement' });
    }

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
}
