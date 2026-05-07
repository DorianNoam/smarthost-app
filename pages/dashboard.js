import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

export default function Dashboard() {
  const [properties, setProperties] = useState([]);

  useEffect(() => { fetchProperties(); }, []);

  const fetchProperties = async () => {
    const { data } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
    if (data) setProperties(data);
  };

  const deleteProperty = async (e, id, name) => {
    e.stopPropagation();
    if (window.confirm(`Supprimer "${name}" ?`)) {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (!error) setProperties(properties.filter(p => p.id !== id));
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
        
        /* NAVBAR DESKTOP */
        nav { 
          width: 260px; 
          background: #1a2a6c; 
          color: white; 
          padding: 40px 20px; 
          position: fixed; 
          height: 100vh; 
          z-index: 100; 
          box-sizing: border-box; 
          /* CORRECTION ICI : Force le flex pour aligner les éléments */
          display: flex; 
          flex-direction: column; 
        }
        .logo { font-size: 22px; font-weight: 900; margin-bottom: 50px; text-align: center; }
        .nav-item { padding: 14px 18px; border-radius: 12px; display: flex; align-items: center; gap: 12px; font-weight: 600; opacity: 0.8; margin-bottom: 10px; cursor: pointer; color: white;}
        .nav-item.active { background: rgba(255,255,255,0.15); color: #fbbf24; opacity: 1; }

        /* CONTENU DESKTOP */
        main { flex: 1; margin-left: 260px; padding: 50px; box-sizing: border-box; }
        .header-area { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        h1 { margin: 0; color: #1e293b; font-size: 32px; font-weight: 800; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 25px; }

        .card { 
          background: white; border-radius: 24px; padding: 25px; 
          border: 1px solid #e2e8f0; position: relative;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05); 
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px rgba(0,0,0,0.1); }
        
        .btn-delete { position: absolute; top: 15px; right: 15px; background: #fff1f2; color: #e11d48; border: none; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;}
        
        h3 { margin: 0 0 5px 0; color: #1a2a6c; font-size: 22px; font-weight: 800; }
        .address { color: #64748b; font-size: 14px; margin-bottom: 20px; }

        .btn-stack { display: flex; flex-direction: column; gap: 12px; }
        .action-btn { padding: 14px; border-radius: 14px; font-weight: 700; font-size: 14px; text-align: center; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; border: none; width: 100%; box-sizing: border-box; }
        .btn-primary { background: #1a2a6c; color: white; box-shadow: 0 4px 6px rgba(26, 42, 108, 0.2); }
        .btn-outline { background: white; color: #1a2a6c; border: 1px solid #cbd5e1; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .btn-light { background: #f1f5f9; color: #475569; }
        .btn-add { background: #fbbf24; color: #1a2a6c; padding: 12px 24px; border-radius: 12px; font-weight: 800; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px rgba(251, 191, 36, 0.3); transition: 0.2s; white-space: nowrap; }

        /* =========================================
           OPTIMISATION MOBILE
           ========================================= */
        @media (max-width: 900px) {
          nav { 
            width: 100%; height: 75px; position: fixed; bottom: 0; left: 0; top: auto;
            flex-direction: row; /* Maintenant le row fonctionne */
            padding: 0; justify-content: space-around; align-items: center; 
            z-index: 1000; box-shadow: 0 -4px 15px rgba(0,0,0,0.1); 
            padding-bottom: env(safe-area-inset-bottom, 10px); 
          }
          .logo { display: none; }
          .nav-text { display: none; }
          
          .nav-item { 
            margin: 0; padding: 10px; flex: 1; justify-content: center; 
            font-size: 24px; border-radius: 0; background: transparent !important;
            height: 100%;
          }
          .nav-item.active { color: #fbbf24; }

          main { margin-left: 0; padding: 20px; padding-bottom: 100px; }
          .header-area { flex-direction: row; align-items: center; gap: 15px; margin-bottom: 25px; }
          h1 { font-size: 22px; }
          .btn-add { padding: 10px 15px; font-size: 13px; width: auto; }
          .grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <nav>
        <div className="logo">MajorMarc 🎩</div>
        <Link href="/dashboard" passHref legacyBehavior>
          <a className="nav-item active">🏠 <span className="nav-text">Mes Logements</span></a>
        </Link>
        <Link href="/settings" passHref legacyBehavior>
          <a className="nav-item">⚙️ <span className="nav-text">Paramètres</span></a>
        </Link>
      </nav>

      <main>
        <div className="header-area">
          <h1>Mes Logements</h1>
          <Link href="/add-property" passHref legacyBehavior>
            <a className="btn-add">+ Ajouter</a>
          </Link>
        </div>

        <div className="grid">
          {properties.map((prop) => (
            <div key={prop.id} className="card">
              <button className="btn-delete" onClick={(e) => deleteProperty(e, prop.id, prop.name)} title="Supprimer">🗑️</button>
              
              <h3>{prop.name}</h3>
              <div className="address">📍 {prop.address}</div>
              
              <div className="btn-stack">
                <Link href={`/property/${prop.id}`} passHref legacyBehavior>
                  <a className="action-btn btn-primary">📊 Fiche Logement & Stats</a>
                </Link>
                
                <Link href={`/add-property?id=${prop.id}`} passHref legacyBehavior>
                  <a className="action-btn btn-outline">⚙️ Modifier la configuration</a>
                </Link>
                
                <Link href={`/chat/${prop.id}`} passHref legacyBehavior>
                  <a className="action-btn btn-light">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                    Ouvrir Marc (Test)
                  </a>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
