// pages/api/cleaning/set-cleaner-password.js
// Définit le mot de passe d'un prestataire lors de sa première connexion.
// Vérifie le token d'invitation avant d'autoriser le changement.

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { token, email, password } = req.body;
  if (!token || !email || !password) {
    return res.status(400).json({ error: 'token, email et password requis' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Mot de passe trop court (8 caractères minimum)' });
  }

  try {
    // 1. Vérifier le token d'invitation
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, invitation_accepted_at')
      .eq('invitation_token', token)
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (!profile) {
      return res.status(400).json({ error: 'Token d\'invitation invalide' });
    }

    if (profile.invitation_accepted_at) {
      return res.status(400).json({ error: 'Ce lien a déjà été utilisé' });
    }

    // 2. Mettre à jour le mot de passe via l'API Admin Supabase
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      profile.id,
      { password }
    );

    if (updateError) throw updateError;

    // 3. Marquer l'invitation comme acceptée + supprimer le token
    await supabaseAdmin
      .from('profiles')
      .update({
        invitation_accepted_at: new Date().toISOString(),
        invitation_token: null,
      })
      .eq('id', profile.id);

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Erreur set-cleaner-password:', error);
    return res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
}
