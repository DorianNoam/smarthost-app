// pages/api/cleaning/validate-invite.js
// Valide un token d'invitation prestataire.
// Utilise service_role pour bypasser RLS sur profiles.

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { token, email } = req.body;
  if (!token || !email) return res.status(400).json({ error: 'Token et email requis' });

  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('full_name, invitation_accepted_at')
      .eq('invitation_token', token)
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (error) throw error;

    if (!profile) {
      return res.json({ valid: false, reason: 'not_found' });
    }

    if (profile.invitation_accepted_at) {
      return res.json({ valid: false, reason: 'already_accepted' });
    }

    return res.json({ valid: true, cleanerName: profile.full_name || '' });
  } catch (err) {
    console.error('validate-invite error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
