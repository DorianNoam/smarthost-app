// pages/upsells/[slug].js
// Page publique premium des upsells — accessible par le voyageur via lien partagé par l'hôte.
// Design premium style hôtel 5 étoiles.
// MODIF : ajout d'un champ optionnel "dates de séjour" pour permettre le rattachement
// automatique de la commande à la bonne réservation (utile pour la coordination ménage).

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabase';

const CATEGORY_LABELS = {
  flexibility:  { label: 'Flexibilité',     emoji: '🕐' },
  comfort:      { label: 'Confort',          emoji: '🛏️' },
  experience:   { label: 'Expériences',      emoji: '✨' },
  practical:    { label: 'Services',         emoji: '🛎️' },
  other:        { label: 'Autres',           emoji: '🎁' },
};

export default function UpsellsPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [property, setProperty] = useState(null);
  const [upsells, setUpsells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (slug) fetchData();
  }, [slug]);

  useEffect(() => {
    if (router.query.success === 'true') setSuccess(true);
  }, [router.query]);

  const fetchData = async () => {
    try {
      // Chercher le logement par slug ou id (détection UUID pour éviter les conflits)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
      const query = supabase
        .from('properties')
        .select('id, name, city, slug, owner_id')
        .eq('is_active', true);

      const { data: prop } = await (isUUID
        ? query.eq('id', slug)
        : query.eq('slug', slug)
      ).maybeSingle();

      if (!prop) { setLoading(false); return; }
      setProperty(prop);

      // Récupérer les upsells actifs
      const { data: ups } = await supabase
        .from('upsells')
        .select('*')
        .eq('property_id', prop.id)
        .eq('is_active', true)
        .order('category')
        .order('price');

      setUpsells(ups || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!selected) return;
    if (!guestName.trim()) { setError('Veuillez indiquer votre prénom.'); return; }

    setPaying(true);
    setError(null);

    try {
      const res = await fetch('/api/connect/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          upsellId:    selected.id,
          propertySlug: slug,
          guestName:   guestName.trim(),
          guestEmail:  guestEmail.trim() || null,
          notes:       notes.trim() || null,
          checkIn:     checkIn || null,
          checkOut:    checkOut || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de paiement');
      if (data.url) window.location.href = data.url;

    } catch (err) {
      setError(err.message);
      setPaying(false);
    }
  };

  // Grouper les upsells par catégorie
  const groupedUpsells = upsells.reduce((acc, up) => {
    const cat = up.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(up);
    return acc;
  }, {});

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎩</div>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>Chargement...</p>
      </div>
    </div>
  );

  if (!property) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: '20px', textAlign: 'center' }}>
      <div>
        <p style={{ fontSize: '48px', margin: '0 0 16px' }}>❌</p>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>Logement introuvable.</p>
      </div>
    </div>
  );

  if (success) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: '20px', textAlign: 'center' }}>
      <div>
        <div style={{ fontSize: '72px', marginBottom: '20px' }}>🎉</div>
        <h1 style={{ color: 'white', fontWeight: 900, fontSize: '28px', margin: '0 0 12px' }}>Merci pour votre commande !</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px', margin: '0 0 24px' }}>
          Votre hôte a été notifié et prendra contact avec vous prochainement.
        </p>
        <button
          onClick={() => { setSuccess(false); router.replace(`/upsells/${slug}`); }}
          style={{ background: '#d4af37', color: '#0f172a', border: 'none', padding: '14px 28px', borderRadius: '12px', fontWeight: 800, fontSize: '15px', cursor: 'pointer' }}
        >
          Commander autre chose
        </button>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '24px' }}>🎩 Alfred Major</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: "'Inter', sans-serif" }}>
      <Head>
        <title>Services & Expériences — {property.name}</title>
        <meta name="description" content={`Améliorez votre séjour à ${property.name} avec nos services premium.`} />
        <meta name="robots" content="noindex" />
      </Head>

      <style jsx global>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>

      {/* HEADER */}
      <div style={{ background: 'linear-gradient(135deg, #1a2a6c 0%, #0f172a 100%)', padding: '40px 20px 60px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎩</div>
        <p style={{ margin: '0 0 8px', color: 'rgba(255,255,255,0.5)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px' }}>
          Services & Expériences
        </p>
        <h1 style={{ margin: '0 0 8px', color: 'white', fontSize: '28px', fontWeight: 900 }}>{property.name}</h1>
        {property.city && <p style={{ margin: 0, color: '#d4af37', fontSize: '14px', fontWeight: 600 }}>📍 {property.city}</p>}
        <p style={{ margin: '16px auto 0', color: 'rgba(255,255,255,0.5)', fontSize: '13px', maxWidth: '400px', lineHeight: 1.6 }}>
          Personnalisez votre séjour avec nos services sur mesure. Commandez en quelques secondes, payez en toute sécurité.
        </p>
      </div>

      <div style={{ maxWidth: '600px', margin: '-20px auto 0', padding: '0 16px 60px', position: 'relative' }}>

        {upsells.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '20px', padding: '40px', textAlign: 'center' }}>
            <p style={{ fontSize: '40px', margin: '0 0 16px' }}>🎁</p>
            <p style={{ color: '#64748b', fontSize: '15px' }}>Aucun service disponible pour le moment.</p>
          </div>
        ) : (
          Object.entries(groupedUpsells).map(([category, items]) => {
            const catInfo = CATEGORY_LABELS[category] || CATEGORY_LABELS.other;
            return (
              <div key={category} style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', padding: '0 4px' }}>
                  <span style={{ fontSize: '18px' }}>{catInfo.emoji}</span>
                  <h2 style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {catInfo.label}
                  </h2>
                </div>

                {items.map(upsell => (
                  <div
                    key={upsell.id}
                    onClick={() => setSelected(selected?.id === upsell.id ? null : upsell)}
                    style={{
                      background: selected?.id === upsell.id ? 'white' : 'rgba(255,255,255,0.05)',
                      border: `2px solid ${selected?.id === upsell.id ? '#d4af37' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: '16px', padding: '18px', marginBottom: '10px',
                      cursor: 'pointer', transition: '0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{ fontSize: '28px' }}>{upsell.emoji}</span>
                        <div>
                          <p style={{ margin: '0 0 3px', fontWeight: 800, fontSize: '15px', color: selected?.id === upsell.id ? '#1a2a6c' : 'white' }}>
                            {upsell.name}
                          </p>
                          {upsell.description && (
                            <p style={{ margin: 0, fontSize: '13px', color: selected?.id === upsell.id ? '#64748b' : 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
                              {upsell.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                        <p style={{ margin: 0, fontWeight: 900, fontSize: '18px', color: selected?.id === upsell.id ? '#1a2a6c' : '#d4af37' }}>
                          {upsell.price} €
                        </p>
                        {selected?.id === upsell.id && (
                          <span style={{ fontSize: '12px', color: '#d4af37', fontWeight: 700 }}>✓ Sélectionné</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })
        )}

        {/* FORMULAIRE DE COMMANDE */}
        {selected && (
          <div style={{ background: 'white', borderRadius: '20px', padding: '24px', marginTop: '8px', border: '2px solid #d4af37' }}>
            <h3 style={{ margin: '0 0 4px', color: '#1a2a6c', fontSize: '18px', fontWeight: 800 }}>
              {selected.emoji} {selected.name}
            </h3>
            <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: '14px' }}>Complétez votre commande</p>

            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
              Votre prénom *
            </label>
            <input
              type="text"
              value={guestName}
              onChange={e => setGuestName(e.target.value)}
              placeholder="ex: Marie"
              style={{ width: '100%', padding: '13px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', marginBottom: '14px', fontFamily: 'inherit', outline: 'none', background: '#f8fafc' }}
            />

            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
              Email (pour le reçu, optionnel)
            </label>
            <input
              type="email"
              value={guestEmail}
              onChange={e => setGuestEmail(e.target.value)}
              placeholder="votre@email.com"
              style={{ width: '100%', padding: '13px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', marginBottom: '14px', fontFamily: 'inherit', outline: 'none', background: '#f8fafc' }}
            />

            {/* ── NOUVEAU : dates de séjour (optionnel) ── */}
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
              Dates de votre séjour (optionnel)
            </label>
            <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#94a3b8', lineHeight: 1.4 }}>
              Aide votre hôte à transmettre cette info à l'équipe de ménage si besoin.
            </p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
              <div style={{ flex: 1 }}>
                <input
                  type="date"
                  value={checkIn}
                  onChange={e => setCheckIn(e.target.value)}
                  style={{ width: '100%', padding: '13px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <input
                  type="date"
                  value={checkOut}
                  onChange={e => setCheckOut(e.target.value)}
                  style={{ width: '100%', padding: '13px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
              Note pour l'hôte (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="ex: Départ prévu à 14h, merci"
              style={{ width: '100%', padding: '13px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', marginBottom: '20px', fontFamily: 'inherit', outline: 'none', background: '#f8fafc', height: '80px', resize: 'vertical' }}
            />

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={paying}
              style={{
                width: '100%', padding: '16px', background: paying ? '#94a3b8' : '#1a2a6c',
                color: 'white', border: 'none', borderRadius: '14px',
                fontSize: '16px', fontWeight: 800, cursor: paying ? 'not-allowed' : 'pointer',
                transition: '0.2s', fontFamily: 'inherit',
              }}
            >
              {paying ? '⏳ Redirection vers le paiement...' : `💳 Payer ${selected.price} € en sécurité`}
            </button>

            <p style={{ margin: '12px 0 0', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
              🔒 Paiement sécurisé par Stripe · Pas de données bancaires stockées
            </p>
          </div>
        )}

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '12px', marginTop: '40px' }}>
          🎩 Alfred Major — L'excellence du service, à portée de clic
        </p>
      </div>
    </div>
  );
}
