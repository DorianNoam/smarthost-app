// pages/cleaner/dashboard.js
// Dashboard dédié au prestataire de ménage.
// Affiche le planning complet de ses missions, triées par date.
// Étape 5 : affichage des instructions spéciales (upsells affects_cleaning).

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

const STATUS_CONFIG = {
  pending:     { label: 'À faire',    bg: '#fff7ed', border: '#f97316', color: '#c2410c', dot: '#f97316' },
  in_progress: { label: 'En cours',   bg: '#eff6ff', border: '#3b82f6', color: '#1d4ed8', dot: '#3b82f6' },
  completed:   { label: 'Terminé',    bg: '#f0fdf4', border: '#22c55e', color: '#15803d', dot: '#22c55e' },
};

export default function CleanerDashboard() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming'); // 'upcoming' | 'completed' | 'all'
  const [upsellNotes, setUpsellNotes] = useState({});

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/cleaner/login'); return; }

      // Vérifier le rôle
      const { data: prof } = await supabase
        .from('profiles')
        .select('full_name, role, email')
        .eq('id', user.id)
        .single();

      if (!prof || prof.role !== 'cleaner') {
        await supabase.auth.signOut();
        router.push('/cleaner/login');
        return;
      }

      setProfile(prof);
      await loadJobs(user.id);
    } catch (err) {
      console.error(err);
      router.push('/cleaner/login');
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async (userId) => {
    // Récupérer le provider_id lié à ce profil
    const { data: provider } = await supabase
      .from('cleaning_providers')
      .select('id')
      .eq('profile_id', userId)
      .maybeSingle();

    if (!provider) { setJobs([]); return; }

    // Récupérer tous les jobs de ce prestataire
    const { data: jobsData } = await supabase
      .from('cleaning_jobs')
      .select('*, properties(name, city, address, street_number)')
      .eq('provider_id', provider.id)
      .order('checkout_time', { ascending: true });

    const loadedJobs = jobsData || [];
    setJobs(loadedJobs);

    // Charger les notes upsells pour les propriétés concernées
    if (loadedJobs.length > 0) {
      await fetchUpsellNotes(loadedJobs);
    }
  };

  const fetchUpsellNotes = async (jobsList) => {
    try {
      const propertyIds = [...new Set(jobsList.map(j => j.property_id).filter(Boolean))];
      if (propertyIds.length === 0) return;

      const res = await fetch('/api/cleaning/upsell-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyIds }),
      });

      if (!res.ok) return;
      const data = await res.json();
      setUpsellNotes(data.notes || {});
    } catch (err) {
      console.error('Erreur chargement upsell notes:', err);
    }
  };

  // Construire la clé de matching entre un job et les upsell notes
  const getUpsellNotesForJob = (job) => {
    if (!job.property_id || !job.checkout_time) return [];
    const checkoutDate = new Date(job.checkout_time).toISOString().split('T')[0];
    const key = `${job.property_id}_${checkoutDate}`;
    return upsellNotes[key] || [];
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('fr-FR', {
      weekday: 'short', day: '2-digit', month: 'short',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatDateShort = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const isUpcoming = (job) => {
    if (job.status === 'completed') return false;
    if (!job.checkout_time) return true;
    return new Date(job.checkout_time) >= new Date(Date.now() - 24 * 60 * 60 * 1000);
  };

  const filteredJobs = jobs.filter(job => {
    if (filter === 'upcoming') return isUpcoming(job);
    if (filter === 'completed') return job.status === 'completed';
    return true;
  });

  const upcomingCount = jobs.filter(isUpcoming).length;

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <p style={{ color: '#64748b' }}>Chargement...</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
      <Head>
        <title>Mon Planning — Alfred Major</title>
        <meta name="robots" content="noindex" />
      </Head>

      <style jsx global>{`* { box-sizing: border-box; } body { margin: 0; }`}</style>

      {/* HEADER */}
      <div style={{ background: '#1a2a6c', padding: '0' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '24px 20px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <p style={{ margin: '0 0 4px', color: 'rgba(255,255,255,0.6)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Espace prestataire</p>
              <h1 style={{ margin: 0, color: 'white', fontSize: '22px', fontWeight: 900 }}>
                Bonjour {profile?.full_name?.split(' ')[0]} 👋
              </h1>
              {upcomingCount > 0 && (
                <p style={{ margin: '4px 0 0', color: '#fbbf24', fontSize: '13px', fontWeight: 600 }}>
                  {upcomingCount} mission{upcomingCount > 1 ? 's' : ''} à venir
                </p>
              )}
            </div>
            <button
              onClick={async () => { await supabase.auth.signOut(); router.push('/cleaner/login'); }}
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit' }}
            >
              Déconnexion
            </button>
          </div>

          {/* FILTRES */}
          <div style={{ display: 'flex', gap: '4px', borderBottom: 'none' }}>
            {[
              { key: 'upcoming', label: '📅 À venir' },
              { key: 'completed', label: '✅ Terminés' },
              { key: 'all', label: '📋 Tous' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  padding: '10px 16px', border: 'none', borderRadius: '10px 10px 0 0',
                  background: filter === f.key ? 'white' : 'transparent',
                  color: filter === f.key ? '#1a2a6c' : 'rgba(255,255,255,0.6)',
                  fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
                  transition: '0.2s',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENU */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '20px' }}>
        {filteredJobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: '48px', margin: '0 0 16px' }}>
              {filter === 'upcoming' ? '🎉' : '📋'}
            </p>
            <h2 style={{ color: '#1a2a6c', fontWeight: 800, margin: '0 0 8px' }}>
              {filter === 'upcoming' ? 'Aucune mission à venir' : 'Aucune mission'}
            </h2>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              {filter === 'upcoming' ? 'Profitez-en — vous êtes à jour !' : 'Les missions apparaîtront ici.'}
            </p>
          </div>
        ) : (
          filteredJobs.map(job => {
            const sc = STATUS_CONFIG[job.status] || STATUS_CONFIG.pending;
            const prop = job.properties;
            const isToday = job.checkout_time && new Date(job.checkout_time).toDateString() === new Date().toDateString();
            const isTomorrow = job.checkout_time && new Date(job.checkout_time).toDateString() === new Date(Date.now() + 86400000).toDateString();
            const jobUpsellNotes = getUpsellNotesForJob(job);

            return (
              <div
                key={job.id}
                style={{
                  background: 'white', borderRadius: '20px', border: `1px solid ${sc.border}`,
                  marginBottom: '14px', overflow: 'hidden',
                  boxShadow: job.status === 'pending' ? '0 4px 16px rgba(249,115,22,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                {/* BANDEAU URGENCE */}
                {isToday && job.status !== 'completed' && (
                  <div style={{ background: '#ef4444', color: 'white', padding: '6px 16px', fontSize: '12px', fontWeight: 800, textAlign: 'center' }}>
                    ⚡ AUJOURD'HUI
                  </div>
                )}
                {isTomorrow && job.status !== 'completed' && (
                  <div style={{ background: '#f97316', color: 'white', padding: '6px 16px', fontSize: '12px', fontWeight: 800, textAlign: 'center' }}>
                    📅 DEMAIN
                  </div>
                )}

                <div style={{ padding: '18px' }}>
                  {/* TITRE */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: 800, color: '#1a2a6c' }}>
                        {prop?.name || 'Logement'}
                      </h3>
                      {prop?.city && (
                        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                          📍 {prop.street_number ? `${prop.street_number} ` : ''}{prop.address || ''}{prop.city ? `, ${prop.city}` : ''}
                        </p>
                      )}
                    </div>
                    <div style={{ background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color, padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, whiteSpace: 'nowrap', marginLeft: '12px' }}>
                      {sc.label}
                    </div>
                  </div>

                  {/* HORAIRES */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ background: '#fff7ed', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Départ voyageur</p>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#c2410c' }}>{formatDate(job.checkout_time)}</p>
                    </div>
                    <div style={{ background: '#f0fdf4', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Prochain voyageur</p>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#15803d' }}>{formatDate(job.next_checkin)}</p>
                    </div>
                  </div>

                  {/* INSTRUCTIONS SPÉCIALES (upsells ménage) */}
                  {jobUpsellNotes.length > 0 && (
                    <div style={{
                      background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px',
                      padding: '14px', marginBottom: '16px',
                    }}>
                      <p style={{
                        margin: '0 0 10px', fontSize: '11px', fontWeight: 800,
                        color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.5px',
                        display: 'flex', alignItems: 'center', gap: '6px',
                      }}>
                        <span style={{ fontSize: '14px' }}>⚠️</span> Instructions spéciales
                      </p>
                      {jobUpsellNotes.map((note, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex', alignItems: 'flex-start', gap: '8px',
                            padding: '8px 10px', background: 'rgba(255,255,255,0.7)',
                            borderRadius: '8px', marginBottom: i < jobUpsellNotes.length - 1 ? '6px' : 0,
                          }}
                        >
                          <span style={{ fontSize: '18px', flexShrink: 0, lineHeight: '1.2' }}>
                            {note.emoji || '✨'}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#92400e' }}>
                              {note.name}
                            </p>
                            {note.notes && (
                              <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#a16207', fontWeight: 400, fontStyle: 'italic' }}>
                                « {note.notes} »
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CONFIRMATION */}
                  {job.status === 'completed' ? (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>✅</span>
                      <div>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#15803d' }}>Ménage confirmé</p>
                        {job.confirmed_at && (
                          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Le {formatDateShort(job.confirmed_at)}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <Link href={`/cleaning/${job.id}`} legacyBehavior>
                      <a style={{
                        display: 'block', background: '#1a2a6c', color: 'white',
                        textDecoration: 'none', textAlign: 'center', padding: '13px',
                        borderRadius: '12px', fontWeight: 800, fontSize: '14px',
                      }}>
                        ✅ Confirmer ce ménage
                      </a>
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
