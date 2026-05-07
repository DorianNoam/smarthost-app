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

  return (
    <div className="dashboard-layout">
      <style jsx global>{`
        body { margin: 0; background: #f8fafc; font-family: 'Inter', sans-serif; }
      `}</style>
      <style jsx>{`
        .dashboard-layout { display: flex; min-height: 100vh; }
        nav { width: 260px; background: #1a2a6c; color: white; padding: 40px 20px; position: fixed; height: 100vh; }
        .logo { font-size: 22px; font-weight: 900; margin-bottom: 50px; text-align: center; }
        .nav-item { padding: 14px 18px; border-radius: 12px; display: flex; align-items: center; gap: 12px; font-weight: 600; opacity: 0.8; margin-bottom: 10px; cursor: pointer; }
        .nav-item.active { background: rgba(255,255,255,0.15); color: #fbbf24; opacity: 1; }

        main { flex: 1; margin-left: 260px; padding: 50px; }
        .header-area { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 25px; }

        .card { background: white; border-radius: 24px; padding: 25px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
        h3 { margin: 0 0 5px 0; color: #1a2a6c; font-size: 22px; }
        .address { color: #64748b; font-size: 14px; margin-bottom: 20px; }

        .btn-stack { display: flex; flex-direction: column; gap: 10px; }
        .btn { padding: 12px; border-radius: 12px; font-weight: 700; font-size: 13px; text-align: center; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; border: none; cursor: pointer; }
        
        .btn-primary { background: #1a2a6c; color: white !important; }
        .btn-outline { background: white; color: #1a2a6c !important; border: 1px solid #e2e8f0; }
        .btn-light { background: #f1f5f9; color: #475569 !important; }
        .btn:hover { opacity: 0.9; transform: translateY(-2px); }

        @media (max-width: 900px) {
          nav { width: 100%; height: auto; position: fixed; bottom: 0; flex-direction: row; padding: 10px; height: 60px; justify-content: space-around; }
          .logo, .nav-text { display: none; }
          main { margin-left: 0; padding: 20px; padding-bottom: 80px; }
          .grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <nav>
        <div className="logo">MajorMarc 🎩</div>
        <Link href="/dashboard"><div className="nav-item active">🏠 <span className="nav-text">Mes Logements</span></div></Link>
        <Link href="/settings"><div className="nav-item">⚙️ <span className="nav-text">Paramètres</span></div></Link>
      </nav>

      <main>
        <div className="header-area">
          <h1 style={{fontWeight:800}}>Mes Logements</h1>
          <Link href="/add-property" className="btn btn-primary" style={{padding:'10px 20px'}}>+ Ajouter</Link>
        </div>

        <div className="grid">
          {properties.map((prop) => (
            <div key={prop.id} className="card">
              <h3>{prop.name}</h3>
              <div className="address">📍 {prop.address}</div>
              
              <div className="btn-stack">
                <Link href={`/property/${prop.id}`} className="btn btn-primary">
                  📊 Fiche Logement & Stats
                </Link>
                <Link href={`/add-property?id=${prop.id}`} className="btn btn-outline">
                  ⚙️ Modifier la configuration
                </Link>
                <Link href={`/chat/${prop.id}`} className="btn btn-light">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
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
