import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const { data: props } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();

    if (props) setProperties(props);
    if (prof) setProfile(prof);
    setLoading(false);
  };

  const deleteProperty = async (e, id, name) => {
    e.stopPropagation();
    if (window.confirm(`Supprimer "${name}" ?`)) {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (!error) setProperties(properties.filter(p => p.id !== id));
    }
  };

  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>Chargement...</div>;

  return (
    <div className="dashboard-layout">
      <style jsx>{`
        .dashboard-layout { display: flex; min-height: 100vh; background: #f8fafc; }
        nav { width: 260px; background: #1a2a6c; color: white; padding: 40px 20px; position: fixed; height: 100vh; }
        .logo { font-size: 22px; font-weight: 900; margin-bottom: 50px; text-align: center; }
        main { flex: 1; margin-left: 260px; padding: 50px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 25px; }
        .card { background: white; border-radius: 24px; padding: 25px; border: 1px solid #e2e8f0; position: relative; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        h3 { margin: 0 0 10px 0; color: #1a2a6c; font-size: 22px; font-weight: 800; }
        .address { color: #64748b; font-size: 14px; margin-bottom: 20px; }
        
        .activation-card { background: #fffbeb; padding: 15px; border-radius: 16px; border: 1px solid #fef3c7; }
        .btn-activate { background: #fbbf24; color: #1a2a6c; border: none; padding: 12px; border-radius: 12px; width: 100%; font-weight: 800; cursor: pointer; }
        
        .action-btn { padding: 12px; border-radius: 12px; font-weight: 700; text-align: center; cursor: pointer; border: none; width: 100%; display: block; margin-bottom: 10px; text-decoration: none; }
        .btn-primary { background: #1a2a6c; color: white; }
        .btn-light { background: #f8fafc; color: #64748b; font-size: 12px; }
      `}</style>

      <nav><div className="logo">MajorMarc 🎩</div></nav>

      <main>
        <h1>Mes Logements</h1>
        <div className="grid">
          {properties.map((prop) => (
            <div key={prop.id} className="card">
              <button style={{position:'absolute', top:15, right:15, border:'none', background:'none', cursor:'pointer'}} onClick={(e) => deleteProperty(e, prop.id, prop.name)}>🗑️</button>
              <h3>{prop.name}</h3>
              <div className="address">📍 {prop.address}</div>

              {!prop.is_active ? (
                <div className="activation-card">
                  <p style={{fontSize: '11px', color: '#92400e', marginBottom: '10px', fontWeight: '600'}}>En attente d'activation</p>
                  <button onClick={() => router.push('/pricing')} className="btn-activate">Activer Marc (24,90€)</button>
                </div>
              ) : (
                <div className="btn-stack">
                  <Link href={`/property/${prop.id}`}><a className="action-btn btn-primary">📊 Configurer Marc</a></Link>
                  <Link href={`/chat/${prop.id}`}><a className="action-btn btn-light">Simuler voyageur</a></Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
