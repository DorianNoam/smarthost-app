import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLimitModal, setShowLimitModal] = useState(false);

  useEffect(() => {
    fetchData();
    // Si on revient de Stripe après un paiement réussi
    if (router.query.success) {
      const timer = setTimeout(() => fetchData(), 1500);
      return () => clearTimeout(timer);
    }
  }, [router.query]);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data: props } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();

    if (props) setProperties(props);
    if (prof) setProfile(prof);
    setLoading(false);
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; 
      } else {
        alert(data.error || "Une erreur est survenue lors de l'accès au portail.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = (e) => {
    e.preventDefault();
    const activeLicenses = profile?.active_licenses || 0;
    
    if (properties.length >= activeLicenses) {
      setShowLimitModal(true);
    } else {
      router.push('/add-property');
    }
  };

  const deleteProperty = async (e, id, name) => {
    e.stopPropagation();
    if (window.confirm(`Supprimer définitivement "${name}" ?`)) {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (!error) setProperties(properties.filter(p => p.id !== id));
    }
  };

  const handleDeleteAccount = async () => {
    const confirm = window.confirm("ATTENTION : Voulez-vous vraiment supprimer votre compte ?");
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

  if (loading) return <div style={{padding: '50px', textAlign: 'center', fontFamily: 'Inter, sans-serif'}}>Chargement de votre espace...</div>;

  return (
    <div className="dashboard-layout">
      <style jsx global>{`
        body { margin: 0; background: #f8fafc; font-family: 'Inter', sans-serif; }
        a { text-decoration: none !important; }
      `}</style>
      <style jsx>{`
        .dashboard-layout { display: flex; min-height: 100vh; }
        
        /* SIDEBAR */
        nav { width: 260px; background: #1a2a6c; color: white; padding: 40px 20px; position: fixed; height: 100vh; z-index: 100; box-sizing: border-box; display: flex; flex-direction: column; }
        .logo { font-size: 22px; font-weight: 900; margin-bottom: 50px; text-align: center; }
        .nav-item { padding: 14px 18px; border-radius: 12px; display: flex; align-items: center; gap: 12px; font-weight: 600; opacity: 0.8; margin-bottom: 10px; cursor: pointer; color: white;}
        .nav-item.active { background: rgba(255,255,255,0.15); color: #fbbf24; opacity: 1; }

        /* MAIN CONTENT */
        main { flex: 1; margin-left: 260px; padding: 50px; box-sizing: border-box; }
        .header-area { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        h1 { margin: 0; color: #0f172a; font-size: 32px; font-weight: 800; }
        
        /* GRID & CARDS */
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 25px; }
        .card { background: white; border-radius: 20px; padding: 25px; border: 1px solid #e2e8f0; position: relative; box-shadow: 0 4px 6px rgba(0,0,0,0.02); transition: 0.2s; }
        .card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px rgba(0,0,0,0.05); }
        
        .btn-delete { position: absolute; top: 15px; right: 15px; background: none; color: #94a3b8; border: none; font-size: 16px; cursor: pointer; transition: 0.2s; }
        .btn-delete:hover { color: #e11d48; }
        
        h3 { margin: 0 0 8px 0; color: #1a2a6c; font-size: 20px; font-weight: 800; }
        .address { color: #64748b; font-size: 13px; margin-bottom: 25px; display: flex; align-items: center; gap: 6px; }

        /* BUTTONS STACK (ÉTAT ACTIF) */
        .btn-stack { display: flex; flex-direction: column; gap: 10px; }
        .action-btn { padding: 12px; border-radius: 10px; font-weight: 600; font-size: 13px; text-align: center; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; border: none; width: 100%; box-sizing: border-box; }
        .btn-primary { background: #1a2a6c; color: white; }
        .btn-primary:hover { background: #152259; }
        .btn-history { background: #fdf2f8; color: #be185d; }
        .btn-history:hover { background: #fce7f3; }
        .btn-light { background: #f1f5f9; color: #475569; }
        .btn-light:hover { background: #e2e8f0; }

        /* ADD BUTTON */
        .btn-add { background: #fbbf24; color: #1a2a6c; padding: 12px 24px; border-radius: 12px; font-weight: 800; font-size: 14px; cursor: pointer; border: none; transition: 0.2s; }
        .btn-add:hover { background: #f59e0b; }

        /* ZONE D'ACTIVATION (ÉTAT INACTIF) */
        .activation-zone { background: #fffbeb; padding: 25px 20px; border-radius: 16px; border: 1px solid #fef3c7; text-align: center; }
        .hint { font-size: 13px; color: #92400e; margin-bottom: 20px; font-weight: 600; line-height: 1.4; margin-top: 0; }
        .btn-activate { background: #fbbf24; border: none; padding: 14px; width: 100%; border-radius: 10px; font-weight: 800; color: #1a2a6c; cursor: pointer; transition: 0.2s; font-size: 14px; }
        .btn-activate:hover { background: #f59e0b; }

        /* SECTION ABONNEMENT */
        .subscription-card { margin-top: 60px; padding: 30px; background: white; border-radius: 20px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; gap: 20px; }
        .sub-info h3 { margin: 0; color: #1a2a6c; font-size: 18px; font-weight: 800; }
        .sub-info p { margin: 6px 0 0; color: #64748b; font-size: 13px; }
        .btn-portal { background: #1a2a6c; color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: 0.2s; font-size: 13px; }
        .btn-portal:hover { background: #152259; }

        /* DELETE ACCOUNT */
        .btn-delete-account { display: inline-block; background: transparent; color: #94a3b8; border: none; padding: 10px 0; font-weight: 500; cursor: pointer; margin-top: 40px; font-size: 13px; text-decoration: underline; transition: 0.2s; }
        .btn-delete-account:hover { color: #dc2626; }

        /* MODAL */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .modal-card { background: white; border-radius: 24px; padding: 40px; max-width: 450px; width: 100%; text-align: center; }
        .modal-icon { font-size: 48px; margin-bottom: 20px; display: block; }
        .modal-card h2 { color: #1a2a6c; font-size: 22px; font-weight: 800; margin-bottom: 15px; }
        .modal-card p { color: #64748b; line-height: 1.6; margin-bottom: 30px; font-size: 14px; }
        .modal-buttons { display: flex; flex-direction: column; gap: 10px; }
        .btn-upgrade { background: #fbbf24; color: #1a2a6c; padding: 16px; border-radius: 12px; font-weight: 800; font-size: 14px; border: none; cursor: pointer; }
        .btn-cancel { background: transparent; color: #94a3b8; padding: 10px; border-radius: 10px; font-weight: 600; font-size: 13px; border: none; cursor: pointer; }

        @media (max-width: 900px) {
          nav { width: 100%; height: 70px; position: fixed; bottom: 0; left: 0; top: auto; flex-direction: row; padding: 0; justify-content: space-around; align-items: center; }
          .logo, .nav-text { display: none; }
          main { margin-left: 0; padding: 20px; padding-bottom: 100px; }
          .grid { grid-template-columns: 1fr; }
          .subscription-card { flex-direction: column; text-align: center; padding: 25px 20px; }
          .btn-portal { width: 100%; }
        }
      `}</style>

      {/* --- MENU LATÉRAL --- */}
      <nav>
        <div className="logo">MajorMarc 🎩</div>
        <Link href="/dashboard" legacyBehavior><a className="nav-item active">🏠 <span className="nav-text">Mes Logements</span></a></Link>
        <Link href="/settings" legacyBehavior><a className="nav-item">⚙️ <span className="nav-text">Paramètres</span></a></Link>
      </nav>

      <main>
        {/* --- EN-TÊTE --- */}
        <div className="header-area">
          <h1>Mes Logements</h1>
          <button onClick={handleAddClick} className="btn-add">+ Ajouter</button>
        </div>

        {/* --- GRILLE DES LOGEMENTS --- */}
        <div className="grid">
          {properties.map((prop) => (
            <div key={prop.id} className="card">
              <button className="btn-delete" onClick={(e) => deleteProperty(e, prop.id, prop.name)}>🗑️</button>
              
              <h3>{prop.name}</h3>
              <div className="address">📍 {prop.street_number} {prop.address}</div>
              
              {/* VÉRIFICATION : ACTIF OU NON */}
              {!prop.is_active ? (
                <div className="activation-zone">
                  <p className="hint">Votre Majordome Major Marc est prêt à entrer en service.</p>
                  <button onClick={() => router.push('/pricing')} className="btn-activate">
                    Activer ce logement
                  </button>
                </div>
              ) : (
                <div className="btn-stack">
                  {/* BOUTONS CORRIGÉS ET STYLISÉS SELON TES CAPTURES */}
                  <Link href={`/property/${prop.id}`} legacyBehavior>
                    <a className="action-btn btn-primary">📊 Configurer le logement</a>
                  </Link>
                  <Link href={`/history/${prop.id}`} legacyBehavior>
                    <a className="action-btn btn-history">📜 Historique des échanges</a>
                  </Link>
                  <Link href={`/chat/${prop.id}`} legacyBehavior>
                    <a className="action-btn btn-light">🎭 Simuler un voyageur</a>
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* --- GESTION ABONNEMENT --- */}
        <div className="subscription-card">
          <div className="sub-info">
            <h3>Gestion des abonnements</h3>
            <p>Gérez vos factures et vos moyens de paiement.</p>
          </div>
          <button onClick={handleManageSubscription} className="btn-portal">
            Accéder au portail
          </button>
        </div>

        {/* --- SUPPRESSION COMPTE --- */}
        <button onClick={handleDeleteAccount} className="btn-delete-account">
          Supprimer mon compte
        </button>
      </main>

      {/* --- MODALE D'ALERTE LIMITE --- */}
      {showLimitModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <span className="modal-icon">🎩</span>
            <h2>Nouvel abonnement requis</h2>
            <p>
              Vous gérez déjà {profile?.active_licenses || 0} logement(s). Pour activer Marc sur cette nouvelle villa, une licence supplémentaire est nécessaire.
            </p>
            <div className="modal-buttons">
              <button className="btn-upgrade" onClick={() => router.push('/pricing')}>
                Prendre un nouvel abonnement (24,90€)
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
