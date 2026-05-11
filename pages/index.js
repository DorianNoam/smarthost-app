import Link from 'next/link';
import Head from 'next/head';

export default function Home() {
  return (
    <div className="container">
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
        .badge-hero { background: rgba(212, 175, 55, 0.15); color: #d4af37; padding: 8px 16px; border-radius: 30px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 25px; border: 1px solid rgba(212, 175, 55, 0.3); }
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
        .msg-time { display: block; font-size: 10px; color: #888; text-align: right; margin-top: 5px; }

        .demo-features { flex: 1; max-width: 500px; }
        .feat-row { margin-bottom: 40px; display: flex; gap: 20px; align-items: flex-start; }
        .feat-icon-wrapper { background: rgba(212, 175, 55, 0.1); color: #d4af37; width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .feat-text h4 { font-size: 20px; margin-bottom: 10px; color: white; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; }
        .feat-text p { color: #94a3b8; line-height: 1.6; font-size: 15px; margin: 0; }

        /* --- THE KILLER FEATURE --- */
        .killer-feature { background: #fff; padding: 60px 40px; margin: 80px auto 0; max-width: 1000px; border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.08); display: flex; flex-wrap: wrap; align-items: center; gap: 40px; text-align: left; }
        .kf-text { flex: 1; min-width: 300px; color: #0f172a;}
        .kf-text span { color: #ef4444; font-weight: 700; letter-spacing: 1px; font-size: 13px; text-transform: uppercase; }
        .kf-text h3 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(24px, 4vw, 32px); color: #0f172a; margin: 15px 0; font-weight: 800; letter-spacing: -0.5px; }
        .kf-text p { color: #475569; line-height: 1.6; font-size: 15px; margin-bottom: 15px; }
        .notif-mockup { flex: 1; min-width: 300px; background: #f8fafc; padding: 25px; border-radius: 20px; border: 1px solid #e2e8f0; width: 100%; box-sizing: border-box; }
        .notif-bubble { background: white; padding: 20px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border-left: 4px solid #ef4444; }
        .notif-head { display: flex; justify-content: space-between; font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 10px; }

        /* --- BENEFITS --- */
        .benefits { padding: 100px 5%; background: #f8fafc; text-align: center; }
        .benefits-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; max-width: 1100px; margin: 40px auto 0; }
        .benefit-card { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); text-align: left; border-top: 4px solid #1a2a6c; }
        .benefit-icon { font-size: 32px; margin-bottom: 15px; }
        .benefit-card h4 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 18px; color: #0f172a; margin-bottom: 10px; font-weight: 700; }
        .benefit-card p { color: #475569; font-size: 15px; line-height: 1.6; margin: 0; }

        /* --- NOUVELLE PRICING SECTION INTÉGRÉE --- */
        .pricing-section { padding: 100px 5%; background: white; text-align: center; }
        .pricing-header { max-width: 800px; margin: 0 auto 50px; }
        .pricing-header h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(28px, 5vw, 40px); color: #0f172a; margin-bottom: 15px; font-weight: 800; letter-spacing: -1px; }
        .pricing-header p { font-size: 16px; color: #475569; line-height: 1.6; }

        .price-card-home { 
          background: white; padding: 50px 40px; border-radius: 24px; 
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1); text-align: center; 
          border: 2px solid #d4af37; position: relative; width: 100%; max-width: 450px; 
          margin: 0 auto; display: flex; flex-direction: column; 
        }
        
        .badge-promo {
          position: absolute; top: -18px; left: 50%; transform: translateX(-50%);
          background: #d4af37; color: #1a2a6c; padding: 8px 24px; border-radius: 30px;
          font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;
          box-shadow: 0 10px 20px rgba(212, 175, 55, 0.3); white-space: nowrap;
        }

        .plan-name { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 22px; color: #1a2a6c; margin-bottom: 15px; }
        .price { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 56px; font-weight: 800; color: #0f172a; letter-spacing: -2px; margin-bottom: 5px; }
        .price span { font-size: 18px; font-weight: 600; color: #64748b; letter-spacing: 0; }
        .billing-cycle { color: #64748b; font-size: 14px; margin-bottom: 30px; font-weight: 500; }
        
        .features-list { text-align: left; margin-bottom: 40px; border-top: 1px solid #e2e8f0; padding-top: 30px; }
        .feature { margin-bottom: 18px; font-size: 15px; display: flex; align-items: center; gap: 12px; color: #1e293b; font-weight: 500; }
        .check-icon { 
          background: rgba(212, 175, 55, 0.15); color: #d4af37; width: 24px; height: 24px; 
          border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; 
        }
        
        .cta-pricing { 
          background: #1a2a6c; color: white; padding: 18px; border-radius: 16px; 
          font-weight: 700; font-size: 16px; transition: 0.3s; text-decoration: none; display: block;
        }
        .cta-pricing:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(26, 42, 108, 0.2); background: #1e3280; }
        
        .guarantee { margin-top: 20px; font-size: 13px; color: #64748b; display: flex; align-items: center; justify-content: center; gap: 8px; }

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
          .price-card-home { padding: 40px 25px; }
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
          <a href="#fonctionnement" className="nav-link">Fonctionnement</a>
          <a href="#tarifs" className="nav-link">Tarifs</a>
          <Link href="/login" passHref legacyBehavior><a className="nav-login">Espace Hôte</a></Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-content">
          <div className="badge-hero">⚡ Offre de lancement : Votre 1er mois à 9,90€</div>
          <h1>Dormez sur vos deux oreilles.<br/>Marc gère vos voyageurs.</h1>
          <p className="subtitle">
            Le premier majordome IA qui répond aux questions 24h/24, recommande les meilleurs restaurants locaux, et vous alerte uniquement en cas d'urgence.
          </p>
          <Link href="/register" passHref legacyBehavior>
            <a className="cta-main">Activer mon Majordome (1er mois à 9,90€) <span>→</span></a>
          </Link>
          <div className="trust-banner">⭐ Rejoignez la nouvelle génération d'hôtes automatisés</div>
        </div>
      </section>

      {/* LOGOS / INTEGRATIONS */}
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
      <section className="steps-section" id="fonctionnement">
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
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
      <section 
