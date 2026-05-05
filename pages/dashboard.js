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
    // 1. Vérifier si l'utilisateur est bien connecté
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    // 2. Récupérer le nom dans la table 'profiles'
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // 3. Récupérer ses logements dans la table 'properties'
    const { data: propertiesData } = await supabase
      .from('properties')
      .select('*')
      .eq('owner_id', user.id);

    setProfile(profileData);
    setProperties(propertiesData || []);
    setLoading(false);
  }

  if (loading) return <div style={{padding: '50px', textAlign: 'center', fontFamily: 'Montserrat'}}>Chargement de votre espace...</div>;

  return (
    <div className="dashboard-container">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@400;600;700&display=swap');
        
        .dashboard-container { display: flex; min-height: 100vh; font-family: 'Montserrat', sans-serif; background: #f8f9fa; }
        
        /* Sidebar */
        .sidebar { width: 260px; background: #1a2a6c; color: white; padding: 30px 20px; }
        .logo { font-family: 'Playfair Display', serif; font-size: 24px; margin-bottom: 40px; }
        .nav-item { padding: 15px; border-radius: 10px; margin-bottom: 5px; cursor: pointer; transition: 0.3s; color: rgba(255,255,255,0.7); font-weight: 600; }
        .nav-item.active { background: rgba(255,255,255,0.1); color: white; }
        .nav-item:hover { background: rgba(255,255,255,0.05); }

        /* Main Content */
        .main { flex: 1; padding: 40px 60px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        h1 { font-family: 'Playfair Display', serif; color: #1a2a6c; font-size: 32px; }
        
        .btn-add { background: #d4af37; color: #1a2a6c; padding: 12px 25px; border-radius: 50px; font-weight: 700; text-decoration: none; font-size: 14px; }

        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
        .stat-card { background: white; padding: 30px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
        .stat-val { font-size: 28px; font-weight: 700; color: #1a2a6c; margin-top: 10px; }

        .property-card { background: white; padding: 25px; border-radius: 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border: 1px solid #eee; }
        .status-badge { padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .status-active { background: #e6fffa; color: #38b2ac; }

        .empty-state { text-align: center; padding: 60px; background: white; border-radius: 20px; border: 2px dashed #eee; }
      `}</style>

      <div className="sidebar">
        <div className="logo">Major<span style={{color:'#d4af37'}}>Marc</span></div>
        <div className="nav-item active">🏠 Mes Logements</div>
        <div className="nav-item">💳 Mon Abonnement</div>
        <div className="nav-item">👤 Profil & Alertes</div>
        <div className="nav-item" onClick={() => supabase.auth.signOut().then(() => router.push('/'))} style={{marginTop: '40px', color: '#e74c3c'}}>Se déconnecter</div>
      </div>

      <div className="main">
        <div className="header">
          <h1>Bienvenue, {profile?.full_name?.split(' ')[0] || 'Hôte'}</h1>
          <Link href="/add-property" className="btn-add">+ Ajouter un logement</Link>
        </div>

        <div className="stats-grid">
          <div className="stat-card"><div>Messages gérés</div><div className="stat-val">0</div></div>
          <div className="stat-card"><div>Urgences détectées</div><div className="stat-val">0</div></div>
          <div className="stat-card"><div>Temps gagné</div><div className="stat-val">0h</div></div>
        </div>

        <h3>Vos propriétés</h3>
        
        {properties.length > 0 ? (
          properties.map(prop => (
            <div key={prop.id} className="property-card">
              <div>
                <div style={{fontWeight: 700, fontSize: '18px'}}>{prop.name}</div>
                <div style={{fontSize: '13px', color: '#888'}}>ID: {prop.id}</div>
              </div>
              <div className="status-badge status-active">Actif</div>
              <Link href={`/edit-property?id=${prop.id}`} style={{color: '#1a2a6c', fontWeight: 700}}>Paramètres</Link>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p style={{color: '#666', marginBottom: '20px'}}>Vous n'avez pas encore ajouté de logement.</p>
            <Link href="/add-property" className="btn-add">Créer mon premier logement</Link>
          </div>
        )}
      </div>
    </div>
  );
}
