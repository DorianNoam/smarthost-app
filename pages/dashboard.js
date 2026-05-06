import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

export default function Dashboard() {
  const [properties, setProperties] = useState([]);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserName(user?.email);
    
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setProperties(data);
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Inter, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1>Mes Logements</h1>
        <Link href="/add-property" style={{ backgroundColor: '#1e293b', color: 'white', padding: '12px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold' }}>
          + Ajouter
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {properties.length === 0 ? (
          <p>Aucun logement trouvé. Commencez par en ajouter un !</p>
        ) : (
          properties.map((prop) => (
            <div key={prop.id} style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>{prop.name}</h3>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>📍 {prop.address}</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ fontSize: '12px', background: prop.wifi_name ? '#dcfce7' : '#fee2e2', color: prop.wifi_name ? '#166534' : '#991b1b', padding: '4px 8px', borderRadius: '4px' }}>
                  {prop.wifi_name ? '📶 Wifi OK' : '❌ Pas de Wifi'}
                </span>
                {prop.self_checkin && <span style={{ fontSize: '12px', background: '#dbeafe', color: '#1e40af', padding: '4px 8px', borderRadius: '4px' }}>🔑 Autonome</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
