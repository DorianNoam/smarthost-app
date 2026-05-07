import { useState } from 'react';
import Link from 'next/link';

export default function Settings() {
  const [profile, setProfile] = useState({ 
    name: 'Jean Dupont', 
    email: 'jean.dupont@email.com',
    address: '12 Rue de la Paix',
    zipcode: '75000',
    city: 'Paris',
  });

  // Faux état pour simuler si le client a déjà lié son Telegram ou non
  const [telegramLinked, setTelegramLinked] = useState(false);

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

        main { flex: 1; margin-left: 260px; padding: 50px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; }
        .settings-container { width: 100%; max-width: 800px; }
        
        .header-area { margin-bottom: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
        h1 { margin: 0; color: #1e293b; font-size: 32px; font-weight: 800; }
        p.subtitle { color: #64748b; margin: 5px 0 0 0; font-size: 15px; }

        .settings-card { background: white; border-radius: 20px; padding: 30px; margin-bottom: 30px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
        h2 { margin: 0 0 25px 0; color: #1a2a6c; font-size: 20px; font-weight: 800; display: flex; align-items: center; gap: 10px; }
        
        .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .input-group { display: flex; flex-direction: column; gap: 8px; }
        .input-group.full { grid-column: span 2; }
        label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        input { padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; font-size: 15px; color: #1e293b; outline: none; transition: 0.2s; }
        input:focus { border-color: #1a2a6c; background: white; }

        /* ABONNEMENT */
        .plan-box { border: 2px solid #1a2a6c; border-radius: 16px; padding: 20px; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; margin-bottom: 20px; }
        .plan-info h3 { margin: 0; color: #1a2a6c; font-size: 18px; font-weight: 800; }
        .plan-info p { margin: 5px 0 0 0; color: #64748b; font-size: 14px; }
        .badge-active { background: #ecfdf5; color: #059669; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 800; border: 1px solid #a7f3d0; }
        
        .payment-method { display: flex; align-items: center; gap: 15px; padding: 15px; border: 1px solid #e2e8f0; border-radius: 12px; }
        .card-icon { background: #1e293b; color: white; padding: 5px 10px; border-radius: 6px; font-size: 12px; font-weight: 800; font-family: monospace; }

        /* TELEGRAM BOX */
        .telegram-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 15px; }
        .telegram-status { display: flex; align-items: center; justify-content: space-between; }
        .status-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; padding: 6px 12px; border-radius: 20px; }
        .status-unlinked { background: #fee2e2; color: #b91c1c; }
        .status-linked { background: #ecfdf5; color: #059669; }

        /* BOUTONS */
        .btn { padding: 12px 24px; border-radius: 12px; font-weight: 700; font-size: 14px; cursor: pointer; border: none; transition: 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-primary { background: #1a2a6c; color: white; box-shadow: 0 4px 6px rgba(26, 42, 108, 0.2); }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 10px rgba(26, 42, 108, 0.3); }
        .btn-outline { background: white; color: #1a2a6c; border: 1px solid #cbd5e1; }
        .btn-outline:hover { background: #f8fafc; }
        .btn-danger { background: #fff1f2; color: #e11d48; border: 1px solid #fecdd3; }
        .btn-danger:hover { background: #ffe4e6; }
        
        .btn-telegram { background: #0088cc; color: white; width: max-content; }
        .btn-telegram:hover { background: #0077b5; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0, 136, 204, 0.3); }

        .divider { height: 1px; background: #e2e8f0; margin: 25px 0; }

        @media (max-width: 900px) {
          nav { width: 100%; height: 75px; position: fixed; bottom: 0; left: 0; top: auto; flex-direction: row; padding: 0; justify-content: space-around; align-items: center; z-index: 1000; box-shadow: 0 -4px 15px rgba(0,0,0,0.1); padding-bottom: env(safe-area-inset-bottom, 10px); }
          .logo, .nav-text { display: none; }
          .nav-item { margin: 0; padding: 10px; flex: 1; justify-content: center; font-size: 24px; border-radius: 0; background: transparent !important; height: 100%; }
          .nav-item.active { color: #fbbf24; }
          main { margin-left: 0; padding: 25px 20px; padding-bottom: 100px; }
          .input-grid { grid-template-columns: 1fr; }
          .input-group.full { grid-column: span 1; }
          .plan-box { flex-direction: column; align-items: flex-start; gap: 15px; }
          .btn-primary, .btn-outline, .btn-danger, .btn-telegram { width: 100%; text-align: center; }
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

          {/* 👤 SECTION : PROFIL & FACTURATION */}
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
                <input type="text" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} placeholder="Numéro et rue" />
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

          {/* 🔔 SECTION : ALERTES (100% TELEGRAM) */}
          <div className="settings-card">
            <h2>🔔 Alertes & Urgences</h2>
            <p style={{fontSize: '14px', color: '#64748b', marginBottom: '20px', lineHeight: '1.5'}}>
              MajorMarc utilise Telegram pour vous prévenir instantanément si l'IA détecte une urgence ou un client mécontent dans l'un de vos logements.
            </p>
            
            <div className="telegram-box">
              <div className="telegram-status">
                <div>
                  <h3 style={{margin: '0 0 5px 0', fontSize: '16px', color: '#0369a1'}}>Connexion Telegram</h3>
                  <p style={{margin: 0, fontSize: '13px', color: '#0ea5e9'}}>Application requise sur votre smartphone.</p>
                </div>
                {/* Badge visuel pour rassurer le client */}
                <div className={`status-badge ${telegramLinked ? 'status-linked' : 'status-unlinked'}`}>
                  {telegramLinked ? '✅ Connecté' : '❌ Non lié'}
                </div>
              </div>

              {/* Bouton d'action */}
              <button 
                className="btn btn-telegram" 
                onClick={() => setTelegramLinked(!telegramLinked)} // Petit toggle pour le test visuel
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                {telegramLinked ? 'Mettre à jour la connexion' : 'Lier mon compte Telegram'}
              </button>
            </div>
          </div>

          {/* 💳 SECTION : ABONNEMENT */}
          <div className="settings-card">
            <h2>💳 Abonnement</h2>
            <div className="plan-box">
              <div className="plan-info">
                <h3>Plan Pro - 5 Logements</h3>
                <p>Renouvellement le 12 Novembre 2024</p>
              </div>
              <span className="badge-active">Actif</span>
            </div>

            <div className="payment-method">
              <span className="card-icon">VISA</span>
              <div>
                <div style={{fontWeight: 700, fontSize: '14px', color: '#1e293b'}}>•••• •••• •••• 4242</div>
                <div style={{fontSize: '12px', color: '#64748b'}}>Expire en 10/26</div>
              </div>
            </div>

            <div className="divider"></div>

            <div style={{display: 'flex', gap: '15px', flexWrap: 'wrap'}}>
              <button className="btn btn-primary">Modifier l'abonnement</button>
              <button className="btn btn-outline">Mettre à jour le paiement</button>
              <button className="btn btn-danger" style={{marginLeft: 'auto'}}>Résilier</button>
            </div>
          </div>

          {/* 🔒 SECTION : SÉCURITÉ */}
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
                <button className="btn btn-outline" style={{width: 'max-content'}}>Changer de mot de passe</button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
