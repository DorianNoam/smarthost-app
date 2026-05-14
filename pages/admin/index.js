import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/router';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
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

  // ── Lancer la ville suivante quand cityIndex change
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

  // ── Ajouter une ligne dans les logs scraper
  const addLog = (message) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  // ── Ajouter une ligne dans les logs email
  const addEmailLog = (message) => {
    setEmailLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
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
        body: JSON.stringify({ secret: adminSecret, cityIndex: index })
      });

      const data = await res.json();

      if (data.success) {
        addLog(`✅ ${data.city} : ${data.stats.emails_sauvegardés} emails sauvegardés (${data.stats.doublons_ignorés} doublons ignorés)`);

        if (data.hasMore) {
          setTimeout(() => setCityIndex(data.nextCityIndex), 2000);
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

  // ── Démarrer le scraping
  const startScraping = () => {
    const secret = process.env.NEXT_PUBLIC_ADMIN_SECRET;
    if (!secret) {
      alert('Variable NEXT_PUBLIC_ADMIN_SECRET manquante dans Vercel !');
      return;
    }
    setAdminSecret(secret);
    setCityIndex(0);
    setLogs([]);
    setLoading(true);
    setTimeout(() => scrapeCity(0), 100);
  };

  // ── Envoyer les emails
  const sendEmails = async (type) => {
    const secret = process.env.NEXT_PUBLIC_ADMIN_SECRET;
    if (!secret) {
      alert('Variable NEXT_PUBLIC_ADMIN_SECRET manquante dans Vercel !');
      return;
    }

    const labels = {
      initial: 'emails initiaux',
      followup_j3: 'relances J+3',
      followup_j7: 'relances J+7'
    };

    const confirmed = window.confirm(
      `Vous allez envoyer les ${labels[type]} à tous les prospects concernés. Confirmer ?`
    );
    if (!confirmed) return;

    setEmailLoading(true);
    setEmailLogs([]);
    addEmailLog(`📧 Envoi des ${labels[type]} en cours...`);

    try {
      const res = await fetch('/api/admin/send-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, type })
      });

      const data = await res.json();

      if (data.success) {
        addEmailLog(`✅ ${data.stats.emails_envoyés} emails envoyés avec succès`);
        addEmailLog(`📊 ${data.stats.prospects_trouvés} prospects trouvés`);
        if (data.stats.échecs > 0) {
          addEmailLog(`⚠️ ${data.stats.échecs} échecs d'envoi`);
        }
        fetchProspects();
      } else {
        addEmailLog(`❌ Erreur : ${data.error}`);
      }
    } catch (e) {
      addEmailLog(`❌ Erreur réseau : ${e.message}`);
    } finally {
      setEmailLoading(false);
    }
  };

  // ── Mettre à jour le statut d'un prospect
  const updateStatus = async (id, status) => {
    await supabase.from('prospects').update({ status }).eq('id', id);
    fetchProspects();
  };

  // ── Stats calculées
  const stats = {
    total: prospects.length,
    new: prospects.filter(p => p.status === 'new').length,
    contacted: prospects.filter(p => p.status === 'contacted').length,
    replied: prospects.filter(p => p.status === 'replied').length,
    converted: prospects.filter(p => p.status === 'converted').length,
  };

  if (!user) return (
    <div style={{ padding: 40, textAlign: 'center', fontFamily: 'sans-serif', color: '#1a2a6c' }}>
      Vérification...
    </div>
  );

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 1100, margin: '0 auto', padding: 30 }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <h1 style={{ color: '#1a2a6c', margin: 0 }}>🎩 Alfred Major — Admin</h1>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <a href="https://www.alfredmajor.com/m/demo-alfred-major" target="_blank" rel="noreferrer"
            style={{ color: '#d4af37', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
            🎭 Voir la démo →
          </a>
          <a href="/dashboard" style={{ color: '#64748b', fontSize: 13, textDecoration: 'none' }}>
            ← Retour au dashboard
          </a>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total prospects', value: stats.total, color: '#1a2a6c' },
          { label: 'Nouveaux 🆕', value: stats.new, color: '#475569' },
          { label: 'Contactés 📧', value: stats.contacted, color: '#d4af37' },
          { label: 'Réponses 💬', value: stats.replied, color: '#f97316' },
          { label: 'Convertis ✅', value: stats.converted, color: '#22c55e' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 20px', flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 34, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* SECTION EMAILS */}
      <div style={{ background: '#0f2560', borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <h2 style={{ color: 'white', margin: '0 0 8px' }}>📧 Envoyer les emails</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0 0 20px', fontSize: 13 }}>
          {stats.new} prospects nouveaux à contacter · {stats.contacted} en attente de relance
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          {/* Email initial */}
          <button
            onClick={() => sendEmails('initial')}
            disabled={emailLoading || stats.new === 0}
            style={{
              background: emailLoading || stats.new === 0 ? '#475569' : '#d4af37',
              color: '#0f2560',
              border: 'none',
              borderRadius: 8,
              padding: '12px 20px',
              fontSize: 14,
              fontWeight: 700,
              cursor: emailLoading || stats.new === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            📨 Envoyer email initial ({stats.new} prospects)
          </button>

          {/* Relance J+3 */}
          <button
            onClick={() => sendEmails('followup_j3')}
            disabled={emailLoading}
            style={{
              background: emailLoading ? '#475569' : '#1a2a6c',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 8,
              padding: '12px 20px',
              fontSize: 14,
              fontWeight: 700,
              cursor: emailLoading ? 'not-allowed' : 'pointer',
            }}
          >
            🔄 Relance J+3
          </button>

          {/* Relance J+7 */}
          <button
            onClick={() => sendEmails('followup_j7')}
            disabled={emailLoading}
            style={{
              background: emailLoading ? '#475569' : '#1a2a6c',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 8,
              padding: '12px 20px',
              fontSize: 14,
              fontWeight: 700,
              cursor: emailLoading ? 'not-allowed' : 'pointer',
            }}
          >
            🔁 Relance J+7 (avec démo)
          </button>
        </div>

        {/* Logs email */}
        {emailLogs.length > 0 && (
          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 16, maxHeight: 150, overflowY: 'auto' }}>
            {emailLogs.map((log, i) => (
              <div key={i} style={{
                color: log.includes('❌') ? '#fca5a5' :
                       log.includes('✅') ? '#86efac' :
                       'rgba(255,255,255,0.7)',
                fontSize: 13, marginBottom: 4, fontFamily: 'monospace'
              }}>
                {log}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION SCRAPER */}
      <div style={{ background: '#1a2a6c', borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <h2 style={{ color: 'white', margin: '0 0 8px' }}>🔍 Scraper Google Maps</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0 0 16px', fontSize: 13 }}>
          Récupère les emails des conciergeries sur 15 villes françaises. Coût : ~3,50€ en crédits Google Maps.
        </p>

        <button
          onClick={startScraping}
          disabled={loading}
          style={{
            background: loading ? '#475569' : '#d4af37',
            color: '#1a2a6c', border: 'none', borderRadius: 8,
            padding: '12px 24px', fontSize: 14, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? `⏳ Scraping ${CITIES[Math.min(cityIndex, CITIES.length - 1)]}... (${Math.min(cityIndex, CITIES.length)}/${CITIES.length})` : '🚀 Lancer le scraping'}
        </button>

        {/* Barre de progression */}
        {loading && (
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 20, height: 6, marginTop: 16 }}>
            <div style={{
              background: '#d4af37', height: 6, borderRadius: 20,
              width: `${(cityIndex / CITIES.length) * 100}%`,
              transition: 'width 0.5s ease'
            }} />
          </div>
        )}

        {/* Logs scraper */}
        {logs.length > 0 && (
          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 16, maxHeight: 180, overflowY: 'auto', marginTop: 16 }}>
            {logs.map((log, i) => (
              <div key={i} style={{
                color: log.includes('❌') ? '#fca5a5' :
                       log.includes('✅') || log.includes('🎉') ? '#86efac' :
                       'rgba(255,255,255,0.7)',
                fontSize: 13, marginBottom: 4, fontFamily: 'monospace'
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
          <h2 style={{ color: '#1a2a6c', margin: 0 }}>📋 Prospects ({prospects.length})</h2>
          <button onClick={fetchProspects} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, color: '#475569' }}>
            🔄 Rafraîchir
          </button>
        </div>

        {prospects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', background: '#f8fafc', borderRadius: 12 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div>Aucun prospect pour l'instant. Lancez le scraping !</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Nom', 'Email', 'Ville', 'Téléphone', 'Source', 'Statut', 'Modifier'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {prospects.map((p, i) => (
                  <tr key={p.id} style={{ background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name || '—'}
                    </td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}>
                      <a href={`mailto:${p.email}`} style={{ color: '#1a2a6c', textDecoration: 'none' }}>{p.email}</a>
                    </td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>{p.city || '—'}</td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', color: '#475569', fontSize: 12 }}>{p.phone || '—'}</td>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{
                        background: '#dbeafe', color: '#1d4ed8',
                        padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500
                      }}>🗺️ Maps</span>
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
                        padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500
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
                        style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 8px', fontSize: 12, cursor: 'pointer', background: 'white' }}
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
