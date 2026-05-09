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
    if (router.query.success) {
      const timer = setTimeout(() => fetchData(), 2000);
      return () => clearTimeout(timer);
    }
  }, [router.query]);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

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

  const deleteProperty = async (e, id, name) => {
    e.stopPropagation();
    if (window.confirm(`Supprimer définitivement "${name}" ?`)) {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (!error) setProperties(properties.filter(p => p.id !== id));
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Supprimer votre compte ?") && window.prompt("Tapez 'SUPPRIMER' :") === "SUPPRIMER") {
      await supabase.from('profiles').delete().eq('id', profile.id);
      await supabase.auth.signOut();
      router.push('/');
    }
  };

  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>Chargement...</div>;

  return (
    <div className="dashboard-layout">
      <style jsx global>{`body { margin: 0; background: #f8fafc; font-family: 'Inter', sans-serif; }`}</style>
      <style jsx>{`
        .dashboard-layout { display: flex; min-height: 100vh; }
        nav { width: 260px; background: #1a2a6c; color: white; padding: 40px 24px; position: fixed; height: 100vh; display: flex; flex-direction: column; }
        .logo { font-size: 22px; font-weight: 900; margin-bottom: 50px; }
        .nav-item { padding: 14px 18px; border-radius: 12px; font-weight: 600; opacity: 0.8; margin-bottom: 10px; cursor: pointer; color: white; display: block; text-decoration: none; }
        .nav-item.active { background: rgba(255,255,255,0.15); color: #fbbf24; opacity: 1; }
        main { flex: 1; margin-left: 260px; padding: 50px; box-sizing: border-box; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 25px; }
        .card { background: white; border-radius: 24px; padding: 25px; border: 1px solid #e2e8f0; position: relative; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        h3 { margin: 0 0 5px 0; color: #1a2a6c; font-size: 22px; font-weight: 800; }
        .address { color: #64748b; font-size: 14px; margin-bottom: 20px; }
        .btn-stack { display: flex; flex-direction: column; gap: 8px; }
        .action-btn { padding: 12px; border-radius: 12px; font-weight: 700; font-size: 13px; text-align: center; cursor: pointer; border: none; width: 100%; display: block; text-decoration: none; }
        .btn-primary { background: #1a2a6c; color: white; }
        .btn-history { background: #fdf2f8; color: #be185d; }
        .btn-light { background: #f1f5f9; color: #475569; }
        .activation-zone { background: #fffbeb; padding: 20px; border-radius: 16px; border: 1px solid #fef3c7; margin-top: 15px; text-align: center; }
        .btn-activate { background: #fbbf24; border: none; padding: 14px; width: 100%; border-radius: 12px; font-weight: 800; color: #1a2a6c; cursor: pointer; }
        .subscription-card { margin-top: 60px; padding: 30px; background: white; border-radius: 24px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
        .btn-portal { background: #1a2a6c; color: white; padding: 14px 24px; border-radius: 14px; font-weight: 700; border: none; cursor: pointer; }
      `}</style>

      <nav>
        <div className="logo">MajorMarc 🎩</div>
        <Link href="/dashboard" legacyBehavior><a className="nav-item active">🏠 Mes Logements</a></Link>
        <Link href="/settings" legacyBehavior><a className="nav-item">⚙️ Paramètres</a></Link>
      </nav>

      <main>
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'40px'}}>
          <h1>Mes Logements</h1>
          <button onClick={() => router.push('/add-property')} style={{background:'#fbbf24', border:'none', padding:'12px 24px', borderRadius:'12px', fontWeight:800, cursor:'pointer'}}>+ Ajouter</button>
        </div>

        <div className="grid">
          {properties.map((prop) => (
            <div key={prop.id} className="card">
              <button onClick={(e) => deleteProperty(e, prop.id, prop.name)} style={{position:'absolute', top:15, right:15, border:'none', background:'none', cursor:'pointer'}}>🗑️</button>
              <h3>{prop.name}</h3>
              <div className="address">📍 {prop.street_number} {prop.address}</div>
              
              {!prop.is_active ? (
                <div className="activation-zone">
                  <p style={{fontSize: '13px', color: '#92400e', marginBottom: '15px', fontWeight: 600}}>Votre Majordome Major Marc est prêt à entrer en service.</p>
                  <button onClick={() => router.push('/pricing')} className="btn-activate">Activer ce logement</button>
                </div>
              ) : (
                <div className="btn-stack">
                  <Link href={`/property/${prop.id}`} legacyBehavior><a className="action-btn btn-primary">📊 Configurer Marc</a></Link>
                  <Link href={`/history/${prop.id}`} legacyBehavior><a className="action-btn btn-history">📜 Historique des échanges</a></Link>
                  <Link href={`/chat/${prop.id}`} legacyBehavior><a className="action-btn btn-light">🎭 Simuler un voyageur</a></Link>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="subscription-card">
          <div>
            <h3 style={{margin:0, color:'#1a2a6c'}}>Gestion des abonnements</h3>
            <p style={{margin:'8px 0 0', color:'#64748b', fontSize:'14px'}}>Gérez vos factures et vos moyens de paiement.</p>
          </div>
          <button onClick={handleManageSubscription} className="btn-portal">Accéder au portail</button>
        </div>

        <button onClick={handleDeleteAccount} style={{background:'none', border:'none', color:'#94a3b8', cursor:'pointer', marginTop:'60px', textDecoration:'underline'}}>Supprimer mon compte</button>
      </main>
    </div>
  );
}
