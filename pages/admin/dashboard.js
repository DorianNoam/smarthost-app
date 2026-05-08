import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/router';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Fausse donnée temporelle pour avoir un beau graphique en attendant Stripe
const mockRevenueData = [
  { name: 'Semaine 1', revenus: 290 },
  { name: 'Semaine 2', revenus: 580 },
  { name: 'Semaine 3', revenus: 1160 },
  { name: 'Semaine 4', revenus: 2320 },
  { name: 'Semaine 5', revenus: 3480 },
  { name: 'Semaine 6', revenus: 5220 },
];

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    totalConversations: 0,
    monthlyRevenue: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      // 🔒 SÉCURITÉ VERROUILLÉE SUR TON EMAIL
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
      
      const { data: users } = await supabase
        .from('profiles')
        .select('id, email, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const estimatedRevenue = (propertiesCount || 0) * 29; 

      setStats({
        totalUsers: usersCount || 0,
        totalProperties: propertiesCount || 0,
        totalConversations: conversationsCount || 0,
        monthlyRevenue: estimatedRevenue,
      });
      setRecentUsers(users || []);
    } catch (error) {
      console.error("Erreur de chargement :", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-screen">Authentification et chargement des données...</div>;

  return (
    <div className="admin-container">
      <style jsx>{`
        .admin-container { padding: 40px; background: #0f172a; min-height: 100vh; font-family: 'Inter', sans-serif; color: white; }
        .header { margin-bottom: 40px; }
        h1 { font-size: 32px; font-weight: 800; color: #f8fafc; margin: 0; }
        p.subtitle { color: #94a3b8; font-size: 16px; margin-top: 5px; }
        .loading-screen { display: flex; justify-content: center; align-items: center; height: 100vh; background: #0f172a; color: white; font-size: 18px; }
        
        .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
        .stat-card { background: #1e293b; padding: 25px; border-radius: 16px; border: 1px solid #334155; }
        .stat-title { color: #94a3b8; font-size: 13px; font-weight: 600; text-transform: uppercase; margin-bottom: 10px; }
        .stat-value { color: #f8fafc; font-size: 36px; font-weight: 800; }
        .stat-value.revenue { color: #10b981; }
        
        .charts-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
        .chart-container, .table-container { background: #1e293b; padding: 25px; border-radius: 16px; border: 1px solid #334155; }
        h2 { font-size: 18px; margin-top: 0; margin-bottom: 25px; color: #f8fafc; }
        
        table { width: 100%; border-collapse: collapse; }
        th, td { text-align: left; padding: 12px 10px; border-bottom: 1px solid #334155; }
        th { color: #94a3b8; font-weight: 600; font-size: 13px; text-transform: uppercase; }
        td { color: #cbd5e1; font-size: 14px; }
      `}</style>

      <div className="header">
        <h1>Tour de Contrôle</h1>
        <p className="subtitle">Bienvenue Administrateur. Voici les métriques en temps réel de Major Marc.</p>
      </div>

      <div className="grid">
        <div className="stat-card">
          <div className="stat-title">Hôtes Inscrits</div>
          <div className="stat-value">{stats.totalUsers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Logements Actifs</div>
          <div className="stat-value">{stats.totalProperties}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Requêtes IA (Coûts)</div>
          <div className="stat-value">{stats.totalConversations}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">MRR Estimé</div>
          <div className="stat-value revenue">{stats.monthlyRevenue} €</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h2>Croissance des Revenus</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={mockRevenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}€`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="revenus" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="table-container">
          <h2>Derniers Inscrits</h2>
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.email ? user.email.split('@')[0] + '@...' : 'Anonyme'}</td>
                  <td>{new Date(user.created_at).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
              {recentUsers.length === 0 && (
                <tr>
                  <td colSpan="2" style={{ textAlign: 'center', color: '#64748b' }}>Aucun utilisateur pour le moment</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
    }
  
