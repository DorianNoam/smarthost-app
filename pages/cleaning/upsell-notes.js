// pages/api/cleaning/upsell-notes.js
// Renvoie les upsell_orders payés avec affects_cleaning = true,
// groupés par property_id + date de checkout (pour matcher avec cleaning_jobs).
// Utilise service_role car le prestataire n'a pas accès RLS aux upsell_orders.

import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { propertyIds } = req.body;
  if (!propertyIds || !Array.isArray(propertyIds) || propertyIds.length === 0) {
    return res.json({ notes: {} });
  }

  try {
    const { data: orders, error } = await supabaseAdmin
      .from('upsell_orders')
      .select('property_id, notes, guest_name, upsells(name, emoji, affects_cleaning), reservations(check_out)')
      .in('property_id', propertyIds)
      .eq('status', 'paid');

    if (error) throw error;

    // Filtrer affects_cleaning et grouper par clé property_id + date checkout
    const grouped = {};
    (orders || []).forEach(order => {
      if (!order.upsells?.affects_cleaning) return;

      const checkoutRaw = order.reservations?.check_out;
      const checkoutDate = checkoutRaw
        ? new Date(checkoutRaw).toISOString().split('T')[0]
        : 'unknown';

      const key = `${order.property_id}_${checkoutDate}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push({
        name: order.upsells.name,
        emoji: order.upsells.emoji,
        notes: order.notes || null,
      });
    });

    return res.json({ notes: grouped });
  } catch (err) {
    console.error('upsell-notes error:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
