import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);

  useEffect(() => {
    console.log("🚀 Composant Dashboard monté");
    fetchData();
    if (router.query.success) {
      const timer = setTimeout(() => fetchData(), 1500);
      return () => clearTimeout(timer);
    }
  }, [router.query]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw new Error("Erreur Auth: " + authError.message);
      if (!user) {
        console.warn("⚠️ Pas d'utilisateur trouvé, redirection...");
        router.push('/login');
        return;
      }

      console.log("👤 Utilisateur connecté:", user.id);

      // Récupération des propriétés
      const { data: props, error: propsError } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (propsError) console.error("❌ Erreur Propriétés:", propsError.message);
      else console.log("🏠 Propriétés chargées:", props?.length);

      // Récupération du profil
      const { data: prof, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profError) {
        console.error("❌ Erreur Profil (Vérifie si la colonne telegram_id existe):", profError.message);
      } else {
        console.log("📄 Profil chargé avec succès:", prof);
      }

      if (props) setProperties(props);
      if (prof) setProfile(prof);
      
    } catch (err) {
      console.error("🔥 CRASH lors du fetchData:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyWelcomeMessage = (prop) => {
    try {
      const identifier = prop.slug || prop.id;
      const guestLink = `${window.location.origin}/m/${identifier}`;
      const message = `Bonjour ! 👋\nPour toute question pendant votre séjour — que ce soit le WiFi, les équipements, ou une bonne adresse dans le quartier — vous pouvez contacter mon assistant disponible 24h/24 via ce lien :\n👉 ${guestLink}\n\nBon séjour ! 🎩`;
      navigator.clipboard.writeText(message);
      alert(`Lien Voyageur copié pour "${prop.name}" !`);
    } catch (err) {
      console.error("❌ Erreur lors de la copie:", err);
    }
  };

  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>Chargement du tableau de bord...</div>;

  return (
    <div className="dashboard-layout">
      {/* CSS inchangé */}
      <style jsx global>{`
        body { margin: 0; background: #f8fafc; font-family: 'Inter', sans-serif; }
        a { text-decoration: none !important; }
      `}</style>
      <style jsx>{`
        .dashboard-layout { display: flex; min-height: 100vh; }
        nav { width: 260px; background: #1a2a6c; color: white; padding: 40px 20px; position: fixed; height: 100vh; z-index: 100; box-sizing: border-box; display: flex; flex-direction: column; }
        .logo { font-size: 22px; font-weight: 900; margin-bottom: 50px; text-align: center; }
        .nav-item { padding: 14px 18px; border-radius: 12px; display: flex; align-items: center; gap: 12px; font-weight: 600; opacity: 0.8; margin-bottom: 10px; cursor: pointer; color: white; transition: 0.2s;}
        .nav-item.active { background: rgba(255,255,255,0.15); color: #fbbf24; opacity: 1; }
        .nav-footer { margin-top: auto; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); }
        .tutorial-box { background: #fbbf24; color: #1a2a6c; padding: 15px; border-radius: 12px; font-size: 13px; font-weight: 700; text-align: center; cursor: pointer; display: block; margin-top: 10px;}
        main { flex: 1; margin-left: 260px; padding: 50px; box-sizing: border-box; }
        .header-area { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        h1 { margin: 0; color: #1e293b; font-size: 32px; font-weight: 800; }
        .telegram-banner { background: #f0f9ff; border: 1px solid #0088cc; border-radius: 20px; padding: 20px; margin-bottom: 40px; display: flex; align-items: center; gap: 20px; box-shadow: 0 4px 12px rgba(0, 136, 204, 0.1); }
        .tg-icon { font-size: 32px; }
        .tg-text h4 { margin: 0 0 5px 0; color: #0088cc; font-weight: 800; }
        .tg-text p { margin: 0; font-size: 13px; color: #475569; line-height: 1.4; }
        .btn-link-tg { background: #0088cc; color: white; padding: 10px 20px; border-radius: 10px; font-weight: 700; font-size: 13px; border: none; cursor: pointer; white-space: nowrap; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 25px; }
        .card { background: white; border-radius: 24px; padding: 25px; border: 1px solid #e2e8f0; position: relative; }
        @media (max-width: 900px) {
          nav { width: 100%; height: 75px; position: fixed; bottom: 0; left: 0; top: auto; flex-direction: row; padding: 0; justify-content: space-around; align-items: center; z-index: 1000; box-shadow: 0 -4px 15px rgba(0,0,0,0.1); padding-bottom: env(safe-area-inset-bottom, 10px); }
          .logo, .nav-text { display: none; }
          .nav-item { margin: 0; padding: 10px; flex: 1; justify-content: center; font-size: 26px; border-radius: 0; background: transparent !important; height: 100%; }
          .nav-footer { border-top: none; padding: 0; margin: 0; flex: 1; display: flex; height: 100%; }
          .tutorial-box { background: transparent; color: white; margin: 0; padding: 0; font-size: 26px; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; border-radius: 0; }
          main { margin-left: 0; padding: 30px 20px; padding-bottom: 120px; }
          .telegram-banner { flex-direction: column; text-align: center; padding: 25px; }
        }
      `}</style>

      <nav>
        <div className="logo">MajorMarc 🎩</div>
        <Link href="/dashboard" legacyBehavior><a className="nav-item active">🏠 <span className="nav-text">Mes Logements</span></a></Link>
        <Link href="/settings" legacyBehavior><a className="nav-item">⚙️ <span className="nav-text">Paramètres</span></a></Link>
        <div className="nav-footer">
          <Link href="/tutorial" legacyBehavior><a className="tutorial-box">❓ <span className="nav-text">Comment ça marche ?</span></a></Link>
        </div>
      </nav>

      <main>
        <div className="header-area">
          <h1>Mes Logements</h1>
          <button onClick={() => router.push('/add-property')} className="btn-add">+ Ajouter</button>
        </div>

        {/* --- BANNIÈRE DYNAMIQUE SÉCURISÉE --- */}
        {/* On vérifie que loading est fini ET que profile existe avant de checker telegram_id */}
        {!loading && profile && !profile.telegram_id && (
          <div className="telegram-banner">
            <div className="tg-icon">🚨</div>
            <div className="tg-text">
              <h4>Action Requise : Sécurisez vos urgences</h4>
              <p>Liez votre compte Telegram pour être alerté si MajorMarc rencontre une difficulté.</p>
            </div>
            <Link href="/tutorial" legacyBehavior>
              <button className="btn-link-tg">Lier mon Telegram</button>
            </Link>
          </div>
        )}

        <div className="grid">
          {properties.length > 0 ? (
            properties.map((prop) => (
              <div key={prop.id} className="card">
                <h3>{prop.name}</h3>
                <p className="address">📍 {prop.address}</p>
                <button onClick={() => copyWelcomeMessage(prop)} className="btn-welcome">Copier le lien</button>
              </div>
            ))
          ) : (
            <p>Aucun logement trouvé.</p>
          )}
        </div>
      </main>
    </div>
  );
}
