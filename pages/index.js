import Link from 'next/link';

export default function Home() {
  return (
    <div className="container">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

        :global(a) { text-decoration: none; color: inherit; }
        :global(html), :global(body) { margin: 0; padding: 0; overflow-x: hidden; width: 100%; background-color: #fafafa; }
        
        .container { font-family: 'Inter', sans-serif; color: #0f172a; width: 100%; }

        /* --- NAVBAR --- */
        nav {
          display: flex; justify-content: space-between; align-items: center; padding: 15px 5%;
          position: fixed; top: 0; left: 0; right: 0; background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px); z-index: 1000; box-shadow: 0 1px 10px rgba(0,0,0,0.05); box-sizing: border-box;
        }
        .brand { display: flex; align-items: center; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 24px; font-weight: 800; color: #1a2a6c; cursor: pointer; letter-spacing: -0.5px; }
        .gold { color: #d4af37; }
        .nav-links { display: flex; align-items: center; gap: 30px; }
        .nav-link { color: #1e293b; font-weight: 500; font-size: 15px; transition: 0.3s; cursor: pointer; }
        .nav-link:hover { color: #d4af37; }
        .nav-login { font-weight: 600; color: #1a2a6c; padding: 10px 24px; border: 2px solid #1a2a6c; border-radius: 50px; font-size: 15px; transition: 0.3s; cursor: pointer; }
        .nav-login:hover { background: #1a2a6c; color: white; }

        /* --- HERO SECTION --- */
        .hero {
          position: relative; min-height: 85vh; display: flex; align-items: center; justify-content: center;
          text-align: center; padding: 140px 20px 80px; box-sizing: border-box;
          background: linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.9)), url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80') center/cover;
        }
        .hero-content { max-width: 950px; z-index: 10; margin: 0 auto; display: flex; flex-direction: column; align-items: center; }
        .badge-hero { background: rgba(212, 175, 55, 0.15); color: #d4af37; padding: 8px 16px; border-radius: 30px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 25px; border: 1px solid rgba(212, 175, 55, 0.3); }
        h1 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(38px, 6vw, 64px); color: white; margin-bottom: 25px; line-height: 1.1; font-weight: 800; letter-spacing: -1px; }
        .subtitle { font-size: clamp(16px, 3vw, 20px); margin-bottom: 40px; color: #cbd5e1; line-height: 1.6; font-weight: 400; max-width: 800px; }
        
        .cta-main {
          background-color: #d4af37; color: #1a2a6c; padding: 20px 45px; border-radius: 50px; font-weight: 700; font-size: 16px;
          box-shadow: 0 10px 30px rgba(212, 175, 55, 0.3); display: inline-block; transition: 0.3s; cursor: pointer; letter-spacing: 0.5px;
        }
        .cta-main:hover { transform: translateY(-3px); background-color: #fff; box-shadow: 0 15px 40px rgba(255, 255, 255, 0.2); }

        /* --- PAIN POINTS --- */
        .pain-section { padding: 100px 5%; background: #fff; text-align: center; }
        .pain-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(28px, 5vw, 40px); color: #0f172a; margin-bottom: 15px; font-weight: 800; letter-spacing: -0.5px; }
        .pain-subtitle { font-size: 18px; color: #64748b; margin-bottom: 60px; font-weight: 400; }
        .pain-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; max-width: 1100px; margin: 0 auto; }
        .pain-card { background: #f8fafc; padding: 40px 30px; border-radius: 20px; text-align: left; transition: 0.3s; border: 1px solid #e2e8f0; }
        .pain-card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.04); border-color: #d4af37; }
        .pain-icon-wrapper { width: 50px; height: 50px; background: rgba(26, 42, 108, 0.05); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; color: #1a2a6c; }
        .pain-card h3 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 20px; color: #0f172a; margin-bottom: 15px; font-weight: 700; }
        .pain-card p { color: #475569; line-height: 1.6; font-size: 15px; }

        /* --- DEMO SECTION --- */
        .demo-section { padding: 100px 5%; background: #0f172a; color: white; overflow: hidden; }
        .demo-header { text-align: center; margin-bottom: 70px; }
        .demo-header h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(28px, 5vw, 42px); margin-bottom: 20px; font-weight: 800; letter-spacing: -1px; }
        
        .demo-layout { display: flex; flex-direction: column; gap: 60px; max-width: 1100px; margin: 0 auto; align-items: center; }
        @media (min-width: 1024px) { .demo-layout { flex-direction: row; justify-content: space-between; align-items: center; } }
        
        .phone-wrapper { position: relative; width: 100%; max-width: 340px; margin: 0 auto; }
        .phone-frame { border: 10px solid #1e293b; border-radius: 40px; background: white; height: 650px; overflow: hidden; position: relative; box-shadow: 0 30px 60px rgba(0,0,0,0.5); }
        .phone-notch { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 120px; height: 25px; background: #1e293b; border-bottom-left-radius: 15px; border-bottom-right-radius: 15px; z-index: 10; }
        
        .chat-app { display: flex; flex-direction: column; height: 100%; background: #f0f2f5; }
        .chat-header { background: #075e54; color: white; padding: 40px 20px 15px; text-align: center; font-weight: 600; font-size: 15px; font-family: 'Plus Jakarta Sans', sans-serif; }
        .chat-body { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; }
        
        .msg { padding: 12px 16px; border-radius: 15px; font-size: 13.5px; line-height: 1.5; max-width: 85%; position: relative; color: #111; }
        .msg-user { background: #dcf8c6; align-self: flex-end; border-bottom-right-radius: 2px; }
        .msg-marc { background: white; align-self: flex-start; border-bottom-left-radius: 2px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .msg-time { display: block; font-size: 10px; color: #888; text-align: right; margin-top: 5px; }

        .demo-features { flex: 1; max-width: 500px; }
        .feat-row { margin-bottom: 40px; display: flex; gap: 20px; align-items: flex-start; }
        .feat-icon-wrapper { background: rgba(212, 175, 55, 0.1); color: #d4af37; width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .feat-text h4 { font-size: 20px; margin-bottom: 10px; color: white; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; }
        .feat-text p { color: #94a3b8; line-height: 1.6; font-size: 15px; margin: 0; }

        /* --- THE KILLER FEATURE (L'alerte) --- */
        .killer-feature { background: #fff; padding: 60px 40px; margin: 80px auto 0; max-width: 1000px; border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.08); display: flex; flex-wrap: wrap; align-items: center; gap: 40px; }
        .kf-text { flex: 1; min-width: 300px; }
        .kf-text span { color: #ef4444; font-weight: 700; letter-spacing: 1px; font-size: 13px; text-transform: uppercase; }
        .kf-text h3 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(24px, 4vw, 32px); color: #0f172a; margin: 15px 0; font-weight: 800; letter-spacing: -0.5px; }
        .kf-text p { color: #475569; line-height: 1.6; font-size: 15px; margin-bottom: 15px; }
        .notif-mockup { flex: 1; min-width: 300px; background: #f8fafc; padding: 25px; border-radius: 20px; border: 1px solid #e2e8f0; width: 100%; box-sizing: border-box; }
        .notif-bubble { background: white; padding: 20px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border-left: 4px solid #ef4444; }
        .notif-head { display: flex; justify-content: space-between; font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 10px; }
        .notif-bubble b { color: #0f172a; }

        /* --- PRICING ANCHOR --- */
        .pricing-anchor { padding: 100px 5%; background: #f8fafc; text-align: center; }
        .anchor-box { max-width: 800px; margin: 0 auto; }
        .anchor-box h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(28px, 5vw, 40px); color: #0f172a; margin-bottom: 20px; font-weight: 800; letter-spacing: -1px; }
        .anchor-box p { font-size: 16px; color: #475569; margin-bottom: 40px; line-height: 1.6; }
        .price-highlight { font-size: clamp(48px, 8vw, 64px); font-weight: 800; color: #1a2a6c; font-family: 'Plus Jakarta Sans', sans-serif; display: block; margin: 20px 0; }
        .price-highlight span { font-size: 18px; color: #64748b; font-family: 'Inter', sans-serif; font-weight: 500; }
        
        /* --- FOOTER --- */
        footer { padding: 40px 5%; text-align: center; background: #0f172a; color: #64748b; font-size: 14px; }

        /* --- OPTIMISATION MOBILE GLOBALE CORRIGÉE --- */
        @media (max-width: 768px) {
          nav { padding: 15px 20px; }
          .brand { font-size: 20px; }
          .nav-links { gap: 15px; } /* On garde les liens visibles, mais plus rapprochés */
          .nav-link { font-size: 14px; }
          .nav-login { padding: 8px 16px; font-size: 13px; }
          
          .hero { padding: 120px 15px 60px; }
          .pain-section { padding: 60px 5%; }
          .demo-section { padding: 60px 5%; }
          .killer-feature { flex-direction: column; padding: 30px 20px; margin: 40px auto 0; text-align: center; }
          .notif-mockup { padding: 15px; }
          .demo-features { text-align: left; }
        }

        /* Sur les très petits téléphones, on cache "Tarifs" pour garantir que le bouton "Espace Hôte" reste sur la même ligne */
        @media (max-width: 380px) {
          .nav-link { display: none; }
        }
      `}</style>

      {/* NAVIGATION */}
      <nav>
        <Link href="/" passHref legacyBehavior>
          <a className="brand">Major<span className="gold">Marc</span></a>
        </Link>
        <div className="nav-links">
          <Link href="/pricing" passHref legacyBehavior><a className="nav-link">Tarifs</a></Link>
          <Link href="/login" passHref legacyBehavior><a className="nav-login">Espace Hôte</a></Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-content">
          <span className="badge-hero">L'Intelligence Artificielle de location</span>
          <h1>Dormez sur vos deux oreilles.<br/>Marc gère vos voyageurs.</h1>
          <p className="subtitle">
            Le premier majordome IA qui répond aux questions 24h/24, recommande les meilleurs restaurants locaux, et vous alerte uniquement en cas d'urgence.
          </p>
          <Link href="/register" passHref legacyBehavior>
            <a className="cta-main">Engager mon Majordome (Essai gratuit)</a>
          </Link>
        </div>
      </section>

      {/* PAIN POINTS avec SVG modernes */}
      <section className="pain-section">
        <h2 className="pain-title">La gestion locative réinventée</h2>
        <p className="pain-subtitle">Déléguez les tâches chronophages à une IA parfaitement formée.</p>
        <div className="pain-grid">
          <div className="pain-card">
            <div className="pain-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <h3>Le message à 23h30</h3>
            <p>Le voyageur arrive tard et ne trouve pas le code Wifi. Votre téléphone sonne pendant votre sommeil. Laissez Marc s'en charger.</p>
          </div>
          <div className="pain-card">
            <div className="pain-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            </div>
            <h3>La barrière de la langue</h3>
            <p>Oubliez Google Translate pour expliquer les poubelles à des touristes étrangers. Marc parle couramment plus de 30 langues.</p>
          </div>
          <div className="pain-card">
            <div className="pain-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>
            </div>
            <h3>Les questions répétées</h3>
            <p>"Où est le supermarché ?", "À quelle heure est le départ ?". Marc répond inlassablement, avec la même politesse.</p>
          </div>
        </div>
      </section>

      {/* DEMO SECTION */}
      <section className="demo-section">
        <div className="demo-header">
          <h2>L'illusion parfaite d'une conciergerie</h2>
          <p style={{fontSize: '16px', color: '#cbd5e1', maxWidth: '700px', margin: '0 auto'}}>Marc comprend le contexte, cherche sur le web pour des recommandations locales, et répond dans un langage naturel impeccable.</p>
        </div>

        <div className="demo-layout">
          {/* Faux Téléphone */}
          <div className="phone-wrapper">
            <div className="phone-frame">
              <div className="phone-notch"></div>
              <div className="chat-app">
                <div className="chat-header">La Villa Noam</div>
                <div className="chat-body">
                  <div className="msg msg-user">
                    Hi! Just arrived. Where can I park my car and do you know a good place to eat pizza around here?
                    <span className="msg-time">19:42</span>
                  </div>
                  <div className="msg msg-marc">
                    Welcome to Villa Noam! 🎩<br/><br/>
                    You can park safely in the private driveway behind the white gate. The code to enter is 1985.<br/><br/>
                    For a great pizza, I highly recommend "Pizzeria Da Luigi", located just a 5-minute walk from the villa. It's excellent! 🍕
                    <span className="msg-time">19:42</span>
                  </div>
                  <div className="msg msg-user">
                    Amazing, thanks! One last thing, I can't find the trash bins.
                    <span className="msg-time">19:45</span>
                  </div>
                  <div className="msg msg-marc">
                    You're very welcome! The grey bin (regular trash) is collected on Monday evenings, and the green one (recycling) on Wednesdays.
                    <span className="msg-time">19:45</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Explications des features avec SVG */}
          <div className="demo-features">
            <div className="feat-row">
              <div className="feat-icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              </div>
              <div className="feat-text">
                <h4>Réponses Instantanées</h4>
                <p>Vos voyageurs n'attendent plus. Marc répond dans la seconde en piochant dans votre base de données sécurisée.</p>
              </div>
            </div>
            <div className="feat-row">
              <div className="feat-icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <div className="feat-text">
                <h4>Recherche Web Intégrée</h4>
                <p>Besoin d'un restaurant ou d'une pharmacie ? Marc scanne les environs du logement sur internet pour faire des recommandations précises.</p>
              </div>
            </div>
          </div>
        </div>

        {/* KILLER FEATURE (ALERTE) */}
        <div className="killer-feature">
          <div className="kf-text">
            <span>Le Filet de Sécurité</span>
            <h3>Vous n'êtes dérangé que lorsque c'est vital.</h3>
            <p>Marc est intelligent. Si un client signale une fuite d'eau, une panne de courant, ou une urgence, il vous transfère immédiatement l'information.</p>
            <p><b>Résultat :</b> Vous filtrez 95% du bruit quotidien, et gardez le contrôle sur les 5% qui comptent vraiment.</p>
          </div>
          <div className="notif-mockup">
            <div className="notif-bubble">
              <div className="notif-head">
                <span>Telegram</span>
                <span>Maintenant</span>
              </div>
              <p style={{fontSize: '13px', margin: 0, color: '#475569', lineHeight: '1.5'}}>
                🚨 <b>ALERTE MAJOR MARC</b><br/><br/>
                🏠 Logement : La Villa Noam<br/>
                💬 Client : "Il y a une énorme fuite sous l'évier !"<br/><br/>
                <i>Marc a indiqué la vanne et vous demande de prendre le relais.</i>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING ANCHOR */}
      <section className="pricing-anchor">
        <div className="anchor-box">
          <h2>Pour le prix d'un seul frais de ménage.</h2>
          <p>La plupart des conciergeries traditionnelles prennent 20% de vos revenus. Offrez-vous le service d'un majordome privé 24h/24 pour une fraction de ce coût, et conservez vos marges.</p>
          <span className="price-highlight">24,90€ <span>/ logement / mois</span></span>
          <p style={{fontSize: '14px', marginTop: '-10px', color: '#94a3b8', marginBottom: '30px'}}>Sans engagement. Facturation simple.</p>
          <Link href="/register" passHref legacyBehavior>
            <a className="cta-main">Créer mon compte maintenant</a>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <p>© 2026 Major Marc - L'excellence de la conciergerie automatisée.</p>
      </footer>
    </div>
  );
        }
        
