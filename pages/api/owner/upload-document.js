// pages/api/owner/upload-document.js
// Enregistre les metadonnees d'un document uploade dans le bucket.
// L'upload dans Storage se fait cote client, cet endpoint enregistre juste l'URL en base.

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Methode non autorisee' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Non authentifie' });

  const { data: { user: host }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !host) return res.status(401).json({ error: 'Session invalide' });

  const { propertyId, name, fileUrl, fileType, fileSize, category } = req.body;
  if (!propertyId || !name || !fileUrl) return res.status(400).json({ error: 'propertyId, name et fileUrl requis' });

  try {
    // Verifier que le logement appartient a cet hote
    const { data: property } = await supabaseAdmin
      .from('properties')
      .select('id')
      .eq('id', propertyId)
      .eq('owner_id', host.id)
      .single();

    if (!property) return res.status(404).json({ error: 'Logement introuvable' });

    // Trouver le proprietaire assigne (au moins un)
    const { data: link } = await supabaseAdmin
      .from('property_owners')
      .select('owner_profile_id')
      .eq('property_id', propertyId)
      .eq('invited_by', host.id)
      .limit(1)
      .maybeSingle();

    if (!link) return res.status(400).json({ error: 'Aucun proprietaire assigne a ce logement' });

    const { data: doc, error } = await supabaseAdmin
      .from('owner_documents')
      .insert({
        property_id: propertyId,
        owner_profile_id: link.owner_profile_id,
        uploaded_by: host.id,
        name,
        file_url: fileUrl,
        file_type: fileType || null,
        file_size: fileSize || null,
        category: category || null,
      })
      .select()
      .single();

    if (error) throw error;

    return res.json({ success: true, document: doc });
  } catch (err) {
    console.error('upload-document error:', err);
    return res.status(500).json({ error: err.message || 'Erreur serveur' });
  }
}
