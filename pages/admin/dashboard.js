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

  const PRICE = 24.90;

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== 'dorian33270@hotmail.fr') {
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

      // 1. RÉCUPÉRATION DU RÉEL (Depuis les profils)
      // C'est ce qui garantit que tes 3 abonnements s'affichent
      const { data: profiles } = await supabase.from('profiles').select('active_licenses');
      const totalActiveLicenses = profiles?.reduce((sum, p) => sum + (p.active_licenses || 0), 0) || 0;

      // 2. RÉCUPÉRATION DES ÉVÉNEMENTS (Pour le détail Jour/Mois)
      const { data: events } = await supabase.from('license_events').select('created_at');
      const dailyCount = events?.filter(e => e.created_at >= startOfDay).length || 0;
      const monthlyCount = events?.filter(e => e.created_at >= startOfMonth).length || 0;

      // 3. AUTRES MÉTRIQUES
      const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: propertiesCount } = await supabase.from('properties').select('*', { count: 'exact', head: true });

      setStats({
        dailyCA: dailyCount * PRICE,
        monthlyCA: totalActiveLicenses * PRICE, // Ton MRR réel basé sur les licences actives
        totalCA: totalActiveLicenses * PRICE,   // Ton CA cumulé actuel
        totalLicenses: totalActiveLicenses,
        totalUsers: usersCount || 0,
        totalProperties: propertiesCount || 0
      });

    } catch (error) {
      console.error("Erreur :", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Mise à jour des finances...</div>;

  return (
    <div className="admin-container">
      <style jsx>{`
        .admin-container { padding: 40px; background: #0f172a; min-height: 100vh; font-family: 'Inter', sans-serif; color: white; }
        h1 { font-size: 28px; font-weight: 800; margin-bottom: 30px; }
        .section-label { color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 15px; display: block; }
        .grid-finance { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .card { background: #1e293b; padding: 25px; border-radius: 20px; border: 1px solid #334155; }
        .card.highlight { border-color: #10b981; background: linear-gradient(145deg, #1e293b 0%, #064e3b 100%); }
        .stat-title { color: #94a3b8; font-size: 13px; font-weight: 500; margin-bottom: 10px; }
        .stat-value { font-size: 32px; font-weight: 800; display: block; }
        .currency { font-size: 16px; color: #94a3b8; margin-left: 5px; }
        .card.highlight .stat-value { color: #10b981; }
        .loading { display: flex; justify-content: center; align-items: center; height: 100vh; background: #0f172a; color: white; }
      `}</style>

      <h1>Tour de Contrôle</h1>

      <span className="section-label">Revenus Réels (Stripe)</span>
      <div className="grid-finance">
        <div className="card highlight">
          <div className="stat-title">Ventes du Jour</div>
          <span className="stat-value">{stats.dailyCA.toFixed(2)}<span className="currency">€</span></span>
        </div>
        
        <div className="card">
          <div className="stat-title">Revenu Mensuel (MRR)</div>
          <span className="stat-value">{stats.monthlyCA.toFixed(2)}<span className="currency">€</span></span>
        </div>

        <div className="card">
          <div className="stat-title">Chiffre d'Affaires Total</div>
          <span className="stat-value">{stats.totalCA.toFixed(2)}<span className="currency">€</span></span>
        </div>

        <div className="card">
          <div className="stat-title">Licences Actives</div>
          <span className="stat-value" style={{color: '#fbbf24'}}>{stats.totalLicenses}</span>
        </div>
      </div>

      <span className="section-label">Activité</span>
      <div className="grid-finance" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'}}>
        <div className="card">
          <div className="stat-title">Nombre d'Hôtes</div>
          <span className="stat-value">{stats.totalUsers}</span>
        </div>
        <div className="card">
          <div className="stat-title">Logements Gérés</div>
          <span className="stat-value">{stats.totalProperties}</span>
        </div>
      </div>
    </div>
  );
}
