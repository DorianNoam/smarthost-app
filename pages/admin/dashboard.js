import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';

const PRICE = 9.90;

function StatCard({ title, value, sub, color = '#e2e8f0', accent = '#1e293b', badge, big }) {
  return (
    <div style={{ background: '#1e293b', padding: '22px 24px', borderRadius: '16px', border: `1px solid ${accent}33`, position: 'relative', overflow: 'hidden' }}>
      {badge && (
        <span style={{ position: 'absolute', top: '12px', right: '12px', background: `${accent}22`, color: accent, fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {badge}
        </span>
      )}
      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' }}>{title}</div>
      <div style={{ fontSize: big ? '42px' : '32px', fontWeight: '800', color, letterSpacing: '-1px', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', fontWeight: '400' }}>{sub}</div>}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '14px', marginTop: '36px', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, height: '1px', background: '#1e293b' }} />
      <span>{children}</span>
      <div style={{ flex: 1, height: '1px', background: '#1e293b' }} />
    </div>
  );
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [expiringTrials, setExpiringTrials] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== 'contact@alfredmajor.com') {
        router.push('/');
      } else {
        fetchAll();
      }
    };
    checkAdmin();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStats(data.stats);
      setExpiringTrials(data.expiringTrials || []);
      setRecentUsers(data.recentUsers || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Erreur dashboard admin:', err);
      setStats({
        mrr: 0, arr: 0, totalLicenses: 0, newPayingThisMonth: 0,
        churnThisMonth: 0, conversionRate: 0, total: 0, actifs: 0,
        trials: 0, pauses: 0, annules: 0, newThisWeek: 0,
        trialsExpiredThisMonth: 0, expiringSoon: 0,
        totalProps: 0, activeProps: 0, referralsPending: 0,
        referralsCompleted: 0, prospectsCount: 0, convertedCount: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' }) : '—';
  const daysLeft = (d) => d ? Math.max(0, Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24))) : 0;

  const statusBadge = (s) => {
    const map = {
      active:    { label: 'Payant', color: '#10b981' },
      trial:     { label: 'Trial',  color: '#c9a227' },
      paused:    { label: 'Pause',  color: '#ef4444' },
      cancelled: { label: 'Annulé', color: '#64748b' },
    };
    const m = map[s] || { label: s, color: '#64748b' };
    return (
      <span style={{ background: `${m.color}22`, color: m.color, padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
        {m.label}
      </span>
    );
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: 'white', fontFamily: 'Inter, sans-serif', gap: '12px' }}>
      <div style={{ fontSize: '36px' }}>🎩</div>
      <div style={{ color: '#64748b', fontSize: '14px' }}>Chargement des données...</div>
    </div>
  );

  if (!stats) return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: 'white', fontFamily: 'Inter, sans-serif', gap: '12px' }}>
      <div style={{ fontSize: '36px' }}>⚠️</div>
      <div style={{ color: '#ef4444', fontSize: '14px' }}>Erreur de chargement</div>
      <button onClick={fetchAll} style={{ background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', marginTop: '8px' }}>🔄 Réessayer</button>
    </div>
  );

  return (
    <div style={{ padding: '32px 40px', background: '#0f172a', minHeight: '100vh', fontFamily: 'Inter, -apple-system, sans-serif', color: 'white' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px' }}>🎩 Tour de Contrôle</h1>
          <p style={{ margin: '4px 0 0', color: '#475569', fontSize: '13px' }}>Alfred Major · Mis à jour {lastUpdated ? lastUpdated.toLocaleTimeString('fr-FR') : '—'}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={fetchAll} style={{ background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>🔄 Rafraîchir</button>
          <a href="/dashboard" style={{ background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', textDecoration: 'none' }}>← Dashboard</a>
        </div>
      </div>

      <SectionLabel>💰 Revenus</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
        <StatCard title="MRR Réel" value={`${stats.mrr.toFixed(2)} €`} sub={`${stats.totalLicenses} licence${stats.totalLicenses > 1 ? 's' : ''} × 9,90 €`} color="#10b981" accent="#10b981" big />
        <StatCard title="ARR (projection)" value={`${stats.arr.toFixed(2)} €`} sub="MRR × 12 mois" color="#34d399" accent="#10b981" />
        <StatCard title="Nouveaux payants" value={stats.newPayingThisMonth} sub="Ce mois-ci" color="#60a5fa" accent="#3b82f6" badge="mois" />
        <StatCard title="Churn" value={stats.churnThisMonth} sub="Comptes mis en pause ce mois" color="#f87171" accent="#ef4444" badge="mois" />
      </div>

      <SectionLabel>🔬 Funnel Trial</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
        <StatCard title="Trials actifs" value={stats.trials} sub="En cours d'essai" color="#c9a227" accent="#c9a227" />
        <StatCard title="Expirent dans 7j" value={stats.expiringSoon} sub="À surveiller" color={stats.expiringSoon > 0 ? '#fb923c' : '#64748b'} accent={stats.expiringSoon > 0 ? '#f97316' : '#334155'} badge="urgent" />
        <StatCard title="Trials expirés" value={stats.trialsExpiredThisMonth} sub="Passés en pause ce mois" color="#f87171" accent="#ef4444" badge="mois" />
        <StatCard title="Taux de conversion" value={`${stats.conversionRate} %`} sub="Trial → Payant (all time)" color={stats.conversionRate >= 20 ? '#10b981' : stats.conversionRate >= 10 ? '#c9a227' : '#f87171'} accent="#6366f1" />
      </div>

      <SectionLabel>👥 Utilisateurs</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
        <StatCard title="Total inscrits" value={stats.total} sub="Tous statuts confondus" color="#e2e8f0" accent="#475569" big />
        <StatCard title="Payants actifs" value={stats.actifs} color="#10b981" accent="#10b981" />
        <StatCard title="En trial" value={stats.trials} color="#c9a227" accent="#c9a227" />
        <StatCard title="En pause" value={stats.pauses} color="#f87171" accent="#ef4444" />
        <StatCard title="Annulés" value={stats.annules} color="#64748b" accent="#334155" />
        <StatCard title="Nouveaux" value={stats.newThisWeek} sub="Ces 7 derniers jours" color="#a78bfa" accent="#7c3aed" badge="7j" />
      </div>

      <SectionLabel>🏠 Logements</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
        <StatCard title="Total logements" value={stats.totalProps} color="#e2e8f0" accent="#475569" />
        <StatCard title="Logements actifs" value={stats.activeProps} sub="Alfred actif dessus" color="#10b981" accent="#10b981" />
        <StatCard title="Logements inactifs" value={stats.totalProps - stats.activeProps} color="#64748b" accent="#334155" />
        <StatCard title="Moy. logements/hôte" value={stats.actifs > 0 ? (stats.activeProps / stats.actifs).toFixed(1) : '0'} sub="Parmi les payants" color="#60a5fa" accent="#3b82f6" />
      </div>

      <SectionLabel>🤝 Parrainage</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
        <StatCard title="Parrainages en cours" value={stats.referralsPending} sub="Filleul inscrit, pas encore payant" color="#c9a227" accent="#c9a227" />
        <StatCard title="Parrainages complétés" value={stats.referralsCompleted} sub="Filleul converti en payant" color="#10b981" accent="#10b981" />
        <StatCard title="Taux parrainage" value={stats.total > 0 ? `${Math.round(((stats.referralsPending + stats.referralsCompleted) / stats.total) * 100)} %` : '0 %'} sub="Inscrits via parrainage" color="#a78bfa" accent="#7c3aed" />
      </div>

      <SectionLabel>📋 Prospection</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
        <StatCard title="Prospects contactés" value={stats.prospectsCount} color="#60a5fa" accent="#3b82f6" />
        <StatCard title="Prospects convertis" value={stats.convertedCount} color="#10b981" accent="#10b981" />
        <StatCard title="Taux de closing" value={stats.prospectsCount > 0 ? `${Math.round((stats.convertedCount / stats.prospectsCount) * 100)} %` : '0 %'} color="#a78bfa" accent="#7c3aed" />
      </div>

      <SectionLabel>🚀 Projections MRR</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
        {[50, 100, 250, 500, 1000].map(n => (
          <StatCard key={n} title={`${n} licences`} value={`${(n * PRICE).toFixed(0)} €`} sub="par mois" color="#a78bfa" accent="#7c3aed" />
        ))}
      </div>

      {expiringTrials.length > 0 && (
        <>
          <SectionLabel>⚠️ Trials expirant dans 7 jours</SectionLabel>
          <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #f9731633', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#0f172a' }}>
                  {['Hôte', 'Email', 'Expire le', 'Jours restants'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expiringTrials.map((u, i) => (
                  <tr key={u.id} style={{ borderTop: '1px solid #1e293b', background: i % 2 === 0 ? '#1e293b' : '#162032' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>{u.full_name || '—'}</td>
                    <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px', color: '#fb923c' }}>{fmtDate(u.trial_expires_at)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: '#f9731622', color: '#fb923c', padding: '3px 10px', borderRadius: '6px', fontWeight: '700' }}>{daysLeft(u.trial_expires_at)}j</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <SectionLabel>🆕 Derniers inscrits</SectionLabel>
      <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', overflow: 'hidden', marginBottom: '40px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#0f172a' }}>
              {['Hôte', 'Email', 'Statut', 'Inscrit le', 'Trial expire'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentUsers.map((u, i) => (
              <tr key={u.id} style={{ borderTop: '1px solid #0f172a', background: i % 2 === 0 ? '#1e293b' : '#162032' }}>
                <td style={{ padding: '12px 16px', fontWeight: '500' }}>{u.full_name || '—'}</td>
                <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{u.email}</td>
                <td style={{ padding: '12px 16px' }}>{statusBadge(u.subscription_status)}</td>
                <td style={{ padding: '12px 16px', color: '#64748b' }}>{fmtDate(u.created_at)}</td>
                <td style={{ padding: '12px 16px', color: '#64748b' }}>
                  {u.subscription_status === 'trial' ? (
                    <span style={{ color: daysLeft(u.trial_expires_at) <= 3 ? '#f87171' : '#c9a227' }}>
                      {fmtDate(u.trial_expires_at)} ({daysLeft(u.trial_expires_at)}j)
                    </span>
                  ) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ textAlign: 'center', color: '#334155', fontSize: '12px', paddingBottom: '20px' }}>
        Alfred Major 🎩 · Tour de Contrôle · {new Date().toLocaleDateString('fr-FR')}
      </div>
    </div>
  );
}
