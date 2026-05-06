import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

export default function Dashboard() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error) setProperties(data);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteProperty = async (e, id, name) => {
    e.stopPropagation();
    if (window.confirm(`Supprimer "${name}" ?`)) {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (!error) setProperties(properties.filter(p => p.id !== id));
    }
  };

  return (
    <div className="dashboard-wrapper">
      <style jsx global>{`
        body { margin: 0; padding: 0; background-color: #f8fafc; }
        a { text-decoration: none !important; color: inherit; }
      `}</style>
      
      <style jsx>{`
        .dashboard-wrapper { display: flex; flex-direction: column; min-height: 100vh; font-family: 'Inter', sans-serif; }

        nav { 
          background: #1a2a6c; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center;
          position: sticky; top: 0; z-index: 1000; box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .logo { color: white; font-size: 18px; font-weight: 900; }
        .nav-links { display: flex; gap: 20px; list-style: none; margin: 0; padding: 0; }
        .nav-item { font-size: 18px; cursor: pointer; color: rgba(255,255,255,0.6); }
        .nav-item.active { color: #fbbf24; }

        main { padding: 20px; flex: 1; max-width: 1100px; margin: 0 auto; width: 100%; box-sizing: border-box; }
        .header-area { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 25px; }
        h1 { font-size: 24px; font-weight: 800; color: #1e293b; margin: 0; }
        .btn-add { color: #1a2a6c; font-weight: 700; font-size: 14px; border-bottom: 2px solid #fbbf24; }

        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }

        .card { 
          background: white; border-radius: 18px; padding: 20px; border: 1px solid #edf2f7;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); position: relative;
        }

        .btn-delete {
          position: absolute; top: 15px; right: 15px; background: #fff1f2; color: #e11d48; 
          border: none; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 10;
        }

        /* Titre cliquable vers la page récapitulative */
        .card-title-link { display: block; cursor: pointer; }
        .card h3 { font-size: 18px; font-weight: 700; color: #1a2a6c; margin: 0 0 8px 0; padding-right: 35px; text-decoration: underline rgba(26, 42, 108, 0.1); }
        .card h3:hover { color: #fbbf24; }

        .card .address { color: #64748b; font-size: 13px; margin-bottom: 18px; display: flex; gap: 5px; }

        .badges { display: flex; gap: 8px; margin-bottom: 20px; }
        .badge { font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 6px; }
        .badge-wifi { background: #ecfdf5; color: #059669; border: 1px solid #d1fae5; }
        .badge-auto { background: #eff6ff; color: #2563eb; border: 1px solid #dbeafe; }

        .button-group { display: flex; gap: 10px; }
        
        .btn-main {
          flex: 2; display: flex; align-items: center; justify-content: center; gap: 8px;
          background: #1a2a6c; color: white; padding: 12px; border-radius: 12px; font-size: 13px; font-weight: 700;
        }

        .btn-config {
          flex: 1; display: flex; align-items: center; justify-content: center;
          background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0;
          padding: 12px; border-radius: 12px; font-size: 13px;
        }

        @media (min-width: 768px) {
          nav { padding: 15px 40px; }
          main { padding: 40px; }
          h1 { font-size: 32px; }
        }
      `}</style>

      <nav>
        <div className="logo">MajorMarc 🎩</div>
        <ul className="nav-links">
          <Link href="/dashboard"><li className="nav-item active">🏠</li></Link>
          <Link href="/messages"><li className="nav-item">💬</li></Link>
          <li className="nav-item">⚙️</li>
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
              
              {/* Le titre renvoie vers la page récapitulative du logement */}
              <Link href={`/property/${prop.id}`} className="card-title-link">
                <h3>{prop.name}</h3>
              </Link>

              <div className="address">
                <span>📍</span>
                <span>{prop.street_number ? `${prop.street_number} ` : ''}{prop.address}</span>
              </div>
              
              <div className="badges">
                {prop.wifi_name && <span className="badge badge-wifi">WIFI OK</span>}
                {prop.self_checkin && <span className="badge badge-auto">AUTONOME</span>}
              </div>

              <div className="button-group">
                {/* Bouton pour voir le chat/recap (page invité) */}
                <Link href={`/chat/${prop.id}`} className="btn-main">
                  🚀 Ouvrir MajorMarc
                </Link>
                
                {/* Bouton pour modifier les infos techniques (page admin) */}
                <Link href={`/add-property?id=${prop.id}`} className="btn-config" title="Modifier">
                  ⚙️
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
