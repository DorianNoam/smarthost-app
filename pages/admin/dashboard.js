import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/router';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    dailyCA: 0,
    monthlyCA: 0,
    yearlyCA: 0,
    totalCA: 0,
    totalUsers: 0,
    totalProperties: 0
  });

  const PRICE = 24.90; // Ton tarif unique

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
      
      // Définition des périodes
      const startOfDay = new Date(new Date().setHours(0,0,0,0)).toISOString();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();

      // 1. Récupération de tous les événements de vente
      const { data: events } = await supabase.from('license_events').select('created_at');
      
      // 2. Calculs des volumes par période
      const dailyCount = events?.filter(e => e.created_at >= startOfDay).length || 0;
      const monthlyCount = events?.filter(e => e.created_at >= startOfMonth).length || 0;
      const yearlyCount = events?.filter(e => e.created_at >= startOfYear).length || 0;
      const totalCount = events?.length || 0;

      // 3. Autres métriques
      const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: propertiesCount } = await supabase.from('properties').select('*', { count: 'exact', head: true });

      setStats({
        dailyCA: dailyCount * PRICE,
        monthlyCA: monthlyCount * PRICE,
        yearlyCA: yearlyCount * PRICE,
        totalCA: totalCount * PRICE,
        totalUsers: usersCount || 0,
        totalProperties: propertiesCount || 0
      });

    } catch (error) {
      console.error("Erreur de calcul financier :", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Analyse des revenus en cours...</div>;

  return (
    <div className="admin-container">
      <style jsx>{`
        .admin-container { padding: 40px; background: #0f172a; min-height: 100vh; font-family: 'Inter', sans-serif; color: white; }
        h1 { font-size: 28px; font-weight: 800; margin-bottom: 30px; letter-spacing: -0.5px; }
        
        .section-label { color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 15px; display: block; letter-spacing: 1px; }
        
        .grid-finance { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .grid-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }

        .card { background: #1e293b; padding: 25px; border-radius: 20px; border: 1px solid #334155; position: relative; overflow: hidden; }
        .card.highlight { border-color: #10b981; background: linear-gradient(145deg, #1e293b 0%, #064e3b 100%); }
        
        .stat-title { color: #94a3b8; font-size: 13px; font-weight: 500; margin-bottom: 10px; }
        .stat-value { font-size: 32px; font-weight: 800; display: block; }
        .currency { font-size: 16px; color: #94a3b8; margin-left: 5px; font-weight: 400; }
        
        .card.highlight .stat-value { color: #10b981; }
        .card.highlight .stat-title { color: #34d399; }

        .loading { display: flex; justify-content: center; align-items: center; height: 100vh; background: #0f172a; color: white; }
        
        @media (max-width: 600px) { .admin-container { padding: 20px; } }
      `}</style>

      <h1>Tour de Contrôle</h1>

      <span className="section-label">Performances Financières (CA)</span>
      <div className="grid-finance">
        <div className="card highlight">
          <div className="stat-title">Chiffre d'Affaires Jour</div>
          <span className="stat-value">{stats.dailyCA.toFixed(2)}<span className="currency">€</span></span>
        </div>
        
        <div className="card">
          <div className="stat-title">Chiffre d'Affaires Mois</div>
          <span className="stat-value">{stats.monthlyCA.toFixed(2)}<span className="currency">€</span></span>
        </div>

        <div className="card">
          <div className="stat-title">Chiffre d'Affaires Année</div>
          <span className="stat-value">{stats.yearlyCA.toFixed(2)}<span className="currency">€</span></span>
        </div>

        <div className="card">
          <div className="stat-title">CA Total (Historique)</div>
          <span className="stat-value">{stats.totalCA.toFixed(2)}<span className="currency">€</span></span>
        </div>
      </div>

      <span className="section-label">Statistiques d'utilisation</span>
      <div className="grid-stats">
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
