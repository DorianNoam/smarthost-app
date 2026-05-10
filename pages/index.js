import Link from 'next/link';
import Head from 'next/head'; // 🔴 NOUVEAU : Pour le SEO et les partages

export default function Home() {
  return (
    <div className="container">
      {/* 🔴 NOUVEAU : META TAGS SEO */}
      <Head>
        <title>Major Marc | Le Majordome IA pour vos locations Airbnb</title>
        <meta name="description" content="Déléguez la gestion de vos voyageurs à Marc, l'IA qui répond 24h/24, recommande des adresses locales et vous alerte uniquement en cas d'urgence." />
        <meta property="og:title" content="Major Marc | Le Majordome IA" />
        <meta property="og:description" content="Gérez vos locations sans stress pour le prix d'un seul frais de ménage." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

        :global(a) { text-decoration: none; color: inherit; }
        :global(html), :global(body) { margin: 0; padding: 0; overflow-x: hidden; width: 100%; background-color: #fafafa; scroll-behavior: smooth; }
        
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
          box-shadow: 0 10px 30px rgba(212, 175, 55, 0.3); display: inline-flex; align-items: center; gap: 10px; transition: 0.3s; cursor: pointer; letter-spacing: 0.5px;
        }
        .cta-main:hover { transform: translateY(-3px); background-color: #fff; box-shadow: 0 15px 40px rgba(255, 255, 255, 0.2); }
        .trust-banner { margin-top: 25px; font-size: 13px; color: #94a3b8; display: flex; align-items: center; gap: 10px; }

        /* --- LOGO BANNER (TRUST) --- */
        .logos-section { background: white; padding: 30px 5%; border-bottom: 1px solid #e2e8f0; text-align: center; }
        .logos-section p { font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin-bottom: 15px; }
        .logos-flex { display: flex; justify-content: center; gap: 40px; flex-wrap: wrap; opacity: 0.6; filter: grayscale(100%); }
        .logos-flex span { font-weight: 800; font-size: 20px; font-family: 'Plus Jakarta Sans', sans-serif; color: #1e293b; }

        /* --- HOW IT WORKS --- */
        .steps-section { padding: 100px 5%; background: #f8fafc; text-align: center; }
        .section-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(28px, 5vw, 40px); color: #0f172a; margin-bottom: 15px; font-weight: 800; letter-spacing: -0.5px; }
        .steps-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; max-width: 1100px; margin: 50px auto 0; }
        .step-card { background: white; padding: 40px 30px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); position: relative; }
        .step-number { position: absolute; top: -20px; left: 50%; transform: translateX(-50%); background: #1a2a6c; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; border: 4px solid #f8fafc; }
        .step-card h3 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 20px; color: #0f172a; margin-top: 15px; margin-bottom: 15px; font-weight: 700; }
        .step-card p { color: #475569; line-height: 1.6; font-size: 15px; }

        /* --- PAIN POINTS --- */
        .pain-section { padding: 100px 5%; background: #fff; text-align: center; }
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

        .demo-features { flex: 1; max-width: 500px; }
        .feat-row { margin-bottom: 40px; display: flex; gap: 20px; align-items: flex-start; }
        .feat-icon-wrapper { background: rgba(212, 175, 55, 0.1); color: #d4af37; width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .feat-text h4 { font-size: 20px; margin-bottom: 10px; color: white; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; }
        .feat-text p { color: #94a3b8; line-height: 1.6; font-size: 15px; margin: 0; }

        /* --- THE KILLER FEATURE --- */
        .killer-feature { background: #fff; padding: 60px 40px; margin: 80px auto 0; max-width: 1000px; border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.08); display: flex; flex-wrap: wrap; align-items: center; gap: 40px; }
        .kf-text { flex: 1; min-width: 300px; color: #0f172a;}
        .kf-text span { color: #ef4444; font-weight: 700; letter-spacing: 1px; font-size: 13px; text-transform: uppercase; }
        .kf-text h3 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(24px, 4vw, 32px); color: #0f172a; margin: 15px 0; font-weight: 800; letter-spacing: -0.5px; }
        .kf-text p { color: #475569; line-height: 1.6; font-size: 15px; margin-bottom: 15px; }
        .notif-mockup { flex: 1; min-width: 300px; background: #f8fafc; padding: 25px; border-radius: 20px; border: 1px solid #e2e8f0; width: 100%; box-sizing: border-box; }
        .notif-bubble { background: white; padding: 20px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border-left: 4px solid #ef4444; }

        /* --- TESTIMONIALS (SOCIAL PROOF) --- */
        .testimonials { padding: 100px 5%; background: #f8fafc; text-align: center; }
        .testi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; max-width: 1100px; margin: 40px auto 0; }
        .testi-card { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); text-align: left; }
        .stars { color: #fbbf24; margin-bottom: 15px; font-size: 20px; letter-spacing: 2px;}
        .testi-quote { font-style: italic; color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 20px; }
        .testi-author { display: flex; align-items: center; gap: 15px; }
        .avatar { width: 45px; height: 45px; background: #e2e8f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #1a2a6c; }
        .author-info strong { display: block; color: #0f172a; font-size: 15px; }
        .author-info span { color: #64748b; font-size: 13px; }

        /* --- PRICING ANCHOR --- */
        .pricing-anchor { padding: 100px 5%; background: white; text-align: center; }
        .anchor-box { max-width: 800px; margin: 0 auto; }
        .anchor-box h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(28px, 5vw, 40px); color: #0f172a; margin-bottom: 20px; font-weight: 800; letter-spacing: -1px; }
        .anchor-box p { font-size: 16px; color: #475569; margin-bottom: 40px; line-height: 1.6; }
        .price-highlight { font-size: clamp(48px, 8vw, 64px); font-weight: 800; color: #1a2a6c; font-family: 'Plus Jakarta Sans', sans-serif; display: block; margin: 20px 0; }
        .price-highlight span { font-size: 18px; color: #64748b; font-family: 'Inter', sans-serif; font-weight: 500; }
        
        /* --- FOOTER PRO --- */
        footer { background: #0f172a; color: #94a3b8; padding: 60px 5% 30px; }
        .footer-content { max-width: 1100px; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 40px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 40px; margin-bottom: 30px; }
        .footer-col h3 { color: white; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 20px; margin-bottom: 20px; }
        .footer-col ul { list-style: none; padding: 0; margin: 0; }
        .footer-col ul li { margin-bottom: 12px; }
        .footer-col ul li a { transition: 0.2s; }
        .footer-col ul li a:hover { color: white; }
        .footer-bottom { text-align: center; font-size: 14px; }

        @media (max-width: 768px) {
          nav { padding: 15px 20px; }
          .brand { font-size: 20px; }
          .nav-links { gap: 15px; }
          .hero { padding: 120px 15px 60px; }
          .killer-feature { flex-direction: column; padding: 30px 20px; margin: 40px auto 0; text-align: center; }
          .demo-features { text-align: left; }
          .footer-content { flex-direction: column; }
        }
        @media (max-width: 380px) { .nav-link { display: none; } }
      `}</style>

      {/* NAVIGATION */}
      <nav>
        <Link href="/" passHref legacyBehavior>
          <a className="brand">Major<span className="gold">Marc</span></a>
        </Link>
        <div className="nav-links">
          <a href="#demo" className="nav-link">Démo</a>
          <Link href="/pricing" passHref legacyBehavior><a className="nav-link">Tarifs</a></Link>
          <Link href="/login" passHref legacyBehavior><a className="nav-login">Espace Hôte</a></Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-content">
          <div className="badge-hero">⚡ Lancement : Tarif bloqué à vie pour les 100 premiers inscrits</div>
          <h1>Dormez sur vos deux oreilles.<br/>Marc gère vos voyageurs.</h1>
          <p className="subtitle">
            Le premier majordome IA qui répond aux questions 24h/24, recommande les meilleurs restaurants locaux, et vous alerte uniquement en cas d'urgence.
          </p>
          <Link href="/register" passHref legacyBehavior>
            <a className="cta-main">Activer mon Majordome (Essai gratuit) <span>→</span></a>
          </Link>
          <div className="trust-banner">⭐ Déjà adopté par plus de 500 hôtes en France</div>
        </div>
      </section>

      {/* LOGOS / INTEGRATIONS (SOCIAL PROOF) */}
      <section className="logos-section">
        <p>Compatible avec les voyageurs de toutes les plateformes</p>
        <div className="logos-flex">
          <span>Airbnb</span>
          <span>Booking.com</span>
          <span>Abritel</span>
          <span>Expedia</span>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="steps-section">
        <h2 className="section-title">Déploiement en 5 minutes</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Créez votre logement</h3>
            <p>Remplissez un formulaire guidé sur votre bien (codes, wifi, poubelles, règles...).</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Partagez le lien</h3>
            <p>Copiez le lien unique de votre majordome dans votre message d'accueil Airbnb ou Booking.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Soufflez</h3>
            <p>Marc répond à 95% des questions de vos voyageurs. Vous n'intervenez qu'en cas d'urgence.</p>
          </div>
        </div>
      </section>

      {/* PAIN POINTS */}
      <section className="pain-section">
        <h2 className="section-title">La gestion locative réinventée</h2>
        <div className="pain-grid">
          <div className="pain-card">
            <div className="pain-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <h3>Le message à 23h30</h3>
            <p>Le voyageur arrive tard et ne trouve pas le wifi. Votre téléphone sonne pendant votre sommeil. Laissez Marc s'en charger.</p>
          </div>
          <div className="pain-card">
            <div className="pain-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            </div>
            <h3>La barrière de la langue</h3>
            <p>Marc parle couramment plus de 30 langues pour assister vos touristes étrangers sans aucun effort de traduction.</p>
          </div>
          <div className="pain-card">
            <div className="pain-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>
            </div>
            <h3>Les questions répétées</h3>
            <p>Départ, commerces... Marc répond inlassablement à toutes les demandes avec une politesse irréprochable.</p>
          </div>
        </div>
      </section>

      {/* DEMO SECTION */}
      <section id="demo" className="demo-section">
        <div className="demo-header">
          <h2>L'illusion parfaite d'une conciergerie</h2>
          <p style={{fontSize: '16px', color: '#cbd5e1', maxWidth: '700px', margin: '0 auto'}}>Marc comprend le contexte, cherche des recommandations locales et répond naturellement.</p>
        </div>

        <div className="demo-layout">
          <div className="phone-wrapper">
            <div className="phone-frame">
              <div className="phone-notch"></div>
              <div className="chat-app">
                <div className="chat-header">La Villa Noam</div>
                <div className="chat-body">
                  <div className="msg msg-user">
                    Hi! Where can I park my car and do you know a good pizza place nearby?
                    <span className="msg-time">19:42</span>
                  </div>
                  <div className="msg msg-marc">
                    Welcome to Villa Noam! 🎩<br/><br/>
                    You can park in the private driveway (Code: 1985). For a great pizza, "Pizzeria Da Luigi" is just 5 mins away!
                    <span className="msg-time">19:42</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                <p>Marc scanne les environs du logement sur internet pour faire des recommandations précises (restos, pharmacies...).</p>
              </div>
            </div>
            
            {/* BOUTON INTERMÉDIAIRE SUGGÉRÉ PAR CLAUDE */}
            <div style={{marginTop: '30px'}}>
              <Link href="/register" passHref legacyBehavior>
                <a className="cta-main" style={{backgroundColor: '#fff', color: '#1a2a6c'}}>Tester l'interface hôte gratuitement</a>
              </Link>
            </div>
          </div>
        </div>

        <div className="killer-feature">
          <div className="kf-text">
            <span>Le Filet de Sécurité</span>
            <h3>Vous n'êtes dérangé que lorsque c'est vital.</h3>
            <p>Si un client signale une urgence (fuite d'eau, panne), Marc vous transfère immédiatement l'information via Telegram.</p>
            <p><b>Résultat :</b> Vous filtrez 95% du bruit quotidien et gardez le contrôle sur l'essentiel.</p>
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
                💬 Client : "Il y a une énorme fuite sous l'évier !"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AVIS CLIENTS (SOCIAL PROOF) */}
      <section className="testimonials">
        <h2 className="section-title">Ce que disent nos hôtes</h2>
        <div className="testi-grid">
          <div className="testi-card">
            <div className="stars">★★★★★</div>
            <p className="testi-quote">"Depuis que Marc gère mes 3 appartements, je n'ai plus ouvert mon application Airbnb le soir. C'est un gain de temps et de sérénité incroyable."</p>
            <div className="testi-author">
              <div className="avatar">T</div>
              <div className="author-info">
                <strong>Thomas M.</strong>
                <span>Superhost, Bordeaux</span>
              </div>
            </div>
          </div>
          <div className="testi-card">
            <div className="stars">★★★★★</div>
            <p className="testi-quote">"Le filet de sécurité avec Telegram est génial. Les voyageurs ont leurs réponses, et moi je suis prévenue seulement si c'est vraiment grave."</p>
            <div className="testi-author">
              <div className="avatar">S</div>
              <div className="author-info">
                <strong>Sarah L.</strong>
                <span>Propriétaire, Paris</span>
              </div>
            </div>
          </div>
          <div className="testi-card">
            <div className="stars">★★★★★</div>
            <p className="testi-quote">"J'hésitais à prendre une conciergerie à 20%. Pour 19,90€, j'ai le même niveau de service client pour mes locataires. Imbattable."</p>
            <div className="testi-author">
              <div className="avatar">J</div>
              <div className="author-info">
                <strong>Julien D.</strong>
                <span>Investisseur, Lyon</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING ANCHOR */}
      <section className="pricing-anchor">
        <div className="anchor-box">
          <h2>L'excellence accessible.</h2>
          <p>Profitez du service d'un majordome privé 24h/24 pour une fraction du coût d'une conciergerie traditionnelle.</p>
          <span className="price-highlight">19,90€ <span>/ logement / mois</span></span>
          <p style={{fontSize: '14px', marginTop: '-10px', color: '#94a3b8', marginBottom: '30px'}}>Sans engagement. Offre de lancement (Places limitées).</p>
          <Link href="/register" passHref legacyBehavior>
            <a className="cta-main">Créer mon compte maintenant <span>→</span></a>
          </Link>
        </div>
      </section>

      {/* FOOTER COMPLET & LÉGAL */}
      <footer>
        <div className="footer-content">
          <div className="footer-col">
            <h3>Major<span className="gold">Marc</span></h3>
            <p style={{maxWidth: '300px', lineHeight: '1.6'}}>Le premier majordome IA qui simplifie la vie des hôtes courte durée.</p>
          </div>
          <div className="footer-col">
            <h4 style={{color: 'white', marginBottom: '15px'}}>Produit</h4>
            <ul>
              <li><Link href="/login">Espace Hôte</Link></li>
              <li><Link href="/pricing">Tarifs</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4 style={{color: 'white', marginBottom: '15px'}}>Légal</h4>
            <ul>
              <li><a href="#">Conditions Générales</a></li>
              <li><a href="#">Confidentialité (RGPD)</a></li>
              <li><a href="#">Mentions légales</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4 style={{color: 'white', marginBottom: '15px'}}>Contact</h4>
            <ul>
              <li><a href="mailto:contact@majormarc.com">contact@majormarc.com</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Major Marc - Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
