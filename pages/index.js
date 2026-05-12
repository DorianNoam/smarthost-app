import Link from 'next/link';
import Head from 'next/head';

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>Alfred Major | Le Majordome IA pour vos locations Courte durée</title>
        <meta name="description" content="Déléguez la gestion de vos voyageurs à Alfred, l'IA qui répond 24h/24, recommande des adresses locales et vous alerte uniquement en cas d'urgence." />
        <meta property="og:title" content="Alfred Major — Le Majordome IA pour vos locations" />
        <meta property="og:description" content="Alfred répond à vos voyageurs 24h/24, recommande les meilleures adresses locales et vous alerte en cas d'urgence. 1er mois à 9,90€." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://alfredmajor.com" />
        <meta property="og:image" content="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&h=630&q=80" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="fr_FR" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Alfred Major — Le Majordome IA pour vos locations" />
        <meta name="twitter:description" content="Alfred répond à vos voyageurs 24h/24. 1er mois à 9,90€." />
        <meta name="twitter:image" content="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&h=630&q=80" />
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
        .nav-login { font-weight: 600; color: #1a2a6c; padding: 10px 24px; border: 2px solid #1a2a6c; border-radius: 50px; font-size: 15px; transition: 0.3s; cursor: pointer; white-space: nowrap; }
        .nav-login:hover { background: #1a2a6c; color: white; }

        /* --- HERO SECTION --- */
        .hero {
          position: relative; min-height: 85vh; display: flex; align-items: center; justify-content: center;
          text-align: center; padding: 140px 20px 80px; box-sizing: border-box;
          background: linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.9)), url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80') center/cover;
        }
        .hero-content { max-width: 950px; z-index: 10; margin: 0 auto; display: flex; flex-direction: column; align-items: center; width: 100%; }
        .badge-hero { background: rgba(212, 175, 55, 0.15); color: #d4af37; padding: 8px 16px; border-radius: 30px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 25px; border: 1px solid rgba(212, 175, 55, 0.3); }
        h1 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(34px, 6vw, 64px); color: white; margin-bottom: 25px; line-height: 1.1; font-weight: 800; letter-spacing: -1px; }
        .subtitle { font-size: clamp(15px, 3vw, 20px); margin-bottom: 40px; color: #cbd5e1; line-height: 1.6; font-weight: 400; max-width: 800px; }
        
        .cta-main {
          background-color: #d4af37; color: #1a2a6c; padding: 20px 45px; border-radius: 50px; font-weight: 700; font-size: 16px;
          box-shadow: 0 10px 30px rgba(212, 175, 55, 0.3); display: inline-flex; justify-content: center; align-items: center; gap: 10px; transition: 0.3s; cursor: pointer; letter-spacing: 0.5px;
        }
        .cta-main:hover { transform: translateY(-3px); background-color: #fff; box-shadow: 0 15px 40px rgba(255, 255, 255, 0.2); }
        .trust-banner { margin-top: 25px; font-size: 13px; color: #94a3b8; display: flex; align-items: center; justify-content: center; gap: 10px; }

        /* --- LOGO BANNER --- */
        .logos-section { background: white; padding: 30px 5%; border-bottom: 1px solid #e2e8f0; text-align: center; }
        .logos-section p { font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin-bottom: 15px; }
        .logos-flex { display: flex; justify-content: center; gap: 30px; flex-wrap: wrap; opacity: 0.6; filter: grayscale(100%); }
        .logos-flex span { font-weight: 800; font-size: 18px; font-family: 'Plus Jakarta Sans', sans-serif; color: #1e293b; }

        /* --- HOW IT WORKS --- */
        .steps-section { padding: 100px 5%; background: #f8fafc; text-align: center; }
        .section-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(28px, 5vw, 40px); color: #0f172a; margin-bottom: 15px; font-weight: 800; letter-spacing: -0.5px; }
        .steps-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 40px; max-width: 1100px; margin: 50px auto 0; }
        .step-card { background: white; padding: 40px 30px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); position: relative; }
        .step-number { position: absolute; top: -20px; left: 50%; transform: translateX(-50%); background: #1a2a6c; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; border: 4px solid #f8fafc; }
        .step-card h3 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 20px; color: #0f172a; margin-top: 15px; margin-bottom: 15px; font-weight: 700; }
        .step-card p { color: #475569; line-height: 1.6; font-size: 15px; margin: 0; }

        /* --- PAIN POINTS --- */
        .pain-section { padding: 100px 5%; background: #fff; text-align: center; }
        .pain-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; max-width: 1100px; margin: 40px auto 0; }
        .pain-card { background: #f8fafc; padding: 40px 30px; border-radius: 20px; text-align: left; transition: 0.3s; border: 1px solid #e2e8f0; }
        .pain-card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.04); border-color: #d4af37; }
        .pain-icon-wrapper { width: 50px; height: 50px; background: rgba(26, 42, 108, 0.05); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; color: #1a2a6c; }
        .pain-card h3 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 20px; color: #0f172a; margin-bottom: 15px; font-weight: 700; }
        .pain-card p { color: #475569; line-height: 1.6; font-size: 15px; margin: 0; }

        /* --- DEMO SECTION --- */
        .demo-section { padding: 100px 5%; background: #0f172a; color: white; overflow: hidden; }
        .demo-header { text-align: center; margin-bottom: 70px; }
        .demo-header h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(28px, 5vw, 42px); margin-bottom: 20px; font-weight: 800; letter-spacing: -1px; }
        
        .demo-layout { display: flex; flex-direction: column; gap: 60px; max-width: 1100px; margin: 0 auto; align-items: center; }
        @media (min-width: 1024px) { .demo-layout { flex-direction: row; justify-content: space-between; align-items: center; } }
        
        .phone-wrapper { position: relative; width: 100%; max-width: 340px; margin: 0 auto; }
        .phone-frame { border: 10px solid #1e293b; border-radius: 40px; background: white; height: 600px; overflow: hidden; position: relative; box-shadow: 0 30px 60px rgba(0,0,0,0.5); }
        .phone-notch { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 120px; height: 25px; background: #1e293b; border-bottom-left-radius: 15px; border-bottom-right-radius: 15px; z-index: 10; }
        
        .chat-app { display: flex; flex-direction: column; height: 100%; background: #f0f2f5; }
        .chat-header { background: #075e54; color: white; padding: 40px 20px 15px; text-align: center; font-weight: 600; font-size: 15px; font-family: 'Plus Jakarta Sans', sans-serif; }
        .chat-body { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; }
        .msg { padding: 12px 16px; border-radius: 15px; font-size: 13.5px; line-height: 1.5; max-width: 85%; position: relative; color: #111; }
        .msg-user { background: #dcf8c6; align-self: flex-end; border-bottom-right-radius: 2px; }
        .msg-alfred { background: white; align-self: flex-start; border-bottom-left-radius: 2px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .msg-time { display: block; font-size: 10px; color: #888; text-align: right; margin-top: 5px; }

        .demo-features { flex: 1; max-width: 500px; width: 100%; }
        .feat-row { margin-bottom: 40px; display: flex; gap: 20px; align-items: flex-start; }
        .feat-icon-wrapper { background: rgba(212, 175, 55, 0.1); color: #d4af37; width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .feat-text h4 { font-size: 20px; margin-bottom: 10px; color: white; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; }
        .feat-text p { color: #94a3b8; line-height: 1.6; font-size: 15px; margin: 0; }

        /* --- KILLER FEATURE --- */
        .killer-feature { background: #fff; padding: 60px 40px; margin: 80px auto 0; max-width: 1000px; border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.08); display: flex; flex-wrap: wrap; align-items: center; gap: 40px; text-align: left; }
        .kf-text { flex: 1; min-width: 250px; color: #0f172a;}
        .kf-text span { color: #ef4444; font-weight: 700; letter-spacing: 1px; font-size: 13px; text-transform: uppercase; }
        .kf-text h3 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(24px, 4vw, 32px); color: #0f172a; margin: 15px 0; font-weight: 800; letter-spacing: -0.5px; }
        .kf-text p { color: #475569; line-height: 1.6; font-size: 15px; margin-bottom: 15px; }
        .notif-mockup { flex: 1; min-width: 250px; background: #f8fafc; padding: 25px; border-radius: 20px; border: 1px solid #e2e8f0; width: 100%; box-sizing: border-box; }
        .notif-bubble { background: white; padding: 20px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border-left: 4px solid #ef4444; }
        .notif-head { display: flex; justify-content: space-between; font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 10px; }

        /* --- BENEFITS --- */
        .benefits { padding: 100px 5%; background: #f8fafc; text-align: center; }
        .benefits-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; max-width: 1100px; margin: 40px auto 0; }
        .benefit-card { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); text-align: left; border-top: 4px solid #1a2a6c; }
        .benefit-icon { font-size: 32px; margin-bottom: 15px; }
        .benefit-card h4 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 18px; color: #0f172a; margin-bottom: 10px; font-weight: 700; }
        .benefit-card p { color: #475569; font-size: 15px; line-height: 1.6; margin: 0; }

        /* --- TÉMOIGNAGES --- */
        .testimonials { padding: 100px 5%; background: white; text-align: center; }
        .testi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 28px; max-width: 1100px; margin: 50px auto 0; }
        .testi-card { background: #f8fafc; border-radius: 24px; padding: 36px; text-align: left; border: 1px solid #e2e8f0; transition: 0.3s; position: relative; }
        .testi-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.06); border-color: #d4af37; }
        .testi-stars { color: #fbbf24; font-size: 18px; letter-spacing: 2px; margin-bottom: 18px; }
        .testi-quote { font-style: italic; color: #334155; font-size: 15px; line-height: 1.7; margin-bottom: 24px; position: relative; }
        .testi-quote::before { content: '"'; font-size: 60px; color: #e2e8f0; font-family: Georgia, serif; position: absolute; top: -20px; left: -10px; line-height: 1; z-index: 0; }
        .testi-quote span { position: relative; z-index: 1; }
        .testi-author { display: flex; align-items: center; gap: 14px; }
        .testi-avatar { width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
        .testi-name { font-weight: 800; color: #1e293b; font-size: 15px; margin: 0 0 2px; }
        .testi-role { color: #64748b; font-size: 13px; margin: 0; }
        .testi-badge { position: absolute; top: 20px; right: 20px; background: #ecfdf5; color: #059669; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; border: 1px solid #a7f3d0; }

        /* --- PRICING SECTION --- */
        .pricing-section { padding: 100px 5%; background: white; text-align: center; }
        .pricing-header { max-width: 800px; margin: 0 auto 50px; }
        .pricing-header h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(28px, 5vw, 40px); color: #0f172a; margin-bottom: 15px; font-weight: 800; letter-spacing: -1px; }
        .pricing-header p { font-size: 16px; color: #475569; line-height: 1.6; }
        .price-card-home { 
          background: white; padding: 50px 40px; border-radius: 24px; 
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1); text-align: center; 
          border: 2px solid #d4af37; position: relative; width: 100%; max-width: 450px; 
          margin: 0 auto; display: flex; flex-direction: column; box-sizing: border-box;
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
        .check-icon { background: rgba(212, 175, 55, 0.15); color: #d4af37; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .cta-pricing { background: #1a2a6c; color: white; padding: 18px; border-radius: 16px; font-weight: 700; font-size: 16px; transition: 0.3s; text-decoration: none; display: block; }
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

        /* 📱 RESPONSIVE MOBILE */
        @media (max-width: 768px) {
          nav { padding: 15px 20px; }
          .brand { font-size: 20px; }
          .nav-link { display: none; }
          .nav-login { padding: 8px 16px; font-size: 13px; }
          .hero { padding: 120px 20px 60px; }
          .steps-section, .pain-section, .demo-section, .benefits, .testimonials, .pricing-section { padding: 60px 20px; }
          .steps-grid, .pain-grid, .benefits-grid, .testi-grid { grid-template-columns: 1fr; gap: 20px; }
          .cta-main { width: 100%; justify-content: center; font-size: 14px; padding: 18px 20px; box-sizing: border-box; }
          .badge-hero { font-size: 11px; padding: 6px 12px; }
          .demo-features { text-align: left; margin-top: 20px; }
          .phone-frame { height: 500px; }
          .killer-feature { flex-direction: column; padding: 30px 20px; margin: 40px auto 0; text-align: center; }
          .kf-text, .notif-mockup { min-width: 100%; }
          .price-card-home { padding: 40px 20px; }
          .price { font-size: 44px; }
          .badge-promo { font-size: 12px; padding: 6px 16px; }
          .footer-content { flex-direction: column; gap: 30px; text-align: center; }
          .footer-col { display: flex; flex-direction: column; align-items: center; }
          .testi-card { padding: 28px 24px; }
        }
      `}</style>

      {/* NAVIGATION */}
      <nav>
        <Link href="/" passHref legacyBehavior>
          <a className="brand">Alfred<span className="gold">Major</span></a>
        </Link>
        <div className="nav-links">
          <a href="#fonctionnement" className="nav-link">Fonctionnement</a>
          <a href="#tarifs" className="nav-link">Tarifs</a>
          <Link href="/login" passHref legacyBehavior><a className="nav-login">Espace Hôte</a></Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="badge-hero">⚡ En ce moment : Votre 1er mois à 9,90€</div>
          <h1>Dormez sur vos deux oreilles.<br/>Alfred gère vos voyageurs.</h1>
          <p className="subtitle">
            Le premier majordome IA qui répond aux questions 24h/24, recommande les meilleurs restaurants locaux, et vous alerte uniquement en cas d'urgence.
          </p>
          <Link href="/register" passHref legacyBehavior>
            <a className="cta-main">Activer mon Majordome (1er mois à 9,90€) <span>→</span></a>
          </Link>
          <div className="trust-banner">⭐ Rejoignez la nouvelle génération d'hôtes automatisés</div>
        </div>
      </section>

      {/* LOGOS */}
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
            <p>Alfred répond à 95% des questions de vos voyageurs. Vous n'intervenez qu'en cas d'urgence.</p>
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
            <p>Le voyageur arrive tard et ne trouve pas le wifi. Votre téléphone sonne pendant votre sommeil. Laissez Alfred s'en charger.</p>
          </div>
          <div className="pain-card">
            <div className="pain-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            </div>
            <h3>La barrière de la langue</h3>
            <p>Alfred parle couramment plus de 30 langues pour assister vos touristes étrangers sans aucun effort de traduction.</p>
          </div>
          <div className="pain-card">
            <div className="pain-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>
            </div>
            <h3>Les questions répétées</h3>
            <p>Départ, commerces... Alfred répond inlassablement à toutes les demandes avec une politesse irréprochable.</p>
          </div>
        </div>
      </section>

      {/* DEMO SECTION */}
      <section id="demo" className="demo-section">
        <div className="demo-header">
          <h2>L'illusion parfaite d'une conciergerie</h2>
          <p style={{fontSize: '16px', color: '#cbd5e1', maxWidth: '700px', margin: '0 auto'}}>Alfred comprend le contexte, cherche des recommandations locales et répond naturellement.</p>
        </div>

        <div className="demo-layout">
          <div className="phone-wrapper">
            <div className="phone-frame">
              <div className="phone-notch"></div>
              <div className="chat-app">
                <div className="chat-header">La Villa Noam</div>
                <div className="chat-body">
                  <div className="msg msg-user">
                    Hi! We just arrived. Where are the trash bins and do you have a restaurant recommendation?
                    <span className="msg-time">19:42</span>
                  </div>
                  <div className="msg msg-alfred">
                    Welcome to Villa Noam! 🎩<br/><br/>
                    The grey and green bins are under the sink. For dinner, I highly recommend "Pizzeria Da Luigi", located just a 5-minute walk from the villa! 🍕
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
                <p>Vos voyageurs n'attendent plus. Alfred répond dans la seconde en piochant dans votre base de données sécurisée.</p>
              </div>
            </div>
            <div className="feat-row">
              <div className="feat-icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <div className="feat-text">
                <h4>Recherche Web Intégrée</h4>
                <p>Alfred scanne les environs du logement sur internet pour faire des recommandations précises (restos, pharmacies...).</p>
              </div>
            </div>
            <div style={{marginTop: '30px'}}>
              <Link href="/register" passHref legacyBehavior>
                <a className="cta-main" style={{backgroundColor: '#fff', color: '#1a2a6c'}}>Créer mon compte (1er mois à 9,90€)</a>
              </Link>
            </div>
          </div>
        </div>

        <div className="killer-feature">
          <div className="kf-text">
            <span>Le Filet de Sécurité</span>
            <h3>Vous n'êtes dérangé que lorsque c'est vital.</h3>
            <p>Si un client signale une urgence (fuite d'eau, panne), Alfred vous transfère immédiatement l'information via Telegram.</p>
            <p><b>Résultat :</b> Vous filtrez 95% du bruit quotidien et gardez le contrôle sur l'essentiel.</p>
          </div>
          <div className="notif-mockup">
            <div className="notif-bubble">
              <div className="notif-head">
                <span>Telegram</span>
                <span>Maintenant</span>
              </div>
              <p style={{fontSize: '13px', margin: 0, color: '#475569', lineHeight: '1.5'}}>
                🚨 <b>ALERTE ALFRED MAJOR</b><br/><br/>
                🏠 Logement : La Villa Noam<br/>
                💬 Client : "Il y a une énorme fuite sous l'évier !"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="benefits">
        <h2 className="section-title">Pourquoi les hôtes nous font confiance</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">🔋</div>
            <h4>Déconnexion totale</h4>
            <p>Plus besoin de garder un œil sur votre téléphone à 22h pour donner un code WiFi ou expliquer où se trouvent les poubelles.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🛡️</div>
            <h4>Tranquillité d'esprit</h4>
            <p>Avec le système d'alerte Telegram, vous avez la certitude de ne rater aucune urgence vitale (fuite, panne) qui nécessite votre intervention.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">⭐</div>
            <h4>Des voyageurs ravis</h4>
            <p>Offrez à vos clients l'expérience d'un service premium avec un assistant instantané et multilingue capable de leur faire des recommandations sur mesure.</p>
          </div>
        </div>
      </section>

      {/* TÉMOIGNAGES */}
      <section className="testimonials">
        <h2 className="section-title">Ce que disent nos premiers hôtes</h2>
        <p style={{color: '#64748b', fontSize: '16px', marginTop: '10px'}}>Ils ont adopté Alfred et ne reviendront plus en arrière.</p>
        <div className="testi-grid">
          <div className="testi-card">
            <span className="testi-badge">✓ Hôte vérifié</span>
            <div className="testi-stars">★★★★★</div>
            <div className="testi-quote">
              <span>Alfred répond à toutes les questions de mes voyageurs, même à 3h du matin. Je n'ai plus reçu un seul appel pour le code WiFi depuis que je l'ai installé. Un vrai soulagement.</span>
            </div>
            <div className="testi-author">
              <div className="testi-avatar" style={{background: '#fef3c7'}}>👩</div>
              <div>
                <p className="testi-name">Sophie L.</p>
                <p className="testi-role">3 logements · Nice</p>
              </div>
            </div>
          </div>

          <div className="testi-card">
            <span className="testi-badge">✓ Hôte vérifié</span>
            <div className="testi-stars">★★★★★</div>
            <div className="testi-quote">
              <span>J'avais des voyageurs étrangers qui ne parlaient pas français. Alfred leur a répondu en anglais, espagnol et même en allemand. Mes notes Airbnb ont augmenté depuis.</span>
            </div>
            <div className="testi-author">
              <div className="testi-avatar" style={{background: '#dbeafe'}}>👨</div>
              <div>
                <p className="testi-name">Thomas R.</p>
                <p className="testi-role">2 logements · Bordeaux</p>
              </div>
            </div>
          </div>

          <div className="testi-card">
            <span className="testi-badge">✓ Hôte vérifié</span>
            <div className="testi-stars">★★★★★</div>
            <div className="testi-quote">
              <span>L'alerte Telegram m'a sauvé la mise : un voyageur a signalé une fuite, j'ai reçu le message instantanément et j'ai pu envoyer un plombier avant que ça empire.</span>
            </div>
            <div className="testi-author">
              <div className="testi-avatar" style={{background: '#dcfce7'}}>👩</div>
              <div>
                <p className="testi-name">Marie C.</p>
                <p className="testi-role">5 logements · Paris</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing-section" id="tarifs">
        <div className="pricing-header">
          <h2>L'excellence accessible.</h2>
          <p>Profitez du service d'un majordome privé 24h/24 pour une fraction du coût d'une conciergerie traditionnelle.</p>
        </div>
        <div className="price-card-home">
          <div className="badge-promo">⚡ Offre : 1er mois à 9,90€</div>
          <div className="plan-name">Licence Unique</div>
          <div className="price">19,90€<span>/mois</span></div>
          <div className="billing-cycle">Facturé par logement. Sans engagement.</div>
          <div className="features-list">
            <div className="feature">
              <div className="check-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
              Majordome IA disponible 24h/24
            </div>
            <div className="feature">
              <div className="check-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
              Traduction automatique (30+ langues)
            </div>
            <div className="feature">
              <div className="check-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
              Recherche locale web intégrée
            </div>
            <div className="feature">
              <div className="check-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
              Alerte urgence en direct sur Telegram
            </div>
            <div className="feature">
              <div className="check-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
              Lien web personnalisé pour vos clients
            </div>
          </div>
          <Link href="/register" passHref legacyBehavior>
            <a className="cta-pricing">Créer mon compte (1er mois à 9,90€)</a>
          </Link>
          <div className="guarantee">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            Paiement sécurisé via Stripe
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-content">
          <div className="footer-col">
            <h3>Alfred<span className="gold">Major</span></h3>
            <p style={{maxWidth: '300px', lineHeight: '1.6'}}>
              Le premier majordome IA qui simplifie la vie des hôtes courte durée.
            </p>
          </div>
          <div className="footer-col">
            <h4 style={{color: 'white', marginBottom: '15px'}}>Produit</h4>
            <ul>
              <li><Link href="/login" passHref legacyBehavior><a>Espace Hôte</a></Link></li>
              <li><Link href="/register" passHref legacyBehavior><a>Inscription</a></Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4 style={{color: 'white', marginBottom: '15px'}}>Légal</h4>
            <ul>
              <li><Link href="/conditions-generales" passHref legacyBehavior><a>Conditions Générales</a></Link></li>
              <li><Link href="/confidentialite" passHref legacyBehavior><a>Confidentialité (RGPD)</a></Link></li>
              <li><Link href="/mentions-legales" passHref legacyBehavior><a>Mentions légales</a></Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4 style={{color: 'white', marginBottom: '15px'}}>Contact</h4>
            <ul>
              <li><a href="mailto:contact@alfredmajor.com">contact@alfredmajor.com</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Alfred Major - Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
