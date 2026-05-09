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
  }, []);

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
      if (data.url) window.location.href = data.url;
    } catch (err) { console.error(err); } finally { setLoading(false); }
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
    if (window.confirm(`Supprimer "${name}" ?`)) {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (!error) setProperties(properties.filter(p => p.id !== id));
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
        .card { background: white; border-radius: 24px; padding: 25px; border: 1px solid #e2e8f0; position: relative; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .btn-delete { position: absolute; top: 15px; right: 15px; background: none; border: none; cursor: pointer; color: #94a3b8; }
        h3 { margin: 0 0 5px 0; color: #1a2a6c; font-size: 22px; font-weight: 800; }
        .address { color: #64748b; font-size: 14px; margin-bottom: 20px; }
        .btn-stack { display: flex; flex-direction: column; gap: 10px; }
        .action-btn { padding: 12px; border-radius: 12px; font-weight: 700; font-size: 13px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 8px; border: none; width: 100%; box-sizing: border-box; cursor: pointer; }
        .btn-primary { background: #1a2a6c; color: white; }
        .btn-history { background: #fdf2f8; color: #be185d; }
        .btn-light { background: #f1f5f9; color: #475569; }
        .btn-add { background: #fbbf24; color: #1a2a6c; padding: 12px 24px; border-radius: 12px; font-weight: 800; cursor: pointer; border: none; }
        .activation-zone { background: #fffbeb; padding: 20px; border-radius: 16px; border: 1px solid #fef3c7; text-align: center; }
        .btn-activate { background: #fbbf24; border: none; padding: 14px; width: 100%; border-radius: 12px; font-weight: 800; color: #1a2a6c; cursor: pointer; }
        .subscription-card { margin-top: 60px; padding: 30px; background: white; border-radius: 24px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
        .btn-portal { background: #1a2a6c; color: white; padding: 14px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; border: none; }
      `}</style>

      <nav>
        <div className="logo">MajorMarc 🎩</div>
        <Link href="/dashboard" legacyBehavior><a className="nav-item active">🏠 Mes Logements</a></Link>
        <Link href="/settings" legacyBehavior><a className="nav-item">⚙️ Paramètres</a></Link>
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
              <div className="address">📍 {prop.street_number} {prop.address}{prop.city ? `, ${prop.city}` : ''}</div>
              
              {!prop.is_active ? (
                <div className="activation-zone">
                  <p style={{fontSize: '13px', color: '#92400e', marginBottom: '15px', fontWeight: 600}}>Votre Majordome Major Marc est prêt à entrer en service.</p>
                  <button onClick={() => router.push('/pricing')} className="btn-activate">Activer ce logement</button>
                </div>
              ) : (
                <div className="btn-stack">
                  <Link href={`/property/${prop.id}`} legacyBehavior><a className="action-btn btn-primary">📊 Configurer le logement</a></Link>
                  <Link href={`/history/${prop.id}`} legacyBehavior><a className="action-btn btn-history">📜 Historique des échanges</a></Link>
                  <Link href={`/chat/${prop.id}`} legacyBehavior><a className="action-btn btn-light">🎭 Simuler un voyageur</a></Link>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="subscription-card">
          <div className="sub-info">
            <h3>Gestion des abonnements</h3>
            <p>Mettez à jour vos moyens de paiement ou gérez vos factures.</p>
          </div>
          <button onClick={handleManageSubscription} className="btn-portal">Accéder au portail</button>
        </div>
      </main>
    </div>
  );
}
