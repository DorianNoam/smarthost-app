// pages/api/cleaning/remove-cleaner.js
// L'hôte supprime / désassigne un prestataire de ménage.

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Non authentifié' });

  const { data: { user: host }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !host) return res.status(401).json({ error: 'Session invalide' });

  const { propertyId, deleteProvider } = req.body;
  if (!propertyId) return res.status(400).json({ error: 'propertyId requis' });

  try {
    // 1. Récupérer le provider_id avant suppression
    const { data: config } = await supabaseAdmin
      .from('property_cleaning')
      .select('provider_id')
      .eq('property_id', propertyId)
      .single();

    // 2. Supprimer l'assignation du logement
    await supabaseAdmin
      .from('property_cleaning')
      .delete()
      .eq('property_id', propertyId);

    // 3. Si deleteProvider = true, supprimer complètement le prestataire
    // (seulement s'il n'est assigné à aucun autre logement de cet hôte)
    if (deleteProvider && config?.provider_id) {
      const { data: otherAssignments } = await supabaseAdmin
        .from('property_cleaning')
        .select('property_id')
        .eq('provider_id', config.provider_id);

      if (!otherAssignments || otherAssignments.length === 0) {
        // Récupérer le profile_id pour désactiver le compte Auth
        const { data: provider } = await supabaseAdmin
          .from('cleaning_providers')
          .select('profile_id')
          .eq('id', config.provider_id)
          .single();

        // Supprimer le compte Auth si c'est un cleaner dédié
        if (provider?.profile_id) {
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', provider.profile_id)
            .single();

          if (profile?.role === 'cleaner') {
            await supabaseAdmin.auth.admin.deleteUser(provider.profile_id);
          }
        }

        // Supprimer le prestataire
        await supabaseAdmin
          .from('cleaning_providers')
          .delete()
          .eq('id', config.provider_id);
      }
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Erreur remove-cleaner:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
