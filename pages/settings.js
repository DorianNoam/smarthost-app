import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';

export default function Settings() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profile, setProfile] = useState({ 
    full_name: '', 
    email: '',
    address: '',
    zipcode: '',
    city: '',
    active_licenses: 0,
    subscription_status: ''
  });

  const [telegramLinked, setTelegramLinked] = useState(false);
  const botName = "Marc_Alerte_Bot"; 

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      setUser(authUser);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
        
      if (data) {
        // --- LOG DE DEBUG POUR VÉRIFIER LES COLONNES ---
        console.log("DEBUG DATA SUPABASE:", data);
        
        setProfile({
          full_name: data.full_name || '',
          email: authUser.email,
          address: data.address || '',
          zipcode: data.zipcode || '',
          city: data.city || '',
          active_licenses: data.active_licenses || 0,
          subscription_status: data.subscription_status || 'Inactif'
        });

        // UTILISATION DE LA COLONNE DÉTECTÉE DANS TES LOGS : telegram_id
        if (data.telegram_id) {
          setTelegramLinked(true);
        }
      }
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        address: profile.address,
        zipcode: profile.zipcode,
        city: profile.city
      })
      .eq('id', user.id);

    if (error) {
      alert("Erreur lors de la sauvegarde : " + error.message);
    } else {
      alert("Profil mis à jour avec succès !");
    }
    setSaving(false);
  };

  const handleStripePortal = async () => {
    try {
      const res = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      alert("Impossible d'accéder au portail de paiement.");
    }
  };

  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>Chargement de vos réglages...</div>;

  return (
    <div className="dashboard-layout">
      <style jsx global>{`
        body { margin: 0; background: #f8fafc; font-family: 'Inter', sans-serif; }
        a { text-decoration: none !important; color: inherit; }
      `}</style>
      
      <style jsx>{`
        .dashboard-layout { display: flex; min-height: 100vh; }
        nav { width: 260px; background: #1a2a6c; color: white; padding: 40px 20px; position: fixed; height: 100vh; z-index: 100; box-sizing: border-box; display: flex; flex-direction: column; }
        .logo { font-size: 22px; font-weight: 900; margin-bottom: 50px; text-align: center; }
        .nav-item { padding: 14px 18px; border-radius: 12px; display: flex; align-items: center; gap: 12px; font-weight: 600; opacity: 0.8; margin-bottom: 10px; cursor: pointer; color: white; transition: 0.2s;}
        .nav-item.active { background: rgba(255,255,255,0.15); color: #fbbf24; opacity: 1; }
        .nav-item:hover { opacity: 1; background: rgba(255,255,255,0.05); }

        main { flex: 1; margin-left: 260px; padding: 50px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; }
        .settings-container { width: 100%; max-width: 800px; }
        
        .header-area { margin-bottom: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; width: 100%; }
        h1 { margin: 0; color: #1e293b; font-size: 32px; font-weight: 800; }
        .subtitle { color: #64748b; margin: 5px 0 0 0; font-size: 15px; }

        .settings-card { background: white; border-radius: 24px; padding: 30px; margin-bottom: 30px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.02); width: 100%; box-sizing: border-box; }
        h2 { margin: 0 0 25px 0; color: #1a2a6c; font-size: 20px; font-weight: 800; display: flex; align-items: center; gap: 10px; }
        
        .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .input-group { display: flex; flex-direction: column; gap: 8px; }
        .input-group.full { grid-column: span 2; }
        label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        input { padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; font-size: 15px; color: #1e293b; outline: none; transition: 0.2s; }
        input:focus { border-color: #1a2a6c; background: white; }

        .telegram-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 15px; width: 100%; box-sizing: border-box; }
        .telegram-status { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .status-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 20px; white-space: nowrap; }
        .status-unlinked { background: #fee2e2; color: #b91c1c; }
        .status-linked { background: #ecfdf5; color: #059669; }

        .btn { padding: 12px 24px; border-radius: 12px; font-weight: 700; font-size: 14px; cursor: pointer; border: none; transition: 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-primary { background: #1a2a6c; color: white !important; }
        .btn-outline { background: white; color: #1a2a6c !important; border: 1px solid #cbd5e1; }
        
        .btn-telegram { background: #0088cc; color: white !important; display: inline-flex; align-items: center; justify-content: center; gap: 10px; padding: 14px 20px; border-radius: 12px; font-weight: 800; width: 100%; text-align: center; margin-top: 10px; }

        .plan-box { border: 2px solid #1a2a6c; border-radius: 16px; padding: 20px; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; margin-bottom: 20px; }
        .plan-info h3 { margin: 0; color: #1a2a6c; font-size: 18px; font-weight: 800; }
        .badge-active { background: #ecfdf5; color: #059669; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 800; border: 1px solid #a7f3d0; }

        @media (max-width: 900px) {
          nav { width: 100%; height: 75px; position: fixed; bottom: 0; left: 0; top: auto; flex-direction: row; padding: 0; justify-content: space-around; align-items: center; z-index: 1000; box-shadow: 0 -4px 15px rgba(0,0,0,0.1); padding-bottom: env(safe-area-inset-bottom, 10px); }
          .logo, .nav-text { display: none; }
          .nav-item { margin: 0; padding: 10px; flex: 1; justify-content: center; font-size: 26px; border-radius: 0; background: transparent !important; height: 100%; }
          main { margin-left: 0; padding: 25px 20px; padding-bottom: 110px; }
          .input-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <nav>
        <div className="logo">MajorMarc 🎩</div>
        <Link href="/dashboard" legacyBehavior><a className="nav-item">🏠 <span className="nav-text">Logements</span></a></Link>
        <Link href="/settings" legacyBehavior><a className="nav-item active">⚙️ <span className="nav-text">Paramètres</span></a></Link>
      </nav>

      <main>
        <div className="settings-container">
          <div className="header-area">
            <h1>Paramètres du compte</h1>
            <p className="subtitle">Gérez vos informations et vos alertes.</p>
          </div>

          <div className="settings-card">
            <h2>👤 Profil & Facturation</h2>
            <div className="input-grid">
              <div className="input-group">
                <label htmlFor="full_name">Nom complet / Société</label>
                <input id="full_name" type="text" value={profile.full_name} onChange={e => setProfile({...profile, full_name: e.target.value})} />
              </div>
              <div className="input-group">
                <label htmlFor="email">E-mail (Lecture seule)</label>
                <input id="email" type="email" value={profile.email} readOnly style={{opacity: 0.7}} />
              </div>
              <div className="input-group full">
                <label htmlFor="address">Adresse de facturation</label>
                <input id="address" type="text" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} />
              </div>
              <div className="input-group">
                <label htmlFor="zipcode">Code Postal</label>
                <input id="zipcode" type="text" value={profile.zipcode} onChange={e => setProfile({...profile, zipcode: e.target.value})} />
              </div>
              <div className="input-group">
                <label htmlFor="city">Ville</label>
                <input id="city" type="text" value={profile.city} onChange={e => setProfile({...profile, city: e.target.value})} />
              </div>
              <div className="input-group full">
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Enregistrement...' : 'Enregistrer les informations'}
                </button>
              </div>
            </div>
          </div>

          <div className="settings-card">
            <h2>🔔 Alertes & Urgences</h2>
            <div className="telegram-box">
              <div className="telegram-status">
                <div style={{ flex: 1 }}>
                  <h3 style={{margin: '0 0 5px 0', fontSize: '16px', color: '#0369a1'}}>Connexion Telegram</h3>
                  <p style={{margin: 0, fontSize: '13px', color: '#64748b'}}>Recevez vos alertes instantanément.</p>
                </div>
                <div className={`status-badge ${telegramLinked ? 'status-linked' : 'status-unlinked'}`}>
                  {telegramLinked ? '✅ Connecté' : '❌ Non lié'}
                </div>
              </div>

              <a href={`https://t.me/${botName}?start=${user?.id}`} target="_blank" rel="noopener noreferrer" className="btn-telegram">
                {telegramLinked ? 'Mettre à jour la connexion' : 'Lier mon compte Telegram'}
              </a>
            </div>
          </div>

          <div className="settings-card">
            <h2>💳 Abonnement</h2>
            <div className="plan-box">
              <div className="plan-info">
                <h3>{profile.active_licenses} Logement(s) Actif(s)</h3>
                <p>Statut : <b>{profile.subscription_status}</b></p>
              </div>
              <span className="badge-active">Pro</span>
            </div>
            <div style={{display: 'flex', gap: '15px'}}>
              <button className="btn btn-outline" onClick={handleStripePortal}>Gérer le paiement & Factures</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
