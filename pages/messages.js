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
      <style jsx>{`
        .layout { display: flex; min-height: 100vh; background: #f8fafc; font-family: 'Inter', sans-serif; }
        nav { width: 280px; background: #1e293b; color: white; padding: 40px 24px; }
        .nav-item { padding: 14px 16px; border-radius: 12px; margin-bottom: 8px; cursor: pointer; display: flex; align-items: center; gap: 12px; opacity: 0.7; transition: 0.2s; color: white; text-decoration: none; }
        .nav-item:hover, .nav-item.active { opacity: 1; background: #334155; }
        .nav-item.active { color: #fbbf24; }
        
        main { flex: 1; padding: 50px; }
        h1 { font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 40px; }
        
        .chat-list { display: flex; flex-direction: column; gap: 15px; max-width: 800px; }
        .chat-card { background: white; padding: 20px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; border: 1px solid #e2e8f0; }
        .chat-info h3 { margin: 0 0 5px 0; color: #1e293b; }
        .chat-info p { margin: 0; color: #64748b; font-size: 14px; }
        .btn-view { background: #fbbf24; color: #0f172a; padding: 10px 20px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 14px; }
      `}</style>

      <nav>
        <div style={{fontSize: '22px', fontWeight: '900', marginBottom: '50px'}}>MajorMarc 🎩</div>
        <Link href="/dashboard" className="nav-item">🏠 Mes Logements</Link>
        <Link href="/messages" className="nav-item active">💬 Messages (IA)</Link>
        <div className="nav-item">⚙️ Paramètres</div>
      </nav>

      <main>
        <h1>Supervision de Marc</h1>
        <div className="chat-list">
          {properties.length === 0 ? (
            <p>Chargement des conversations...</p>
          ) : (
            properties.map(p => (
              <div key={p.id} className="chat-card">
                <div className="chat-info">
                  <h3>Conversation : {p.name}</h3>
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
