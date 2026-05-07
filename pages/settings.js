import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

export default function Settings() {
  const [profile, setProfile] = useState({ name: '', email: '', telegram_token: '', telegram_chat_id: '' });
  const [loading, setLoading] = useState(false);

  // Note: On pourra lier ça à une table "profiles" plus tard
  
  return (
    <div className="dashboard-layout">
      <style jsx>{`
        .dashboard-layout { display: flex; min-height: 100vh; }
        nav { width: 260px; background: #1a2a6c; color: white; display: flex; flex-direction: column; padding: 40px 20px; position: fixed; height: 100vh; }
        .logo { font-size: 22px; font-weight: 900; margin-bottom: 50px; text-align: center; }
        .nav-links { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
        .nav-item { padding: 14px 18px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; gap: 12px; font-weight: 600; opacity: 0.8; transition: 0.2s; }
        .nav-item:hover { background: rgba(255,255,255,0.1); opacity: 1; }
        .nav-item.active { background: rgba(255,255,255,0.15); color: #fbbf24; opacity: 1; }

        main { flex: 1; margin-left: 260px; padding: 50px; }
        .settings-card { background: white; padding: 30px; border-radius: 24px; max-width: 600px; border: 1px solid #e2e8f0; }
        h1 { margin-bottom: 30px; font-weight: 800; color: #1e293b; }
        h2 { font-size: 18px; color: #1a2a6c; margin-top: 30px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; }
        
        .input-group { margin-top: 20px; display: flex; flex-direction: column; gap: 8px; }
        label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; }
        input { padding: 12px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; }
        
        .btn-save { margin-top: 30px; background: #fbbf24; color: #1a2a6c; padding: 14px; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; width: 100%; }
        
        @media (max-width: 900px) {
           nav { width: 100%; height: auto; position: sticky; top: 0; padding: 15px 20px; flex-direction: row; justify-content: space-between; }
           .nav-text { display: none; }
           main { margin-left: 0; padding: 20px; }
        }
      `}</style>

      <nav>
        <div className="logo">MajorMarc 🎩</div>
        <ul className="nav-links">
          <Link href="/dashboard"><li className="nav-item"><span>🏠</span> <span className="nav-text">Mes Logements</span></li></Link>
          <Link href="/settings"><li className="nav-item active"><span>⚙️</span> <span className="nav-text">Paramètres</span></li></Link>
        </ul>
      </nav>

      <main>
        <h1>Paramètres</h1>
        <div className="settings-card">
          <h2>Profil Hôte</h2>
          <div className="input-group">
            <label>Nom complet</label>
            <input type="text" placeholder="Ex: Jean Dupont" />
          </div>
          
          <h2>Configuration Alertes (Telegram)</h2>
          <p style={{fontSize: '13px', color: '#64748b'}}>Ces informations permettent à Marc de vous envoyer des alertes en cas de problème.</p>
          <div className="input-group">
            <label>Telegram Bot Token</label>
            <input type="password" placeholder="Votre Token Bot" />
          </div>
          <div className="input-group">
            <label>Telegram Chat ID</label>
            <input type="text" placeholder="Votre Chat ID" />
          </div>

          <button className="btn-save">Enregistrer les modifications</button>
        </div>
      </main>
    </div>
  );
}
