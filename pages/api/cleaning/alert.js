// pages/api/cleaning/alert.js
// Vérifie les ménages non confirmés 2h avant l'arrivée et alerte l'hôte
// À appeler via un cron job toutes les 30 minutes

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  // Sécurité : vérifier le token cron
  const cronSecret = req.headers['x-cron-secret'];
  if (cronSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  try {
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    // Récupérer tous les jobs en attente dont l'arrivée est dans moins de 2h
    const { data: jobs } = await supabaseAdmin
      .from('cleaning_jobs')
      .select('*, properties(name, owner_id)')
      .eq('status', 'pending')
      .not('next_checkin', 'is', null)
      .lte('next_checkin', twoHoursLater.toISOString())
      .gte('next_checkin', now.toISOString());

    if (!jobs || jobs.length === 0) {
      return res.status(200).json({ success: true, alerts: 0 });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    let alertCount = 0;

    for (const job of jobs) {
      // Récupérer le profil de l'hôte
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('telegram_chat_id, expo_push_token')
        .eq('id', job.properties.owner_id)
        .single();

      const checkinTime = new Date(job.next_checkin).toLocaleString('fr-FR', {
        hour: '2-digit', minute: '2-digit'
      });

      // Alerte Telegram
      if (token && profile?.telegram_chat_id) {
        const text = `⚠️ *MÉNAGE NON CONFIRMÉ*\n\n🏠 *Logement :* ${job.properties.name}\n📅 *Arrivée prévue à :* ${checkinTime}\n\n❗ Le ménage n'a pas encore été confirmé par votre prestataire. Veuillez vérifier.\n\n_Alfred Major 🎩_`;

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

      // Alerte push Expo
      if (profile?.expo_push_token) {
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: profile.expo_push_token,
            sound: 'default',
            title: '⚠️ Ménage non confirmé',
            body: `${job.properties.name} — Arrivée à ${checkinTime} et ménage non confirmé`,
            priority: 'high',
          }),
        });
      }

      alertCount++;
    }

    return res.status(200).json({ success: true, alerts: alertCount });

  } catch (error) {
    console.error('Erreur alert cleaning:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
