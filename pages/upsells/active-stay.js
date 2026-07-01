// pages/api/upsells/active-stay.js
// Renvoie la réservation active ou prochaine pour un logement donné.
// Utilisé par la page upsells pour pré-remplir le formulaire voyageur
// et supprimer le champ dates quand une résa est détectée.
// Utilise service_role car la page upsells est publique (pas d'auth voyageur).

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { propertyId } = req.query;
  if (!propertyId) {
    return res.json({ reservation: null });
  }

  try {
    const today = new Date().toISOString().split('T')[0];

    // 1. Chercher un séjour en cours (check_in ≤ today ≤ check_out)
    const { data: activeStay } = await supabaseAdmin
      .from('reservations')
      .select('id, guest_name, check_in, check_out, platform')
      .eq('property_id', propertyId)
      .eq('status', 'confirmed')
      .lte('check_in', today)
      .gte('check_out', today)
      .limit(1)
      .maybeSingle();

    if (activeStay) {
      return res.json({ reservation: activeStay });
    }

    // 2. Sinon, prochaine réservation à venir (dans les 3 prochains jours)
    const threeDays = new Date();
    threeDays.setDate(threeDays.getDate() + 3);
    const threeDaysStr = threeDays.toISOString().split('T')[0];

    const { data: upcomingStay } = await supabaseAdmin
      .from('reservations')
      .select('id, guest_name, check_in, check_out, platform')
      .eq('property_id', propertyId)
      .eq('status', 'confirmed')
      .gte('check_in', today)
      .lte('check_in', threeDaysStr)
      .order('check_in', { ascending: true })
      .limit(1)
      .maybeSingle();

    return res.json({ reservation: upcomingStay || null });
  } catch (err) {
    console.error('active-stay error:', err);
    return res.json({ reservation: null });
  }
}
