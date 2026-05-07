import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ 
    name: 'Jean Dupont', 
    email: 'jean.dupont@email.com',
    address: '12 Rue de la Paix',
    zipcode: '75000',
    city: 'Paris',
  });

  const [telegramLinked, setTelegramLinked] = useState(false);
  
  // Nom de ton bot officiel
  const botName = "Marc_Alerte_Bot"; 

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    // 1. Récupération de l'utilisateur connecté
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      setUser(user);
      
      // 2. Récupération des infos dans la table profiles
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (data) {
        setProfile(prev => ({ ...prev, ...data }));
        // Si un ID Telegram est déjà enregistré
        if (data.telegram_chat_id) {
          setTelegramLinked(true);
        }
      }
    }
  };

  return (
    <div className="dashboard-layout">
      <style jsx global>{`
        body { margin: 0; background: #f8fafc; font-family: 'Inter', sans-serif; }
        a { text-decoration: none !important; }
      `}</style>
      
      <style jsx>{`
        .dashboard-layout { display: flex; min-height: 100vh; }
        
        nav { 
          width: 260px; background: #1a2a6c; color: white; padding: 40px 20px; 
          position: fixed; height: 100vh; z-index: 100; box-sizing: border-box; 
          display: flex; flex-direction: column; 
        }
        .logo { font-size: 22px; font-weight: 900; margin-bottom: 50px; text-align: center; }
        .nav-item { padding: 14px 18px; border-radius: 12px; display: flex; align-items: center; gap: 12px; font-weight: 600; opacity: 0.8; margin-bottom: 10px; cursor: pointer; color: white;}
        .nav-item.active { background: rgba(255,255,255,0.15); color: #fbbf24; opacity: 1; }

        main { flex: 1; margin-left: 260px; padding: 50px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; }
        .settings-container { width: 100%; max-width: 800px; }
        
        .header-area { margin-bottom: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
        h1 { margin: 0; color: #1e293b; font-size: 32px; font-weight: 800; }
        .subtitle { color: #64748b; margin: 5px 0 0 0; font-size: 15px; }

        .settings-card { background: white; border-radius: 20px; padding: 30px; margin-bottom: 30px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
        h2 { margin: 0 0 25px 0; color: #1a2a6c; font-size: 20px; font-weight: 800; display: flex; align-items: center; gap: 10px; }
        
        .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .input-group { display: flex; flex-direction: column; gap: 8px; }
        .input-group.full { grid-column: span 2; }
        label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        input { padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; font-size: 15px; color: #1e293b; outline: none; transition: 0.2s; }
        input:focus { border-color: #1a2a6c; background: white; }

        /* TELEGRAM BOX & FIX MOBILE */
        .telegram-box { 
          background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 16px; 
          padding: 20px; display: flex; flex-direction: column; gap: 15px; 
          width: 100%; box-sizing: border-box;
        }
        .telegram-status { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .status-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 20px; white-space: nowrap; }
        .status-unlinked { background: #fee2e2; color: #b91c1c; }
        .status-linked { background: #ecfdf5; color: #059669; }

        .btn { padding: 12px 24px; border-radius: 12px; font-weight: 700; font-size: 14px; cursor: pointer; border: none; transition: 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-primary { background: #1a2a6c; color: white; }
        .btn-outline { background: white; color: #1a2a6c; border: 1px solid #cbd5e1; }
        .btn-danger { background: #fff1f2; color: #e11d48; border: 1px solid #fecdd3; }
        
        .btn-telegram { 
          background: #0088cc; color: white !important; width: 100%; max-width: 300px; 
          display: inline-flex; align-items: center; justify-content: center; gap: 8px; 
          text-decoration: none; padding: 14px; border-radius: 12px; font-weight: 700;
        }

        /* ABONNEMENT */
        .plan-box { border: 2px solid #1a2a6c; border-radius: 16px; padding: 20px; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; margin-bottom: 20px; }
        .plan-info h3 { margin: 0; color: #1a2a6c; font-size: 18px; font-weight: 800; }
        .plan-info p { margin: 5px 0 0 0; color: #64748b; font-size: 14px; }
        .badge-active { background: #ecfdf5; color: #059669; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 800; border: 1px solid #a7f3d0; }

        @media (max-width: 900px) {
          nav { width: 100%; height: 75px; position: fixed; bottom: 0; left: 0; top: auto; flex-direction: row; padding: 0; justify-content: space-around; align-items: center; z-index: 1000; box-shadow: 0 -4px 15px rgba(0,0,0,0.1); padding-bottom: env(safe-area-inset-bottom, 10px); }
          .logo, .nav-text { display: none; }
          .nav-item { margin: 0; padding: 10px; flex: 1; justify-content: center; font-size: 24px; border-radius: 0; background: transparent !important; height: 100%; }
          main { margin-left: 0; padding: 25px 20px; padding-bottom: 100px; }
          .input-grid { grid-template-columns: 1fr; }
          .input-group.full { grid-column: span 1; }
          .btn-primary, .btn-outline, .btn-danger, .btn-telegram { width: 100%; max-width: 100%; }
          .telegram-status { flex-direction: column; align-items: flex-start; }
          .plan-box { flex-direction: column; align-items: flex-start; gap: 15px; }
        }
      `}</style>

      <nav>
        <div className="logo">MajorMarc 🎩</div>
        <Link href="/dashboard" passHref legacyBehavior><a className="nav-item">🏠 <span className="nav-text">Mes Logements</span></a></Link>
        <Link href="/settings" passHref legacyBehavior><a className="nav-item active">⚙️ <span className="nav-text">Paramètres</span></a></Link>
      </nav>

      <main>
        <div className="settings-container">
          <div className="header-area">
            <h1>Paramètres du compte</h1>
            <p className="subtitle">Gérez vos informations, votre abonnement et vos alertes.</p>
          </div>

          <div className="settings-card">
            <h2>👤 Profil & Facturation</h2>
            <div className="input-grid">
              <div className="input-group">
                <label>Nom ou Société</label>
                <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
              </div>
              <div className="input-group">
                <label>E-mail de connexion</label>
                <input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
              </div>
              <div className="input-group full">
                <label>Adresse de facturation</label>
                <input type="text" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Code Postal</label>
                <input type="text" value={profile.zipcode} onChange={e => setProfile({...profile, zipcode: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Ville</label>
                <input type="text" value={profile.city} onChange={e => setProfile({...profile, city: e.target.value})} />
              </div>
              <div className="input-group full">
                <button className="btn btn-primary" style={{width: 'max-content'}}>Enregistrer les informations</button>
              </div>
            </div>
          </div>

          <div className="settings-card">
            <h2>🔔 Alertes & Urgences</h2>
            <p style={{fontSize: '14px', color: '#64748b', marginBottom: '20px', lineHeight: '1.5'}}>
              MajorMarc utilise Telegram pour vous prévenir instantanément en cas d'urgence.
            </p>
            
            <div className="telegram-box">
              <div className="telegram-status">
                <div style={{flex: 1}}>
                  <h3 style={{margin: '0 0 5px 0', fontSize: '16px', color: '#0369a1'}}>Connexion Telegram</h3>
                  <p style={{margin: 0, fontSize: '13px', color: '#0ea5e9'}}>Nécessite l'application sur smartphone.</p>
                </div>
                <div className={`status-badge ${telegramLinked ? 'status-linked' : 'status-unlinked'}`}>
                  {telegramLinked ? '✅ Connecté' : '❌ Non lié'}
                </div>
              </div>

              {user ? (
                <a 
                  href={`https://t.me/${botName}?start=${user.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-telegram"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  {telegramLinked ? 'Mettre à jour la connexion' : 'Lier mon compte Telegram'}
                </a>
              ) : (
                <div className="btn-telegram" style={{opacity: 0.7}}>Chargement...</div>
              )}
            </div>
          </div>

          <div className="settings-card">
            <h2>💳 Abonnement</h2>
            <div className="plan-box">
              <div className="plan-info">
                <h3>Plan Pro - 5 Logements</h3>
                <p>Renouvellement le 12 Novembre 2024</p>
              </div>
              <span className="badge-active">Actif</span>
            </div>
            <div style={{display: 'flex', gap: '15px', flexWrap: 'wrap'}}>
              <button className="btn btn-primary">Modifier</button>
              <button className="btn btn-outline">Paiement</button>
              <button className="btn btn-danger" style={{marginLeft: 'auto'}}>Résilier</button>
            </div>
          </div>

          <div className="settings-card">
            <h2>🔒 Sécurité</h2>
            <div className="input-grid">
              <div className="input-group">
                <label>Nouveau mot de passe</label>
                <input type="password" placeholder="••••••••" />
              </div>
              <div className="input-group">
                <label>Confirmer</label>
                <input type="password" placeholder="••••••••" />
              </div>
              <div className="input-group full">
                <button className="btn btn-outline" style={{width: 'max-content'}}>Changer le mot de passe</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
