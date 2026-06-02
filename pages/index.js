import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="container">
      <Head>
        <title>Alfred Major | Le Majordome IA pour vos locations Courte durée</title>
        <meta name="description" content="Gérez vos locations courte durée en mode autopilote. Majordome IA 24h/24, gestion du ménage automatisée, upsells sans commission, alertes urgences. Premier mois offert, sans engagement." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.alfredmajor.com/" />
        <link rel="alternate" hrefLang="fr" href="https://www.alfredmajor.com/" />
        <link rel="alternate" hrefLang="en" href="https://www.alfredmajor.com/en" />
        <link rel="alternate" hrefLang="es" href="https://www.alfredmajor.com/es" />
        <link rel="alternate" hrefLang="x-default" href="https://www.alfredmajor.com/" />
        <meta property="og:title" content="Alfred Major — Gérez vos locations en mode autopilote" />
        <meta property="og:description" content="Majordome IA 24h/24, ménage automatisé, upsells sans commission, alertes urgences. Premier mois offert, sans engagement." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.alfredmajor.com/" />
        <meta property="og:image" content="https://www.alfredmajor.com/og-image.jpg" />
        <meta property="og:locale" content="fr_FR" />
        <meta property="og:site_name" content="Alfred Major" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f172a" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "SoftwareApplication",
          "name": "Alfred Major", "url": "https://www.alfredmajor.com",
          "description": "Plateforme tout-en-un pour la gestion de locations courte durée. Majordome IA, gestion ménage, upsells, alertes urgences.",
          "applicationCategory": "BusinessApplication", "operatingSystem": "Web, Android, iOS",
          "offers": { "@type": "Offer", "price": "9.90", "priceCurrency": "EUR" },
          "publisher": { "@type": "Organization", "name": "Alfred Major", "url": "https://www.alfredmajor.com" }
        })}} />
      </Head>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; overflow-x: hidden; background: #fafaf8; scroll-behavior: smooth; }
        a { text-decoration: none; color: inherit; }
        img { display: block; }
      `}</style>

      <style jsx>{`
        .container { font-family: 'DM Sans', sans-serif; color: #0f172a; background: #fafaf8; }

        /* ── NAVBAR ── */
        nav {
          display: flex; justify-content: space-between; align-items: center;
          padding: 0 5%; height: 68px;
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          transition: all 0.3s ease;
          background: ${scrolled ? 'rgba(250,250,248,0.95)' : 'transparent'};
          backdrop-filter: ${scrolled ? 'blur(20px)' : 'none'};
          border-bottom: ${scrolled ? '1px solid rgba(0,0,0,0.06)' : 'none'};
        }
        .brand { font-family: 'DM Sans', sans-serif; font-size: 22px; font-weight: 600; color: ${scrolled ? '#0f172a' : 'white'}; letter-spacing: -0.3px; transition: color 0.3s; }
        .brand-gold { color: #c9a227; }
        .nav-links { display: flex; align-items: center; gap: 28px; }
        .nav-link { font-size: 14px; font-weight: 400; color: ${scrolled ? '#475569' : 'rgba(255,255,255,0.8)'}; transition: color 0.2s; }
        .nav-link:hover { color: ${scrolled ? '#0f172a' : 'white'}; }
        .nav-lang { display: flex; align-items: center; gap: 2px; background: rgba(255,255,255,0.12); border-radius: 20px; padding: 3px; }
        .lang-btn { background: none; border: none; padding: 4px 9px; border-radius: 16px; cursor: pointer; font-size: 14px; font-family: inherit; transition: 0.2s; line-height: 1; }
        .lang-btn:hover, .lang-btn.active { background: white; }
        .nav-cta { background: #0f172a; color: white; padding: 10px 22px; border-radius: 24px; font-size: 14px; font-weight: 500; transition: 0.2s; }
        .nav-cta:hover { background: #c9a227; color: #0f172a; }

        /* ── HERO ── */
        .hero {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          text-align: center; padding: 130px 5% 90px;
          position: relative; overflow: hidden;
          background: linear-gradient(175deg, rgba(10,14,30,0.90) 0%, rgba(15,23,42,0.82) 45%, rgba(10,14,30,0.92) 100%),
                      url('https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1920&q=80') center/cover no-repeat fixed;
        }
        .hero-content { max-width: 820px; margin: 0 auto; position: relative; z-index: 2; }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(201,162,39,0.15); border: 1px solid rgba(201,162,39,0.3);
          color: #e8c84a; padding: 8px 18px; border-radius: 24px;
          font-size: 13px; font-weight: 500; margin-bottom: 32px; letter-spacing: 0.2px;
        }
        .hero h1 {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(42px, 7vw, 76px);
          color: white; margin-bottom: 24px;
          line-height: 1.06; letter-spacing: -1px; font-weight: 400;
        }
        .hero h1 em { font-style: italic; color: #e8c84a; }
        .hero-sub {
          font-size: clamp(16px, 2vw, 18px); color: rgba(255,255,255,0.62);
          line-height: 1.75; max-width: 600px; margin: 0 auto 44px; font-weight: 300;
        }
        .hero-actions { display: flex; align-items: center; justify-content: center; gap: 14px; flex-wrap: wrap; }
        .cta-primary {
          background: linear-gradient(135deg, #c9a227, #e8c84a);
          color: #0f172a; padding: 16px 36px; border-radius: 32px;
          font-weight: 600; font-size: 16px;
          box-shadow: 0 16px 40px rgba(201,162,39,0.35);
          display: inline-flex; align-items: center; gap: 8px; transition: 0.3s;
        }
        .cta-primary:hover { transform: translateY(-2px); box-shadow: 0 24px 50px rgba(201,162,39,0.45); }
        .cta-secondary {
          color: rgba(255,255,255,0.75); font-size: 15px; font-weight: 400;
          display: inline-flex; align-items: center; gap: 6px; transition: 0.2s;
        }
        .cta-secondary:hover { color: white; }
        .hero-trust {
          margin-top: 32px; display: flex; align-items: center; justify-content: center;
          gap: 20px; flex-wrap: wrap;
        }
        .trust-item { font-size: 13px; color: rgba(255,255,255,0.45); display: flex; align-items: center; gap: 6px; }
        .trust-sep { width: 3px; height: 3px; border-radius: 50%; background: rgba(255,255,255,0.2); }

        /* ── LOGOS ── */
        .logos { background: white; padding: 22px 5%; border-bottom: 1px solid #f1f5f9; text-align: center; }
        .logos-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; margin-bottom: 16px; }
        .logos-row { display: flex; justify-content: center; align-items: center; gap: 36px; flex-wrap: wrap; }
        .logo-pill {
          font-size: 15px; font-weight: 600; color: #c4c4bc;
          letter-spacing: -0.2px; font-family: 'DM Sans', sans-serif; transition: 0.2s;
        }
        .logo-pill:hover { color: #64748b; }

        /* ── PILIERS ── */
        .pillars { padding: 96px 5%; background: #fafaf8; }
        .section-eyebrow { font-size: 12px; font-weight: 600; color: #c9a227; text-transform: uppercase; letter-spacing: 2.5px; margin-bottom: 14px; }
        .section-h2 {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(30px, 5vw, 46px);
          font-weight: 400; color: #0f172a; line-height: 1.15;
          letter-spacing: -0.5px; margin-bottom: 14px;
        }
        .section-sub { font-size: 17px; color: #64748b; line-height: 1.7; max-width: 560px; margin-bottom: 56px; font-weight: 300; }
        .pillars-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1px; background: #e8e8e2;
          border: 1px solid #e8e8e2; border-radius: 20px; overflow: hidden;
        }
        .pillar-card {
          background: white; padding: 32px 28px;
          transition: 0.25s;
        }
        .pillar-card:hover { background: #fffef8; }
        .pillar-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: #faf8f0; border: 1px solid #f0ead4;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; margin-bottom: 18px;
        }
        .pillar-card h3 { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 8px; }
        .pillar-card p { font-size: 14px; color: #64748b; line-height: 1.65; font-weight: 300; }
        .pillar-tag {
          display: inline-block; margin-top: 14px;
          font-size: 11px; font-weight: 600; color: #c9a227;
          background: #faf6e8; border: 1px solid #f0e4a8;
          padding: 3px 10px; border-radius: 10px;
        }

        /* ── PAIN ── */
        .pain {
          padding: 96px 5%;
          background: linear-gradient(rgba(10,14,30,0.90), rgba(10,14,30,0.88)),
                      url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1920&q=80') center/cover fixed;
          text-align: center; color: white;
        }
        .pain .section-h2 { color: white; }
        .pain .section-sub { color: rgba(255,255,255,0.55); }
        .pain-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; max-width: 1100px; margin: 0 auto; }
        .pain-card {
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px; overflow: hidden; text-align: left; transition: 0.3s;
        }
        .pain-card:hover { background: rgba(255,255,255,0.1); border-color: rgba(201,162,39,0.4); transform: translateY(-4px); }
        .pain-img { width: 100%; height: 180px; object-fit: cover; }
        .pain-body { padding: 24px; }
        .pain-body h3 { font-family: 'Instrument Serif', serif; font-size: 20px; font-weight: 400; color: white; margin-bottom: 10px; }
        .pain-body p { font-size: 14px; color: rgba(255,255,255,0.55); line-height: 1.7; font-weight: 300; }

        /* ── DEMO CHAT ── */
        .demo { padding: 96px 5%; background: white; }
        .demo-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; max-width: 1100px; margin: 0 auto; align-items: center; }
        .phone-wrap { position: relative; max-width: 280px; margin: 0 auto; }
        .phone-frame {
          border: 8px solid #1e293b; border-radius: 44px; overflow: hidden;
          background: white; box-shadow: 0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05);
          height: 580px;
        }
        .phone-notch { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 90px; height: 22px; background: #1e293b; border-radius: 0 0 14px 14px; z-index: 10; }
        .chat-app { display: flex; flex-direction: column; height: 100%; background: #f0f2f5; }
        .chat-head { background: linear-gradient(135deg, #0f172a, #1e3a5f); color: white; padding: 38px 16px 14px; text-align: center; }
        .chat-head-title { font-weight: 600; font-size: 14px; }
        .chat-head-sub { font-size: 11px; opacity: 0.6; margin-top: 2px; }
        .chat-msgs { flex: 1; padding: 16px; display: flex; flex-direction: column; gap: 10px; overflow: hidden; }
        .msg { padding: 10px 13px; border-radius: 16px; font-size: 12px; line-height: 1.55; max-width: 82%; }
        .msg-user { background: #c9a227; color: white; align-self: flex-end; border-bottom-right-radius: 4px; font-weight: 500; }
        .msg-alfred { background: white; color: #1e293b; align-self: flex-start; border-bottom-left-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .demo-text h2 { font-family: 'Instrument Serif', serif; font-size: 36px; font-weight: 400; color: #0f172a; margin-bottom: 16px; line-height: 1.2; letter-spacing: -0.3px; }
        .demo-text p { font-size: 16px; color: #64748b; line-height: 1.75; margin-bottom: 28px; font-weight: 300; }
        .demo-feats { display: flex; flex-direction: column; gap: 14px; }
        .demo-feat { display: flex; align-items: flex-start; gap: 12px; }
        .feat-dot { width: 22px; height: 22px; border-radius: 50%; background: #faf6e8; border: 1.5px solid #e8c84a; display: flex; align-items: center; justify-content: center; color: #c9a227; font-size: 11px; font-weight: 700; flex-shrink: 0; margin-top: 1px; }
        .demo-feat div h4 { font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 3px; }
        .demo-feat div p { font-size: 13px; color: #64748b; line-height: 1.5; font-weight: 300; }

        /* ── URGENCE KILLER FEATURE ── */
        .urgence {
          background: #fafaf8; padding: 80px 5%;
          border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;
        }
        .urgence-inner {
          max-width: 1000px; margin: 0 auto;
          display: flex; align-items: center; gap: 64px; flex-wrap: wrap;
        }
        .urgence-text { flex: 1; min-width: 280px; }
        .urgence-tag { display: inline-flex; align-items: center; gap: 8px; background: #fff0f0; border: 1px solid #fecaca; color: #dc2626; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 20px; }
        .urgence-dot { width: 7px; height: 7px; border-radius: 50%; background: #dc2626; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }
        .urgence-text h2 { font-family: 'Instrument Serif', serif; font-size: 34px; font-weight: 400; color: #0f172a; margin-bottom: 16px; line-height: 1.2; letter-spacing: -0.3px; }
        .urgence-text p { font-size: 15px; color: #64748b; line-height: 1.75; margin-bottom: 12px; font-weight: 300; }
        .urgence-mockup { flex: 1; min-width: 280px; }
        .notif-phone { background: #1e293b; border-radius: 22px; padding: 18px; max-width: 320px; }
        .notif-screen { background: #f8fafc; border-radius: 12px; padding: 14px; }
        .notif-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .notif-icon { width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #0088cc, #005fa3); display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
        .notif-meta { flex: 1; }
        .notif-app { font-size: 12px; font-weight: 700; color: #1e293b; }
        .notif-time { font-size: 11px; color: #94a3b8; }
        .notif-bubble { background: white; border-radius: 10px; padding: 14px; border-left: 3px solid #dc2626; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .notif-bubble p { font-size: 13px; color: #334155; line-height: 1.55; margin: 0; }

        /* ── UPSELLS FEATURE ── */
        .upsells-section { padding: 96px 5%; background: white; }
        .upsells-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
        .upsells-text h2 { font-family: 'Instrument Serif', serif; font-size: 36px; font-weight: 400; color: #0f172a; margin-bottom: 16px; letter-spacing: -0.3px; line-height: 1.2; }
        .upsells-text p { font-size: 16px; color: #64748b; line-height: 1.75; margin-bottom: 28px; font-weight: 300; }
        .upsells-perks { display: flex; flex-direction: column; gap: 12px; }
        .perk { display: flex; align-items: center; gap: 12px; font-size: 14px; color: #475569; font-weight: 400; }
        .perk-icon { width: 32px; height: 32px; background: #faf6e8; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
        .upsells-mockup { display: flex; flex-direction: column; gap: 10px; }
        .upsell-card {
          background: #fafaf8; border: 1px solid #e8e8e2; border-radius: 14px;
          padding: 16px 18px; display: flex; align-items: center; gap: 14px; transition: 0.2s;
        }
        .upsell-card:hover { border-color: #c9a227; background: #fffef5; }
        .upsell-emoji { font-size: 26px; flex-shrink: 0; }
        .upsell-info { flex: 1; }
        .upsell-name { font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 2px; }
        .upsell-desc { font-size: 12px; color: #94a3b8; font-weight: 300; }
        .upsell-price { font-size: 16px; font-weight: 600; color: #0f172a; }
        .upsell-cta { background: #0f172a; color: white; border: none; padding: 7px 14px; border-radius: 20px; font-size: 12px; font-weight: 500; cursor: pointer; white-space: nowrap; font-family: inherit; }

        /* ── BENEFITS (photo) ── */
        .benefits { padding: 96px 5%; background: #fafaf8; }
        .benefits-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        .benefits-img { border-radius: 24px; overflow: hidden; height: 480px; position: relative; }
        .benefits-img img { width: 100%; height: 100%; object-fit: cover; }
        .benefits-img-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(15,23,42,0.2), transparent); }
        .benefits-cards { display: flex; flex-direction: column; gap: 16px; }
        .benefit-card { background: white; border: 1px solid #e8e8e2; border-radius: 16px; padding: 22px; display: flex; gap: 16px; align-items: flex-start; transition: 0.2s; }
        .benefit-card:hover { border-color: #c9a227; transform: translateX(4px); }
        .benefit-ico { width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .bi1 { background: #eff6ff; } .bi2 { background: #faf6e8; } .bi3 { background: #f0fdf4; }
        .benefit-card h4 { font-size: 15px; font-weight: 600; color: #0f172a; margin-bottom: 5px; }
        .benefit-card p { font-size: 13px; color: #64748b; line-height: 1.6; font-weight: 300; }

        /* ── TEMOIGNAGES ── */
        .testi { padding: 96px 5%; background: white; text-align: center; }
        .testi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; max-width: 1100px; margin: 52px auto 0; }
        .testi-card { background: #fafaf8; border: 1px solid #e8e8e2; border-radius: 20px; padding: 32px; text-align: left; position: relative; transition: 0.3s; }
        .testi-card:hover { border-color: #c9a227; box-shadow: 0 16px 40px rgba(0,0,0,0.06); transform: translateY(-4px); }
        .testi-verified { position: absolute; top: 18px; right: 18px; background: #f0fdf4; color: #16a34a; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 10px; border: 1px solid #bbf7d0; }
        .testi-stars { color: #f59e0b; font-size: 14px; margin-bottom: 16px; letter-spacing: 1px; }
        .testi-quote { font-family: 'Instrument Serif', serif; font-size: 16px; color: #334155; line-height: 1.8; margin-bottom: 24px; font-style: italic; }
        .testi-author { display: flex; align-items: center; gap: 12px; }
        .testi-av { width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; color: white; flex-shrink: 0; }
        .av1{background:linear-gradient(135deg,#f59e0b,#d97706)} .av2{background:linear-gradient(135deg,#3b82f6,#1d4ed8)} .av3{background:linear-gradient(135deg,#10b981,#059669)}
        .testi-name { font-weight: 600; font-size: 14px; color: #0f172a; margin-bottom: 1px; }
        .testi-role { font-size: 12px; color: #94a3b8; font-weight: 300; }

        /* ── PRICING ── */
        .pricing {
          padding: 96px 5%; text-align: center;
          background: linear-gradient(160deg, #0a0e1e 0%, #0f172a 60%, #0a0e1e 100%);
          position: relative; overflow: hidden;
        }
        .pricing::before { content: ''; position: absolute; top: -30%; right: -10%; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(201,162,39,0.06) 0%, transparent 70%); pointer-events: none; }
        .pricing .section-h2 { color: white; }
        .pricing .section-sub { color: rgba(255,255,255,0.5); }
        .price-card {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(20px); border-radius: 24px; padding: 44px 40px;
          max-width: 440px; margin: 0 auto; position: relative;
        }
        .price-promo { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #c9a227, #e8c84a); color: #0f172a; padding: 5px 20px; border-radius: 14px; font-size: 12px; font-weight: 600; white-space: nowrap; }
        .plan-label { font-size: 12px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 2px; font-weight: 500; margin-bottom: 20px; }
        .price-old { font-size: 16px; color: rgba(255,255,255,0.3); text-decoration: line-through; margin-bottom: 4px; }
        .price-amount { font-family: 'Instrument Serif', serif; font-size: 64px; color: white; line-height: 1; margin-bottom: 4px; letter-spacing: -2px; }
        .price-amount span { font-size: 20px; font-family: 'DM Sans', sans-serif; color: rgba(255,255,255,0.4); letter-spacing: 0; }
        .price-note { font-size: 13px; color: rgba(255,255,255,0.35); margin-bottom: 32px; }
        .price-divider { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin-bottom: 24px; }
        .price-feats { text-align: left; margin-bottom: 32px; display: flex; flex-direction: column; gap: 12px; }
        .price-feat { display: flex; align-items: center; gap: 10px; font-size: 14px; color: rgba(255,255,255,0.7); font-weight: 300; }
        .price-check { width: 20px; height: 20px; border-radius: 50%; background: rgba(201,162,39,0.2); display: flex; align-items: center; justify-content: center; color: #e8c84a; font-size: 10px; font-weight: 700; flex-shrink: 0; }
        .price-cta { background: linear-gradient(135deg, #c9a227, #e8c84a); color: #0f172a; padding: 16px; border-radius: 16px; font-weight: 600; font-size: 16px; display: block; transition: 0.3s; }
        .price-cta:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(201,162,39,0.3); }
        .price-security { margin-top: 14px; font-size: 12px; color: rgba(255,255,255,0.25); display: flex; align-items: center; justify-content: center; gap: 6px; }

        /* ── PARRAINAGE ── */
        .referral { padding: 80px 5%; background: #fafaf8; text-align: center; border-top: 1px solid #f1f5f9; }
        .referral-inner { max-width: 680px; margin: 0 auto; }
        .referral h2 { font-family: 'Instrument Serif', serif; font-size: 34px; font-weight: 400; color: #0f172a; margin-bottom: 14px; letter-spacing: -0.3px; }
        .referral p { font-size: 16px; color: #64748b; line-height: 1.7; margin-bottom: 32px; font-weight: 300; }
        .referral-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; max-width: 500px; margin: 0 auto 32px; }
        .referral-card { background: white; border: 1px solid #e8e8e2; border-radius: 16px; padding: 24px; text-align: center; }
        .referral-number { font-family: 'Instrument Serif', serif; font-size: 42px; color: #c9a227; line-height: 1; margin-bottom: 6px; }
        .referral-label { font-size: 13px; color: #64748b; font-weight: 400; }

        /* ── FOOTER ── */
        footer { background: #060d1f; color: #475569; padding: 64px 5% 28px; }
        .footer-inner { max-width: 1100px; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 40px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 44px; margin-bottom: 24px; }
        .footer-brand-col { max-width: 240px; }
        .footer-logo { font-size: 20px; font-weight: 600; color: white; display: block; margin-bottom: 12px; }
        .footer-logo span { color: #c9a227; }
        .footer-brand-col p { font-size: 13px; line-height: 1.7; color: #475569; font-weight: 300; }
        .footer-col h4 { color: rgba(255,255,255,0.7); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 18px; }
        .footer-col ul { list-style: none; padding: 0; margin: 0; }
        .footer-col ul li { margin-bottom: 10px; }
        .footer-col ul li a { font-size: 14px; color: #475569; transition: 0.2s; font-weight: 300; }
        .footer-col ul li a:hover { color: rgba(255,255,255,0.8); }
        .footer-bottom { text-align: center; font-size: 12px; color: #334155; font-weight: 300; }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          nav { padding: 0 16px; }
          .nav-link { display: none; }
          .nav-links { gap: 10px; }
          .hero { padding: 110px 16px 70px; background-attachment: scroll; }
          .pillars-grid { grid-template-columns: 1fr; }
          .demo-layout, .upsells-inner, .benefits-inner { grid-template-columns: 1fr; gap: 40px; }
          .urgence-inner { gap: 40px; }
          .benefits-img { height: 260px; }
          .pain-grid, .testi-grid { grid-template-columns: 1fr; }
          .referral-cards { grid-template-columns: 1fr 1fr; }
          .pain { background-attachment: scroll; }
          .pillars, .demo, .upsells-section, .benefits, .testi, .pricing, .referral { padding: 64px 16px; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav>
        <Link href="/" passHref legacyBehavior>
          <a className="brand">Alfred<span className="brand-gold">Major</span></a>
        </Link>
        <div className="nav-links">
          <a href="#fonctionnement" className="nav-link">Fonctionnalités</a>
          <a href="#tarifs" className="nav-link">Tarifs</a>
          <div className="nav-lang">
            <button className="lang-btn active">🇫🇷</button>
            <button className="lang-btn" onClick={() => router.push('/en')}>🇬🇧</button>
            <button className="lang-btn" onClick={() => router.push('/es')}>🇪🇸</button>
          </div>
          <Link href="/login" passHref legacyBehavior>
            <a className="nav-cta">Espace Hôte</a>
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🎁 1er mois 100% offert — Sans engagement</div>
          <h1>Gérez vos locations<br/>en mode <em>autopilote.</em></h1>
          <p className="hero-sub">
            Majordome IA pour vos voyageurs, gestion automatique du ménage, upsells sans commission et alertes urgences — tout en un, à 9,90€/mois.
          </p>
          <div className="hero-actions">
            <Link href="/register" passHref legacyBehavior>
              <a className="cta-primary">Démarrer gratuitement →</a>
            </Link>
            <a href="#demo" className="cta-secondary">Voir la démo ↓</a>
          </div>
          <div className="hero-trust">
            <span className="trust-item">✓ Sans carte bancaire</span>
            <span className="trust-sep" />
            <span className="trust-item">✓ Configuration en 5 min</span>
            <span className="trust-sep" />
            <span className="trust-item">✓ 30+ langues</span>
            <span className="trust-sep" />
            <span className="trust-item">✓ 0% commission</span>
          </div>
        </div>
      </section>

      {/* ── LOGOS ── */}
      <section className="logos">
        <p className="logos-label">Compatible avec toutes les plateformes</p>
        <div className="logos-row">
          {['Airbnb', 'Booking.com', 'Abritel', 'Vrbo', 'Expedia'].map(p => (
            <span key={p} className="logo-pill">{p}</span>
          ))}
        </div>
      </section>

      {/* ── PILLARS ── */}
      <section className="pillars" id="fonctionnement">
        <div className="section-eyebrow">Tout inclus</div>
        <h2 className="section-h2">6 outils. 1 abonnement.<br/>Zéro friction.</h2>
        <p className="section-sub">Là où d'autres facturent 300€/mois pour assembler 6 outils séparés, Alfred Major fait tout pour 9,90€.</p>
        <div className="pillars-grid">
          {[
            { icon: '🎩', title: 'Majordome IA', desc: 'Répond aux voyageurs 24h/24 en 30+ langues. Ton chaleureux, réponses précises, mémoire de conversation.', tag: 'Disponible 24h/24' },
            { icon: '🧹', title: 'Ménage automatisé', desc: 'Détecte les nouvelles réservations, notifie votre prestataire, confirme le ménage par photos avant chaque arrivée.', tag: 'Zéro gestion manuelle' },
            { icon: '💰', title: 'Upsells sans commission', desc: 'Late checkout, pack romantique, transfert... Alfred propose au bon moment. Paiement direct sur votre compte Stripe.', tag: '0% de commission' },
            { icon: '📅', title: 'Calendrier synchronisé', desc: 'Sync iCal Airbnb & Booking en temps réel. Réservations détectées automatiquement, missions ménage créées dans la foulée.', tag: 'Sync en temps réel' },
            { icon: '🚨', title: 'Alertes urgences', desc: 'Fuite, panne, incendie — Alfred détecte et vous alerte instantanément sur Telegram et votre mobile, avec traduction auto.', tag: 'Telegram + Push' },
            { icon: '🎁', title: 'Programme parrainage', desc: '2 mois offerts pour chaque hôte parrainé qui s\'active. Votre réseau travaille pour réduire votre abonnement à zéro.', tag: '2 mois offerts' },
          ].map((p, i) => (
            <div key={i} className="pillar-card">
              <div className="pillar-icon">{p.icon}</div>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
              <span className="pillar-tag">{p.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── PAIN POINTS ── */}
      <section className="pain">
        <div className="section-eyebrow">Fini les nuits coupées</div>
        <h2 className="section-h2" style={{color:'white', marginBottom:'12px'}}>La gestion locative réinventée.</h2>
        <p className="section-sub" style={{margin:'0 auto 52px', textAlign:'center'}}>Alfred élimine les interruptions du quotidien.</p>
        <div className="pain-grid">
          {[
            { img: '/pain-nuit.png', alt: 'Message de nuit', title: 'Le message à 23h30', desc: 'Le voyageur ne trouve pas le WiFi. Votre téléphone sonne pendant votre sommeil. Alfred répond instantanément, en pleine nuit, sans vous déranger.' },
            { img: '/pain-langue.png', alt: 'Barrière langue', title: 'La barrière de la langue', desc: 'Alfred parle 30+ langues couramment. Vos voyageurs étrangers sont servis dans leur langue, sans effort de votre part.' },
            { img: '/pain-questions.png', alt: 'Questions répétées', title: 'Les questions répétées', desc: 'Poubelles, départ, parking... Alfred répond avec une patience et une précision irréprochable, chaque fois comme si c\'était la première.' },
          ].map((item, i) => (
            <div key={i} className="pain-card">
              <img src={item.img} alt={item.alt} className="pain-img" loading="lazy" />
              <div className="pain-body">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DEMO CHAT ── */}
      <section className="demo" id="demo">
        <div style={{textAlign:'center', marginBottom:'52px'}}>
          <div className="section-eyebrow">En action</div>
          <h2 className="section-h2">L'illusion parfaite<br/>d'un concierge humain.</h2>
          <p className="section-sub" style={{margin:'0 auto'}}>Vos voyageurs ne savent pas qu'ils parlent à une IA.</p>
        </div>
        <div className="demo-layout">
          <div className="phone-wrap">
            <div className="phone-frame">
              <div className="phone-notch" />
              <div className="chat-app">
                <div className="chat-head">
                  <div className="chat-head-title">🎩 Alfred — Villa Noam</div>
                  <div className="chat-head-sub">Disponible 24h/24</div>
                </div>
                <div className="chat-msgs">
                  <div className="msg msg-user">Hi! What's the WiFi password? 📶</div>
                  <div className="msg msg-alfred">Welcome to Villa Noam! 🎩 Network: <strong>VillaNomad_5G</strong>, password: <strong>Holiday2024</strong></div>
                  <div className="msg msg-user">Can we check out at 2pm?</div>
                  <div className="msg msg-alfred">Of course! Late check-out until 2pm is available for 30€. You can book it here → ✨</div>
                  <div className="msg msg-user">Il y a une fuite sous l'évier !</div>
                  <div className="msg msg-alfred">Je comprends, restez calme. La vanne est sous l'évier à droite. Je préviens immédiatement votre hôte. 🚨</div>
                </div>
              </div>
            </div>
          </div>
          <div className="demo-text">
            <h2>Répond, recommande, alerte — sans jamais vous déranger.</h2>
            <p>Alfred puise dans la base de connaissance que vous avez configurée pour répondre avec précision. Il cherche les meilleures adresses locales en temps réel et détecte les urgences automatiquement.</p>
            <div className="demo-feats">
              {[
                { title: 'Recommandations locales en temps réel', desc: 'Restaurants, pharmacies, transports — Alfred scanne les environs via Google Maps.' },
                { title: 'Propose vos upsells naturellement', desc: 'Si un voyageur demande un départ tardif, Alfred propose votre late check-out directement.' },
                { title: 'Détecte les urgences et alerte', desc: 'Fuite, panne, gaz — Alfred vous alerte sur Telegram avec traduction automatique.' },
                { title: 'Mémoire de conversation', desc: 'Alfred comprend le contexte et ne demande jamais deux fois la même chose.' },
              ].map((f, i) => (
                <div key={i} className="demo-feat">
                  <div className="feat-dot">✓</div>
                  <div><h4>{f.title}</h4><p>{f.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── URGENCE ── */}
      <section className="urgence">
        <div className="urgence-inner">
          <div className="urgence-text">
            <div className="urgence-tag"><div className="urgence-dot" /> Alerte en temps réel</div>
            <h2>Vous n'êtes dérangé que lorsque c'est vital.</h2>
            <p>Si un voyageur signale une urgence, Alfred vous transfère instantanément l'information sur Telegram — avec traduction automatique si nécessaire.</p>
            <p><strong>Résultat :</strong> Vous filtrez 95% du bruit quotidien et gardez le contrôle sur l'essentiel.</p>
          </div>
          <div className="urgence-mockup">
            <div className="notif-phone">
              <div className="notif-screen">
                <div className="notif-row">
                  <div className="notif-icon">✈️</div>
                  <div className="notif-meta">
                    <div className="notif-app">Telegram</div>
                    <div className="notif-time">maintenant</div>
                  </div>
                </div>
                <div className="notif-bubble">
                  <p>🚨 <strong>ALERTE ALFRED MAJOR</strong><br/><br/>🏠 Villa Noam — Paris<br/>💬 "Il y a une énorme fuite sous l'évier !"<br/>🔄 Traduction : Water leak under the sink</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── UPSELLS ── */}
      <section className="upsells-section">
        <div className="upsells-inner">
          <div className="upsells-text">
            <div className="section-eyebrow">Revenus additionnels</div>
            <h2 className="section-h2">Boostez vos revenus.<br/>0% de commission.</h2>
            <p>Vos voyageurs peuvent commander des services premium directement depuis leur conversation avec Alfred. Le paiement va directement sur votre compte Stripe.</p>
            <div className="upsells-perks">
              {[
                { icon: '💶', text: 'Paiement direct sur votre compte Stripe' },
                { icon: '0️⃣', text: 'Alfred Major ne prend aucune commission' },
                { icon: '🤖', text: 'Alfred propose au bon moment, naturellement' },
                { icon: '🌍', text: 'Page voyageur multilingue et personnalisée' },
              ].map((p, i) => (
                <div key={i} className="perk">
                  <div className="perk-icon">{p.icon}</div>
                  {p.text}
                </div>
              ))}
            </div>
          </div>
          <div className="upsells-mockup">
            {[
              { emoji: '🕐', name: 'Late check-out', desc: 'Départ jusqu\'à 14h', price: '30€' },
              { emoji: '🌅', name: 'Early check-in', desc: 'Arrivée dès 10h', price: '25€' },
              { emoji: '🥂', name: 'Pack romantique', desc: 'Champagne & fleurs', price: '45€' },
              { emoji: '🚗', name: 'Transfert aéroport', desc: 'Navette privée', price: '50€' },
            ].map((u, i) => (
              <div key={i} className="upsell-card">
                <div className="upsell-emoji">{u.emoji}</div>
                <div className="upsell-info">
                  <div className="upsell-name">{u.name}</div>
                  <div className="upsell-desc">{u.desc}</div>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                  <div className="upsell-price">{u.price}</div>
                  <button className="upsell-cta">Réserver</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section className="benefits">
        <div style={{textAlign:'center', marginBottom:'52px'}}>
          <div className="section-eyebrow">Pourquoi Alfred</div>
          <h2 className="section-h2">Ce que vivent nos hôtes<br/>au quotidien.</h2>
        </div>
        <div className="benefits-inner">
          <div className="benefits-img">
            <img src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80" alt="Hôte détendu" loading="lazy" />
            <div className="benefits-img-overlay" />
          </div>
          <div className="benefits-cards">
            {[
              { ico: '😴', cls: 'bi1', title: 'Nuits complètes garanties', desc: 'Plus besoin de garder un œil sur votre téléphone. Alfred gère les questions WiFi, codes et équipements à votre place, 24h/24.' },
              { ico: '🧹', cls: 'bi2', title: 'Ménage géré automatiquement', desc: 'Dès qu\'une réservation est détectée, votre prestataire est notifié. Vous recevez une confirmation avec photos avant chaque arrivée.' },
              { ico: '⭐', cls: 'bi3', title: 'Notes Airbnb améliorées', desc: 'Des voyageurs mieux accompagnés laissent de meilleures notes. Réactivité instantanée et service multilingue font la différence.' },
            ].map((b, i) => (
              <div key={i} className="benefit-card">
                <div className={`benefit-ico ${b.cls}`}>{b.ico}</div>
                <div><h4>{b.title}</h4><p>{b.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEMOIGNAGES ── */}
      <section className="testi">
        <div className="section-eyebrow">Ils nous font confiance</div>
        <h2 className="section-h2">Ce que disent nos premiers hôtes.</h2>
        <div className="testi-grid">
          {[
            { av: 'av1', initials: 'SL', name: 'Sophie L.', role: '3 logements · Nice', quote: 'Alfred répond à toutes les questions de mes voyageurs, même à 3h du matin. Je n\'ai plus reçu un seul appel pour le code WiFi depuis que je l\'ai installé. Un vrai soulagement.' },
            { av: 'av2', initials: 'TR', name: 'Thomas R.', role: '2 logements · Bordeaux', quote: 'J\'avais des voyageurs étrangers qui ne parlaient pas français. Alfred leur a répondu en anglais, espagnol et même en allemand. Mes notes Airbnb ont augmenté depuis.' },
            { av: 'av3', initials: 'MC', name: 'Marie C.', role: '5 logements · Paris', quote: 'L\'alerte Telegram m\'a sauvé la mise : un voyageur a signalé une fuite, j\'ai reçu le message instantanément et j\'ai pu envoyer un plombier avant que ça empire.' },
          ].map((t, i) => (
            <div key={i} className="testi-card">
              <span className="testi-verified">✓ Hôte vérifié</span>
              <div className="testi-stars">★★★★★</div>
              <p className="testi-quote">{t.quote}</p>
              <div className="testi-author">
                <div className={`testi-av ${t.av}`}>{t.initials}</div>
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="pricing" id="tarifs">
        <div className="section-eyebrow">Tarifs</div>
        <h2 className="section-h2" style={{marginBottom:'12px'}}>Simple. Transparent.<br/>Sans surprise.</h2>
        <p className="section-sub" style={{margin:'0 auto 52px'}}>Un majordome privé 24h/24 pour une fraction du coût d'une conciergerie traditionnelle.</p>
        <div className="price-card">
          <div className="price-promo">🎁 1er mois 100% offert</div>
          <div className="plan-label">Licence par logement</div>
          <div className="price-old">19,90€/mois</div>
          <div className="price-amount">9,90€<span>/mois</span></div>
          <div className="price-note">puis 19,90€/mois — sans engagement, résiliable en 1 clic</div>
          <hr className="price-divider" />
          <div className="price-feats">
            {[
              'Majordome IA 24h/24 · 30+ langues',
              'Gestion ménage automatisée',
              'Upsells 0% commission (Stripe Connect)',
              'Sync calendrier iCal Airbnb & Booking',
              'Alertes urgences Telegram + Push mobile',
              'Historique conversations voyageurs',
              'Programme parrainage — 2 mois offerts',
            ].map((f, i) => (
              <div key={i} className="price-feat">
                <div className="price-check">✓</div>
                {f}
              </div>
            ))}
          </div>
          <Link href="/register" passHref legacyBehavior>
            <a className="price-cta">Commencer gratuitement — 1er mois offert</a>
          </Link>
          <div className="price-security">🔒 Paiement 100% sécurisé via Stripe · Pas de commission sur vos réservations</div>
        </div>
      </section>

      {/* ── PARRAINAGE ── */}
      <section className="referral">
        <div className="referral-inner">
          <div className="section-eyebrow">Parrainage</div>
          <h2>Parrainez. Économisez.<br/>Réduisez votre abonnement à zéro.</h2>
          <p>Partagez votre lien unique à d'autres hôtes. Dès qu'un filleul active son premier logement, vous êtes tous les deux récompensés automatiquement.</p>
          <div className="referral-cards">
            <div className="referral-card">
              <div className="referral-number">2</div>
              <div className="referral-label">mois offerts pour vous</div>
            </div>
            <div className="referral-card">
              <div className="referral-number">1</div>
              <div className="referral-label">mois offert pour votre filleul</div>
            </div>
          </div>
          <Link href="/register" passHref legacyBehavior>
            <a className="cta-primary" style={{display:'inline-flex'}}>Créer mon compte et obtenir mon lien →</a>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-inner">
          <div className="footer-brand-col">
            <span className="footer-logo">Alfred<span>Major</span></span>
            <p>La plateforme tout-en-un pour gérer vos locations courte durée en mode autopilote.</p>
          </div>
          <div className="footer-col">
            <h4>Produit</h4>
            <ul>
              <li><Link href="/login" passHref legacyBehavior><a>Espace Hôte</a></Link></li>
              <li><Link href="/register" passHref legacyBehavior><a>Créer un compte</a></Link></li>
              <li><a href="#tarifs">Tarifs</a></li>
              <li><a href="#fonctionnement">Fonctionnalités</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Légal</h4>
            <ul>
              <li><Link href="/conditions-generales" passHref legacyBehavior><a>Conditions Générales</a></Link></li>
              <li><Link href="/confidentialite" passHref legacyBehavior><a>Confidentialité (RGPD)</a></Link></li>
              <li><Link href="/mentions-legales" passHref legacyBehavior><a>Mentions légales</a></Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li><a href="mailto:contact@alfredmajor.com">contact@alfredmajor.com</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Alfred Major — Tous droits réservés · Dorian BISCARRAT · SIRET 531 965 044 00039</p>
        </div>
      </footer>
    </div>
  );
}
