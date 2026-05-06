import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    try {
      // 1. Récupérer l'utilisateur connecté
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push('/login');
        return;
      }

      setUserId(user.id);
      setUserEmail(user.email);

      // 2. Récupérer le profil dans la table 'profiles'
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profileError && profileData) {
        setProfile(profileData);
      }

      // 3. Récupérer les logements associés à cet ID
      const { data: propertiesData } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id);

      setProperties(propertiesData || []);

    } catch (err) {
      console.error("Erreur critique dashboard:", err);
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
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', fontFamily: 'Montserrat, sans-serif' }}>
        <h2>Chargement de votre espace...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@400;600;700&display=swap');
        .dashboard-container { display: flex; min-height: 100vh; font-family: 'Montserrat', sans-serif; background: #f8f9fa; }
        .sidebar { width: 260px; background: #1a2a6c; color: white; padding: 30px 20px; display: flex; flex-direction: column; }
        .logo { font-family: 'Playfair Display', serif; font-size: 24px; margin-bottom: 40px; }
        .nav-item { padding: 15px; border-radius: 10px; margin-bottom: 5px; cursor: pointer; color: rgba(255,255,255,0.7); font-weight: 600; }
        .nav-item.active { background: rgba(255,255,255,0.1); color: white; }
        .main { flex: 1; padding: 40px 60px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        h1 { font-family: 'Playfair Display', serif; color: #1a2a6c; font-size: 32px; }
        .btn-add { background: #d4af37; color: #1a2a6c; padding: 12px 25px; border-radius: 50px; font-weight: 700; text-decoration: none; font-size: 14px; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
        .stat-card { background: white; padding: 30px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
        .stat-val { font-size: 28px; font-weight: 700; color: #1a2a6c; margin-top: 10px; }
        .empty-state { text-align: center; padding: 60px; background: white; border-radius: 25px; border: 2px dashed #eee; }
        .btn-logout { margin-top: auto; color: #ff7675; cursor: pointer; font-weight: 700; padding: 15px; }
        .debug-box { margin-top: 20px; padding: 15px; background: #fff5f5; border: 1px solid #feb2b2; border-radius: 10px; font-size: 12px; color: #c53030; }
      `}</style>

      <div className="sidebar">
        <div className="logo">Major<span style={{color:'#d4af37'}}>Marc</span></div>
        <div className="nav-item active">🏠 Mes Logements</div>
        <div className="nav-item">💳 Mon Abonnement</div>
        <div className="nav-item">👤 Profil & Alertes</div>
        <div className="btn-logout" onClick={handleLogout}>Se déconnecter</div>
      </div>

      <div className="main">
        <div className="header">
          {/* Priorité : Nom Complet > Début de l'Email > Hôte */}
          <h1>Bienvenue, {profile?.full_name || userEmail.split('@')[0] || 'Hôte'}</h1>
          <Link href="/add-property" className="btn-add">+ Ajouter un logement</Link>
        </div>

        <div className="stats-grid">
          <div className="stat-card"><div>Messages gérés</div><div className="stat-val">0</div></div>
          <div className="stat-card"><div>Urgences détectées</div><div className="stat-val">0</div></div>
          <div className="stat-card"><div>Temps gagné</div><div className="stat-val">0h</div></div>
        </div>

        <h3 style={{color: '#1a2a6c', marginBottom: '20px'}}>Vos propriétés</h3>
        
        {properties.length > 0 ? (
          <div>{/* Liste des propriétés */}</div>
        ) : (
          <div className="empty-state">
            <p style={{color: '#666', marginBottom: '20px'}}>Votre tableau de bord est prêt, mais il est vide.</p>
            <Link href="/add-property" className="btn-add">Configurer mon premier logement</Link>
          </div>
        )}

        {/* Section de DEBUG pour vérifier la correspondance d'ID */}
        <div className="debug-box">
          <strong>🔍 Mode Diagnostic :</strong><br/>
          Votre ID de session actuel : <code style={{background: '#eee', padding: '2px 5px'}}>{userId}</code><br/>
          <em>Comparez ce code avec la colonne "id" de votre table "profiles" dans Supabase.</em>
        </div>
      </div>
    </div>
  );
}
