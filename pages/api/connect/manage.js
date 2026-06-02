// pages/api/upsells/manage.js
// CRUD des upsells par l'hôte : créer, modifier, supprimer, activer/désactiver.

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Non authentifié' });

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Session invalide' });

  // GET — liste des upsells d'un logement
  if (req.method === 'GET') {
    const { propertyId } = req.query;
    if (!propertyId) return res.status(400).json({ error: 'propertyId requis' });

    const { data, error } = await supabaseAdmin
      .from('upsells')
      .select('*')
      .eq('property_id', propertyId)
      .eq('owner_id', user.id)
      .order('created_at', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ upsells: data || [] });
  }

  // POST — créer un upsell
  if (req.method === 'POST') {
    const { propertyId, name, description, category, emoji, price } = req.body;
    if (!propertyId || !name || !price) {
      return res.status(400).json({ error: 'propertyId, name et price sont requis' });
    }

    const { data, error } = await supabaseAdmin
      .from('upsells')
      .insert({
        property_id:  propertyId,
        owner_id:     user.id,
        name:         name.trim(),
        description:  description?.trim() || null,
        category:     category || 'other',
        emoji:        emoji || '✨',
        price:        parseFloat(price),
        is_active:    true,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ upsell: data });
  }

  // PATCH — modifier ou activer/désactiver
  if (req.method === 'PATCH') {
    const { upsellId, ...updates } = req.body;
    if (!upsellId) return res.status(400).json({ error: 'upsellId requis' });

    // Nettoyer les champs autorisés
    const allowedFields = ['name', 'description', 'category', 'emoji', 'price', 'is_active', 'max_per_stay'];
    const cleanUpdates = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        cleanUpdates[field] = updates[field];
      }
    }

    const { data, error } = await supabaseAdmin
      .from('upsells')
      .update(cleanUpdates)
      .eq('id', upsellId)
      .eq('owner_id', user.id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ upsell: data });
  }

  // DELETE — supprimer un upsell
  if (req.method === 'DELETE') {
    const { upsellId } = req.body;
    if (!upsellId) return res.status(400).json({ error: 'upsellId requis' });

    const { error } = await supabaseAdmin
      .from('upsells')
      .delete()
      .eq('id', upsellId)
      .eq('owner_id', user.id);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
}
