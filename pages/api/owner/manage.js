// pages/api/owner/manage.js
// Gestion des proprietaires et documents pour un logement (cote hote).

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Non authentifie' });

  const { data: { user: host }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !host) return res.status(401).json({ error: 'Session invalide' });

  // GET : liste des proprietaires + documents d'un logement
  if (req.method === 'GET') {
    const { propertyId } = req.query;
    if (!propertyId) return res.status(400).json({ error: 'propertyId requis' });

    // Verifier que le logement appartient a cet hote
    const { data: property } = await supabaseAdmin
      .from('properties')
      .select('id, name, city')
      .eq('id', propertyId)
      .eq('owner_id', host.id)
      .single();

    if (!property) return res.status(404).json({ error: 'Logement introuvable' });

    // Recuperer les liaisons proprietaires
    const { data: links } = await supabaseAdmin
      .from('property_owners')
      .select('*, profiles!property_owners_owner_profile_id_fkey(id, full_name, email, invitation_accepted_at)')
      .eq('property_id', propertyId)
      .eq('invited_by', host.id);

    // Recuperer les documents
    const { data: documents } = await supabaseAdmin
      .from('owner_documents')
      .select('*')
      .eq('property_id', propertyId)
      .eq('uploaded_by', host.id)
      .order('created_at', { ascending: false });

    return res.json({
      property,
      owners: (links || []).map(l => ({
        link_id: l.id,
        owner_profile_id: l.owner_profile_id,
        name: l.profiles?.full_name || '',
        email: l.profiles?.email || '',
        commission_rate: l.commission_rate,
        invited_at: l.invited_at,
        accepted: !!l.profiles?.invitation_accepted_at,
      })),
      documents: documents || [],
    });
  }

  // DELETE : retirer un proprietaire d'un logement OU supprimer un document
  if (req.method === 'DELETE') {
    const { linkId, documentId, propertyId } = req.body;

    if (linkId) {
      // Supprimer la liaison proprietaire
      const { data: link } = await supabaseAdmin
        .from('property_owners')
        .select('id, invited_by')
        .eq('id', linkId)
        .single();

      if (!link || link.invited_by !== host.id) return res.status(403).json({ error: 'Non autorise' });

      await supabaseAdmin.from('property_owners').delete().eq('id', linkId);
      return res.json({ success: true });
    }

    if (documentId) {
      // Supprimer un document
      const { data: doc } = await supabaseAdmin
        .from('owner_documents')
        .select('id, uploaded_by, file_url')
        .eq('id', documentId)
        .single();

      if (!doc || doc.uploaded_by !== host.id) return res.status(403).json({ error: 'Non autorise' });

      // Supprimer le fichier du bucket
      try {
        const url = new URL(doc.file_url);
        const path = url.pathname.split('/owner-documents/')[1];
        if (path) await supabaseAdmin.storage.from('owner-documents').remove([path]);
      } catch (e) { console.error('Erreur suppression fichier storage:', e); }

      await supabaseAdmin.from('owner_documents').delete().eq('id', documentId);
      return res.json({ success: true });
    }

    return res.status(400).json({ error: 'linkId ou documentId requis' });
  }

  // PATCH : modifier le taux de commission
  if (req.method === 'PATCH') {
    const { linkId, commissionRate } = req.body;
    if (!linkId || commissionRate === undefined) return res.status(400).json({ error: 'linkId et commissionRate requis' });

    const { data: link } = await supabaseAdmin
      .from('property_owners')
      .select('id, invited_by')
      .eq('id', linkId)
      .single();

    if (!link || link.invited_by !== host.id) return res.status(403).json({ error: 'Non autorise' });

    await supabaseAdmin
      .from('property_owners')
      .update({ commission_rate: commissionRate })
      .eq('id', linkId);

    return res.json({ success: true });
  }

  return res.status(405).json({ error: 'Methode non autorisee' });
}
