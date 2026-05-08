import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLimitModal, setShowLimitModal] = useState(false); // État pour le nouveau modal

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // Récupérer les logements
    const { data: props } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
    
    // Récupérer le profil (pour les licences)
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();

    if (props) setProperties(props);
    if (prof) setProfile(prof);
    setLoading(false);
  };

  // LOGIQUE D'AJOUT : Vérifie si l'utilisateur a une licence disponible
  const handleAddClick = (e) => {
    e.preventDefault();
    const activeLicenses = profile?.active_licenses || 0;
    
    if (properties.length >= activeLicenses) {
      // On remplace l'alerte par l'affichage du modal
      setShowLimitModal(true);
    } else {
      router.push('/add-property');
    }
  };

  const deleteProperty = async (e, id, name) => {
    e.stopPropagation();
    if (window.confirm(`Supprimer "${name}" ?`)) {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (!error) setProperties(properties.filter(p => p.id !== id));
    }
  };

  const handleDeleteAccount = async () => {
    const confirm = window.confirm("ATTENTION : Voulez-vous vraiment supprimer votre compte ? Toutes vos données seront effacées.");
    if (!confirm) return;

    const check = window.prompt("Tapez 'SUPPRIMER' pour confirmer :");
    if (check !== "SUPPRIMER") return;

    try {
      await supabase.from('profiles').delete().eq('id', profile.id);
      await supabase.auth.signOut();
      router.push('/');
    } catch (err) {
      alert("Erreur lors de la suppression.");
    }
  };

  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>Chargement...</div>;

  return (
    <div className="dashboard-layout">
      <style jsx global>{`
        body { margin: 0; background: #f8fafc; font-family: 'Inter', sans-serif; }
        a { text-decoration: none !important; }
      `}</style>
      <style jsx>{`
        .dashboard-layout { display: flex; min-height: 100vh; }
        nav { width: 260px; background: #1a2a6c; color: white; padding: 40px 20px; position: fixed; height: 100vh; z-index: 100; box-sizing: border-box; display: flex; flex-direction: column; }
        .logo { font-size: 22px; font-weight: 900; margin-bottom: 50px; text-align: center; }
        .nav-item { padding: 14px 18px; border-radius: 12px; display: flex; align-items: center; gap: 12px; font-weight: 600; opacity: 0.8; margin-bottom: 10px; cursor: pointer; color: white;}
        .nav-item.active { background: rgba(255,255,255,0.15); color: #fbbf24; opacity: 1; }

        main { flex: 1; margin-left: 260px; padding: 50px; box-sizing: border-box; }
        .header-area { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        h1 { margin: 0; color: #1e293b; font-size: 32px; font-weight: 800; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 25px; }

        .card { background: white; border-radius: 24px; padding: 25px; border: 1px solid #e2e8f0; position: relative; box-shadow: 0 4px 6px rgba(0,0,0,0.05); transition: 0.2s; }
        .card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px rgba(0,0,0,0.1); }
        
        .btn-delete { position: absolute; top: 15px; right: 15px; background: #fff1f2; color: #e11d48; border: none; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;}
        
        h3 { margin: 0 0 5px 0; color: #1a2a6c; font-size: 22px; font-weight: 800; }
        .address { color: #64748b; font-size: 14px; margin-bottom: 20px; line-height: 1.5; }

        .btn-stack { display: flex; flex-direction: column; gap: 10px; }
        .action-btn { padding: 12px; border-radius: 12px; font-weight: 700; font-size: 13px; text-align: center; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; border: none; width: 100%; box-sizing: border-box; }
        
        .btn-primary { background: #1a2a6c; color: white; }
        .btn-history { background: #f0f9ff; color: #0369a1; border: 1px solid #bae6fd; }
        .btn-outline { background: white; color: #1a2a6c; border: 1px solid #cbd5e1; }
        .btn-light { background: #f8fafc; color: #64748b; font-size: 11px; }

        .btn-add { background: #fbbf24; color: #1a2a6c; padding: 12px 24px; border-radius: 12px; font-weight: 800; font-size: 15px; display: inline-block; cursor: pointer; border: none; box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3); }

        .danger-zone { margin-top: 80px; padding: 30px; background: #fff5f5; border: 1px solid #fee2e2; border-radius: 20px; }
        .danger-zone h2 { color: #991b1b; font-size: 18px; margin-top: 0; }
        .btn-delete-account { background: #dc2626; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 10px; }

        /* --- STYLES DU MODAL --- */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .modal-card { background: white; border-radius: 32px; padding: 40px; max-width: 450px; width: 100%; text-align: center; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); border: 1px solid #e2e8f0; }
        .modal-icon { font-size: 54px; margin-bottom: 20px; display: block; }
        .modal-card h2 { color: #1a2a6c; font-size: 26px; font-weight: 800; margin-bottom: 15px; font-family: 'Playfair Display', serif; }
        .modal-card p { color: #64748b; line-height: 1.6; margin-bottom: 35px; font-size: 16px; }
        .modal-buttons { display: flex; flex-direction: column; gap: 12px; }
        .btn-upgrade { background: #fbbf24; color: #1a2a6c; padding: 18px; border-radius: 16px; font-weight: 800; font-size: 16px; border: none; cursor: pointer; transition: 0.3s; }
        .btn-upgrade:hover { transform: translateY(-2px); background: #e5c158; box-shadow: 0 10px 20px rgba(251, 191, 36, 0.2); }
        .btn-cancel { background: transparent; color: #94a3b8; padding: 10px; border-radius: 14px; font-weight: 600; font-size: 14px; border: none; cursor: pointer; }

        @media (max-width: 900px) {
          nav { width: 100%; height: 75px; position: fixed; bottom: 0; left: 0; top: auto; flex-direction: row; padding: 0; justify-content: space-around; align-items: center; z-index: 1000; padding-bottom: env(safe-area-inset-bottom, 10px); }
          .logo, .nav-text { display: none; }
          .nav-item { margin: 0; padding: 10px; flex: 1; justify-content: center; font-size: 24px; }
          main { margin-left: 0; padding: 20px; padding-bottom: 120px; }
          .grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <nav>
        <div className="logo">MajorMarc 🎩</div>
        <Link href="/dashboard"><a className="nav-item active">🏠 <span className="nav-text">Mes Logements</span></a></Link>
        <Link href="/settings"><a className="nav-item">⚙️ <span className="nav-text">Paramètres</span></a></Link>
      </nav>

      <main>
        <div className="header-area">
          <h1>Mes Logements</h1>
          <button onClick={handleAddClick} className="btn-add">+ Ajouter</button>
        </div>

        <div className="grid">
          {properties.map((prop) => (
            <div key={prop.id} className="card">
              <button className="btn-delete" onClick={(e) => deleteProperty(e, prop.id, prop.name)}>🗑️</button>
              <h3>{prop.name}</h3>
              <div className="address">
                📍 {prop.street_number} {prop.address} 
                {prop.residence && <><br />Résidence {prop.residence}</>}
              </div>
              <div className="btn-stack">
                <Link href={`/property/${prop.id}`}><a className="action-btn btn-primary">📊 Configurer Marc</a></Link>
                <Link href={`/chat/${prop.id}`}><a className="action-btn btn-light">Simuler voyageur</a></Link>
              </div>
            </div>
          ))}
        </div>

        <div className="danger-zone">
          <h2>Zone de danger</h2>
          <p style={{color: '#b91c1c', fontSize: '14px'}}>La suppression de votre compte effacera toutes vos données. Cette action est définitive.</p>
          <button onClick={handleDeleteAccount} className="btn-delete-account">Supprimer mon compte</button>
        </div>
      </main>

      {/* --- LE MODAL PRESTIGE --- */}
      {showLimitModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <span className="modal-icon">🎩</span>
            <h2>Limite atteinte</h2>
            <p>
              Vous avez utilisé vos <b>{profile?.active_licenses || 0} licence(s)</b> actives.<br/><br/>
              Pour activer le Majordome sur une nouvelle propriété, vous devez ajouter un emplacement supplémentaire.
            </p>
            <div className="modal-buttons">
              <button className="btn-upgrade" onClick={() => router.push('/pricing')}>
                Ajouter un emplacement (24,90€)
              </button>
              <button className="btn-cancel" onClick={() => setShowLimitModal(false)}>
                Plus tard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
