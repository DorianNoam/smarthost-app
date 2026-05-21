// pages/api/cron/purge-conversations.js
// Appelé automatiquement chaque nuit à 3h par Vercel Cron
// Purge les historiques de conversations inactives depuis 90 jours (RGPD)

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // ✅ Sécurité : seul Vercel Cron peut appeler cette route
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  try {
    const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

    const { error, count } = await supabaseAdmin
      .from('conversations')
      .update({ history: [] })
      .lt('last_message_at', cutoffDate)
      .neq('history', []);

    if (error) throw error;

    console.log(`✅ Purge RGPD : ${count} conversations vidées (inactives depuis 90j)`);
    return res.status(200).json({ success: true, purged: count });

  } catch (err) {
    console.error('❌ Erreur purge conversations:', err);
    return res.status(500).json({ error: 'Erreur purge' });
  }
}
