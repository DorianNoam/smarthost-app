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
    <div className="dashboard">
      <style jsx global>{`
        body { margin: 0; padding: 0; background-color: #f0f2f5; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        a { text-decoration: none !important; }
      `}</style>
      
      <style jsx>{`
        .nav-bar { background: #1a2a6c; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; color: white; position: sticky; top: 0; z-index: 100; }
        .logo { font-weight: 900; font-size: 1.2rem; }
        .nav-icons { display: flex; gap: 20px; font-size: 1.2rem; }
        
        main { padding: 20px; max-width: 800px; margin: 0 auto; }
        .top-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
        h1 { font-size: 1.6rem; color: #1e293b; margin: 0; }
        .add-link { color: #1a2a6c; font-weight: 700; border-bottom: 2px solid #fbbf24; }

        .property-card { 
          background: white; border-radius: 20px; padding: 20px; margin-bottom: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05); position: relative; border: 1px solid #e5e7eb;
        }

        .trash-btn { position: absolute; top: 15px; right: 15px; background: #fee2e2; border: none; padding: 8px; border-radius: 50%; cursor: pointer; }

        .prop-title { font-size: 1.3rem; font-weight: 800; color: #1a2a6c; margin-bottom: 5px; display: block; }
        .prop-addr { color: #64748b; font-size: 0.9rem; margin-bottom: 15px; display: block; }
        
        .wifi-badge { display: inline-block; background: #dcfce7; color: #166534; font-size: 0.7rem; font-weight: 800; padding: 4px 10px; border-radius: 6px; margin-bottom: 20px; }

        /* BOUTONS ACTIONS */
        .actions-row { display: flex; gap: 10px; }
        
        .btn-open { 
          flex: 4; background: #1a2a6c; color: white !important; text-align: center; 
          padding: 14px; border-radius: 14px; font-weight: 700; font-size: 0.9rem;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        
        .btn-setup { 
          flex: 1; background: #f1f5f9; color: #475569 !important; text-align: center;
          padding: 14px; border-radius: 14px; border: 1px solid #cbd5e1;
          display: flex; align-items: center; justify-content: center;
        }

        @media (min-width: 768px) {
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        }
      `}</style>

      <nav className="nav-bar">
        <div className="logo">MajorMarc 🎩</div>
        <div className="nav-icons">
          <Link href="/dashboard"><span style={{color: '#fbbf24'}}>🏠</span></Link>
          <Link href="/messages"><span>💬</span></Link>
          <span>⚙️</span>
        </div>
      </nav>

      <main>
        <div className="top-header">
          <h1>Mes Logements</h1>
          <Link href="/add-property" className="add-link">+ Ajouter</Link>
        </div>

        <div className="grid">
          {properties.map((prop) => (
            <div key={prop.id} className="property-card">
              <button className="trash-btn" onClick={(e) => deleteProperty(e, prop.id, prop.name)}>🗑️</button>
              
              <Link href={`/property/${prop.id}`}>
                <span className="prop-title">{prop.name}</span>
                <span className="prop-addr">📍 {prop.street_number ? `${prop.street_number} ` : ''}{prop.address}</span>
              </Link>
              
              {prop.wifi_name && <span className="wifi-badge">📶 WIFI OK</span>}

              <div className="actions-row">
                <Link href={`/chat/${prop.id}`} className="btn-open">
                   🚀 Ouvrir MajorMarc
                </Link>
                
                <Link href={`/add-property?id=${prop.id}`} className="btn-setup">
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
  
