import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/router';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    dailyCA: 0,
    monthlyCA: 0,
    totalCA: 0,
    totalLicenses: 0,
    totalUsers: 0,
    totalProperties: 0
  });

  const PRICE = 19.90;

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('USER EMAIL:', user?.email);
      if (!user || user.email !== 'contact@alfredmajor.com') {
        router.push('/');
      } else {
        fetchFinancialData();
      }
    };
    checkAdmin();
  }, []);

  const fetchFinancialData = async () => {
    try {
      const now = new Date();
      const startOfDay = new Date(new Date().setHours(0,0,0,0)).toISOString();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // 1. LICENCES ACTIVES (depuis les profils)
      const { data: profiles } = await supabase.from('profiles').select('active_licenses');
      const totalActiveLicenses = profiles?.reduce((sum, p) => sum + (p.active_licenses || 0), 0) || 0;

      // 2. ÉVÉNEMENTS (pour le détail Jour/Mois)
      const { data: events } = await supabase.from('license_events').select('created_at');
      const dailyCount = events?.filter(e => e.created_at >= startOfDay).length || 0;

      // 3. AUTRES MÉTRIQUES
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: propertiesCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      // 4. PROSPECTS (depuis la table prospects)
      const { count: prospectsCount } = await supabase
        .from('prospects')
        .select('*', { count: 'exact', head: true });

      const { count: convertedCount } = await supabase
        .from('prospects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'converted');

      setStats({
        dailyCA: dailyCount * PRICE,
        monthlyCA: totalActiveLicenses * PRICE,
        totalCA: totalActiveLicenses * PRICE,
        totalLicenses: totalActiveLicenses,
        totalUsers: usersCount || 0,
        totalProperties: propertiesCount || 0,
        totalProspects: prospectsCount || 0,
        convertedProspects: convertedCount || 0,
      });

    } catch (error) {
      console.error("Erreur :", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: 'white', fontFamily: 'sans-serif' }}>
      Mise à jour des finances...
    </div>
  );

  return (
    <div style={{ padding: 40, background: '#0f172a', minHeight: '100vh', fontFamily: 'sans-serif', color: 'white' }}>
      <style jsx>{`
        .section-label { color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 15px; display: block; letter-spacing: 1px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .card { background: #1e293b; padding: 25px; border-radius: 20px; border: 1px solid #334155; }
        .card.green { border-color: #10b981; background: linear-gradient(145deg, #1e293b 0%, #064e3b 100%); }
        .card.gold { border-color: #d4af37; background: linear-gradient(145deg, #1e293b 0%, #292005 100%); }
        .card.blue { border-color: #3b82f6; background: linear-gradient(145deg, #1e293b 0%, #1e3a5f 100%); }
        .stat-title { color: #94a3b8; font-size: 13px; font-weight: 500; margin-bottom: 10px; }
        .stat-value { font-size: 36px; font-weight: 800; display: block; }
        .currency { font-size: 16px; color: #94a3b8; margin-left: 4px; }
      `}</style>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>🎩 Tour de Contrôle</h1>
          <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: 14 }}>Alfred Major — Vue financière en temps réel</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <a href="/admin" style={{ color: '#d4af37', fontSize: 13, textDecoration: 'none', background: 'rgba(212,175,55,0.1)', padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(212,175,55,0.3)' }}>
            📋 Prospects
          </a>
          <a href="/dashboard" style={{ color: '#94a3b8', fontSize: 13, textDecoration: 'none', background: '#1e293b', padding: '8px 16px', borderRadius: 8, border: '1px solid #334155' }}>
            ← Dashboard
          </a>
        </div>
      </div>

      {/* REVENUS */}
      <span className="section-label">💰 Revenus (Stripe)</span>
      <div className="grid">
        <div className="card green">
          <div className="stat-title">Ventes du Jour</div>
          <span className="stat-value" style={{ color: '#10b981' }}>
            {stats.dailyCA.toFixed(2)}<span className="currency">€</span>
          </span>
        </div>

        <div className="card green">
          <div className="stat-title">MRR — Revenu Mensuel Récurrent</div>
          <span className="stat-value" style={{ color: '#10b981' }}>
            {stats.monthlyCA.toFixed(2)}<span className="currency">€</span>
          </span>
        </div>

        <div className="card">
          <div className="stat-title">Chiffre d'Affaires Total</div>
          <span className="stat-value" style={{ color: '#fbbf24' }}>
            {stats.totalCA.toFixed(2)}<span className="currency">€</span>
          </span>
        </div>

        <div className="card gold">
          <div className="stat-title">Licences Actives</div>
          <span className="stat-value" style={{ color: '#d4af37' }}>
            {stats.totalLicenses}
          </span>
        </div>
      </div>

      {/* ACTIVITÉ */}
      <span className="section-label">📊 Activité</span>
      <div className="grid">
        <div className="card blue">
          <div className="stat-title">Hôtes inscrits</div>
          <span className="stat-value" style={{ color: '#60a5fa' }}>
            {stats.totalUsers}
          </span>
        </div>

        <div className="card blue">
          <div className="stat-title">Logements gérés</div>
          <span className="stat-value" style={{ color: '#60a5fa' }}>
            {stats.totalProperties}
          </span>
        </div>

        <div className="card">
          <div className="stat-title">Prospects contactés</div>
          <span className="stat-value" style={{ color: '#e2e8f0' }}>
            {stats.totalProspects}
          </span>
        </div>

        <div className="card green">
          <div className="stat-title">Prospects convertis ✅</div>
          <span className="stat-value" style={{ color: '#10b981' }}>
            {stats.convertedProspects}
          </span>
        </div>
      </div>

      {/* PROJECTION */}
      <span className="section-label">🚀 Projections</span>
      <div className="grid">
        <div className="card">
          <div className="stat-title">MRR si 10 licences</div>
          <span className="stat-value" style={{ color: '#a78bfa' }}>
            {(10 * PRICE).toFixed(2)}<span className="currency">€</span>
          </span>
        </div>
        <div className="card">
          <div className="stat-title">MRR si 50 licences</div>
          <span className="stat-value" style={{ color: '#a78bfa' }}>
            {(50 * PRICE).toFixed(2)}<span className="currency">€</span>
          </span>
        </div>
        <div className="card">
          <div className="stat-title">MRR si 100 licences</div>
          <span className="stat-value" style={{ color: '#a78bfa' }}>
            {(100 * PRICE).toFixed(2)}<span className="currency">€</span>
          </span>
        </div>
        <div className="card">
          <div className="stat-title">MRR si 500 licences</div>
          <span className="stat-value" style={{ color: '#a78bfa' }}>
            {(500 * PRICE).toFixed(2)}<span className="currency">€</span>
          </span>
        </div>
      </div>

      <div style={{ textAlign: 'center', color: '#334155', fontSize: 12, marginTop: 20 }}>
        Dernière mise à jour : {new Date().toLocaleString('fr-FR')} · Alfred Major 🎩
      </div>
    </div>
  );
}
