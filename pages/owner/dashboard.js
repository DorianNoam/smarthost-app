// pages/owner/dashboard.js
// Dashboard proprietaire — vue de ses biens, resas, revenus, documents.

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabase';

const MONTHS_FR = ['jan', 'fev', 'mar', 'avr', 'mai', 'juin', 'juil', 'aout', 'sep', 'oct', 'nov', 'dec'];
const PLATFORM_COLORS = {
  airbnb: { bg: '#fff1f0', color: '#e11d48', label: 'Airbnb' },
  booking: { bg: '#eff6ff', color: '#1d4ed8', label: 'Booking' },
  vrbo: { bg: '#fefce8', color: '#ca8a04', label: 'Vrbo' },
  unknown: { bg: '#f5f5f7', color: '#6e6e73', label: 'Autre' },
};

export default function OwnerDashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [selectedProperty, setSelectedProperty] = useState('all');

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/owner/login'); return; }

      const res = await fetch('/api/owner/dashboard-data', {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      if (res.status === 403) { router.push('/owner/login'); return; }
      if (!res.ok) throw new Error('Erreur chargement');

      const d = await res.json();
      setData(d);
    } catch (err) {
      console.error(err);
      router.push('/owner/login');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return `${d.getDate()} ${MONTHS_FR[d.getMonth()]}`;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/owner/login');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <p style={{ color: '#64748b', fontFamily: 'Inter, sans-serif' }}>Chargement...</p>
    </div>
  );

  if (!data) return null;

  const filteredResas = selectedProperty === 'all'
    ? data.reservations
    : data.reservations.filter(r => r.property_id === selectedProperty);

  const filteredDocs = selectedProperty === 'all'
    ? data.documents
    : data.documents.filter(d => d.property_id === selectedProperty);

  const today = new Date().toISOString().split('T')[0];
  const upcomingResas = filteredResas.filter(r => r.check_out >= today);
  const pastResas = filteredResas.filter(r => r.check_out < today);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <Head>
        <title>Mon espace proprietaire — Alfred Major</title>
        <meta name="robots" content="noindex" />
      </Head>
      <style jsx global>{`* { box-sizing: border-box; } body { margin: 0; }`}</style>

      {/* HEADER */}
      <div style={{ background: '#1a2a6c', padding: '24px 20px 0' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <p style={{ margin: '0 0 4px', color: 'rgba(255,255,255,0.6)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Espace Proprietaire</p>
              <h1 style={{ margin: 0, color: 'white', fontSize: '22px', fontWeight: 900 }}>Bonjour {data.profile.name?.split(' ')[0]} 👋</h1>
              <p style={{ margin: '4px 0 0', color: '#d4af37', fontSize: '13px', fontWeight: 600 }}>
                {data.stats.propertyCount} logement{data.stats.propertyCount > 1 ? 's' : ''} · {data.stats.upcomingCount} reservation{data.stats.upcomingCount > 1 ? 's' : ''} a venir
              </p>
            </div>
            <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit' }}>
              Deconnexion
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {[
              { key: 'overview', label: '📊 Apercu' },
              { key: 'reservations', label: '📅 Reservations' },
              { key: 'documents', label: '📄 Documents' },
              { key: 'properties', label: '🏠 Mes biens' },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                padding: '10px 16px', border: 'none', borderRadius: '10px 10px 0 0',
                background: tab === t.key ? 'white' : 'transparent',
                color: tab === t.key ? '#1a2a6c' : 'rgba(255,255,255,0.6)',
                fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
              }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENU */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 20px' }}>

        {/* Filtre logement */}
        {data.properties.length > 1 && tab !== 'properties' && (
          <div style={{ marginBottom: '20px' }}>
            <select value={selectedProperty} onChange={e => setSelectedProperty(e.target.value)}
              style={{ width: '100%', maxWidth: '300px', padding: '10px 14px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit', color: '#1a2a6c', fontWeight: 600 }}>
              <option value="all">Tous mes biens ({data.properties.length})</option>
              {data.properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* APERCU */}
        {tab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
              <StatCard icon="🏠" label="Mes biens" value={data.stats.propertyCount} />
              <StatCard icon="📅" label="Reservations a venir" value={data.stats.upcomingCount} />
              <StatCard icon="🌙" label={`Nuits ${new Date().getFullYear()}`} value={data.stats.nightsThisYear} />
              <StatCard icon="💰" label="Extras vendus" value={`${data.stats.upsellsTotal.toFixed(2)} €`} />
            </div>

            <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 800, color: '#1a2a6c' }}>Prochaines arrivees</h3>
              {upcomingResas.slice(0, 5).length === 0 ? (
                <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Aucune reservation a venir.</p>
              ) : (
                upcomingResas.slice(0, 5).map(r => {
                  const prop = data.properties.find(p => p.id === r.property_id);
                  const pc = PLATFORM_COLORS[r.platform] || PLATFORM_COLORS.unknown;
                  return (
                    <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1a2a6c' }}>{r.guest_name || 'Voyageur'}</p>
                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>{prop?.name} · {formatDate(r.check_in)} → {formatDate(r.check_out)}</p>
                      </div>
                      <span style={{ background: pc.bg, color: pc.color, padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>{pc.label}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* RESERVATIONS */}
        {tab === 'reservations' && (
          <div>
            <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 800, color: '#1a2a6c' }}>A venir ({upcomingResas.length})</h3>
            {upcomingResas.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>Aucune reservation a venir.</p>
            ) : (
              upcomingResas.map(r => <ResaCard key={r.id} r={r} properties={data.properties} formatDate={formatDate} />)
            )}
            <h3 style={{ margin: '24px 0 14px', fontSize: '15px', fontWeight: 800, color: '#1a2a6c' }}>Historique ({pastResas.length})</h3>
            {pastResas.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>Aucun historique.</p>
            ) : (
              pastResas.slice(0, 20).map(r => <ResaCard key={r.id} r={r} properties={data.properties} formatDate={formatDate} past />)
            )}
          </div>
        )}

        {/* DOCUMENTS */}
        {tab === 'documents' && (
          <div>
            <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 800, color: '#1a2a6c' }}>Documents partages ({filteredDocs.length})</h3>
            {filteredDocs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '40px', margin: '0 0 12px' }}>📄</p>
                <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Aucun document partage pour le moment.</p>
              </div>
            ) : (
              filteredDocs.map(d => (
                <div key={d.id} style={{ background: 'white', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1a2a6c' }}>📄 {d.name}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                      {d.properties?.name} · {d.category || 'Document'} · {new Date(d.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <a href={d.file_url} target="_blank" rel="noopener noreferrer" style={{ background: '#1a2a6c', color: 'white', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
                    Voir →
                  </a>
                </div>
              ))
            )}
          </div>
        )}

        {/* PROPRIETES */}
        {tab === 'properties' && (
          <div>
            {data.properties.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '40px', margin: '0 0 12px' }}>🏠</p>
                <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Aucun logement rattache a votre compte.</p>
              </div>
            ) : (
              data.properties.map(p => (
                <div key={p.id} style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
                  <h3 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: 800, color: '#1a2a6c' }}>{p.name}</h3>
                  <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#64748b' }}>
                    📍 {p.street_number ? `${p.street_number} ` : ''}{p.address}{p.city ? `, ${p.city}` : ''}
                  </p>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{ background: '#f0fdf4', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', color: '#15803d', fontWeight: 700 }}>
                      Commission conciergerie : {p.commission_rate}%
                    </div>
                    <div style={{ background: p.is_active ? '#eff6ff' : '#fef2f2', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', color: p.is_active ? '#1d4ed8' : '#dc2626', fontWeight: 700 }}>
                      {p.is_active ? '● En service' : '○ Inactif'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div style={{ background: 'white', borderRadius: '16px', padding: '18px', border: '1px solid #e2e8f0' }}>
      <div style={{ fontSize: '24px', marginBottom: '6px' }}>{icon}</div>
      <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{label}</p>
      <p style={{ margin: '4px 0 0', fontSize: '22px', fontWeight: 900, color: '#1a2a6c' }}>{value}</p>
    </div>
  );
}

function ResaCard({ r, properties, formatDate, past }) {
  const prop = properties.find(p => p.id === r.property_id);
  const pc = PLATFORM_COLORS[r.platform] || PLATFORM_COLORS.unknown;
  const nights = Math.round((new Date(r.check_out) - new Date(r.check_in)) / 86400000);
  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0', marginBottom: '10px', opacity: past ? 0.7 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1a2a6c' }}>{r.guest_name || 'Voyageur'}</p>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>{prop?.name}</p>
        </div>
        <span style={{ background: pc.bg, color: pc.color, padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>{pc.label}</span>
      </div>
      <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: '#64748b' }}>
        <span>📅 {formatDate(r.check_in)} → {formatDate(r.check_out)}</span>
        <span>· 🌙 {nights} nuit{nights > 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}
