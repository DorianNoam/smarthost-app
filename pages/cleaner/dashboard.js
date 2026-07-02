// pages/cleaner/dashboard.js
// Dashboard dédié au prestataire de ménage.
// Vue liste + vue calendrier mensuel avec toggle.
// Affiche les instructions spéciales (upsells affects_cleaning).

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

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export default function CleanerDashboard() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const [upsellNotes, setUpsellNotes] = useState({});
  const [viewMode, setViewMode] = useState('list');
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/cleaner/login'); return; }

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
    const { data: provider } = await supabase
      .from('cleaning_providers')
      .select('id')
      .eq('profile_id', userId)
      .maybeSingle();

    if (!provider) { setJobs([]); return; }

    const { data: jobsData } = await supabase
      .from('cleaning_jobs')
      .select('*, properties(name, city, address, street_number)')
      .eq('provider_id', provider.id)
      .order('checkout_time', { ascending: true });

    const loadedJobs = jobsData || [];
    setJobs(loadedJobs);

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

  // ── Calendrier helpers ──

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();

  const getFirstDayOfMonth = (month, year) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const getJobsForDate = (day, month, year) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return jobs.filter(job => {
      if (!job.checkout_time) return false;
      const jobDate = new Date(job.checkout_time).toISOString().split('T')[0];
      return jobDate === dateStr;
    });
  };

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
    setSelectedDay(null);
  };

  const goToday = () => {
    const now = new Date();
    setCalMonth(now.getMonth());
    setCalYear(now.getFullYear());
    setSelectedDay(null);
  };

  const isToday = (day) => {
    const now = new Date();
    return day === now.getDate() && calMonth === now.getMonth() && calYear === now.getFullYear();
  };

  const isSelected = (day) => {
    return selectedDay && selectedDay.day === day && selectedDay.month === calMonth && selectedDay.year === calYear;
  };

  const selectedDayJobs = selectedDay
    ? getJobsForDate(selectedDay.day, selectedDay.month, selectedDay.year)
    : [];

  // ── Rendu carte mission ──

  const renderJobCard = (job) => {
    const sc = STATUS_CONFIG[job.status] || STATUS_CONFIG.pending;
    const prop = job.properties;
    const jobIsToday = job.checkout_time && new Date(job.checkout_time).toDateString() === new Date().toDateString();
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
        {jobIsToday && job.status !== 'completed' && (
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
  };

  // ── Rendu calendrier ──

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(calMonth, calYear);
    const firstDay = getFirstDayOfMonth(calMonth, calYear);
    const cells = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} style={{ minHeight: '48px' }} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayJobs = getJobsForDate(day, calMonth, calYear);
      const hasJobs = dayJobs.length > 0;
      const dayIsToday = isToday(day);
      const dayIsSelected = isSelected(day);

      cells.push(
        <div
          key={day}
          onClick={() => {
            if (hasJobs) {
              setSelectedDay(
                dayIsSelected ? null : { day, month: calMonth, year: calYear }
              );
            }
          }}
          style={{
            minHeight: '48px',
            padding: '4px',
            borderRadius: '12px',
            cursor: hasJobs ? 'pointer' : 'default',
            background: dayIsSelected ? '#1a2a6c' : dayIsToday ? '#eff6ff' : 'transparent',
            border: dayIsToday && !dayIsSelected ? '2px solid #3b82f6' : '2px solid transparent',
            transition: '0.15s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
          }}
        >
          <span style={{
            fontSize: '14px',
            fontWeight: dayIsToday || hasJobs ? 800 : 400,
            color: dayIsSelected ? 'white' : dayIsToday ? '#1a2a6c' : hasJobs ? '#1a2a6c' : '#94a3b8',
          }}>
            {day}
          </span>
          {hasJobs && (
            <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {dayJobs.map((j, i) => {
                const sc = STATUS_CONFIG[j.status] || STATUS_CONFIG.pending;
                return (
                  <div
                    key={i}
                    style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: dayIsSelected ? 'rgba(255,255,255,0.8)' : sc.dot,
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '16px', padding: '0 4px',
        }}>
          <button onClick={prevMonth} style={{
            background: 'rgba(26,42,108,0.08)', border: 'none', borderRadius: '10px',
            padding: '10px 14px', cursor: 'pointer', fontSize: '16px', fontFamily: 'inherit',
            color: '#1a2a6c', fontWeight: 700,
          }}>
            ←
          </button>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1a2a6c' }}>
              {MONTHS_FR[calMonth]} {calYear}
            </h2>
            <button onClick={goToday} style={{
              background: 'none', border: 'none', color: '#3b82f6', fontSize: '12px',
              fontWeight: 600, cursor: 'pointer', padding: '2px 0', fontFamily: 'inherit',
            }}>
              Aujourd'hui
            </button>
          </div>
          <button onClick={nextMonth} style={{
            background: 'rgba(26,42,108,0.08)', border: 'none', borderRadius: '10px',
            padding: '10px 14px', cursor: 'pointer', fontSize: '16px', fontFamily: 'inherit',
            color: '#1a2a6c', fontWeight: 700,
          }}>
            →
          </button>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px',
          marginBottom: '4px', textAlign: 'center',
        }}>
          {DAYS_FR.map(d => (
            <div key={d} style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', padding: '6px 0', textTransform: 'uppercase' }}>
              {d}
            </div>
          ))}
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px',
          background: 'white', borderRadius: '16px', padding: '8px',
          border: '1px solid #e2e8f0',
        }}>
          {cells}
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '12px' }}>
          {Object.entries(STATUS_CONFIG).map(([key, sc]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: sc.dot }} />
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{sc.label}</span>
            </div>
          ))}
        </div>

        {selectedDay && (
          <div style={{ marginTop: '20px' }}>
            <h3 style={{
              margin: '0 0 12px', fontSize: '15px', fontWeight: 800, color: '#1a2a6c',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span>📋</span>
              {selectedDay.day} {MONTHS_FR[selectedDay.month]} {selectedDay.year}
              <span style={{
                background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px',
                borderRadius: '6px', fontSize: '12px', fontWeight: 700,
              }}>
                {selectedDayJobs.length} mission{selectedDayJobs.length > 1 ? 's' : ''}
              </span>
            </h3>
            {selectedDayJobs.map(job => renderJobCard(job))}
          </div>
        )}

        {!selectedDay && (
          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', marginTop: '20px', fontStyle: 'italic' }}>
            Touchez un jour avec des missions pour voir le détail
          </p>
        )}
      </div>
    );
  };

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

          {/* TOGGLE VUE + FILTRES */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {viewMode === 'list' ? (
              <div style={{ display: 'flex', gap: '4px' }}>
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
            ) : (
              <div style={{ padding: '10px 0' }}>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 600 }}>
                  🗓️ Vue calendrier
                </span>
              </div>
            )}

            <div style={{
              display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.1)',
              borderRadius: '10px 10px 0 0', padding: '2px', marginLeft: '8px',
            }}>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '8px 12px', border: 'none', borderRadius: '8px 8px 0 0',
                  background: viewMode === 'list' ? 'white' : 'transparent',
                  color: viewMode === 'list' ? '#1a2a6c' : 'rgba(255,255,255,0.6)',
                  fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                ☰
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                style={{
                  padding: '8px 12px', border: 'none', borderRadius: '8px 8px 0 0',
                  background: viewMode === 'calendar' ? 'white' : 'transparent',
                  color: viewMode === 'calendar' ? '#1a2a6c' : 'rgba(255,255,255,0.6)',
                  fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                🗓️
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENU */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '20px' }}>
        {viewMode === 'calendar' && renderCalendar()}

        {viewMode === 'list' && (
          <>
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
              filteredJobs.map(job => renderJobCard(job))
            )}
          </>
        )}
      </div>
    </div>
  );
}
