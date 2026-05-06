import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

export default function IAMessages() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    const { data } = await supabase.from('properties').select('id, name, address');
    setProperties(data || []);
  };

  return (
    <div className="layout">
      {/* STYLE GLOBAL POUR TUER LE BLEU/VIOLET */}
      <style jsx global>{`
        a { text-decoration: none !important; color: inherit !important; }
      `}</style>

      <style jsx>{`
        .layout { display: flex; min-height: 100vh; background: #f8fafc; font-family: 'Inter', sans-serif; }
        
        /* Sidebar Fixée */
        nav { width: 280px; background: #1e293b; color: white; padding: 40px 24px; display: flex; flex-direction: column; }
        .logo { font-size: 22px; font-weight: 900; margin-bottom: 50px; color: white; }
        
        .nav-links { display: flex; flex-direction: column; gap: 8px; }
        
        .nav-item { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          padding: 14px 16px; 
          border-radius: 12px; 
          font-weight: 500; 
          color: white !important; 
          opacity: 0.7; 
          transition: 0.2s; 
          cursor: pointer;
        }
        
        .nav-item:hover { opacity: 1; background: #334155; }
        .nav-item.active { opacity: 1; background: #334155; color: #fbbf24 !important; }

        /* Contenu */
        main { flex: 1; padding: 50px; }
        h1 { font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 40px; }
        
        .chat-list { display: flex; flex-direction: column; gap: 15px; max-width: 800px; }
        .chat-card { 
          background: white; 
          padding: 24px; 
          border-radius: 20px; 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          border: 1px solid #e2e8f0; 
          box-shadow: 0 4px 6px rgba(0,0,0,0.02);
        }
        .chat-info h3 { margin: 0 0 5px 0; color: #1e293b; font-size: 18px; }
        .chat-info p { margin: 0; color: #64748b; font-size: 14px; }
        
        .btn-view { 
          background: #1e293b; 
          color: white !important; 
          padding: 12px 20px; 
          border-radius: 10px; 
          font-weight: 700; 
          font-size: 14px; 
          transition: 0.2s;
        }
        .btn-view:hover { transform: scale(1.05); }
      `}</style>

      {/* MENU LATÉRAL */}
      <nav>
        <div className="logo">MajorMarc 🎩</div>
        <div className="nav-links">
          <Link href="/dashboard">
            <div className="nav-item">🏠 Mes Logements</div>
          </Link>
          <Link href="/messages">
            <div className="nav-item active">💬 Messages (IA)</div>
          </Link>
          <div className="nav-item">⚙️ Paramètres</div>
        </div>
      </nav>

      {/* CONTENU PRINCIPAL */}
      <main>
        <h1>Supervision de Marc</h1>
        <div className="chat-list">
          {properties.length === 0 ? (
            <p style={{color: '#64748b'}}>Chargement de vos propriétés...</p>
          ) : (
            properties.map(p => (
              <div key={p.id} className="chat-card">
                <div className="chat-info">
                  <h3>{p.name}</h3>
                  <p>📍 {p.address}</p>
                </div>
                <Link href={`/chat/${p.id}`} className="btn-view">Voir le Chat</Link>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
