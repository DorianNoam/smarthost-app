import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    try {
      // 1. On récupère l'utilisateur de la session
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push('/login');
        return;
      }

      // On stocke l'email immédiatement comme secours
      setUserEmail(user.email);

      // 2. On récupère le profil dans la table 'profiles'
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.warn("Profil introuvable ou RLS activé:", profileError.message);
      } else {
        setProfile(profileData);
      }

      // 3. On récupère les logements
      const { data: propertiesData } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id);

      setProperties(propertiesData || []);

    } catch (err) {
      console.error("Erreur globale dashboard:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', fontFamily: 'Montserrat, sans-serif', color: '#1a2a6c' }}>
        <h2>Chargement de votre empire...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@400;600;700&display=swap');
        
        .dashboard-container { display: flex; min-height: 100vh; font-family: 'Montserrat', sans-serif; background: #f8f9fa; }
        
        .sidebar { width: 260px; background: #1a2a6c; color: white; padding: 30px 20px; display: flex; flex-direction: column; }
        .logo { font-family: 'Playfair Display', serif; font-size: 24px; margin-bottom: 40px; cursor: pointer; }
        .nav-item { padding: 15px; border-radius: 10px; margin-bottom: 5px; cursor: pointer; transition: 0.3s; color: rgba(255,255,255,0.7); font-weight: 600; }
        .nav-item.active { background: rgba(255,255,255,0.1); color: white; }
        .nav-item:hover { background: rgba(255,255,255,0.05); }
        
        .main { flex: 1; padding: 40px 60px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        h1 { font-family: 'Playfair Display', serif; color: #1a2a6c; font-size: 32px; text-transform: capitalize; }
        
        .btn-add { background: #d4af37; color: #1a2a6c; padding: 12px 25px; border-radius: 50px; font-weight: 700; text-decoration: none; font-size: 14px; transition: 0.3s; }
        .btn-add:hover { background: #b8962d; transform: translateY(-2px); }

        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
        .stat-card { background: white; padding: 30px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
        .stat-label { color: #999; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
        .stat-val { font-size: 28px; font-weight: 700; color: #1a2a6c; margin-top: 10px; }

        .empty-state { text-align: center; padding: 60px; background: white; border-radius: 25px; border: 2px dashed #eee; }
        
        .btn-logout { margin-top: auto; color: #ff7675; cursor: pointer; font-weight: 700; padding: 15px; transition: 0.3s; }
        .btn-logout:hover { color: #ff4757; }
      `}</style>

      <div className="sidebar">
        <Link href="/" legacyBehavior>
          <div className="logo">Major<span style={{color:'#d4af37'}}>Marc</span></div>
        </Link>
        <div className="nav-item active">🏠 Mes Logements</div>
        <div className="nav-item">💳 Mon Abonnement</div>
        <div className="nav-item">👤 Profil & Alertes</div>
        
        <div className="btn-logout" onClick={handleLogout}>
          Se déconnecter
        </div>
      </div>

      <div className="main">
        <div className="header">
          {/* LOGIQUE D'AFFICHAGE : Nom > Email > Hôte */}
<p style={{color: 'red', fontSize: '12px', marginTop: '10px'}}>
  DEBUG - Mon ID actuel : <span style={{fontWeight: 'bold'}}>{profile?.id || "Chargement..."}</span> <br/>
  Si cet ID n'est pas 96d381ef..., alors tu n'es pas sur le bon compte dans la base.
</p>
          <Link href="/add-property" className="btn-add">
            + Ajouter un logement
          </Link>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Messages gérés</div>
            <div className="stat-val">0</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Urgences détectées</div>
            <div className="stat-val">0</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Temps gagné</div>
            <div className="stat-val">0h</div>
          </div>
        </div>

        <h3 style={{ color: '#1a2a6c', marginBottom: '20px' }}>Vos propriétés</h3>
        
        {properties.length > 0 ? (
          <div className="properties-list">
            {/* On affichera les logements ici plus tard */}
          </div>
        ) : (
          <div className="empty-state">
            <p style={{ color: '#666', marginBottom: '20px', fontSize: '16px' }}>
              Ravi de vous voir ici. Votre tableau de bord est prêt, mais il est encore vide.
            </p>
            <Link href="/add-property" className="btn-add">
              Configurer mon premier logement
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
