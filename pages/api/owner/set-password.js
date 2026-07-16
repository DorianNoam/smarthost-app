// pages/api/owner/set-password.js
// Definit le mot de passe du proprietaire.

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Methode non autorisee' });

  const { token, email, password } = req.body;
  if (!token || !email || !password) return res.status(400).json({ error: 'token, email et password requis' });
  if (password.length < 8) return res.status(400).json({ error: 'Mot de passe trop court (8 caracteres minimum)' });

  const emailNormalized = email.toLowerCase().trim();

  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, invitation_accepted_at')
      .eq('invitation_token', token)
      .eq('email', emailNormalized)
      .maybeSingle();

    if (!profile) return res.status(400).json({ error: 'Token d\'invitation invalide' });
    if (profile.invitation_accepted_at) return res.status(400).json({ error: 'Ce lien a deja ete utilise' });

    const { data: userList } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const existingAuthUser = userList?.users?.find(u => u.email === emailNormalized);

    let authUserId;

    if (existingAuthUser) {
      authUserId = existingAuthUser.id;
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(authUserId, { password });
      if (updateError) throw updateError;
    } else {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: emailNormalized,
        password,
        email_confirm: true,
        user_metadata: { full_name: profile.full_name, role: 'owner' },
      });
      if (createError) throw createError;
      authUserId = newUser.user.id;

      if (authUserId !== profile.id) {
        await supabaseAdmin.from('profiles').update({ id: authUserId }).eq('id', profile.id);
        await supabaseAdmin.from('property_owners').update({ owner_profile_id: authUserId }).eq('owner_profile_id', profile.id);
      }
    }

    await supabaseAdmin
      .from('profiles')
      .update({
        invitation_accepted_at: new Date().toISOString(),
        invitation_token: null,
      })
      .eq('email', emailNormalized);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erreur set-owner-password:', error);
    return res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
}
