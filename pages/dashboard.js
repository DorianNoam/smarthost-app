import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

export default function Dashboard() {
  const [properties, setProperties] = useState([]);

  useEffect(() => { fetchProperties(); }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error) setProperties(data);
    } catch (err) { console.error(err); }
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
        body { margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', -apple-system, sans-serif; }
        a { text-decoration: none !important; color: inherit; }
      `}</style>
      
      <style jsx>{`
        .dashboard-layout { display: flex; min-height: 100vh; }

        /* SIDEBAR */
        nav { 
          width: 260px; background: #1a2a6c; color: white; 
          display: flex; flex-direction: column; padding: 40px 20px;
          position: fixed; height: 100vh; box-shadow: 4px 0 10px rgba(0,0,0,0.1);
        }
        .logo { font-size: 22px; font-weight: 900; margin-bottom: 50px; text-align: center; }
        .nav-links { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
        .nav-item { 
          padding: 14px 18px; border-radius: 12px; cursor: pointer; 
          display: flex; align-items: center; gap: 12px; font-weight: 600; 
          transition: 0.2s; opacity: 0.8;
        }
        .nav-item:hover { background: rgba(255,255,255,0.1); opacity: 1; }
        .nav-item.active { background: rgba(255,255,255,0.15); color: #fbbf24; opacity: 1; }

        /* CONTENU */
        main { flex: 1; margin-left: 260px; padding: 50px; box-sizing: border-box; }
        .header-area { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0; }
        h1 { font-size: 32px; font-weight: 800; color: #1e293b; margin: 0; }
        
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 25px; }

        /* CARTES AVEC RELIEF AMÉLIORÉ */
        .card { 
          background: white; border-radius: 24px; padding: 25px; 
          border: 1px solid #edf2f7; position: relative;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.02);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .card:hover { 
          transform: translateY(-5px); 
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .btn-delete { position: absolute; top: 15px; right: 15px; background: #fff1f2; color: #e11d48; border: none; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; }
        h3 { font-size: 20px; font-weight: 800; color: #1a2a6c; margin: 0 0 8px 0; }
        .address { color: #64748b; font-size: 13px; margin-bottom: 15px; }
        
        /* --- STYLES DES BOUTONS (LE FIX) --- */
        .btn-group { display: flex; flex-direction: column; gap: 10px; margin-top: 15px; }
        
        .btn { 
          padding: 14px 20px; 
          border-radius: 14px; 
          font-weight: 700; 
          font-size: 14px; 
          text-align: center; 
          transition: 0.2s, box-shadow 0.2s; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          gap: 10px; 
          border: none; 
          cursor: pointer;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        .btn:hover { 
          opacity: 0.95; 
          transform: translateY(-3px); 
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        .btn-config { 
          background: #fbbf24; 
          color: #1a2a6c !important; 
        }
        .btn-config:hover { 
          background: #f59e0b;
        }

        .btn-outline { 
          background: white; 
          color: #1a2a6c !important; 
          border: 1px solid #e2e8f0; 
        }
        .btn-outline:hover { 
          background: #f1f5f9;
        }

        .btn-light { 
          background: #f1f5f9; 
          color: #475569 !important; 
          border: 1px solid #e2e8f0; 
        }
        .btn-light:hover { 
          background: #e2e8f0;
        }

        /* BOUTON AJOUTER DANS LE HEADER */
        .btn-add { 
          background: #1a2a6c; 
          color: white !important; 
          padding: 12px 24px; 
          border-radius: 12px; 
          font-weight: 700; 
          transition: 0.2s;
        }
        .btn-add:hover { 
          transform: scale(1.05); 
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 900px) {
          nav { width: 100%; height: auto; position: sticky; top: 0; padding: 15px 20px; flex-direction: row; justify-content: space-between; }
          .logo { margin-bottom: 0; font-size: 18px; }
          .nav-text { display: none; }
          main { margin-left: 0; padding: 25px 20px; }
          .grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <nav>
        <div className="logo">MajorMarc 🎩</div>
        <ul className="nav-links">
          <Link href="/dashboard"><li className="nav-item active">🏠 <span className="nav-text">Mes Logements</span></li></Link>
          <Link href="/settings"><li className="nav-item">⚙️ <span className="nav-text">Paramètres</span></li></Link>
        </ul>
      </nav>

      <main>
        <div className="header-area">
          <h1>Mes Logements</h1>
          <Link href="/add-property" className="btn-add">+ Ajouter</Link>
        </div>

        <div className="grid">
          {properties.map((prop) => (
            <div key={prop.id} className="card">
              <button className="btn-delete" onClick={(e) => deleteProperty(e, prop.id, prop.name)}>🗑️</button>
              <h3>{prop.name}</h3>
              <div className="address">📍 {prop.address}</div>
              
              <div className="btn-group">
                {/* Le bouton principal de configuration avec relief (couleur Or/Jaune) */}
                <Link href={`/add-property?id=${prop.id}`} className="btn btn-config">
                  ⚙️ Continuer la configuration
                </Link>
                {/* Bouton secondaire d'ouverture (style outline Bleu Nuit) */}
                <Link href={`/chat/${prop.id}`} className="btn btn-outline">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                  Ouvrir Marc (Test)
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
