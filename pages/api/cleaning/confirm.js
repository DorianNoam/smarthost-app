// pages/api/cleaning/confirm.js
// Le prestataire confirme que le ménage est effectué

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { jobId, checklistDone, photos, status } = req.body;

  if (!jobId) return res.status(400).json({ error: 'jobId requis' });

  try {
    // 1. Mettre à jour le job
    const { data: job } = await supabaseAdmin
      .from('cleaning_jobs')
      .update({
        status: status || 'completed',
        checklist_done: checklistDone || [],
        photos: photos || [],
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', jobId)
      .select('*, properties(name, owner_id)')
      .single();

    if (!job) return res.status(404).json({ error: 'Job introuvable' });

    // 2. Notifier l'hôte sur Telegram
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('telegram_chat_id, preferred_language')
      .eq('id', job.properties.owner_id)
      .single();

    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (token && profile?.telegram_chat_id) {
      const text = `✅ *MÉNAGE TERMINÉ*\n\n🏠 *Logement :* ${job.properties.name}\n⏰ *Confirmé à :* ${new Date().toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}\n\nVotre logement est prêt pour le prochain voyageur ! 🎩`;

      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: profile.telegram_chat_id,
          text,
          parse_mode: 'Markdown',
        }),
      });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Erreur confirm cleaning:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
