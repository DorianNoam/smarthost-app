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
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error) setProperties(data);
    } catch (err) {
      console.error("Erreur lors de la récupération :", err);
    }
  };

  const deleteProperty = async (e, id, name) => {
    e.stopPropagation(); // Empêche d'ouvrir la page du logement
    const confirmed = window.confirm(`Voulez-vous vraiment supprimer "${name}" ? Cette action est irréversible.`);
    
    if (confirmed) {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) {
        alert("Erreur : " + error.message);
      } else {
        setProperties(properties.filter(p => p.id !== id));
      }
    }
  };

  return (
    <div className="dashboard-container">
      <style jsx global>{`
        /* Reset global pour enlever les soulignages bleus partout */
        a { text-decoration: none !important; color: inherit; }
      `}</style>
      
      <style jsx>{`
        .dashboard-container { display: flex; min-height: 100vh; background-color: #f8fafc; font-family: 'Inter', sans-serif; }
        
        /* Menu Latéral */
        nav { width: 280px; background: #1e293b; color: white; padding: 40px 24px; display: flex; flex-direction: column; }
        .logo { font-size: 22px; fontWeight: 900; margin-bottom: 50px; display: flex; align-items: center; gap: 10px; }
        .nav-links { list-style: none; padding: 0; margin: 0; }
        .nav-item { padding: 14px 16px; border-radius: 12px; margin-bottom: 8px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 12px; font-weight: 500; }
        .nav-item.active { background: #334155; color: #fbbf24; }
        .nav-item:not(.active) { opacity: 0.7; }
        .nav-item:hover { background: #334155; opacity: 1; }

        /* Zone Principale */
        main { flex: 1; padding: 50px; overflow-y: auto; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        h1 { font-size: 32px; font-weight: 800; color: #0f172a; margin: 0; }
        .btn-add { background: #1e293b; color: white; padding: 14px 28px; border-radius: 14px; font-weight: 700; transition: 0.2s; }
        .btn-add:hover { transform: scale(1.03); background: #0f172a; }

        /* Grille de cartes */
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 30px; }
        
        .card { 
          background: white; 
          border-radius: 24px; 
          padding: 28px; 
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
          border: 1px solid #f1f5f9;
        }
        .card:hover { transform: translateY(-8px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); border-color: #e2e8f0; }

        .btn-delete {
          position: absolute; top: 24px; right: 24px;
          background: #fee2e2; color: #991b1b; border: none;
          width: 36px; height: 36px; border-radius: 10px;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: 0.2s; font-size: 18px;
        }
        .btn-delete:hover { background: #fecaca; transform: rotate(15deg); }

        h3 { margin: 0 0 12px 0; color: #1e293b; font-size: 20px; font-weight: 700; padding-right: 40px; }
        .address { color: #64748b; font-size: 14px; margin-bottom: 24px; display: flex; align-items: center; gap: 6px; }
        
        .badges { display: flex; gap: 10px; margin-bottom: 24px; }
        .badge { font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .badge-wifi-ok { background: #dcfce7; color: #166534; }
        .badge-wifi-no { background: #fee2e2; color: #991b1b; }
        .badge-auto { background: #dbeafe; color: #1e40af; }

        .btn-edit { 
          display: block; width: 100%; text-align: center; 
          background: #f1f5f9; color: #1e293b; 
          padding: 12px; border-radius: 12px; 
          font-size: 13px; font-weight: 700; 
          transition: 0.2s;
        }
        .btn-edit:hover { background: #e2e8f0; }
      `}</style>

      {/* NAVIGATION */}
      <nav>
        <div className="logo">MajorMarc 🎩</div>
        <ul className="nav-links">
          <li className="nav-item active">🏠 Mes Logements</li>
          <li className="nav-item">💬 Messages (IA)</li>
          <li className="nav-item">⚙️ Paramètres</li>
        </ul>
      </nav>

      {/* CONTENU */}
      <main>
        <div className="header">
          <h1>Mes Logements</h1>
          <Link href="/add-property" className="btn-add">+ Ajouter un logement</Link>
        </div>

        <div className="grid">
          {properties.length === 0 ? (
            <p style={{ color: '#64748b' }}>Vous n'avez pas encore de logement. Cliquez sur + Ajouter pour commencer !</p>
          ) : (
            properties.map((prop) => (
              <div key={prop.id} className="card" onClick={() => window.location.href = `/property/${prop.id}`}>
                <button className="btn-delete" onClick={(e) => deleteProperty(e, prop.id, prop.name)} title="Supprimer le logement">
                  🗑️
                </button>

                <h3>{prop.name}</h3>
                <div className="address">
                  📍 {prop.street_number && `${prop.street_number} `}{prop.address}
                </div>
                
                <div className="badges">
                  <span className={`badge ${prop.wifi_name ? 'badge-wifi-ok' : 'badge-wifi-no'}`}>
                    {prop.wifi_name ? '📶 WIFI' : '❌ WIFI'}
                  </span>
                  {prop.self_checkin && <span className="badge badge-auto">🔑 AUTONOME</span>}
                </div>

                <Link 
                  href={`/add-property?id=${prop.id}`} 
                  onClick={(e) => e.stopPropagation()} 
                  className="btn-edit"
                >
                  ⚙️ Modifier les informations
                </Link>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
