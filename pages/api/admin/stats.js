// pages/api/admin/stats.js
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Methode non autorisee' });

  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Non authentifie' });

  const { data: userData } = await supabaseAdmin.auth.getUser(token);
  if (!userData?.user || userData.user.email !== 'contact@alfredmajor.com') {
    return res.status(403).json({ error: 'Acces refuse' });
  }

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Tous les profils via service_role (bypass RLS)
    // Exclure les prestataires de menage (role = 'cleaner') des stats
    const { data: allProfiles } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, subscription_status, active_licenses, trial_started_at, trial_expires_at, paused_at, created_at, referred_by, role');

    const profiles = (allProfiles || []).filter(p => p.role !== 'cleaner');

    const actifs = profiles.filter(p => p.subscription_status === 'active');
    const trials = profiles.filter(p => p.subscription_status === 'trial');
    const pauses = profiles.filter(p => p.subscription_status === 'paused');
    const annules = profiles.filter(p => p.subscription_status === 'cancelled');
    const total = profiles.length;

    const totalLicenses = actifs.reduce((sum, p) => sum + (p.active_licenses || 0), 0);
    const mrr = totalLicenses * 9.90;
    const newThisWeek = profiles.filter(p => p.created_at >= startOfWeek).length;
    const churnThisMonth = pauses.filter(p => p.paused_at && p.paused_at >= startOfMonth).length;
    const conversionRate = total > 0 ? Math.round((actifs.length / total) * 100) : 0;

    const expiringSoon = trials.filter(p =>
      p.trial_expires_at && p.trial_expires_at <= in7days && p.trial_expires_at >= now.toISOString()
    );
    const trialsExpiredThisMonth = pauses.filter(p => p.paused_at && p.paused_at >= startOfMonth).length;

    // Nouveaux payants ce mois
    const { data: eventsMonth } = await supabaseAdmin
      .from('license_events')
      .select('user_id')
      .gte('created_at', startOfMonth);
    const newPayingThisMonth = new Set(eventsMonth?.map(e => e.user_id) || []).size;

    // Logements
    const { count: totalProps } = await supabaseAdmin
      .from('properties')
      .select('*', { count: 'exact', head: true });
    const { count: activeProps } = await supabaseAdmin
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Parrainage
    const { count: referralsPending } = await supabaseAdmin
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    const { count: referralsCompleted } = await supabaseAdmin
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    // Prospects
    let prospectsCount = 0;
    let convertedCount = 0;
    try {
      const { count: pc } = await supabaseAdmin
        .from('prospects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'contacted');
      const { count: cc } = await supabaseAdmin
        .from('prospects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'converted');
      prospectsCount = pc || 0;
      convertedCount = cc || 0;
    } catch (_) {}

    // 10 derniers inscrits (hotes uniquement, pas les cleaners)
    const recentUsers = [...profiles]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10);

    return res.status(200).json({
      stats: {
        mrr, arr: mrr * 12, totalLicenses, newPayingThisMonth,
        churnThisMonth, conversionRate, total,
        actifs: actifs.length, trials: trials.length,
        pauses: pauses.length, annules: annules.length,
        newThisWeek, trialsExpiredThisMonth,
        expiringSoon: expiringSoon.length,
        totalProps: totalProps || 0, activeProps: activeProps || 0,
        referralsPending: referralsPending || 0, referralsCompleted: referralsCompleted || 0,
        prospectsCount, convertedCount,
      },
      expiringTrials: expiringSoon,
      recentUsers,
    });
  } catch (err) {
    console.error('Erreur admin stats:', err);
    return res.status(500).json({ error: err.message });
  }
}
