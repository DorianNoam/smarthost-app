// pages/api/push-subscribe.js
// Enregistre ou supprime l'abonnement push d'un hôte dans Supabase

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Enregistrement d'un nouvel abonnement
    const { userId, subscription } = req.body;

    if (!userId || !subscription) {
      return res.status(400).json({ error: 'userId et subscription requis' });
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ push_subscription: subscription })
      .eq('id', userId);

    if (error) {
      console.error('Erreur enregistrement push:', error);
      return res.status(500).json({ error: 'Erreur enregistrement' });
    }

    return res.status(200).json({ success: true });
  }

  if (req.method === 'DELETE') {
    // Désabonnement
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId requis' });
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ push_subscription: null })
      .eq('id', userId);

    if (error) {
      return res.status(500).json({ error: 'Erreur désabonnement' });
    }

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
}
