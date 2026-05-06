import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

export default function Dashboard() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setProperties(data);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      {/* MENU LATÉRAL */}
      <nav style={{ width: '260px', background: '#1e293b', color: 'white', padding: '30px 20px' }}>
        <h2 style={{ marginBottom: '40px', fontSize: '20px', fontWeight: '800' }}>MajorMarc 🎩</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ padding: '12px 0', borderBottom: '1px solid #334155', cursor: 'pointer' }}>🏠 Mes Logements</li>
          <li style={{ padding: '12px 0', borderBottom: '1px solid #334155', opacity: 0.5 }}>💬 Messages (IA)</li>
          <li style={{ padding: '12px 0', borderBottom: '1px solid #334155', opacity: 0.5 }}>⚙️ Paramètres</li>
        </ul>
      </nav>

      {/* CONTENU PRINCIPAL */}
      <main style={{ flex: 1, padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>Mes Logements</h1>
          <Link href="/add-property" style={{ backgroundColor: '#1e293b', color: 'white', padding: '12px 24px', borderRadius: '12px', textDecoration: 'none', fontWeight: '700' }}>
            + Ajouter un logement
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
          {properties.map((prop) => (
            <div key={prop.id} className="property-card">
              <style jsx>{`
                .property-card { 
                  background: white; 
                  padding: 24px; 
                  border-radius: 20px; 
                  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); 
                  transition: transform 0.2s, box-shadow 0.2s;
                  cursor: pointer;
                }
                .property-card:hover {
                  transform: translateY(-5px);
                  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
                }
                .card-link { text-decoration: none; color: inherit; display: block; }
              `}</style>

              {/* CLIC SUR LA CARTE -> RÉCAPITULATIF */}
              <Link href={`/property/${prop.id}`} className="card-link">
                <h3 style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '18px' }}>{prop.name}</h3>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
                  📍 {prop.street_number} {prop.address}
                  {prop.floor && ` • Étage ${prop.floor}`}
                </p>
                
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', background: prop.wifi_name ? '#dcfce7' : '#fee2e2', color: prop.wifi_name ? '#166534' : '#991b1b', padding: '5px 10px', borderRadius: '6px' }}>
                    {prop.wifi_name ? '📶 WIFI OK' : '❌ PAS DE WIFI'}
                  </span>
                  {prop.self_checkin && <span style={{ fontSize: '11px', fontWeight: '700', background: '#dbeafe', color: '#1e40af', padding: '5px 10px', borderRadius: '6px' }}>🔑 AUTONOME</span>}
                </div>
              </Link>

              {/* BOUTON MODIFIER -> TUNNEL DE CRÉATION */}
              <Link href={`/add-property?id=${prop.id}`} style={{ display: 'block', textAlign: 'center', background: '#f1f5f9', color: '#1e293b', padding: '10px', borderRadius: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
                ⚙️ Modifier les étapes
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
