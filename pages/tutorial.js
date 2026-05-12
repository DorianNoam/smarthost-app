import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

const STEPS = [
  { number: 1, badge: 'Étape 1', emoji: '🏠', title: 'Créez votre logement' },
  { number: 2, badge: 'Étape 2', emoji: '🎩', title: 'Dressez votre Majordome' },
  { number: 3, badge: 'Étape 3', emoji: '🔗', title: 'Partagez le lien voyageur' },
  { number: 4, badge: 'Étape 4', emoji: '🚨', title: 'Activez vos alertes urgences' },
];

export default function Tutorial() {
  const [user, setUser] = useState(null);
  const [activeStep, setActiveStep] = useState(1);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Détection de l'ancre #step-4 dans l'URL
  useEffect(() => {
    if (window.location.hash === '#step-4') {
      setActiveStep(4);
      setTimeout(() => {
        document.getElementById('step-4')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, []);

  const handleTelegramSmartLink = () => {
    const botName = "Alfred_Alerte_Bot";
    const userId = user?.id;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isMobile = isIOS || isAndroid;
    const appLink = `tg://resolve?domain=${botName}&start=${userId}`;
    const webLink = `https://t.me/${botName}?start=${userId}`;
    const playStore = "https://play.google.com/store/apps/details?id=org.telegram.messenger";
    const appStore = "https://apps.apple.com/app/telegram-messenger/id686449807";

    if (isMobile) {
      window.location.href = appLink;
      const start = Date.now();
      setTimeout(() => {
        if (Date.now() - start < 3500) {
          window.location.href = isIOS ? appStore : playStore;
        }
      }, 2500);
    } else {
      window.open(webLink, '_blank');
    }
  };

  const copyExampleMessage = () => {
    const msg = `Bonjour ! 👋\nPour toute question pendant votre séjour — WiFi, équipements, bonnes adresses — contactez mon assistant disponible 24h/24 via ce lien :\n👉 [VOTRE LIEN MARC]\n\nBon séjour ! 🎩`;
    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="page">
      <style jsx global>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #f8fafc; font-family: 'Inter', -apple-system, sans-serif; color: #1e293b; }
        a { text-decoration: none; color: inherit; }
      `}</style>
      <style jsx>{`
        .page { min-height: 100vh; padding: 0 0 80px; }

        /* ── Header ── */
        .top-bar {
          background: #1a2a6c; color: white; padding: 16px 24px;
          display: flex; align-items: center; gap: 16px;
          position: sticky; top: 0; z-index: 100;
          box-shadow: 0 2px 12px rgba(0,0,0,0.2);
        }
        .back-btn {
          background: rgba(255,255,255,0.12); border: none; color: white;
          padding: 8px 16px; border-radius: 8px; font-weight: 700;
          font-size: 14px; cursor: pointer; font-family: inherit;
          display: flex; align-items: center; gap: 6px; white-space: nowrap;
          transition: 0.2s;
        }
        .back-btn:hover { background: rgba(255,255,255,0.2); }
        .top-title { font-size: 18px; font-weight: 800; }
        .top-sub { font-size: 13px; opacity: 0.7; margin-left: auto; white-space: nowrap; }

        /* ── Progress bar ── */
        .progress-wrap { background: white; padding: 20px 24px; border-bottom: 1px solid #e2e8f0; }
        .progress-steps { display: flex; gap: 8px; max-width: 900px; margin: 0 auto; }
        .progress-step {
          flex: 1; display: flex; flex-direction: column; align-items: center;
          gap: 6px; cursor: pointer; transition: 0.2s;
        }
        .step-dot {
          width: 36px; height: 36px; border-radius: 50%; display: flex;
          align-items: center; justify-content: center; font-size: 16px;
          font-weight: 800; transition: 0.3s; border: 2px solid transparent;
        }
        .step-dot.done { background: #ecfdf5; color: #059669; border-color: #a7f3d0; }
        .step-dot.active { background: #1a2a6c; color: white; box-shadow: 0 4px 12px rgba(26,42,108,0.3); }
        .step-dot.idle { background: #f1f5f9; color: #94a3b8; border-color: #e2e8f0; }
        .step-label { font-size: 11px; font-weight: 600; color: #64748b; text-align: center; line-height: 1.3; }
        .step-label.active { color: #1a2a6c; font-weight: 800; }
        .progress-line { flex: 1; height: 2px; background: #e2e8f0; margin-top: 17px; border-radius: 2px; max-width: 40px; }
        .progress-line.done { background: #10b981; }

        /* ── Content ── */
        .content { max-width: 900px; margin: 0 auto; padding: 40px 20px; }

        /* ── Step card ── */
        .step-card {
          background: white; border-radius: 28px; padding: 40px;
          border: 1px solid #e2e8f0; margin-bottom: 24px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.04);
          scroll-margin-top: 80px;
        }
        .step-card.active { border-color: #1a2a6c; box-shadow: 0 8px 32px rgba(26,42,108,0.1); }
        .step-card.telegram-card { border-color: #0088cc; background: linear-gradient(135deg, #f0f9ff 0%, white 100%); }

        .card-header { display: flex; align-items: flex-start; gap: 20px; margin-bottom: 28px; }
        .card-emoji { font-size: 40px; flex-shrink: 0; }
        .card-meta { flex: 1; }
        .card-badge {
          background: #fbbf24; color: #1a2a6c; padding: 4px 12px;
          border-radius: 6px; font-size: 11px; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.5px;
          display: inline-block; margin-bottom: 8px;
        }
        .telegram-card .card-badge { background: #0088cc; color: white; }
        h2 { margin: 0; font-size: 22px; font-weight: 800; color: #1a2a6c; line-height: 1.2; }
        .card-desc { color: #64748b; font-size: 15px; line-height: 1.6; margin: 12px 0 0; }

        /* ── Feature grid ── */
        .feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 24px 0; }
        .feature-item {
          display: flex; align-items: center; gap: 12px;
          background: #f8fafc; padding: 14px 16px; border-radius: 14px;
          border: 1px solid #e2e8f0; font-size: 14px; font-weight: 600; color: #334155;
        }
        .feature-icon { font-size: 20px; flex-shrink: 0; }

        /* ── Info boxes ── */
        .info-box {
          background: #f8fafc; border-radius: 16px; padding: 20px;
          border: 1px solid #e2e8f0; margin: 20px 0;
        }
        .info-box-title { font-size: 13px; font-weight: 800; color: #475569; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }

        /* ── Message preview ── */
        .message-preview {
          background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 16px;
          padding: 20px; margin: 20px 0; font-size: 14px; line-height: 1.7;
          color: #1e293b; white-space: pre-line;
        }
        .msg-highlight { color: #0088cc; font-weight: 700; }

        /* ── Telegram specifics ── */
        .tg-steps { display: flex; flex-direction: column; gap: 16px; margin: 24px 0; }
        .tg-step { display: flex; align-items: flex-start; gap: 16px; }
        .tg-step-num {
          width: 32px; height: 32px; border-radius: 50%; background: #0088cc;
          color: white; display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 14px; flex-shrink: 0;
        }
        .tg-step-text { flex: 1; font-size: 14px; color: #475569; line-height: 1.5; padding-top: 4px; }
        .tg-step-text strong { color: #1e293b; }

        .download-btns { display: flex; gap: 12px; margin: 20px 0; }
        .btn-dl {
          flex: 1; padding: 14px; border-radius: 12px; font-size: 14px;
          font-weight: 700; text-decoration: none; display: flex;
          align-items: center; justify-content: center; gap: 8px; transition: 0.2s;
        }
        .btn-apple { background: #000; color: white; }
        .btn-apple:hover { background: #1a1a1a; }
        .btn-google { background: #34a853; color: white; }
        .btn-google:hover { background: #2d9447; }

        /* ── Buttons ── */
        .btn-primary {
          background: #1a2a6c; color: white; padding: 16px 28px;
          border-radius: 14px; font-weight: 800; font-size: 16px;
          border: none; cursor: pointer; font-family: inherit;
          display: inline-flex; align-items: center; gap: 10px;
          transition: 0.2s; width: 100%; justify-content: center;
        }
        .btn-primary:hover { background: #152259; transform: translateY(-1px); }

        .btn-telegram {
          background: #0088cc; color: white; padding: 18px 28px;
          border-radius: 14px; font-weight: 800; font-size: 16px;
          border: none; cursor: pointer; font-family: inherit;
          display: flex; align-items: center; justify-content: center;
          gap: 10px; transition: 0.2s; width: 100%;
          box-shadow: 0 4px 16px rgba(0,136,204,0.25);
        }
        .btn-telegram:hover { background: #0077b5; transform: translateY(-2px); }

        .btn-copy {
          background: ${copied ? '#ecfdf5' : '#f8fafc'};
          color: ${copied ? '#059669' : '#475569'};
          border: 1.5px solid ${copied ? '#a7f3d0' : '#e2e8f0'};
          padding: 14px 20px; border-radius: 12px; font-weight: 700;
          font-size: 14px; cursor: pointer; font-family: inherit;
          display: flex; align-items: center; gap: 8px;
          transition: 0.2s; width: 100%; justify-content: center; margin-top: 12px;
        }

        .btn-next {
          background: linear-gradient(135deg, #1a2a6c, #2a3f9f);
          color: white; padding: 16px 28px; border-radius: 14px;
          font-weight: 800; font-size: 15px; border: none; cursor: pointer;
          font-family: inherit; display: flex; align-items: center;
          justify-content: center; gap: 10px; transition: 0.2s;
          width: 100%; margin-top: 24px;
        }
        .btn-next:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(26,42,108,0.3); }

        /* ── Navigation bottom ── */
        .step-nav { display: flex; gap: 12px; margin-top: 16px; }
        .btn-prev {
          background: #f1f5f9; color: #64748b; padding: 14px 20px;
          border-radius: 12px; font-weight: 700; font-size: 14px;
          border: none; cursor: pointer; font-family: inherit;
          display: flex; align-items: center; gap: 6px; transition: 0.2s;
        }
        .btn-prev:hover { background: #e2e8f0; }

        /* ── CTA Footer ── */
        .cta-footer {
          background: linear-gradient(135deg, #1a2a6c, #2a3f9f);
          border-radius: 28px; padding: 50px 40px; text-align: center;
          color: white; margin-top: 40px;
        }
        .cta-footer h2 { margin: 0 0 12px; font-size: 28px; font-weight: 900; color: white; }
        .cta-footer p { margin: 0 0 30px; color: rgba(255,255,255,0.85); font-size: 16px; }
        .btn-cta {
          background: #fbbf24; color: #1a2a6c; padding: 18px 40px;
          border-radius: 50px; font-weight: 900; font-size: 18px;
          border: none; cursor: pointer; font-family: inherit;
          display: inline-flex; align-items: center; gap: 10px;
          transition: 0.2s; box-shadow: 0 8px 24px rgba(251,191,36,0.4);
        }
        .btn-cta:hover { transform: translateY(-3px); background: #fcd34d; }

        /* ── Tip box ── */
        .tip { background: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 14px 16px; font-size: 13px; color: #92400e; line-height: 1.5; margin: 16px 0; display: flex; gap: 10px; }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .top-bar { padding: 14px 16px; }
          .top-sub { display: none; }
          .top-title { font-size: 15px; }
          .progress-wrap { padding: 16px; }
          .step-label { display: none; }
          .step-dot { width: 30px; height: 30px; font-size: 14px; }
          .content { padding: 24px 16px; }
          .step-card { padding: 24px 18px; border-radius: 20px; }
          .card-header { gap: 14px; }
          .card-emoji { font-size: 32px; }
          h2 { font-size: 19px; }
          .feature-grid { grid-template-columns: 1fr; }
          .download-btns { flex-direction: column; }
          .btn-dl { width: 100%; }
          .cta-footer { padding: 36px 20px; }
          .cta-footer h2 { font-size: 22px; }
          .btn-cta { font-size: 16px; padding: 16px 28px; }
          .step-nav { flex-direction: column-reverse; }
          .btn-prev { justify-content: center; }
        }
      `}</style>

      {/* ── TOP BAR ── */}
      <div className="top-bar">
        <Link href="/dashboard" legacyBehavior>
          <a><button className="back-btn">← Dashboard</button></a>
        </Link>
        <span className="top-title">🎩 Guide de mise en route</span>
        <span className="top-sub">Étape {activeStep} / {STEPS.length}</span>
      </div>

      {/* ── PROGRESS BAR ── */}
      <div className="progress-wrap">
        <div className="progress-steps">
          {STEPS.map((s, i) => (
            <>
              <div
                key={s.number}
                className="progress-step"
                onClick={() => {
                  setActiveStep(s.number);
                  document.getElementById(`step-${s.number}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                <div className={`step-dot ${activeStep > s.number ? 'done' : activeStep === s.number ? 'active' : 'idle'}`}>
                  {activeStep > s.number ? '✓' : s.emoji}
                </div>
                <span className={`step-label ${activeStep === s.number ? 'active' : ''}`}>
                  {s.title}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div key={`line-${i}`} className={`progress-line ${activeStep > s.number ? 'done' : ''}`} />
              )}
            </>
          ))}
        </div>
      </div>

      <div className="content">

        {/* ══════════════════════════════ */}
        {/* ÉTAPE 1 — CRÉER LE LOGEMENT  */}
        {/* ══════════════════════════════ */}
        <div id="step-1" className={`step-card ${activeStep === 1 ? 'active' : ''}`}>
          <div className="card-header">
            <div className="card-emoji">🏠</div>
            <div className="card-meta">
              <span className="card-badge">Étape 1</span>
              <h2>Créez votre logement</h2>
              <p className="card-desc">
                Donnez une identité à votre bien. C'est la base sur laquelle Marc va se construire — nom, adresse, localisation GPS pour que vos voyageurs le trouvent sans effort.
              </p>
            </div>
          </div>

          <div className="info-box">
            <div className="info-box-title">📋 Ce que vous allez renseigner</div>
            <div className="feature-grid">
              <div className="feature-item"><span className="feature-icon">🏷️</span> Nom du logement</div>
              <div className="feature-item"><span className="feature-icon">📍</span> Adresse complète</div>
              <div className="feature-item"><span className="feature-icon">🗺️</span> Lien GPS Google Maps</div>
              <div className="feature-item"><span className="feature-icon">🏢</span> Bâtiment & Étage</div>
            </div>
          </div>

          <div className="tip">
            💡 <span><strong>Conseil :</strong> Copiez l'URL Google Maps de votre logement et collez-la dans le champ GPS — Marc l'enverra directement au voyageur qui demande son chemin.</span>
          </div>

          <div className="step-nav">
            <button className="btn-next" onClick={() => { setActiveStep(2); document.getElementById('step-2')?.scrollIntoView({ behavior: 'smooth' }); }}>
              Continuer → Étape 2 : Configurer Marc
            </button>
          </div>

          <Link href="/add-property" legacyBehavior>
            <a><button className="btn-primary" style={{marginTop: '12px', background: '#fbbf24', color: '#1a2a6c'}}>
              🏠 Créer mon logement maintenant
            </button></a>
          </Link>
        </div>

        {/* ══════════════════════════════ */}
        {/* ÉTAPE 2 — CONFIGURER MARC    */}
        {/* ══════════════════════════════ */}
        <div id="step-2" className={`step-card ${activeStep === 2 ? 'active' : ''}`}>
          <div className="card-header">
            <div className="card-emoji">🎩</div>
            <div className="card-meta">
              <span className="card-badge">Étape 2</span>
              <h2>Dressez votre Majordome</h2>
              <p className="card-desc">
                Plus Marc en sait sur votre logement, mieux il répond. Remplissez les 10 piliers de sa formation — il sera opérationnel en 5 minutes.
              </p>
            </div>
          </div>

          <div className="feature-grid">
            <div className="feature-item"><span className="feature-icon">🔑</span> Arrivée & Code d'accès</div>
            <div className="feature-item"><span className="feature-icon">📶</span> WiFi & Réseau</div>
            <div className="feature-item"><span className="feature-icon">🗑️</span> Poubelles & Tri</div>
            <div className="feature-item"><span className="feature-icon">☕</span> Électroménager</div>
            <div className="feature-item"><span className="feature-icon">📜</span> Règlement & Règles</div>
            <div className="feature-item"><span className="feature-icon">🚌</span> Transports proches</div>
            <div className="feature-item"><span className="feature-icon">🍕</span> Bonnes adresses</div>
            <div className="feature-item"><span className="feature-icon">🚒</span> Contacts d'urgence</div>
            <div className="feature-item"><span className="feature-icon">💡</span> Électricité & Eau</div>
            <div className="feature-item"><span className="feature-icon">🧳</span> Instructions départ</div>
          </div>

          <div className="tip">
            💡 <span><strong>Astuce :</strong> Vous n'avez pas besoin de tout remplir d'un coup. Commencez par WiFi, code d'accès et instructions d'arrivée — ce sont les 3 questions les plus fréquentes.</span>
          </div>

          <div className="step-nav">
            <button className="btn-prev" onClick={() => { setActiveStep(1); document.getElementById('step-1')?.scrollIntoView({ behavior: 'smooth' }); }}>
              ← Étape 1
            </button>
            <button className="btn-next" onClick={() => { setActiveStep(3); document.getElementById('step-3')?.scrollIntoView({ behavior: 'smooth' }); }}>
              Continuer → Étape 3 : Partager le lien
            </button>
          </div>
        </div>

        {/* ══════════════════════════════ */}
        {/* ÉTAPE 3 — PARTAGER LE LIEN  */}
        {/* ══════════════════════════════ */}
        <div id="step-3" className={`step-card ${activeStep === 3 ? 'active' : ''}`}>
          <div className="card-header">
            <div className="card-emoji">🔗</div>
            <div className="card-meta">
              <span className="card-badge">Étape 3</span>
              <h2>Partagez le lien voyageur</h2>
              <p className="card-desc">
                Chaque logement a son propre lien unique. Copiez-le depuis votre dashboard et intégrez-le dans votre message d'accueil Airbnb ou Booking.
              </p>
            </div>
          </div>

          <div className="info-box">
            <div className="info-box-title">📍 Où trouver votre lien Marc ?</div>
            <div style={{fontSize: '14px', color: '#475569', lineHeight: '1.8'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px'}}>
                <span style={{background: '#1a2a6c', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', flexShrink: 0}}>1</span>
                Allez sur votre <strong>Dashboard → votre logement</strong>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px'}}>
                <span style={{background: '#1a2a6c', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', flexShrink: 0}}>2</span>
                Cliquez sur <strong>"✨ Lien Voyageur (Copier)"</strong>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <span style={{background: '#1a2a6c', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', flexShrink: 0}}>3</span>
                Collez dans votre message de bienvenue Airbnb / Booking
              </div>
            </div>
          </div>

          <div className="info-box" style={{marginTop: '20px'}}>
            <div className="info-box-title">✉️ Exemple de message à envoyer à vos voyageurs</div>
            <div className="message-preview">
{`Bonjour ! 👋

Pour toute question pendant votre séjour — WiFi, équipements, bonnes adresses dans le quartier — contactez mon assistant disponible 24h/24 via ce lien :

👉 `}<span className="msg-highlight">majormarc.fr/m/villa-noam</span>{`

Bon séjour ! 🎩`}
            </div>
            <button className="btn-copy" onClick={copyExampleMessage}>
              {copied ? '✅ Message copié !' : '📋 Copier ce modèle de message'}
            </button>
          </div>

          <div className="tip">
            💡 <span><strong>Pro tip :</strong> Sur Airbnb, allez dans <strong>Messagerie → Réponses rapides</strong> et créez une réponse automatique "Instructions d'arrivée" avec le lien Marc dedans. Zéro effort à chaque nouvelle réservation.</span>
          </div>

          <div className="step-nav">
            <button className="btn-prev" onClick={() => { setActiveStep(2); document.getElementById('step-2')?.scrollIntoView({ behavior: 'smooth' }); }}>
              ← Étape 2
            </button>
            <button className="btn-next" onClick={() => { setActiveStep(4); document.getElementById('step-4')?.scrollIntoView({ behavior: 'smooth' }); }}>
              Continuer → Étape 4 : Alertes Telegram
            </button>
          </div>
        </div>

        {/* ══════════════════════════════ */}
        {/* ÉTAPE 4 — TELEGRAM          */}
        {/* ══════════════════════════════ */}
        <div id="step-4" className={`step-card telegram-card ${activeStep === 4 ? 'active' : ''}`}>
          <div className="card-header">
            <div className="card-emoji">🚨</div>
            <div className="card-meta">
              <span className="card-badge">Étape 4</span>
              <h2>Activez vos alertes urgences</h2>
              <p className="card-desc">
                C'est votre filet de sécurité. Si un voyageur signale une urgence (fuite, panne, blocage), Marc vous alerte <strong>instantanément</strong> sur Telegram — même à 3h du matin.
              </p>
            </div>
          </div>

          <div className="tg-steps">
            <div className="tg-step">
              <div className="tg-step-num">1</div>
              <div className="tg-step-text">
                <strong>Téléchargez Telegram</strong> sur votre téléphone si vous ne l'avez pas encore.
                <div className="download-btns" style={{marginTop: '12px'}}>
                  <a href="https://apps.apple.com/app/telegram-messenger/id686449807" target="_blank" rel="noopener noreferrer" className="btn-dl btn-apple">
                    🍎 App Store (iPhone)
                  </a>
                  <a href="https://play.google.com/store/apps/details?id=org.telegram.messenger" target="_blank" rel="noopener noreferrer" className="btn-dl btn-google">
                    🤖 Google Play (Android)
                  </a>
                </div>
              </div>
            </div>

            <div className="tg-step">
              <div className="tg-step-num">2</div>
              <div className="tg-step-text">
                <strong>Cliquez sur le bouton ci-dessous</strong> pour ouvrir le bot Marc directement dans Telegram.
              </div>
            </div>

            <div className="tg-step">
              <div className="tg-step-num">3</div>
              <div className="tg-step-text">
                Dans l'application Telegram, appuyez sur <strong>"DÉMARRER"</strong> (ou "START"). C'est tout — vous êtes connecté !
              </div>
            </div>
          </div>

          <button onClick={handleTelegramSmartLink} className="btn-telegram">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            Lier mon compte Telegram maintenant
          </button>

          <div className="tip" style={{marginTop: '16px'}}>
            ⚡ <span>Une fois lié, la bannière d'alerte rouge disparaît de votre dashboard et le badge passe au vert dans vos paramètres.</span>
          </div>

          <div className="step-nav">
            <button className="btn-prev" onClick={() => { setActiveStep(3); document.getElementById('step-3')?.scrollIntoView({ behavior: 'smooth' }); }}>
              ← Étape 3
            </button>
          </div>
        </div>

        {/* ── CTA FINAL ── */}
        <div className="cta-footer">
          <h2>🎉 Vous êtes prêt !</h2>
          <p>Marc est configuré et opérationnel. Vos voyageurs vont adorer.</p>
          <Link href="/dashboard" legacyBehavior>
            <a><button className="btn-cta">
              🏠 Retour à mes logements
            </button></a>
          </Link>
        </div>

      </div>
    </div>
  );
}
