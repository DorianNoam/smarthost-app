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
  const [adminSecret, setAdminSecret] = useState('');

  const CITIES = [
    'Paris', 'Lyon', 'Bordeaux', 'Marseille', 'Nice',
    'Toulouse', 'Biarritz', 'Annecy', 'Strasbourg', 'Nantes',
    'Montpellier', 'Rennes', 'Bayonne', 'Saint-Malo', 'La Rochelle'
  ];

  // ── Vérifier que c'est bien l'admin
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      fetchProspects();
    };
    checkAdmin();
  }, []);

  // ── Lancer la ville suivante quand cityIndex ou adminSecret change
  useEffect(() => {
    if (adminSecret && cityIndex > 0 && loading) {
      scrapeCity(cityIndex);
    }
  }, [cityIndex]);

  // ── Récupérer les prospects depuis Supabase
  const fetchProspects = async () => {
    const { data } = await supabase
      .from('prospects')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    setProspects(data || []);
  };

  // ── Ajouter une ligne dans les logs
  const addLog = (message) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  // ── Scraper une ville spécifique
  const scrapeCity = async (index) => {
    if (index >= CITIES.length) {
      addLog('🎉 Toutes les villes ont été scrapées !');
      setLoading(false);
      fetchProspects();
      return;
    }

    addLog(`🔍 Scraping de ${CITIES[index]}...`);

    try {
      const res = await fetch('/api/admin/scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: adminSecret,
          cityIndex: index
        })
      });

      const data = await res.json();

      if (data.success) {
        addLog(`✅ ${data.city} : ${data.stats.emails_sauvegardés} emails sauvegardés (${data.stats.doublons_ignorés} doublons ignorés)`);
        setStats(prev => ({
          total: (prev?.total || 0) + data.stats.emails_sauvegardés
        }));

        if (data.hasMore) {
          // Pause 2 secondes avant la ville suivante
          setTimeout(() => {
            setCityIndex(data.nextCityIndex);
          }, 2000);
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

  // ── Démarrer le scraping (demande le mot de passe une seule fois)
  const startScraping = () => {
    const secret = prompt('🔐 Mot de passe admin :');
    if (!secret) return;

    setAdminSecret(secret);
    setCityIndex(0);
    setLogs([]);
    setStats(null);
    setLoading(true);

    // Lancer la première ville directement
    setTimeout(() => scrapeCity(0), 100);
  };

  // ── Mettre à jour le statut d'un prospect
  const updateStatus = async (id, status) => {
    await supabase.from('prospects').update({ status }).eq('id', id);
    fetchProspects();
  };

  if (!user) return (
    <div style={{ padding: 40, textAlign: 'center', fontFamily: 'sans-serif', color: '#1a2a6c' }}>
      Vérification...
    </div>
  );

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 1000, margin: '0 auto', padding: 30 }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <h1 style={{ color: '#1a2a6c', margin: 0 }}>🎩 Alfred Major — Admin</h1>
        <a href="/dashboard" style={{ color: '#64748b', fontSize: 14, textDecoration: 'none' }}>
          ← Retour au dashboard
        </a>
      </div>

      {/* STATS */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 24px', flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 40, fontWeight: 800, color: '#1a2a6c' }}>{prospects.length}</div>
          <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Prospects total</div>
        </div>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 24px', flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 40, fontWeight: 800, color: '#d4af37' }}>
            {prospects.filter(p => p.status === 'contacted').length}
          </div>
          <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Contactés 📧</div>
        </div>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 24px', flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 40, fontWeight: 800, color: '#f97316' }}>
            {prospects.filter(p => p.status === 'replied').length}
          </div>
          <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Réponses reçues 💬</div>
        </div>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 24px', flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 40, fontWeight: 800, color: '#22c55e' }}>
            {prospects.filter(p => p.status === 'converted').length}
          </div>
          <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Convertis ✅</div>
        </div>
      </div>

      {/* SCRAPER */}
      <div style={{ background: '#1a2a6c', borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <h2 style={{ color: 'white', margin: '0 0 8px' }}>🔍 Scraper Google Maps</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0 0 16px', fontSize: 13 }}>
          Récupère les emails des conciergeries et gestionnaires Airbnb sur {CITIES.length} villes françaises.
          Coût estimé : ~3,50€ en crédits Google Maps (largement dans le gratuit).
        </p>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
          <button
            onClick={startScraping}
            disabled={loading}
            style={{
              background: loading ? '#475569' : '#d4af37',
              color: '#1a2a6c',
              border: 'none',
              borderRadius: 8,
              padding: '12px 24px',
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: '0.2s'
            }}
          >
            {loading
              ? `⏳ Scraping ${CITIES[Math.min(cityIndex, CITIES.length - 1)]}... (${Math.min(cityIndex, CITIES.length)}/${CITIES.length})`
              : '🚀 Lancer le scraping'}
          </button>

          {loading && (
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
              Ne fermez pas cette page...
            </div>
          )}
        </div>

        {/* Barre de progression */}
        {loading && (
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 20, height: 8, marginBottom: 16 }}>
            <div style={{
              background: '#d4af37',
              height: 8,
              borderRadius: 20,
              width: `${(cityIndex / CITIES.length) * 100}%`,
              transition: 'width 0.5s ease'
            }} />
          </div>
        )}

        {/* Logs */}
        {logs.length > 0 && (
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            borderRadius: 8,
            padding: 16,
            maxHeight: 220,
            overflowY: 'auto'
          }}>
            {logs.map((log, i) => (
              <div key={i} style={{
                color: log.includes('❌') ? '#fca5a5' :
                       log.includes('✅') || log.includes('🎉') ? '#86efac' :
                       'rgba(255,255,255,0.7)',
                fontSize: 13,
                marginBottom: 4,
                fontFamily: 'monospace'
              }}>
                {log}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LISTE PROSPECTS */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ color: '#1a2a6c', margin: 0 }}>
            📋 Prospects ({prospects.length})
          </h2>
          <button
            onClick={fetchProspects}
            style={{
              background: 'none',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: 13,
              color: '#475569'
            }}
          >
            🔄 Rafraîchir
          </button>
        </div>

        {prospects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', background: '#f8fafc', borderRadius: 12 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 16 }}>Aucun prospect pour l'instant.</div>
            <div style={{ fontSize: 13, marginTop: 8 }}>Lancez le scraping pour commencer !</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Nom', 'Email', 'Ville', 'Téléphone', 'Source', 'Statut', 'Action'].map(h => (
                    <th key={h} style={{
                      padding: '10px 12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #e2e8f0',
                      color: '#475569',
                      fontWeight: 600,
                      fontSize: 13
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {prospects.map((p, i) => (
                  <tr key={p.id} style={{ background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', fontWeight: 500 }}>
                      {p.name || '—'}
                    </td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}>
                      <a href={`mailto:${p.email}`} style={{ color: '#1a2a6c', textDecoration: 'none' }}>
                        {p.email}
                      </a>
                    </td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>
                      {p.city || '—'}
                    </td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', color: '#475569', fontSize: 13 }}>
                      {p.phone || '—'}
                    </td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{
                        background: p.source === 'googlemaps' ? '#dbeafe' : '#fef3c7',
                        color: p.source === 'googlemaps' ? '#1d4ed8' : '#92400e',
                        padding: '2px 10px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 500
                      }}>
                        {p.source === 'googlemaps' ? '🗺️ Maps' : '🏠 LBC'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{
                        background: p.status === 'new' ? '#f1f5f9' :
                                    p.status === 'contacted' ? '#fef3c7' :
                                    p.status === 'replied' ? '#fed7aa' :
                                    p.status === 'converted' ? '#dcfce7' : '#fee2e2',
                        color: p.status === 'new' ? '#475569' :
                               p.status === 'contacted' ? '#92400e' :
                               p.status === 'replied' ? '#9a3412' :
                               p.status === 'converted' ? '#166534' : '#991b1b',
                        padding: '2px 10px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 500
                      }}>
                        {p.status === 'new' ? '🆕 Nouveau' :
                         p.status === 'contacted' ? '📧 Contacté' :
                         p.status === 'replied' ? '💬 A répondu' :
                         p.status === 'converted' ? '✅ Converti' :
                         p.status === 'unsubscribed' ? '🚫 Désabonné' : p.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}>
                      <select
                        value={p.status}
                        onChange={(e) => updateStatus(p.id, e.target.value)}
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: 6,
                          padding: '4px 8px',
                          fontSize: 12,
                          cursor: 'pointer',
                          background: 'white'
                        }}
                      >
                        <option value="new">🆕 Nouveau</option>
                        <option value="contacted">📧 Contacté</option>
                        <option value="replied">💬 A répondu</option>
                        <option value="converted">✅ Converti</option>
                        <option value="unsubscribed">🚫 Désabonné</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
