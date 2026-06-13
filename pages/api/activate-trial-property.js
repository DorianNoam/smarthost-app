import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  // 1. Authentification via le token Bearer
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData?.user) {
    return res.status(401).json({ error: 'Token invalide' });
  }
  const userId = userData.user.id;

  try {
    // 2. Récupérer le profil
    const { data: profile, error: profErr } = await supabaseAdmin
      .from('profiles')
      .select('subscription_status, trial_expires_at, active_licenses')
      .eq('id', userId)
      .single();

    if (profErr || !profile) {
      return res.status(404).json({ error: 'Profil introuvable' });
    }

    // 3. Vérifier que le user est en trial valide
    if (profile.subscription_status !== 'trial') {
      return res.status(403).json({
        error: 'Compte hors trial',
        requiresPayment: true,
      });
    }

    if (profile.trial_expires_at && new Date(profile.trial_expires_at) < new Date()) {
      return res.status(403).json({
        error: 'Trial expiré',
        requiresPayment: true,
      });
    }

    // 4. Vérifier qu'il n'a pas déjà un logement actif (1 max pendant le trial)
    const { data: activeProps } = await supabaseAdmin
      .from('properties')
      .select('id')
      .eq('owner_id', userId)
      .eq('is_active', true);

    if (activeProps && activeProps.length >= 1) {
      return res.status(403).json({
        error: 'Limite trial atteinte (1 logement gratuit)',
        requiresPayment: true,
      });
    }

    // 5. Activer la propriété inactive la plus ancienne
    const { data: inactiveProp, error: propErr } = await supabaseAdmin
      .from('properties')
      .select('id, name')
      .eq('owner_id', userId)
      .eq('is_active', false)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (propErr || !inactiveProp) {
      return res.status(404).json({ error: 'Aucun logement à activer' });
    }

    const { error: updErr } = await supabaseAdmin
      .from('properties')
      .update({ is_active: true })
      .eq('id', inactiveProp.id);

    if (updErr) {
      console.error('Erreur activation:', updErr);
      return res.status(500).json({ error: 'Échec activation' });
    }

    // 6. Log de l'événement (pour stats internes)
    await supabaseAdmin
      .from('license_events')
      .insert([{ user_id: userId }])
      .then(() => {})
      .catch(() => {}); // table license_events peut ne pas exister, on ignore

    return res.status(200).json({
      success: true,
      propertyId: inactiveProp.id,
      propertyName: inactiveProp.name,
      message: 'Logement activé gratuitement pendant votre essai',
    });

  } catch (error) {
    console.error('Erreur activate-trial-property:', error);
    return res.status(500).json({ error: error.message });
  }
}
