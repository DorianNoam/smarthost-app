import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

export default function PropertySpecs() {
  const router = useRouter();
  const { id } = router.query;
  const [property, setProperty] = useState(null);

  useEffect(() => {
    if (id) fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    const { data } = await supabase.from('properties').select('*').eq('id', id).single();
    setProperty(data);
  };

  if (!property) return null;

  return (
    <div className="specs-container">
      <style jsx>{`
        .specs-container { background: #f8fafc; min-height: 100vh; font-family: 'Inter', sans-serif; }
        nav { background: #1a2a6c; color: white; padding: 15px 30px; display: flex; align-items: center; gap: 20px; }
        .back-link { color: white; text-decoration: none; font-size: 14px; opacity: 0.8; }
        
        main { max-width: 1000px; margin: 40px auto; padding: 0 20px; display: grid; grid-template-columns: 2fr 1fr; gap: 30px; }
        
        .section { background: white; padding: 30px; border-radius: 24px; border: 1px solid #e2e8f0; margin-bottom: 25px; }
        h2 { font-size: 18px; color: #1a2a6c; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 20px; }
        
        .stat-card { background: #1a2a6c; color: white; padding: 25px; border-radius: 24px; text-align: center; margin-bottom: 20px; }
        .stat-value { font-size: 32px; font-weight: 800; display: block; color: #fbbf24; }
        .stat-label { font-size: 12px; opacity: 0.8; text-transform: uppercase; letter-spacing: 1px; }

        .data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .data-item label { display: block; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
        .data-item p { margin: 5px 0 0; font-size: 15px; color: #1e293b; font-weight: 500; }
        
        @media (max-width: 800px) { main { grid-template-columns: 1fr; } }
      `}</style>

      <nav>
        <Link href="/dashboard" className="back-link">← Retour Dashboard</Link>
        <h1 style={{fontSize:'18px', margin:0}}>{property.name}</h1>
      </nav>

      <main>
        <div className="left-col">
          <div className="section">
            <h2>🧠 Cerveau du logement</h2>
            <div className="data-grid">
              <div className="data-item"><label>Wifi</label><p>{property.wifi_name || 'Non configuré'}</p></div>
              <div className="data-item"><label>Mot de passe</label><p>{property.wifi_password || 'Non configuré'}</p></div>
              <div className="data-item"><label>Arrivée</label><p>{property.check_in_hour}</p></div>
              <div className="data-item"><label>Départ</label><p>{property.check_out_hour}</p></div>
              <div className="data-item" style={{gridColumn:'span 2'}}><label>Accès</label><p>{property.checkin_instructions || 'Aucune instruction'}</p></div>
            </div>
          </div>

          <div className="section">
            <h2>📍 Localisation</h2>
            <p>{property.address}, {property.city}</p>
          </div>
        </div>

        <div className="right-col">
          <div className="stat-card">
            <span className="stat-label">Temps gagné</span>
            <span className="stat-value">12h 45min</span>
            <p style={{fontSize:'11px', marginTop:'10px'}}>Basé sur 15min / message</p>
          </div>

          <div className="stat-card" style={{background: 'white', color: '#1a2a6c', border: '1px solid #e2e8f0'}}>
            <span className="stat-label" style={{color:'#64748b'}}>Échanges Clients</span>
            <span className="stat-value" style={{color:'#1a2a6c'}}>54</span>
          </div>

          <Link href={`/add-property?id=${property.id}`} className="btn" style={{display:'block', textAlign:'center', background:'#fbbf24', padding:'15px', borderRadius:'15px', color:'#1a2a6c', fontWeight:'800', textDecoration:'none'}}>
            Modifier les infos
          </Link>
        </div>
      </main>
    </div>
  );
}
