import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/router';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    totalConversations: 0,
    totalLicenses: 0, // Nouveau compteur
    monthlyRevenue: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== 'dorian33270@hotmail.fr') {
        router.push('/'); 
      } else {
        fetchDashboardData();
      }
    };
    checkAdmin();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: propertiesCount } = await supabase.from('properties').select('*', { count: 'exact', head: true });
      const { count: conversationsCount } = await supabase.from('conversations').select('*', { count: 'exact', head: true });
      
      // Calcul du nombre total de licences et du MRR
      const { data: profilesData } = await supabase.from('profiles').select('active_licenses');
      const totalLicensesCount = profilesData?.reduce((acc, curr) => acc + (curr.active_licenses || 0), 0) || 0;
      const realMRR = totalLicensesCount * 24.90;

      const { data: users } = await supabase
        .from('profiles')
        .select('id, email, created_at, active_licenses')
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalUsers: usersCount || 0,
        totalProperties: propertiesCount || 0,
        totalConversations: conversationsCount || 0,
        totalLicenses: totalLicensesCount,
        monthlyRevenue: realMRR,
      });
      setRecentUsers(users || []);
    } catch (error) {
      console.error("Erreur :", error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Lancement', revenus: 0 },
    { name: 'Aujourd\'hui', revenus: stats.monthlyRevenue },
  ];

  if (loading) return <div className="loading-screen">Accès à la Tour de Contrôle...</div>;

  return (
    <div className="admin-container">
      <style jsx>{`
        .admin-container { padding: 40px; background: #0f172a; min-height: 100vh; font-family: 'Inter', sans-serif; color: white; overflow-x: hidden; }
        .header { margin-bottom: 40px; }
        h1 { font-size: 32px; font-weight: 800; color: #f8fafc; margin: 0; }
        p.subtitle { color: #94a3b8; font-size: 16px; margin-top: 5px; }
        
        /* Grille adaptative pour 5 cartes */
        .grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
          gap: 20px; 
          margin-bottom: 40px; 
        }
        
        .stat-card { background: #1e293b; padding: 25px; border-radius: 16px; border: 1px solid #334155; }
        .stat-title { color: #94a3b8; font-size: 13px; font-weight: 600; text-transform: uppercase; margin-bottom: 10px; }
        .stat-value { color: #f8fafc; font-size: 36px; font-weight: 800; }
        .stat-value.revenue { color: #10b981; }
        .stat-value.license { color: #fbbf24; } /* Couleur or pour les licences */
        
        .charts-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
        .chart-container, .table-container { background: #1e293b; padding: 25px; border-radius: 16px; border: 1px solid #334155; }
        h2 { font-size: 18px; margin-top: 0; margin-bottom: 25px; color: #f8fafc; }
        table { width: 100%; border-collapse: collapse; }
        th, td { text-align: left; padding: 12px 10px; border-bottom: 1px solid #334155; }
        th { color: #94a3b8; font-weight: 600; font-size: 13px; text-transform: uppercase; }
        td { color: #cbd5e1; font-size: 14px; }
        .badge { background: #10b981; color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; margin-left: 5px; }
        .loading-screen { display: flex; justify-content: center; align-items: center; height: 100vh; background: #0f172a; color: white; font-size: 18px; }

        @media (max-width: 1024px) { .charts-grid { grid-template-columns: 1fr; } }
        @media (max-width: 600px) { .admin-container { padding: 20px; } }
      `}</style>

      <div className="header">
        <h1>Tour de Contrôle</h1>
        <p className="subtitle">Mise à jour en temps réel des performances de Major Marc.</p>
      </div>

      <div className="grid">
        <div className="stat-card">
          <div className="stat-title">Hôtes Inscrits</div>
          <div className="stat-value">{stats.totalUsers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Logements Créés</div>
          <div className="stat-value">{stats.totalProperties}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Licences Actives</div>
          <div className="stat-value license">{stats.totalLicenses}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Messages IA</div>
          <div className="stat-value">{stats.totalConversations}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">MRR Réel</div>
          <div className="stat-value revenue">{stats.monthlyRevenue.toFixed(2)} €</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h2>Évolution des Revenus</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${v}€`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                <Line type="monotone" dataKey="revenus" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="table-container">
          <h2>Derniers Clients</h2>
          <table>
            <thead>
              <tr>
                <th>Hôte</th>
                <th>Licences</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    {user.email?.split('@')[0]}
                    {user.active_licenses > 0 && <span className="badge">PAYANT</span>}
                  </td>
                  <td>{user.active_licenses || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
