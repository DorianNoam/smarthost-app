// pages/api/owner/dashboard-data.js
// Renvoie toutes les donnees du dashboard proprietaire (biens, resas, revenus, docs).

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Non authentifie' });

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Session invalide' });

  try {
    // Verifier le role
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name, role, email')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'owner') {
      return res.status(403).json({ error: 'Acces refuse' });
    }

    // Recuperer les liaisons property_owners de ce proprietaire
    const { data: links } = await supabaseAdmin
      .from('property_owners')
      .select('*, properties(id, name, city, address, street_number, is_active), invited_by')
      .eq('owner_profile_id', user.id);

    const properties = (links || []).map(l => ({
      ...l.properties,
      commission_rate: l.commission_rate,
      link_id: l.id,
    }));

    const propertyIds = properties.map(p => p.id).filter(Boolean);

    // Reservations
    let reservations = [];
    if (propertyIds.length > 0) {
      const { data: resas } = await supabaseAdmin
        .from('reservations')
        .select('id, property_id, guest_name, check_in, check_out, platform, status')
        .in('property_id', propertyIds)
        .eq('status', 'confirmed')
        .order('check_in', { ascending: false })
        .limit(100);
      reservations = resas || [];
    }

    // Revenus estimes (base sur upsells payes + estimation nuit)
    let upsellsTotal = 0;
    if (propertyIds.length > 0) {
      const { data: upsells } = await supabaseAdmin
        .from('upsell_orders')
        .select('amount, property_id')
        .in('property_id', propertyIds)
        .eq('status', 'paid');
      upsellsTotal = (upsells || []).reduce((sum, u) => sum + Number(u.amount || 0), 0);
    }

    // Documents partages
    let documents = [];
    if (propertyIds.length > 0) {
      const { data: docs } = await supabaseAdmin
        .from('owner_documents')
        .select('*, properties(name)')
        .in('property_id', propertyIds)
        .order('created_at', { ascending: false });
      documents = docs || [];
    }

    // Statistiques
    const today = new Date().toISOString().split('T')[0];
    const upcomingCount = reservations.filter(r => r.check_out >= today).length;
    const pastCount = reservations.filter(r => r.check_out < today).length;

    // Nuits totales des sejours passes
    const nightsThisYear = reservations
      .filter(r => {
        const y = new Date(r.check_in).getFullYear();
        return y === new Date().getFullYear();
      })
      .reduce((sum, r) => {
        const nights = Math.round((new Date(r.check_out) - new Date(r.check_in)) / 86400000);
        return sum + Math.max(0, nights);
      }, 0);

    return res.json({
      profile: { name: profile.full_name, email: profile.email },
      properties,
      reservations,
      documents,
      stats: {
        propertyCount: properties.length,
        upcomingCount,
        pastCount,
        nightsThisYear,
        upsellsTotal: Math.round(upsellsTotal * 100) / 100,
      },
    });
  } catch (err) {
    console.error('dashboard-data owner error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
