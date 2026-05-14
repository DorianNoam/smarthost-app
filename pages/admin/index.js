import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/router';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [cityIndex, setCityIndex] = useState(0);
  const [prospects, setProspects] = useState([]);

  const CITIES = [
    'Paris', 'Lyon', 'Bordeaux', 'Marseille', 'Nice',
    'Toulouse', 'Biarritz', 'Annecy', 'Strasbourg', 'Nantes',
    'Montpellier', 'Rennes', 'Bayonne', 'Saint-Malo', 'La Rochelle'
  ];

  // Vérifier que c'est bien l'admin
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== 'contact@alfredmajor.com') {
        router.push('/dashboard');
        return;
      }
      setUser(user);
      fetchProspects();
    };
    checkAdmin();
  }, []);

  const fetchProspects = async () => {
    const { data } = await supabase
      .from('prospects')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    setProspects(data || []);
  };

  // Scraper une ville
  const scrapeNextCity = async () => {
    if (cityIndex >= CITIES.length) {
      addLog('✅ Toutes les villes ont été scrapées !');
      setLoading(false);
      return;
    }

    setLoading(true);
    addLog(`🔍 Scraping de ${CITIES[cityIndex]}...`);

    try {
      const res = await fetch('/api/admin/scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: process.env.NEXT_PUBLIC_ADMIN_SECRET || prompt('Mot de passe admin :'),
          cityIndex
        })
      });

      const data = await res.json();

      if (data.success) {
        addLog(`✅ ${data.city} : ${data.stats.emails_sauvegardés} emails sauvegardés (${data.stats.doublons_ignorés} doublons ignorés)`);
        setStats(prev => ({
          total: (prev?.total || 0) + data.stats.emails_sauvegardés
        }));

        if (data.hasMore) {
          setCityIndex(data.nextCityIndex);
          // Petite pause avant la prochaine ville
          setTimeout(() => scrapeNextCity(), 2000);
        } else {
          addLog('🎉 Scraping terminé !');
          setLoading(false);
          fetchProspects();
        }
      } else {
        addLog(`❌ Erreur : ${data.error}`);
        setLoading(false);
      }
    } catch (e) {
      addLog(`❌ Erreur réseau : ${e.message}`);
      setLoading(false);
    }
  };

  const addLog = (message) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const startScraping = () => {
    setCityIndex(0);
    setLogs([]);
    setStats(null);
    scrapeNextCity();
  };

  if (!user) return <div style={{ padding: 40, textAlign: 'center' }}>Vérification...</div>;

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 900, margin: '0 auto', padding: 30 }}>
      <h1 style={{ color: '#1a2a6c' }}>🎩 Alfred Major — Admin</h1>

      {/* STATS */}
      <div style={{ display: 'flex', gap: 20, margin: '20px 0' }}>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 30px', flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#1a2a6c' }}>{prospects.length}</div>
          <div style={{ color: '#64748b', fontSize: 14 }}>Prospects total</div>
        </div>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 30px', flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#d4af37' }}>
            {prospects.filter(p => p.status === 'contacted').length}
          </div>
          <div style={{ color: '#64748b', fontSize: 14 }}>Contactés</div>
        </div>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 30px', flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#22c55e' }}>
            {prospects.filter(p => p.status === 'converted').length}
          </div>
          <div style={{ color: '#64748b', fontSize: 14 }}>Convertis ✅</div>
        </div>
      </div>

      {/* SCRAPER */}
      <div style={{ background: '#1a2a6c', borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <h2 style={{ color: 'white', margin: '0 0 16px' }}>🔍 Scraper Google Maps</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0 0 16px', fontSize: 14 }}>
          Lance le scraping des conciergeries et gestionnaires Airbnb sur {CITIES.length} villes françaises.
        </p>
        <button
          onClick={startScraping}
          disabled={loading}
          style={{
            background: loading ? '#64748b' : '#d4af37',
            color: '#1a2a6c', border: 'none', borderRadius: 8,
            padding: '12px 24px', fontSize: 15, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? `⏳ Scraping ${CITIES[cityIndex]}... (${cityIndex}/${CITIES.length})` : '🚀 Lancer le scraping'}
        </button>

        {/* Logs */}
        {logs.length > 0 && (
          <div style={{
            marginTop: 16, background: 'rgba(0,0,0,0.3)', borderRadius: 8,
            padding: 16, maxHeight: 200, overflowY: 'auto'
          }}>
            {logs.map((log, i) => (
              <div key={i} style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 4, fontFamily: 'monospace' }}>
                {log}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LISTE PROSPECTS */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ color: '#1a2a6c', margin: 0 }}>📋 Derniers prospects</h2>
          <button onClick={fetchProspects} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}>
            🔄 Rafraîchir
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Nom</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Email</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Ville</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Source</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {prospects.map((p, i) => (
              <tr key={p.id} style={{ background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}>{p.name || '—'}</td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}>
                  <a href={`mailto:${p.email}`} style={{ color: '#1a2a6c' }}>{p.email}</a>
                </td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}>{p.city || '—'}</td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{
                    background: p.source === 'googlemaps' ? '#dbeafe' : '#fef3c7',
                    color: p.source === 'googlemaps' ? '#1d4ed8' : '#92400e',
                    padding: '2px 8px', borderRadius: 20, fontSize: 12
                  }}>
                    {p.source === 'googlemaps' ? '🗺️ Maps' : '🏠 LBC'}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{
                    background: p.status === 'new' ? '#f1f5f9' :
                                p.status === 'contacted' ? '#fef3c7' :
                                p.status === 'converted' ? '#dcfce7' : '#fee2e2',
                    color: p.status === 'new' ? '#475569' :
                           p.status === 'contacted' ? '#92400e' :
                           p.status === 'converted' ? '#166534' : '#991b1b',
                    padding: '2px 8px', borderRadius: 20, fontSize: 12
                  }}>
                    {p.status === 'new' ? '🆕 Nouveau' :
                     p.status === 'contacted' ? '📧 Contacté' :
                     p.status === 'converted' ? '✅ Converti' : p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {prospects.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
            Aucun prospect pour l'instant. Lancez le scraping ! 🚀
          </div>
        )}
      </div>
    </div>
  );
}
