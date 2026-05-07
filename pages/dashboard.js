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
        body { margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', sans-serif; }
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
        .btn-add { background: #1a2a6c; color: white !important; padding: 12px 24px; border-radius: 12px; font-weight: 700; }

        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 25px; }

        /* CARTES */
        .card { 
          background: white; border-radius: 24px; padding: 25px; 
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); position: relative;
          border: 1px solid #edf2f7;
        }
        .btn-delete { position: absolute; top: 15px; right: 15px; background: #fff1f2; color: #e11d48; border: none; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; }
        h3 { font-size: 20px; font-weight: 800; color: #1a2a6c; margin: 0 0 8px 0; }
        .address { color: #64748b; font-size: 13px; margin-bottom: 15px; }
        
        .btn-group { display: flex; flex-direction: column; gap: 10px; margin-top: 15px; }
        .btn-main { background: #f8fafc; color: #1a2a6c !important; padding: 12px; border-radius: 12px; font-size: 13px; font-weight: 700; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-config { background: #1a2a6c; color: white !important; padding: 12px; border-radius: 12px; font-size: 13px; font-weight: 700; text-align: center; }

        @media (max-width: 900px) {
          nav { width: 100%; height: auto; position: sticky; top: 0; padding: 15px 20px; flex-direction: row; justify-content: space-between; }
          .logo { margin-bottom: 0; font-size: 18px; }
          .nav-text { display: none; }
          main { margin-left: 0; padding: 25px 20px; }
        }
      `}</style>

      <nav>
        <div className="logo">MajorMarc 🎩</div>
        <ul className="nav-links">
          <Link href="/dashboard"><li className="nav-item active"><span>🏠</span> <span className="nav-text">Mes Logements</span></li></Link>
          <Link href="/settings"><li className="nav-item"><span>⚙️</span> <span className="nav-text">Paramètres</span></li></Link>
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
                <Link href={`/add-property?id=${prop.id}`} className="btn-config">
                  Continuer la configuration
                </Link>
                <Link href={`/chat/${prop.id}`} className="btn-main">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
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
