import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { supabase } from '../lib/supabase';

const STEPS = [
  { number: 1, emoji: '🏠', title: 'Créer le logement' },
  { number: 2, emoji: '🎩', title: 'Configurer Alfred' },
  { number: 3, emoji: '🔗', title: 'Lien voyageur' },
  { number: 4, emoji: '🚨', title: 'Alertes urgences' },
  { number: 5, emoji: '🧹', title: 'Ménage auto' },
  { number: 6, emoji: '💰', title: 'Upsells' },
  { number: 7, emoji: '📅', title: 'Calendrier iCal' },
  { number: 8, emoji: '🎁', title: 'Parrainage' },
];

export default function Tutorial() {
  const [user, setUser] = useState(null);
  const [activeStep, setActiveStep] = useState(1);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/#step-(\d+)/);
    if (match) {
      const n = parseInt(match[1]);
      setActiveStep(n);
      setTimeout(() => document.getElementById(`step-${n}`)?.scrollIntoView({ behavior: 'smooth' }), 300);
    }
  }, []);

  const goTo = (n) => {
    setActiveStep(n);
    setTimeout(() => document.getElementById(`step-${n}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const handleTelegramSmartLink = () => {
    const botName = "Alfred_Alerte_Bot";
    const userId = user?.id;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isMobile = isIOS || isAndroid;
    if (isMobile) {
      window.location.href = `tg://resolve?domain=${botName}&start=${userId}`;
      const start = Date.now();
      setTimeout(() => {
        if (Date.now() - start < 3500) window.location.href = isIOS
          ? "https://apps.apple.com/app/telegram-messenger/id686449807"
          : "https://play.google.com/store/apps/details?id=org.telegram.messenger";
      }, 2500);
    } else {
      window.open(`https://t.me/${botName}?start=${userId}`, '_blank');
    }
  };

  const copyExampleMessage = () => {
    navigator.clipboard.writeText(`Bonjour ! 👋\nPour toute question pendant votre séjour — WiFi, équipements, bonnes adresses — contactez mon assistant disponible 24h/24 via ce lien :\n👉 [VOTRE LIEN ALFRED]\n\nBon séjour ! 🎩`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // ── Helpers de style ──
  const card = (n) => ({
    scrollMarginTop: '80px',
    background: activeStep === n ? '#fff' : '#fff',
    borderRadius: '20px',
    padding: '36px',
    border: `1px solid ${activeStep === n ? '#1d1d1f' : '#e8e8ed'}`,
    marginBottom: '12px',
    boxShadow: activeStep === n ? '0 8px 32px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
    transition: '0.3s',
  });

  const badge = (color = '#c9a227', textColor = '#1d1d1f') => ({
    background: color, color: textColor,
    padding: '3px 10px', borderRadius: '980px',
    fontSize: '11px', fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: '0.3px',
    display: 'inline-block', marginBottom: '10px',
  });

  const h2style = { fontSize: '22px', fontWeight: '600', color: '#1d1d1f', margin: '0 0 8px', letterSpacing: '-0.4px' };
  const desc = { fontSize: '15px', color: '#6e6e73', lineHeight: 1.65, margin: 0, fontWeight: '300', letterSpacing: '-0.1px' };
  const tip = { background: '#fffbeb', border: '1px solid #f5d58a', borderRadius: '12px', padding: '14px 16px', fontSize: '13px', color: '#92400e', lineHeight: 1.6, display: 'flex', gap: '10px', marginBottom: '24px', fontWeight: '300' };
  const infoBox = { background: '#f5f5f7', borderRadius: '14px', padding: '20px', border: '1px solid #e8e8ed', marginBottom: '20px' };
  const infoTitle = { fontSize: '11px', fontWeight: '600', color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 14px' };
  const featureItem = { display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e8e8ed', fontSize: '14px', fontWeight: '400', color: '#1d1d1f', letterSpacing: '-0.1px' };
  const featureItemGray = { ...featureItem, background: '#f5f5f7' };
  const btnDark = { flex: 1, background: '#1d1d1f', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.2px', transition: '0.2s' };
  const btnBack = { background: '#f5f5f7', color: '#6e6e73', border: '1px solid #e8e8ed', padding: '14px 20px', borderRadius: '12px', fontWeight: '400', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.1px', flexShrink: 0 };
  const stepNum = (color = '#1d1d1f') => ({ width: '24px', height: '24px', borderRadius: '50%', background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600', flexShrink: 0, marginTop: '1px' });

  return (
    <>
      <Head>
        <title>Guide complet d'utilisation — Alfred Major</title>
        <meta name="description" content="Guide complet pour configurer et utiliser Alfred Major : logement, majordome IA, ménage, upsells, calendrier, parrainage." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-font-smoothing: antialiased; scroll-behavior: smooth; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #f5f5f7; color: #1d1d1f; }
        a { text-decoration: none; color: inherit; }
        @media (max-width: 640px) {
          .progress-label { display: none; }
          .step-dot-wrap { min-width: 36px !important; }
          .step-dot { width: 34px !important; height: 34px !important; font-size: 16px !important; }
          .step-card-inner { padding: 22px 18px !important; }
          .feat-grid { grid-template-columns: 1fr !important; }
          .nav-btns { flex-direction: column-reverse; }
          .dl-btns { flex-direction: column; }
          .cta-block { padding: 36px 20px !important; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>

        {/* ── TOP BAR ── */}
        <div style={{ background: '#1d1d1f', color: '#fff', padding: '0 28px', height: '60px', display: 'flex', alignItems: 'center', gap: '16px', position: 'sticky', top: 0, zIndex: 100 }}>
          <Link href="/dashboard" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: '7px 14px', borderRadius: '980px', fontSize: '13px', fontWeight: '400', display: 'inline-flex', alignItems: 'center', gap: '6px', letterSpacing: '-0.1px' }}>
            ← Dashboard
          </Link>
          <span style={{ fontSize: '15px', fontWeight: '500', letterSpacing: '-0.2px' }}>🎩 Guide complet d'utilisation</span>
          <span style={{ marginLeft: 'auto', fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: '300' }}>Étape {activeStep} / {STEPS.length}</span>
        </div>

        {/* ── PROGRESS BAR ── */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e8e8ed', padding: '16px 24px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', minWidth: 'max-content', maxWidth: '1100px', margin: '0 auto' }}>
            {STEPS.map((s, i) => (
              <div key={s.number} style={{ display: 'contents' }}>
                <div className="step-dot-wrap" onClick={() => goTo(s.number)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', minWidth: '70px' }}>
                  <div className="step-dot" style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '17px', fontWeight: '600', transition: '0.25s',
                    background: activeStep > s.number ? '#f0fdf4' : activeStep === s.number ? '#1d1d1f' : '#f5f5f7',
                    color: activeStep > s.number ? '#15803d' : activeStep === s.number ? '#fff' : '#aeaeb2',
                    border: activeStep > s.number ? '1px solid #bbf7d0' : activeStep === s.number ? 'none' : '1px solid #e8e8ed',
                    boxShadow: activeStep === s.number ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                  }}>
                    {activeStep > s.number ? '✓' : s.emoji}
                  </div>
                  <span className="progress-label" style={{ fontSize: '10px', fontWeight: activeStep === s.number ? '600' : '400', color: activeStep === s.number ? '#1d1d1f' : '#86868b', textAlign: 'center', lineHeight: 1.3, letterSpacing: '-0.1px', maxWidth: '64px' }}>
                    {s.title}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ width: '28px', height: '2px', background: activeStep > s.number ? '#c9a227' : '#e8e8ed', borderRadius: '2px', marginBottom: '18px', flexShrink: 0, transition: '0.3s' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 20px' }}>

          {/* ════════════════════════════ */}
          {/* ÉTAPE 1 — CRÉER LOGEMENT   */}
          {/* ════════════════════════════ */}
          <div id="step-1" className="step-card-inner" style={card(1)}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '28px' }}>
              <span style={{ fontSize: '40px', flexShrink: 0, lineHeight: 1 }}>🏠</span>
              <div>
                <span style={badge()}>Étape 1</span>
                <h2 style={h2style}>Créez votre logement</h2>
                <p style={desc}>Donnez une identité à votre bien. C'est la base sur laquelle Alfred va se construire — nom, adresse, localisation GPS pour que vos voyageurs le trouvent sans effort.</p>
              </div>
            </div>

            <div style={infoBox}>
              <p style={infoTitle}>📋 Ce que vous allez renseigner</p>
              <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[['🏷️','Nom du logement'], ['📍','Adresse complète'], ['🗺️','Lien GPS Google Maps'], ['🏢','Bâtiment & Étage']].map(([icon, label]) => (
                  <div key={label} style={featureItem}><span style={{ fontSize: '18px' }}>{icon}</span>{label}</div>
                ))}
              </div>
            </div>

            <div style={tip}>
              <span>💡</span>
              <span><strong style={{ fontWeight: '500' }}>Conseil :</strong> Copiez l'URL Google Maps de votre logement et collez-la dans le champ GPS — Alfred l'enverra directement au voyageur qui demande son chemin.</span>
            </div>

            <div className="nav-btns" style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => goTo(2)} style={btnDark}>Continuer → Étape 2 : Configurer Alfred</button>
            </div>
            <Link href="/add-property" style={{ display: 'block', width: '100%', background: '#c9a227', color: '#1d1d1f', borderRadius: '12px', padding: '14px', fontSize: '15px', fontWeight: '600', textAlign: 'center', letterSpacing: '-0.2px', marginTop: '10px' }}>
              🏠 Créer mon logement maintenant
            </Link>
          </div>

          {/* ════════════════════════════ */}
          {/* ÉTAPE 2 — CONFIGURER ALFRED */}
          {/* ════════════════════════════ */}
          <div id="step-2" className="step-card-inner" style={card(2)}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '28px' }}>
              <span style={{ fontSize: '40px', flexShrink: 0, lineHeight: 1 }}>🎩</span>
              <div>
                <span style={badge()}>Étape 2</span>
                <h2 style={h2style}>Dressez votre Majordome</h2>
                <p style={desc}>Plus Alfred en sait sur votre logement, mieux il répond. Remplissez les 10 sections de sa formation — il sera opérationnel en 5 minutes.</p>
              </div>
            </div>

            <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
              {[['🔑','Arrivée & Code d\'accès'], ['📶','WiFi & Réseau'], ['🗑️','Poubelles & Tri'], ['☕','Électroménager & TV'], ['📜','Règlement & Bruit'], ['🚌','Transports proches'], ['🍕','Bonnes adresses locales'], ['🚒','Contacts d\'urgence'], ['💡','Tableau élec. & Vanne eau'], ['🧳','Instructions de départ']].map(([icon, label]) => (
                <div key={label} style={featureItemGray}><span style={{ fontSize: '18px' }}>{icon}</span>{label}</div>
              ))}
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#15803d', margin: '0 0 6px' }}>✅ Bon à savoir</p>
              <p style={{ fontSize: '13px', color: '#166534', margin: 0, fontWeight: '300', lineHeight: 1.6 }}>Vos modifications sont prises en compte <strong style={{ fontWeight: '500' }}>immédiatement</strong>. Alfred utilise toujours la version la plus récente de votre base de connaissance à chaque réponse.</p>
            </div>

            <div style={tip}>
              <span>💡</span>
              <span><strong style={{ fontWeight: '500' }}>Astuce :</strong> Commencez par WiFi, code d'accès et instructions d'arrivée — ce sont les 3 questions les plus fréquentes. Vous complétez le reste à votre rythme.</span>
            </div>

            <div className="nav-btns" style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => goTo(1)} style={btnBack}>← Étape 1</button>
              <button onClick={() => goTo(3)} style={btnDark}>Continuer → Étape 3 : Lien voyageur</button>
            </div>
          </div>

          {/* ════════════════════════════ */}
          {/* ÉTAPE 3 — LIEN VOYAGEUR    */}
          {/* ════════════════════════════ */}
          <div id="step-3" className="step-card-inner" style={card(3)}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '28px' }}>
              <span style={{ fontSize: '40px', flexShrink: 0, lineHeight: 1 }}>🔗</span>
              <div>
                <span style={badge()}>Étape 3</span>
                <h2 style={h2style}>Partagez le lien voyageur</h2>
                <p style={desc}>Chaque logement a un lien unique. Copiez-le depuis votre dashboard et intégrez-le dans votre message d'accueil Airbnb ou Booking. Le voyageur accède à Alfred sans téléchargement, sans inscription.</p>
              </div>
            </div>

            <div style={infoBox}>
              <p style={infoTitle}>📍 Où trouver votre lien Alfred ?</p>
              {[['Dashboard → votre logement', ''],['Cliquez sur', '✨ Lien Voyageur (Copier)'],['Collez dans votre', 'message de bienvenue Airbnb / Booking']].map(([pre, bold], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: i < 2 ? '12px' : 0 }}>
                  <div style={stepNum()}>{i + 1}</div>
                  <p style={{ fontSize: '14px', color: '#6e6e73', margin: 0, fontWeight: '300', lineHeight: 1.55 }}>
                    {pre}{bold && <> <strong style={{ color: '#1d1d1f', fontWeight: '500' }}>{bold}</strong></>}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ background: '#f0f8ff', border: '1px solid #b3d9f7', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
              <p style={{ fontSize: '11px', fontWeight: '600', color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 14px' }}>✉️ Exemple de message à envoyer à vos voyageurs</p>
              <div style={{ fontSize: '14px', lineHeight: 1.75, color: '#1d1d1f', fontWeight: '300', whiteSpace: 'pre-line' }}>
{`Bonjour ! 👋

Pour toute question pendant votre séjour — WiFi, équipements, bonnes adresses dans le quartier — contactez mon assistant disponible 24h/24 via ce lien :

👉 `}<span style={{ color: '#0088cc', fontWeight: '500' }}>alfredmajor.com/m/villa-noam</span>{`

Bon séjour ! 🎩`}
              </div>
              <button onClick={copyExampleMessage} style={{ width: '100%', marginTop: '14px', background: copied ? '#f0fdf4' : '#fff', color: copied ? '#15803d' : '#6e6e73', border: `1px solid ${copied ? '#bbf7d0' : '#e8e8ed'}`, padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', transition: '0.2s', letterSpacing: '-0.1px' }}>
                {copied ? '✅ Message copié !' : '📋 Copier ce modèle de message'}
              </button>
            </div>

            <div style={{ background: '#f5f5f7', borderRadius: '14px', padding: '18px 20px', marginBottom: '20px', border: '1px solid #e8e8ed' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#1d1d1f', margin: '0 0 10px', letterSpacing: '-0.2px' }}>💬 Ce qu'Alfred sait faire pour vos voyageurs</p>
              <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {[['🔑','Donner le code WiFi'], ['📍','Indiquer le chemin GPS'], ['🍽️','Recommander des restaurants'], ['🚌','Trouver les transports'], ['🛁','Expliquer les équipements'], ['🗑️','Indiquer les poubelles'], ['🧳','Donner les instructions départ'], ['🆘','Gérer les urgences']].map(([icon, label]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6e6e73', fontWeight: '300', padding: '6px 0' }}>
                    <span>{icon}</span> {label}
                  </div>
                ))}
              </div>
            </div>

            <div style={tip}>
              <span>💡</span>
              <span><strong style={{ fontWeight: '500' }}>Pro tip :</strong> Sur Airbnb, allez dans <strong style={{ fontWeight: '500' }}>Messagerie → Réponses rapides</strong> et créez une réponse "Instructions d'arrivée" avec le lien Alfred. Zéro effort à chaque réservation.</span>
            </div>

            <div className="nav-btns" style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => goTo(2)} style={btnBack}>← Étape 2</button>
              <button onClick={() => goTo(4)} style={btnDark}>Continuer → Étape 4 : Alertes</button>
            </div>
          </div>

          {/* ════════════════════════════ */}
          {/* ÉTAPE 4 — TELEGRAM         */}
          {/* ════════════════════════════ */}
          <div id="step-4" className="step-card-inner" style={{ ...card(4), background: activeStep === 4 ? '#f0f8ff' : '#fff', border: `1px solid ${activeStep === 4 ? '#0088cc' : '#e8e8ed'}`, boxShadow: activeStep === 4 ? '0 8px 32px rgba(0,136,204,0.1)' : '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '28px' }}>
              <span style={{ fontSize: '40px', flexShrink: 0, lineHeight: 1 }}>🚨</span>
              <div>
                <span style={badge('#0088cc', '#fff')}>Étape 4</span>
                <h2 style={h2style}>Activez vos alertes urgences</h2>
                <p style={desc}>C'est votre filet de sécurité. Si un voyageur signale une urgence (fuite, panne, gaz, blocage), Alfred vous alerte <strong style={{ color: '#1d1d1f', fontWeight: '500' }}>instantanément</strong> sur Telegram avec le message traduit en français.</p>
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e8e8ed', borderRadius: '14px', padding: '18px 20px', marginBottom: '20px' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#1d1d1f', margin: '0 0 12px', letterSpacing: '-0.2px' }}>🔔 Que reçoit-on sur Telegram ?</p>
              <div style={{ background: '#f5f5f7', border: '1px solid #e8e8ed', borderRadius: '12px', padding: '14px' }}>
                <p style={{ fontSize: '13px', color: '#1d1d1f', margin: 0, lineHeight: 1.7, fontWeight: '300' }}>
                  🚨 <strong style={{ fontWeight: '500' }}>ALERTE ALFRED MAJOR</strong><br/>
                  🏠 Villa Noam — Paris<br/>
                  💬 "Il y a une énorme fuite sous l'évier !"<br/>
                  🔄 <em>Traduction : Water leak under the sink</em><br/>
                  ⚠️ Contactez votre voyageur au plus vite.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '28px' }}>
              {[
                { n: 1, content: <div><strong style={{ fontWeight: '500', color: '#1d1d1f' }}>Téléchargez Telegram</strong><span style={{ color: '#6e6e73', fontWeight: '300' }}> si vous ne l'avez pas encore.</span>
                  <div className="dl-btns" style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                    <a href="https://apps.apple.com/app/telegram-messenger/id686449807" target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: '11px', background: '#1d1d1f', color: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>🍎 App Store</a>
                    <a href="https://play.google.com/store/apps/details?id=org.telegram.messenger" target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: '11px', background: '#34a853', color: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>🤖 Google Play</a>
                  </div>
                </div> },
                { n: 2, content: <p style={{ fontSize: '14px', color: '#6e6e73', margin: 0, fontWeight: '300', lineHeight: 1.55 }}><strong style={{ color: '#1d1d1f', fontWeight: '500' }}>Cliquez sur le bouton ci-dessous</strong> pour ouvrir le bot Alfred directement dans Telegram.</p> },
                { n: 3, content: <p style={{ fontSize: '14px', color: '#6e6e73', margin: 0, fontWeight: '300', lineHeight: 1.55 }}>Dans Telegram, appuyez sur <strong style={{ color: '#1d1d1f', fontWeight: '500' }}>"DÉMARRER"</strong> (ou "START"). C'est tout — vous êtes connecté !</p> },
              ].map(({ n, content }) => (
                <div key={n} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0088cc', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '14px', flexShrink: 0 }}>{n}</div>
                  <div style={{ flex: 1, paddingTop: '4px' }}>{content}</div>
                </div>
              ))}
            </div>

            <button onClick={handleTelegramSmartLink} style={{ width: '100%', background: '#0088cc', color: '#fff', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: '500', fontSize: '16px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', letterSpacing: '-0.2px', boxShadow: '0 4px 16px rgba(0,136,204,0.25)', marginBottom: '16px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              Lier mon compte Telegram maintenant
            </button>

            <div style={{ ...tip, marginBottom: '24px' }}>
              <span>⚡</span>
              <span>Une fois lié, la bannière rouge disparaît de votre dashboard et le badge passe au vert dans vos paramètres.</span>
            </div>

            <div className="nav-btns" style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => goTo(3)} style={btnBack}>← Étape 3</button>
              <button onClick={() => goTo(5)} style={btnDark}>Continuer → Étape 5 : Ménage auto</button>
            </div>
          </div>

          {/* ════════════════════════════ */}
          {/* ÉTAPE 5 — MÉNAGE AUTO      */}
          {/* ════════════════════════════ */}
          <div id="step-5" className="step-card-inner" style={card(5)}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '28px' }}>
              <span style={{ fontSize: '40px', flexShrink: 0, lineHeight: 1 }}>🧹</span>
              <div>
                <span style={badge()}>Étape 5</span>
                <h2 style={h2style}>Automatisez votre ménage</h2>
                <p style={desc}>Alfred détecte chaque nouvelle réservation et notifie automatiquement votre prestataire de ménage. Il peut confirmer sa mission, envoyer des photos et consulter la checklist — tout depuis son téléphone.</p>
              </div>
            </div>

            <div style={{ background: '#f5f5f7', borderRadius: '14px', padding: '20px', border: '1px solid #e8e8ed', marginBottom: '20px' }}>
              <p style={infoTitle}>🔄 Comment ça fonctionne</p>
              {[
                ['📅', 'Alfred détecte une nouvelle réservation via votre lien iCal (étape 7)'],
                ['📲', 'Votre prestataire reçoit une notification Telegram avec les détails du logement'],
                ['✅', 'Il confirme la mission, coche sa checklist et envoie des photos depuis l\'app web dédiée'],
                ['🔔', 'Vous recevez une confirmation avant chaque arrivée de voyageur'],
              ].map(([icon, text], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: i < 3 ? '12px' : 0 }}>
                  <span style={{ fontSize: '20px', flexShrink: 0, lineHeight: 1, marginTop: '1px' }}>{icon}</span>
                  <p style={{ fontSize: '14px', color: '#6e6e73', margin: 0, fontWeight: '300', lineHeight: 1.55 }}>{text}</p>
                </div>
              ))}
            </div>

            <div style={infoBox}>
              <p style={infoTitle}>👨‍🔧 Inviter votre prestataire de ménage</p>
              {[
                ['Dans votre dashboard, ouvrez un logement actif'],
                ['Cliquez sur l\'onglet', '🧹 Ménage'],
                ['Renseignez le nom et l\'email de votre prestataire'],
                ['Cliquez sur', '✉️ Envoyer l\'invitation'],
                ['Votre prestataire reçoit un email avec son accès dédié'],
              ].map(([pre, bold], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: i < 4 ? '10px' : 0 }}>
                  <div style={stepNum()}>{i + 1}</div>
                  <p style={{ fontSize: '14px', color: '#6e6e73', margin: 0, fontWeight: '300', lineHeight: 1.55 }}>
                    {pre}{bold && <> <strong style={{ color: '#1d1d1f', fontWeight: '500' }}>{bold}</strong></>}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ background: '#f5f5f7', borderRadius: '14px', padding: '18px 20px', marginBottom: '20px', border: '1px solid #e8e8ed' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#1d1d1f', margin: '0 0 10px', letterSpacing: '-0.2px' }}>📋 La checklist de ménage</p>
              <p style={{ fontSize: '13px', color: '#6e6e73', margin: '0 0 12px', fontWeight: '300', lineHeight: 1.6 }}>Créez une checklist personnalisée pour chaque logement. Votre prestataire la retrouve directement dans son interface et coche chaque tâche au fur et à mesure.</p>
              <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {['Changer les draps', 'Vider les poubelles', 'Nettoyer la salle de bain', 'Réapprovisionner savon/papier', 'Vérifier le WiFi', 'Envoyer les photos de confirmation'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6e6e73', fontWeight: '300', padding: '5px 0' }}>
                    <span style={{ color: '#15803d', fontWeight: '600' }}>✓</span> {item}
                  </div>
                ))}
              </div>
            </div>

            <div style={tip}>
              <span>💡</span>
              <span><strong style={{ fontWeight: '500' }}>Important :</strong> Pour que le ménage automatique fonctionne, vous devez d'abord ajouter votre lien iCal (étape 7). C'est ce lien qui permet à Alfred de détecter les nouvelles réservations.</span>
            </div>

            <div className="nav-btns" style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => goTo(4)} style={btnBack}>← Étape 4</button>
              <button onClick={() => goTo(6)} style={btnDark}>Continuer → Étape 6 : Upsells</button>
            </div>
          </div>

          {/* ════════════════════════════ */}
          {/* ÉTAPE 6 — UPSELLS          */}
          {/* ════════════════════════════ */}
          <div id="step-6" className="step-card-inner" style={card(6)}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '28px' }}>
              <span style={{ fontSize: '40px', flexShrink: 0, lineHeight: 1 }}>💰</span>
              <div>
                <span style={badge()}>Étape 6</span>
                <h2 style={h2style}>Activez les upsells</h2>
                <p style={desc}>Proposez des services additionnels à vos voyageurs directement via Alfred. Ils paient en ligne, l'argent arrive sur votre compte Stripe. Alfred Major ne prend aucune commission.</p>
              </div>
            </div>

            <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
              {[['🕐','Late check-out (ex: 30€)'], ['🌅','Early check-in (ex: 25€)'], ['🥂','Pack romantique (ex: 45€)'], ['🧹','Ménage mi-séjour (ex: 35€)'], ['🚗','Transfert aéroport (ex: 50€)'], ['👶','Pack bébé (ex: 20€)']].map(([icon, label]) => (
                <div key={label} style={featureItemGray}><span style={{ fontSize: '18px' }}>{icon}</span>{label}</div>
              ))}
            </div>

            <div style={infoBox}>
              <p style={infoTitle}>⚙️ Mise en place en 3 étapes</p>
              {[
                ['Allez dans', 'Paramètres → Revenus & Upsells'],
                ['Connectez votre compte Stripe', '(bouton "Connecter mon compte Stripe")'],
                ['Dans votre dashboard, onglet', '💰 Upsells → Ajouter un service'],
              ].map(([pre, bold], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: i < 2 ? '10px' : 0 }}>
                  <div style={stepNum()}>{i + 1}</div>
                  <p style={{ fontSize: '14px', color: '#6e6e73', margin: 0, fontWeight: '300', lineHeight: 1.55 }}>
                    {pre} <strong style={{ color: '#1d1d1f', fontWeight: '500' }}>{bold}</strong>
                  </p>
                </div>
              ))}
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px 18px', marginBottom: '20px' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#15803d', margin: '0 0 8px' }}>💶 Comment Alfred propose les upsells ?</p>
              <p style={{ fontSize: '13px', color: '#166534', margin: 0, fontWeight: '300', lineHeight: 1.65 }}>
                Lorsqu'un voyageur demande naturellement (ex: "Est-ce qu'on peut partir à 14h ?"), Alfred détecte l'intention et propose automatiquement votre service de late check-out avec le prix et le lien de paiement. Vous n'avez rien à faire.
              </p>
            </div>

            <div style={tip}>
              <span>💡</span>
              <span><strong style={{ fontWeight: '500' }}>0% de commission :</strong> Contrairement à Airbnb qui prend jusqu'à 15% sur les extras, Alfred Major ne prend rien. 100% de vos revenus vont directement sur votre compte Stripe.</span>
            </div>

            <div className="nav-btns" style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => goTo(5)} style={btnBack}>← Étape 5</button>
              <button onClick={() => goTo(7)} style={btnDark}>Continuer → Étape 7 : Calendrier iCal</button>
            </div>
          </div>

          {/* ════════════════════════════ */}
          {/* ÉTAPE 7 — ICAL SYNC        */}
          {/* ════════════════════════════ */}
          <div id="step-7" className="step-card-inner" style={card(7)}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '28px' }}>
              <span style={{ fontSize: '40px', flexShrink: 0, lineHeight: 1 }}>📅</span>
              <div>
                <span style={badge()}>Étape 7</span>
                <h2 style={h2style}>Synchronisez votre calendrier</h2>
                <p style={desc}>Connectez votre calendrier Airbnb ou Booking via un lien iCal. Alfred synchronise vos réservations en temps réel et déclenche automatiquement les notifications de ménage à chaque nouvelle arrivée détectée.</p>
              </div>
            </div>

            <div style={infoBox}>
              <p style={infoTitle}>🔗 Récupérer votre lien iCal Airbnb</p>
              {[
                'Allez sur Airbnb → Calendrier → votre logement',
                'Cliquez sur "Disponibilité" puis "Exporter le calendrier"',
                'Copiez le lien iCal (commence par webcal:// ou https://)',
                'Dans Alfred : Configurer le logement → champ "Lien iCal"',
                'Sauvegardez — la synchronisation est immédiate',
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: i < 4 ? '10px' : 0 }}>
                  <div style={stepNum()}>{i + 1}</div>
                  <p style={{ fontSize: '14px', color: '#6e6e73', margin: 0, fontWeight: '300', lineHeight: 1.55 }}>{step}</p>
                </div>
              ))}
            </div>

            <div style={infoBox}>
              <p style={infoTitle}>🔗 Récupérer votre lien iCal Booking.com</p>
              {[
                'Allez sur Booking.com → Extranet → Calendrier',
                'Cliquez sur "Synchronisation du calendrier"',
                'Copiez l\'adresse de votre calendrier (format iCal)',
                'Collez-la dans Alfred → Configuration → Lien iCal',
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: i < 3 ? '10px' : 0 }}>
                  <div style={stepNum('#0369a1')}>{i + 1}</div>
                  <p style={{ fontSize: '14px', color: '#6e6e73', margin: 0, fontWeight: '300', lineHeight: 1.55 }}>{step}</p>
                </div>
              ))}
            </div>

            <div style={{ background: '#f5f5f7', borderRadius: '14px', padding: '18px 20px', marginBottom: '20px', border: '1px solid #e8e8ed' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#1d1d1f', margin: '0 0 10px', letterSpacing: '-0.2px' }}>📊 Ce qu'Alfred fait avec vos réservations</p>
              <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {[['📅','Affiche le calendrier dans votre dashboard'], ['🧹','Notifie le prestataire ménage automatiquement'], ['👤','Affiche le nom du voyageur et les dates'], ['🔄','Se synchronise à chaque visite du dashboard']].map(([icon, label]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6e6e73', fontWeight: '300', padding: '5px 0' }}>
                    <span>{icon}</span> {label}
                  </div>
                ))}
              </div>
            </div>

            <div style={tip}>
              <span>💡</span>
              <span><strong style={{ fontWeight: '500' }}>Multi-plateformes :</strong> Vous pouvez avoir des réservations sur Airbnb ET Booking en même temps — Alfred consolide les deux calendriers et évite les doublons.</span>
            </div>

            <div className="nav-btns" style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => goTo(6)} style={btnBack}>← Étape 6</button>
              <button onClick={() => goTo(8)} style={btnDark}>Continuer → Étape 8 : Parrainage</button>
            </div>
          </div>

          {/* ════════════════════════════ */}
          {/* ÉTAPE 8 — PARRAINAGE       */}
          {/* ════════════════════════════ */}
          <div id="step-8" className="step-card-inner" style={card(8)}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '28px' }}>
              <span style={{ fontSize: '40px', flexShrink: 0, lineHeight: 1 }}>🎁</span>
              <div>
                <span style={badge()}>Étape 8</span>
                <h2 style={h2style}>Programme de parrainage</h2>
                <p style={desc}>Partagez Alfred Major à d'autres hôtes. Dès qu'un filleul active son premier logement, vous gagnez automatiquement 2 mois offerts — et lui 1 mois. Il n'y a pas de limite de parrainages.</p>
              </div>
            </div>

            <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#fffbeb', border: '1px solid #f5d58a', borderRadius: '14px', padding: '20px', textAlign: 'center' }}>
                <p style={{ fontSize: '48px', fontWeight: '300', color: '#c9a227', letterSpacing: '-2px', margin: '0 0 6px', lineHeight: 1 }}>2</p>
                <p style={{ fontSize: '13px', color: '#92400e', margin: 0, fontWeight: '400', letterSpacing: '-0.1px' }}>mois offerts pour vous</p>
              </div>
              <div style={{ background: '#f5f5f7', border: '1px solid #e8e8ed', borderRadius: '14px', padding: '20px', textAlign: 'center' }}>
                <p style={{ fontSize: '48px', fontWeight: '300', color: '#6e6e73', letterSpacing: '-2px', margin: '0 0 6px', lineHeight: 1 }}>1</p>
                <p style={{ fontSize: '13px', color: '#6e6e73', margin: 0, fontWeight: '400', letterSpacing: '-0.1px' }}>mois offert pour votre filleul</p>
              </div>
            </div>

            <div style={infoBox}>
              <p style={infoTitle}>🔗 Récupérer et partager votre lien</p>
              {[
                ['Allez dans', 'Paramètres → 🎁 Parrainage'],
                ['Copiez votre lien unique', '(alfredmajor.com/register?ref=VOTRECODE)'],
                ['Partagez-le à des hôtes', 'Airbnb, Facebook, WhatsApp, Instagram...'],
                ['Dès activation d\'un filleul', 'les mois offerts sont crédités automatiquement'],
              ].map(([pre, bold], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: i < 3 ? '10px' : 0 }}>
                  <div style={stepNum()}>{i + 1}</div>
                  <p style={{ fontSize: '14px', color: '#6e6e73', margin: 0, fontWeight: '300', lineHeight: 1.55 }}>
                    {pre} <strong style={{ color: '#1d1d1f', fontWeight: '500' }}>{bold}</strong>
                  </p>
                </div>
              ))}
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px 18px', marginBottom: '20px' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#15803d', margin: '0 0 8px' }}>📊 Suivre vos parrainages</p>
              <p style={{ fontSize: '13px', color: '#166534', margin: '0 0 10px', fontWeight: '300', lineHeight: 1.6 }}>
                Dans vos paramètres vous voyez en temps réel : le nombre de filleuls actifs, les mois offerts gagnés et les économies totales réalisées.
              </p>
              <p style={{ fontSize: '13px', color: '#166534', margin: 0, fontWeight: '300', lineHeight: 1.6 }}>
                <strong style={{ fontWeight: '500' }}>Exemple :</strong> 5 filleuls actifs = 10 mois offerts = 99€ économisés sur votre abonnement.
              </p>
            </div>

            <div style={{ background: '#f5f5f7', borderRadius: '14px', padding: '18px 20px', marginBottom: '20px', border: '1px solid #e8e8ed' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#1d1d1f', margin: '0 0 10px', letterSpacing: '-0.2px' }}>💬 Idées de partage</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  '📘 Groupes Facebook d\'hôtes Airbnb (ex: "Hôtes Airbnb France")',
                  '📸 Story Instagram avec votre retour d\'expérience',
                  '💬 WhatsApp à d\'autres hôtes de votre réseau',
                  '🎥 TikTok : montrez Alfred en action avec une question type',
                ].map((item, i) => (
                  <p key={i} style={{ fontSize: '13px', color: '#6e6e73', margin: 0, fontWeight: '300', lineHeight: 1.55 }}>{item}</p>
                ))}
              </div>
            </div>

            <div style={tip}>
              <span>💡</span>
              <span><strong style={{ fontWeight: '500' }}>Pas de limite :</strong> Il n'y a aucune limite au nombre de parrainages. Théoriquement, votre abonnement peut descendre à 0€ si vous parrainez suffisamment d'hôtes.</span>
            </div>

            <div className="nav-btns" style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => goTo(7)} style={btnBack}>← Étape 7</button>
            </div>
          </div>

          {/* ── CTA FINAL ── */}
          <div className="cta-block" style={{ background: '#1d1d1f', borderRadius: '20px', padding: '52px 40px', textAlign: 'center', marginTop: '8px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ fontSize: '28px', fontWeight: '600', color: '#fff', letterSpacing: '-0.8px', margin: '0 0 12px' }}>Vous maîtrisez Alfred Major !</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', fontWeight: '300', margin: '0 0 12px', letterSpacing: '-0.1px' }}>Logement configuré · Alertes actives · Ménage automatisé · Upsells en ligne · Parrainage lancé.</p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px', fontWeight: '300', margin: '0 0 32px', letterSpacing: '-0.1px' }}>Vos voyageurs vont adorer. Et vous allez enfin dormir tranquille.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
              <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#c9a227', color: '#1d1d1f', padding: '17px 40px', borderRadius: '980px', fontWeight: '600', fontSize: '16px', letterSpacing: '-0.2px', boxShadow: '0 8px 24px rgba(201,162,39,0.35)' }}>
                🏠 Retour à mes logements
              </Link>
              <Link href="/settings" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: '300', letterSpacing: '-0.1px', marginTop: '4px' }}>
                ⚙️ Aller dans mes paramètres
              </Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
