// pages/support.js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

const CATEGORIES = [
  { value: 'technique', label: '🔧 Problème technique', desc: 'Bug, erreur, fonctionnalité qui ne marche pas' },
  { value: 'facturation', label: '💳 Facturation', desc: 'Abonnement, paiement, facture' },
  { value: 'configuration', label: '⚙️ Configuration', desc: 'Aide pour configurer un logement ou une fonctionnalité' },
  { value: 'alfred', label: '🎩 Alfred ne répond pas bien', desc: 'Réponse incorrecte ou inappropriée de l\'IA' },
  { value: 'general', label: '💬 Question générale', desc: 'Autre question ou suggestion' },
];

const FAQ = [
  { q: 'Comment partager le lien Alfred à mes voyageurs ?', a: 'Depuis votre dashboard, cliquez sur "✨ Lien Voyageur (Copier)" — un message tout prêt est copié dans votre presse-papier, prêt à coller dans Airbnb ou Booking.' },
  { q: 'Alfred ne répond plus à mes voyageurs, pourquoi ?', a: 'Vérifiez que votre logement est bien activé (fond vert dans le dashboard) et que votre abonnement est actif. Si votre essai gratuit est terminé, réactivez votre compte en ajoutant une carte de paiement.' },
  { q: 'Comment recevoir les alertes urgences ?', a: 'Allez dans Paramètres → liez votre compte Telegram en cliquant sur "Lier Telegram". Vous recevrez une alerte instantanée dès qu\'Alfred détecte une urgence.' },
  { q: 'Puis-je modifier les infos de mon logement ?', a: 'Oui, depuis le dashboard cliquez sur "📊 Configurer le logement" sur la card de votre logement. Les modifications sont prises en compte immédiatement.' },
  { q: 'Comment résilier mon abonnement ?', a: 'Depuis le dashboard, cliquez sur "Accéder au portail" dans la section Gestion des abonnements. Vous pouvez résilier à tout moment, sans frais.' },
  { q: 'Alfred parle-t-il vraiment 30 langues ?', a: 'Oui, Alfred détecte automatiquement la langue de votre voyageur et répond dans sa langue, sans configuration de votre part.' },
];

export default function Support() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({ category: '', subject: '', message: '' });

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      const { data: prof } = await supabase.from('profiles').select('full_name, email').eq('id', user.id).single();
      if (prof) setProfile(prof);
      setLoading(false);
    };
    init();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.subject || !form.message) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setSending(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
        setForm({ category: '', subject: '', message: '' });
      } else {
        setError(data.error || "Erreur lors de l'envoi.");
      }
    } catch (err) {
      setError("Erreur de connexion. Réessayez.");
    } finally {
      setSending(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif', background: '#f5f5f7', color: '#86868b' }}>
      Chargement...
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      <Head>
        <title>Support — Alfred Major</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f5f5f7; -webkit-font-smoothing: antialiased; }
        a { text-decoration: none !important; color: inherit; }
        .sidebar { width: 220px; background: #1d1d1f; color: #fff; padding: 28px 16px; position: fixed; height: 100vh; z-index: 200; display: flex; flex-direction: column; transition: transform 0.3s ease; }
        .main-content { margin-left: 220px; padding: 40px; }
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); width: 280px; }
          .sidebar.open { transform: translateX(0); }
          .main-content { margin-left: 0; padding: 16px; padding-top: 72px; }
          .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 150; }
          .sidebar-overlay.open { display: block; }
          .mobile-topbar { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-topbar { display: none !important; }
          .sidebar-overlay { display: none !important; }
        }
      `}</style>

      {/* Mobile topbar */}
      <div className="mobile-topbar" style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '60px', background: '#1d1d1f', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 100 }}>
        <span style={{ fontSize: '17px', fontWeight: '600', color: '#fff' }}>Alfred<span style={{ color: '#c9a227' }}>Major</span> 🎩</span>
        <button onClick={() => setMenuOpen(true)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '8px 10px', cursor: 'pointer', fontSize: '18px', color: '#fff' }}>☰</button>
      </div>

      <div className={`sidebar-overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} />

      {/* Sidebar */}
      <nav className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div style={{ fontSize: '17px', fontWeight: '600', marginBottom: '36px', textAlign: 'center', letterSpacing: '-0.3px' }}>
          Alfred<span style={{ color: '#c9a227' }}>Major</span> 🎩
        </div>
        {[
          { href: '/dashboard', label: 'Logements', icon: '🏠' },
          { href: '/settings', label: 'Paramètres', icon: '⚙️' },
          { href: '/support', label: 'Support', icon: '💬', active: true },
        ].map(({ href, label, icon, active }) => (
          <Link key={href} href={href} onClick={() => setMenuOpen(false)} style={{ padding: '13px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: active ? '500' : '400', fontSize: '15px', opacity: active ? 1 : 0.6, marginBottom: '4px', color: active ? '#c9a227' : '#fff', background: active ? 'rgba(255,255,255,0.08)' : 'transparent', transition: '0.2s' }}>
            <span>{icon}</span><span>{label}</span>
          </Link>
        ))}
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link href="/tutorial" onClick={() => setMenuOpen(false)} style={{ display: 'block', background: '#c9a227', color: '#1d1d1f', padding: '11px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>
            ❓ Comment ça marche ?
          </Link>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/'); }} style={{ width: '100%', padding: '11px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: '400', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>
            🚪 Déconnexion
          </button>
        </div>
      </nav>

      {/* Main */}
      <main className="main-content" style={{ maxWidth: '760px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '600', color: '#1d1d1f', letterSpacing: '-0.6px', marginBottom: '6px' }}>Support</h1>
        <p style={{ fontSize: '15px', color: '#86868b', fontWeight: '300', marginBottom: '32px' }}>
          Bonjour {profile?.full_name || ''} — comment pouvons-nous vous aider ?
        </p>

        {/* FAQ */}
        <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e8e8ed', marginBottom: '24px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f5f5f7' }}>
            <h2 style={{ fontSize: '17px', fontWeight: '600', color: '#1d1d1f', margin: 0 }}>❓ Questions fréquentes</h2>
          </div>
          {FAQ.map((item, i) => (
            <div key={i} style={{ borderBottom: i < FAQ.length - 1 ? '1px solid #f5f5f7' : 'none' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', padding: '16px 24px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', fontFamily: 'inherit' }}>
                <span style={{ fontSize: '15px', fontWeight: '500', color: '#1d1d1f' }}>{item.q}</span>
                <span style={{ fontSize: '18px', color: '#86868b', flexShrink: 0, transition: '0.2s', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 24px 16px', fontSize: '14px', color: '#6e6e73', lineHeight: 1.65, fontWeight: '300' }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Formulaire */}
        <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e8e8ed', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f5f5f7' }}>
            <h2 style={{ fontSize: '17px', fontWeight: '600', color: '#1d1d1f', margin: 0 }}>✉️ Nous contacter</h2>
            <p style={{ fontSize: '13px', color: '#86868b', margin: '4px 0 0', fontWeight: '300' }}>Réponse sous 24h — généralement bien plus rapide</p>
          </div>

          <div style={{ padding: '24px' }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ fontSize: '52px', marginBottom: '16px' }}>✅</div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1d1d1f', margin: '0 0 8px' }}>Message envoyé !</h3>
                <p style={{ fontSize: '15px', color: '#86868b', fontWeight: '300', margin: '0 0 24px' }}>Nous vous répondrons sur <strong>{profile?.email}</strong> dans les meilleurs délais.</p>
                <button onClick={() => setSent(false)} style={{ background: '#f5f5f7', border: 'none', padding: '12px 24px', borderRadius: '980px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', color: '#1d1d1f', fontFamily: 'inherit' }}>
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Catégorie */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6e6e73', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                    Catégorie
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {CATEGORIES.map(cat => (
                      <button key={cat.value} type="button" onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                        style={{ padding: '12px 16px', borderRadius: '12px', border: `1px solid ${form.category === cat.value ? '#1d1d1f' : '#e8e8ed'}`, background: form.category === cat.value ? '#1d1d1f' : '#f5f5f7', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: '0.15s' }}>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: form.category === cat.value ? '#fff' : '#1d1d1f', display: 'block' }}>{cat.label}</span>
                        <span style={{ fontSize: '12px', color: form.category === cat.value ? 'rgba(255,255,255,0.6)' : '#86868b', fontWeight: '300' }}>{cat.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sujet */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6e6e73', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '7px' }}>Sujet</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    placeholder="Résumez votre demande en une phrase"
                    style={{ width: '100%', background: '#f5f5f7', border: '1px solid #e8e8ed', borderRadius: '12px', padding: '14px 16px', fontSize: '15px', color: '#1d1d1f', outline: 'none', fontFamily: 'inherit' }}
                  />
                </div>

                {/* Message */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6e6e73', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '7px' }}>Message</label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Décrivez votre problème ou question en détail..."
                    rows={5}
                    style={{ width: '100%', background: '#f5f5f7', border: '1px solid #e8e8ed', borderRadius: '12px', padding: '14px 16px', fontSize: '15px', color: '#1d1d1f', outline: 'none', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6 }}
                  />
                </div>

                {error && (
                  <div style={{ background: '#fff2f2', border: '1px solid #ffd0d0', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', fontSize: '14px', color: '#c00' }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={sending} style={{ width: '100%', background: sending ? '#aeaeb2' : '#1d1d1f', color: '#fff', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '16px', fontWeight: '500', cursor: sending ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}>
                  {sending ? '⏳ Envoi en cours...' : 'Envoyer mon message →'}
                </button>

                <p style={{ marginTop: '12px', textAlign: 'center', fontSize: '13px', color: '#86868b', fontWeight: '300' }}>
                  Réponse sur <strong>{profile?.email}</strong> · Généralement sous 24h
                </p>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
