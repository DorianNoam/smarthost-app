import { useState } from 'react';
import Link from 'next/link';

export default function Settings() {
  // Ces états simulent les données du client (à relier plus tard à Supabase / Stripe)
  const [profile, setProfile] = useState({ name: 'Jean Dupont', email: 'jean.dupont@email.com' });

  return (
    <div className="dashboard-layout">
      <style jsx global>{`
        body { margin: 0; background: #f8fafc; font-family: 'Inter', sans-serif; }
        a { text-decoration: none !important; }
      `}</style>
      
      <style jsx>{`
        .dashboard-layout { display: flex; min-height: 100vh; }
        
        /* NAVBAR DESKTOP (Identique au Dashboard) */
        nav { 
          width: 260px; background: #1a2a6c; color: white; padding: 40px 20px; 
          position: fixed; height: 100vh; z-index: 100; box-sizing: border-box; 
          display: flex; flex-direction: column; 
        }
        .logo { font-size: 22px; font-weight: 900; margin-bottom: 50px; text-align: center; }
        .nav-item { padding: 14px 18px; border-radius: 12px; display: flex; align-items: center; gap: 12px; font-weight: 600; opacity: 0.8; margin-bottom: 10px; cursor: pointer; color: white;}
        .nav-item.active { background: rgba(255,255,255,0.15); color: #fbbf24; opacity: 1; }

        /* CONTENU DESKTOP */
        main { flex: 1; margin-left: 260px; padding: 50px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; }
        .settings-container { width: 100%; max-width: 800px; }
        
        .header-area { margin-bottom: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
        h1 { margin: 0; color: #1e293b; font-size: 32px; font-weight: 800; }
        p.subtitle { color: #64748b; margin: 5px 0 0 0; font-size: 15px; }

        /* CARTES DE PARAMÈTRES */
        .settings-card { 
          background: white; border-radius: 20px; padding: 30px; margin-bottom: 30px;
          border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.02);
        }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
        h2 { margin: 0; color: #1a2a6c; font-size: 20px; font-weight: 800; display: flex; align-items: center; gap: 10px; }
        
        /* FORMULAIRES */
        .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .input-group { display: flex; flex-direction: column; gap: 8px; }
        .input-group.full { grid-column: span 2; }
        label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        input { padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; font-size: 15px; color: #1e293b; outline: none; transition: 0.2s; }
        input:focus { border-color: #1a2a6c; background: white; }

        /* ABONNEMENT & BADGES */
        .plan-box { border: 2px solid #1a2a6c; border-radius: 16px; padding: 20px; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; margin-bottom: 20px; }
        .plan-info h3 { margin: 0; color: #1a2a6c; font-size: 18px; font-weight: 800; }
        .plan-info p { margin: 5px 0 0 0; color: #64748b; font-size: 14px; }
        .badge-active { background: #ecfdf5; color: #059669; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 800; border: 1px solid #a7f3d0; }
        
        .payment-method { display: flex; align-items: center; gap: 15px; padding: 15px; border: 1px solid #e2e8f0; border-radius: 12px; }
        .card-icon { background: #1e293b; color: white; padding: 5px 10px; border-radius: 6px; font-size: 12px; font-weight: 800; font-family: monospace; }

        /* BOUTONS */
        .btn { padding: 12px 24px; border-radius: 12px; font-weight: 700; font-size: 14px; cursor: pointer; border: none; transition: 0.2s; display: inline-flex; align-items: center; justify-content: center; }
        .btn-primary { background: #1a2a6c; color: white; box-shadow: 0 4px 6px rgba(26, 42, 108, 0.2); }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 10px rgba(26, 42, 108, 0.3); }
        .btn-outline { background: white; color: #1a2a6c; border: 1px solid #cbd5e1; }
        .btn-outline:hover { background: #f8fafc; }
        .btn-danger { background: #fff1f2; color: #e11d48; border: 1px solid #fecdd3; }
        .btn-danger:hover { background: #ffe4e6; }

        .divider { height: 1px; background: #e2e8f0; margin: 25px 0; }

        /* =========================================
           OPTIMISATION MOBILE (Correction appliquée)
           ========================================= */
        @media (max-width: 900px) {
          nav { 
            width: 100%; height: 75px; position: fixed; bottom: 0; left: 0; top: auto;
            flex-direction: row; padding: 0; justify-content: space-around; align-items: center; 
            z-index: 1000; box-shadow: 0 -4px 15px rgba(0,0,0,0.1); 
            padding-bottom: env(safe-area-inset-bottom, 10px); 
          }
          .logo, .nav-text { display: none; }
          .nav-item { margin: 0; padding: 10px; flex: 1; justify-content: center; font-size: 24px; border-radius: 0; background: transparent !important; height: 100%; }
          .nav-item.active { color: #fbbf24; }

          main { margin-left: 0; padding: 25px 20px; padding-bottom: 100px; }
          .input-grid { grid-template-columns: 1fr; }
          .input-group.full { grid-column: span 1; }
          .plan-box { flex-direction: column; align-items: flex-start; gap: 15px; }
          .btn-primary, .btn-outline, .btn-danger { width: 100%; text-align: center; }
        }
      `}</style>

      <nav>
        <div className="logo">MajorMarc 🎩</div>
        <Link href="/dashboard" passHref legacyBehavior>
          <a className="nav-item">🏠 <span className="nav-text">Mes Logements</span></a>
        </Link>
        <Link href="/settings" passHref legacyBehavior>
          <a className="nav-item active">⚙️ <span className="nav-text">Paramètres</span></a>
        </Link>
      </nav>

      <main>
        <div className="settings-container">
          <div className="header-area">
            <h1>Paramètres du compte</h1>
            <p className="subtitle">Gérez vos informations, votre abonnement et votre sécurité.</p>
          </div>

          {/* 👤 SECTION : PROFIL */}
          <div className="settings-card">
            <h2>👤 Informations Personnelles</h2>
            <div className="input-grid">
              <div className="input-group">
                <label>Nom complet</label>
                <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Adresse E-mail</label>
                <input type="email" value={profile.email} onChange={e => setProfile({...email, email: e.target.value})} />
              </div>
              <div className="input-group full">
                <button className="btn btn-primary" style={{width: 'max-content'}}>Mettre à jour le profil</button>
              </div>
            </div>
          </div>

          {/* 💳 SECTION : ABONNEMENT & FACTURATION */}
          <div className="settings-card">
            <h2>💳 Abonnement & Facturation</h2>
            
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
                <label>Confirmer le mot de passe</label>
                <input type="password" placeholder="••••••••" />
              </div>
              <div className="input-group full">
                <button className="btn btn-outline" style={{width: 'max-content'}}>Changer de mot de passe</button>
              </div>
            </div>
          </div>

          {/* 🔔 SECTION : INTÉGRATIONS (Telegram) */}
          <div className="settings-card">
            <h2>🔔 Alertes & Notifications</h2>
            <p style={{fontSize: '14px', color: '#64748b', marginBottom: '20px'}}>
              Configurez Telegram pour recevoir instantanément les alertes urgentes si l'IA détecte un problème avec vos voyageurs.
            </p>
            <div className="input-grid">
              <div className="input-group">
                <label>Telegram Bot Token</label>
                <input type="password" placeholder="Ex: 123456:ABC-DEF1234..." />
              </div>
              <div className="input-group">
                <label>Telegram Chat ID</label>
                <input type="text" placeholder="Ex: -100123456789" />
              </div>
              <div className="input-group full">
                <button className="btn btn-outline" style={{width: 'max-content'}}>Sauvegarder les alertes</button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
