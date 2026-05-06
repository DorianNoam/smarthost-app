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
        body { margin: 0; padding: 0; background-color: #f4f7fe; }
        a { text-decoration: none !important; color: inherit; }
      `}</style>
      
      <style jsx>{`
        .dashboard-wrapper { display: flex; flex-direction: column; min-height: 100vh; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }

        /* HEADER */
        nav { 
          background: #1a2a6c; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center;
          position: sticky; top: 0; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .logo { color: white; font-size: 18px; font-weight: 900; }
        .nav-links { display: flex; gap: 15px; }
        .nav-item { font-size: 20px; color: rgba(255,255,255,0.7); }
        .nav-item.active { color: #fbbf24; }

        /* MAIN CONTENT */
        main { padding: 20px; flex: 1; max-width: 800px; margin: 0 auto; width: 100%; box-sizing: border-box; }
        
        .header-area { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
        h1 { font-size: 24px; font-weight: 800; color: #1e293b; margin: 0; }
        .btn-add-top { font-size: 15px; font-weight: 700; color: #1a2a6c; border-bottom: 2px solid #fbbf24; }

        /* GRID & CARDS */
        .grid { display: flex; flex-direction: column; gap: 18px; }

        .card { 
          background: white; border-radius: 22px; padding: 22px; 
          box-shadow: 0 8px 20px rgba(0,0,0,0.04); position: relative;
          border: 1px solid #edf2f7;
        }

        .btn-delete {
          position: absolute; top: 15px; right: 15px; background: #fff1f2; color: #e11d48; 
          border: none; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 10;
        }

        /* Titre et adresse */
        .property-link { display: block; margin-bottom: 12px; }
        h3 { font-size: 20px; font-weight: 800; color: #1a2a6c; margin: 0 0 6px 0; }
        .address { color: #64748b; font-size: 13px; display: flex; align-items: center; gap: 5px; margin-bottom: 15px; }
        
        .badge { display: inline-block; font-size: 10px; font-weight: 800; padding: 5px 12px; background: #ecfdf5; color: #059669; border-radius: 8px; margin-bottom: 18px; border: 1px solid #d1fae5; }

        /* SECTION BOUTONS (Le gros changement) */
        .button-group { 
          display: flex; 
          gap: 12px; 
          width: 100%;
        }

        .btn-primary {
          flex: 4;
          background: #1a2a6c;
          color: white !important;
          padding: 14px;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 700;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 10px rgba(26, 42, 108, 0.2);
        }

        .btn-secondary {
          flex: 1;
          background: #f1f5f9;
          color: #475569 !important;
          padding: 14px;
          border-radius: 14px;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e2e8f0;
        }

        @media (min-width: 768px) {
          .grid { display: grid; grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <nav>
        <div className="logo">MajorMarc 🎩</div>
        <div className="nav-links">
          <Link href="/dashboard"><span className="nav-item active">🏠</span></Link>
          <Link href="/messages"><span className="nav-item">💬</span></Link>
          <span className="nav-item">⚙️</span>
        </div>
      </nav>

      <main>
        <div className="header-area">
          <h1>Mes Logements</h1>
          <Link href="/add-property" className="btn-add-top">+ Ajouter</Link>
        </div>

        <div className="grid">
          {properties.map((prop) => (
            <div key={prop.id} className="card">
              <button className="btn-delete" onClick={(e) => deleteProperty(e, prop.id, prop.name)}>🗑️</button>
              
              {/* Le haut de la carte est cliquable vers la fiche */}
              <Link href={`/property/${prop.id}`} className="property-link">
                <h3>{prop.name}</h3>
                <div className="address">
                  📍 {prop.street_number ? `${prop.street_number} ` : ''}{prop.address}
                </div>
              </Link>
              
              {prop.wifi_name && <span className="badge">📶 WIFI OK</span>}

              <div className="button-group">
                {/* Gros bouton bleu d'action */}
                <Link href={`/chat/${prop.id}`} className="btn-primary">
                  🚀 Ouvrir MajorMarc
                </Link>
                
                {/* Bouton gris de réglage */}
                <Link href={`/add-property?id=${prop.id}`} className="btn-secondary">
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
                
