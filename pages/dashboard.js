import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    // 1. On récupère l'utilisateur connecté
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      router.push('/login');
      return;
    }

    // 2. On récupère son profil (nom et prénom)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error("Erreur de récupération du profil:", profileError.message);
    }

    // 3. On récupère ses propriétés
    const { data: propertiesData } = await supabase
      .from('properties')
      .select('*')
      .eq('owner_id', user.id);

    setProfile(profileData);
    setProperties(propertiesData || []);
    setLoading(false);
  }

  if (loading) return <div style={{padding: '50px', textAlign: 'center', fontFamily: 'Montserrat'}}>Chargement de l'univers MajorMarc...</div>;

  return (
    <div className="dashboard-container">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@400;600;700&display=swap');
        .dashboard-container { display: flex; min-height: 100vh; font-family: 'Montserrat', sans-serif; background: #f8f9fa; }
        .sidebar { width: 260px; background: #1a2a6c; color: white; padding: 30px 20px; display: flex; flex-direction: column; }
        .logo { font-family: 'Playfair Display', serif; font-size: 24px; margin-bottom: 40px; color: white; text-decoration: none; }
        .nav-item { padding: 15px; border-radius: 10px; margin-bottom: 5px; cursor: pointer; transition: 0.3s; color: rgba(255,255,255,0.7); font-weight: 600; }
        .nav-item.active { background: rgba(255,255,255,0.1); color: white; }
        .main { flex: 1; padding: 40px 60px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        h1 { font-family: 'Playfair Display', serif; color: #1a2a6c; font-size: 32px; text-transform: capitalize; }
        .btn-add { background: #d4af37; color: #1a2a6c; padding: 12px 25px; border-radius: 50px; font-weight: 700; text-decoration: none; font-size: 14px; transition: 0.3s; }
        .btn-add:hover { background: #b8962d; transform: translateY(-2px); }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
        .stat-card { background: white; padding: 30px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
        .stat-label { color: #999; font-size: 12px; font-weight: 700; text-transform: uppercase; }
        .stat-val { font-size: 28px; font-weight: 700; color: #1a2a6c; margin-top: 10px; }
        .empty-state { text-align: center; padding: 60px; background: white; border-radius: 25px; border: 2px dashed #eee; margin-top: 20px; }
        .btn-logout { margin-top: auto; color: #ff7675; cursor: pointer; font-weight: 700; padding: 15px; }
      `}</style>

      <div className="sidebar">
        <Link href="/" className="logo">Major<span style={{color:'#d4af37'}}>Marc</span></Link>
        <div className="nav-item active">🏠 Mes Logements</div>
        <div className="nav-item">💳 Mon Abonnement</div>
        <div className="nav-item">👤 Profil & Alertes</div>
        <div className="btn-logout" onClick={() => supabase.auth.signOut().then(() => router.push('/'))}>
          Déconnexion
        </div>
      </div>

      <div className="main">
        <div className="header">
          {/* C'est ici qu'on affiche ton nom complet */}
          <h1>Bienvenue, {profile?.full_name || 'Hôte'}</h1>
          <Link href="/add-property" className="btn-add">+ Ajouter un logement</Link>
        </div>

        <div className="stats-grid">
          <div className="stat-card"><div className="stat-label">Messages gérés</div><div className="stat-val">0</div></div>
          <div className="stat-card"><div className="stat-label">Urgences détectées</div><div className="stat-val">0</div></div>
          <div className="stat-card"><div className="stat-label">Temps gagné</div><div className="stat-val">0h</div></div>
        </div>

        <h3 style={{color: '#1a2a6c', marginBottom: '20px'}}>Vos propriétés</h3>
        
        <div className="empty-state">
          <p style={{color: '#666', marginBottom: '20px', fontSize: '18px'}}>
            Ravi de vous accueillir, {profile?.full_name || 'cher hôte'}.
          </p>
          <p style={{color: '#999', marginBottom: '30px'}}>
            Votre tableau de bord est prêt. Il ne manque plus que votre premier logement.
          </p>
          <Link href="/add-property" className="btn-add">Commencer la configuration</Link>
        </div>
      </div>
    </div>
  );
}
