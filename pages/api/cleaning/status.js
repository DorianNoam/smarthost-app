// pages/api/cleaning/status.js
// Récupère le statut du ménage en temps réel pour le dashboard hôte

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { propertyId } = req.query;

  if (!propertyId) return res.status(400).json({ error: 'propertyId requis' });

  try {
    // Récupérer le dernier job de ménage pour ce logement
    const { data: job } = await supabaseAdmin
      .from('cleaning_jobs')
      .select('*, cleaning_providers(name)')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!job) return res.status(200).json({ status: null });

    return res.status(200).json({
      jobId: job.id,
      status: job.status,
      providerName: job.cleaning_providers?.name,
      checkoutTime: job.checkout_time,
      nextCheckin: job.next_checkin,
      confirmedAt: job.confirmed_at,
      photos: job.photos || [],
      checklistDone: job.checklist_done || [],
    });

  } catch (error) {
    console.error('Erreur status cleaning:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
