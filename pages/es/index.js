import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function HomeES() {
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
        <title>Alfred Major | El Mayordomo IA para Alquileres de Corta Estancia</title>
        <meta name="description" content="Gestiona tus alquileres de corta estancia en piloto automático. Mayordomo IA 24/7, limpieza automatizada, upsells sin comisión, alertas de emergencia. Primer mes gratis, sin compromiso." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.alfredmajor.com/es" />
        <link rel="alternate" hrefLang="fr" href="https://www.alfredmajor.com/" />
        <link rel="alternate" hrefLang="en" href="https://www.alfredmajor.com/en" />
        <link rel="alternate" hrefLang="es" href="https://www.alfredmajor.com/es" />
        <link rel="alternate" hrefLang="x-default" href="https://www.alfredmajor.com/" />
        <meta property="og:title" content="Alfred Major — Gestiona tus alquileres en piloto automático" />
        <meta property="og:description" content="Mayordomo IA 24/7, limpieza automatizada, upsells sin comisión, alertas de emergencia. Primer mes gratis, sin compromiso." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.alfredmajor.com/es" />
        <meta property="og:image" content="https://www.alfredmajor.com/og-image.jpg" />
        <meta property="og:locale" content="es_ES" />
        <meta property="og:site_name" content="Alfred Major" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "SoftwareApplication",
          "name": "Alfred Major", "url": "https://www.alfredmajor.com",
          "description": "Plataforma todo en uno para la gestión de alquileres de corta estancia. Mayordomo IA, limpieza, upsells, alertas de emergencia.",
          "applicationCategory": "BusinessApplication", "operatingSystem": "Web, Android, iOS",
          "offers": { "@type": "Offer", "price": "9.90", "priceCurrency": "EUR" },
          "publisher": { "@type": "Organization", "name": "Alfred Major", "url": "https://www.alfredmajor.com" }
        })}} />
      </Head>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; }
        body { background: #fff; overflow-x: hidden; }
        a { text-decoration: none; color: inherit; }
        img { display: block; max-width: 100%; }
      `}</style>

      <style jsx>{`
        .container { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; color: #1d1d1f; background: #fff; font-weight: 400; }
        nav {
          display: flex; justify-content: space-between; align-items: center;
          padding: 0 48px; height: 64px; position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          transition: background 0.4s ease, border-color 0.4s ease;
          background: ${scrolled ? 'rgba(255,255,255,0.88)' : 'transparent'};
          backdrop-filter: ${scrolled ? 'saturate(180%) blur(20px)' : 'none'};
          border-bottom: 1px solid ${scrolled ? 'rgba(0,0,0,0.08)' : 'transparent'};
        }
        .brand { font-size: 20px; font-weight: 600; letter-spacing: -0.4px; color: ${scrolled ? '#1d1d1f' : '#fff'}; transition: color 0.4s; }
        .brand-gold { color: #c9a227; }
        .nav-links { display: flex; align-items: center; gap: 32px; }
        .nav-link { font-size: 14px; font-weight: 400; color: ${scrolled ? '#6e6e73' : 'rgba(255,255,255,0.75)'}; transition: color 0.2s; }
        .nav-link:hover { color: ${scrolled ? '#1d1d1f' : '#fff'}; }
        .nav-lang { display: flex; align-items: center; gap: 2px; background: ${scrolled ? '#f5f5f7' : 'rgba(255,255,255,0.12)'}; border-radius: 20px; padding: 3px; }
        .lang-btn { background: none; border: none; padding: 4px 9px; border-radius: 16px; cursor: pointer; font-size: 13px; font-family: inherit; transition: background 0.2s; line-height: 1; }
        .lang-btn:hover, .lang-btn.active { background: white; }
        .nav-cta { background: #1d1d1f; color: #fff; padding: 9px 20px; border-radius: 980px; font-size: 13px; font-weight: 500; transition: background 0.2s; }
        .nav-cta:hover { background: #c9a227; color: #1d1d1f; }
        .hero { min-height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 120px 24px 100px; position: relative; overflow: hidden;
          background: linear-gradient(180deg, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.38) 60%, rgba(0,0,0,0.62) 100%),
            url('https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1920&q=80') center/cover no-repeat;
          background-attachment: fixed; }
        .hero-content { max-width: 880px; margin: 0 auto; position: relative; z-index: 2; }
        .hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(201,162,39,0.18); border: 1px solid rgba(201,162,39,0.35); color: #f0d060; padding: 7px 16px; border-radius: 980px; font-size: 13px; font-weight: 500; margin-bottom: 40px; }
        .hero h1 { font-size: clamp(48px, 8vw, 88px); font-weight: 300; color: #fff; line-height: 1.04; letter-spacing: -2.5px; margin-bottom: 24px; }
        .hero h1 strong { font-weight: 600; color: #f0d060; }
        .hero-sub { font-size: clamp(17px, 2vw, 21px); color: rgba(255,255,255,0.58); line-height: 1.6; max-width: 560px; margin: 0 auto 48px; font-weight: 300; }
        .hero-actions { display: flex; align-items: center; justify-content: center; gap: 16px; flex-wrap: wrap; }
        .cta-primary { background: #c9a227; color: #1d1d1f; padding: 17px 38px; border-radius: 980px; font-weight: 600; font-size: 16px; display: inline-flex; align-items: center; gap: 6px; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 8px 32px rgba(201,162,39,0.4); }
        .cta-primary:hover { transform: scale(1.02); box-shadow: 0 16px 48px rgba(201,162,39,0.5); }
        .cta-secondary { color: rgba(255,255,255,0.65); font-size: 16px; font-weight: 400; display: inline-flex; align-items: center; gap: 4px; transition: color 0.2s; }
        .cta-secondary:hover { color: #fff; }
        .hero-trust { margin-top: 40px; display: flex; align-items: center; justify-content: center; gap: 24px; flex-wrap: wrap; }
        .trust-item { font-size: 13px; color: rgba(255,255,255,0.4); display: flex; align-items: center; gap: 5px; font-weight: 300; }
        .trust-sep { width: 3px; height: 3px; border-radius: 50%; background: rgba(255,255,255,0.2); }
        .logos { background: #f5f5f7; padding: 24px 48px; text-align: center; border-bottom: 1px solid #e8e8ed; }
        .logos-label { font-size: 11px; color: #86868b; text-transform: uppercase; letter-spacing: 2px; font-weight: 500; margin-bottom: 14px; }
        .logos-row { display: flex; justify-content: center; align-items: center; gap: 40px; flex-wrap: wrap; }
        .logo-pill { font-size: 15px; font-weight: 500; color: #aeaeb2; letter-spacing: -0.2px; transition: color 0.2s; }
        .logo-pill:hover { color: #6e6e73; }
        .eyebrow { font-size: 12px; font-weight: 600; color: #c9a227; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
        .s-h2 { font-size: clamp(36px, 5vw, 56px); font-weight: 300; color: #1d1d1f; line-height: 1.07; letter-spacing: -1.5px; margin-bottom: 16px; }
        .s-h2 strong { font-weight: 600; }
        .s-sub { font-size: 19px; color: #6e6e73; line-height: 1.6; font-weight: 300; }
        .pillars { padding: 120px 48px; background: #fff; }
        .pillars-header { margin-bottom: 64px; text-align: center; }
        .pillars-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #e8e8ed; border: 1px solid #e8e8ed; border-radius: 18px; overflow: hidden; max-width: 1200px; margin: 0 auto; }
        .pillar-card { background: #fff; padding: 36px 32px; transition: background 0.2s; }
        .pillar-card:hover { background: #fbfaf5; }
        .pillar-icon { width: 48px; height: 48px; border-radius: 12px; background: #f5f5f7; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 20px; }
        .pillar-card h3 { font-size: 17px; font-weight: 600; color: #1d1d1f; margin-bottom: 8px; letter-spacing: -0.3px; }
        .pillar-card p { font-size: 14px; color: #6e6e73; line-height: 1.65; font-weight: 300; }
        .pillar-tag { display: inline-block; margin-top: 16px; font-size: 11px; font-weight: 600; color: #c9a227; background: #faf6e8; border: 1px solid #f0e6b0; padding: 3px 10px; border-radius: 980px; }
        .pain { padding: 120px 48px; text-align: center; background: linear-gradient(rgba(0,0,0,0.88), rgba(0,0,0,0.84)), url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1920&q=80') center/cover; background-attachment: fixed; color: #fff; }
        .pain .s-h2 { color: #fff; }
        .pain-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; max-width: 1100px; margin: 0 auto; }
        .pain-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 18px; overflow: hidden; text-align: left; transition: 0.3s; }
        .pain-card:hover { background: rgba(255,255,255,0.09); transform: translateY(-4px); }
        .pain-img { width: 100%; height: 180px; object-fit: cover; opacity: 0.85; }
        .pain-body { padding: 24px; }
        .pain-body h3 { font-size: 20px; font-weight: 500; color: #fff; margin-bottom: 10px; }
        .pain-body p { font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.7; font-weight: 300; }
        .demo { padding: 120px 48px; background: #f5f5f7; }
        .demo-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; max-width: 1100px; margin: 64px auto 0; align-items: center; }
        .phone-wrap { position: relative; max-width: 270px; margin: 0 auto; }
        .phone-frame { border: 8px solid #1d1d1f; border-radius: 48px; overflow: hidden; background: #fff; box-shadow: 0 48px 100px rgba(0,0,0,0.16); height: 560px; }
        .phone-notch { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 88px; height: 22px; background: #1d1d1f; border-radius: 0 0 16px 16px; z-index: 10; }
        .chat-app { display: flex; flex-direction: column; height: 100%; background: #f0f2f5; }
        .chat-head { background: linear-gradient(135deg, #0f172a, #1e3a5f); color: #fff; padding: 36px 16px 14px; text-align: center; }
        .chat-head-title { font-weight: 600; font-size: 14px; }
        .chat-head-sub { font-size: 11px; opacity: 0.55; margin-top: 2px; }
        .chat-msgs { flex: 1; padding: 16px; display: flex; flex-direction: column; gap: 10px; overflow: hidden; }
        .msg { padding: 10px 13px; border-radius: 16px; font-size: 12px; line-height: 1.55; max-width: 82%; }
        .msg-user { background: #c9a227; color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; font-weight: 500; }
        .msg-alfred { background: #fff; color: #1d1d1f; align-self: flex-start; border-bottom-left-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .demo-text h2 { font-size: clamp(28px, 3.5vw, 40px); font-weight: 300; color: #1d1d1f; margin-bottom: 16px; line-height: 1.1; letter-spacing: -1px; }
        .demo-text h2 strong { font-weight: 600; }
        .demo-text > p { font-size: 17px; color: #6e6e73; line-height: 1.7; margin-bottom: 32px; font-weight: 300; }
        .demo-feats { display: flex; flex-direction: column; gap: 16px; }
        .demo-feat { display: flex; align-items: flex-start; gap: 14px; }
        .feat-dot { width: 22px; height: 22px; border-radius: 50%; background: #faf6e8; border: 1.5px solid #c9a227; display: flex; align-items: center; justify-content: center; color: #c9a227; font-size: 10px; font-weight: 700; flex-shrink: 0; margin-top: 2px; }
        .demo-feat div h4 { font-size: 14px; font-weight: 600; color: #1d1d1f; margin-bottom: 3px; }
        .demo-feat div p { font-size: 13px; color: #6e6e73; line-height: 1.55; font-weight: 300; }
        .urgence { background: #fff; padding: 100px 48px; border-top: 1px solid #f5f5f7; }
        .urgence-inner { max-width: 1000px; margin: 0 auto; display: flex; align-items: center; gap: 80px; flex-wrap: wrap; }
        .urgence-text { flex: 1; min-width: 280px; }
        .urgence-tag { display: inline-flex; align-items: center; gap: 8px; background: #fff5f5; border: 1px solid #fecaca; color: #dc2626; padding: 6px 14px; border-radius: 980px; font-size: 12px; font-weight: 600; margin-bottom: 24px; }
        .urgence-dot { width: 7px; height: 7px; border-radius: 50%; background: #dc2626; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }
        .urgence-text h2 { font-size: clamp(28px, 3.5vw, 40px); font-weight: 300; color: #1d1d1f; margin-bottom: 16px; line-height: 1.1; letter-spacing: -1px; }
        .urgence-text h2 strong { font-weight: 600; }
        .urgence-text p { font-size: 16px; color: #6e6e73; line-height: 1.7; font-weight: 300; }
        .urgence-text p + p { margin-top: 12px; }
        .urgence-mockup { flex: 1; min-width: 280px; }
        .notif-phone { background: #1d1d1f; border-radius: 24px; padding: 20px; max-width: 320px; }
        .notif-screen { background: #f5f5f7; border-radius: 14px; padding: 16px; }
        .notif-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .notif-icon { width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #0088cc, #005fa3); display: flex; align-items: center; justify-content: center; font-size: 14px; }
        .notif-app { font-size: 12px; font-weight: 600; color: #1d1d1f; }
        .notif-time { font-size: 11px; color: #86868b; }
        .notif-bubble { background: #fff; border-radius: 12px; padding: 14px; border-left: 3px solid #dc2626; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .notif-bubble p { font-size: 13px; color: #1d1d1f; line-height: 1.6; margin: 0; }
        .upsells-section { padding: 120px 48px; background: #f5f5f7; }
        .upsells-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .upsells-text h2 { font-size: clamp(28px, 3.5vw, 44px); font-weight: 300; color: #1d1d1f; margin-bottom: 16px; letter-spacing: -1px; line-height: 1.1; }
        .upsells-text h2 strong { font-weight: 600; }
        .upsells-text > p { font-size: 17px; color: #6e6e73; line-height: 1.7; margin-bottom: 32px; font-weight: 300; }
        .upsells-perks { display: flex; flex-direction: column; gap: 14px; }
        .perk { display: flex; align-items: center; gap: 12px; font-size: 15px; color: #1d1d1f; font-weight: 400; }
        .perk-icon { width: 34px; height: 34px; background: #fff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .upsells-mockup { display: flex; flex-direction: column; gap: 10px; }
        .upsell-card { background: #fff; border: 1px solid #e8e8ed; border-radius: 14px; padding: 16px 18px; display: flex; align-items: center; gap: 14px; transition: 0.2s; }
        .upsell-card:hover { border-color: #c9a227; }
        .upsell-emoji { font-size: 26px; flex-shrink: 0; }
        .upsell-info { flex: 1; }
        .upsell-name { font-size: 14px; font-weight: 600; color: #1d1d1f; margin-bottom: 2px; }
        .upsell-desc { font-size: 12px; color: #86868b; font-weight: 300; }
        .upsell-price { font-size: 16px; font-weight: 600; color: #1d1d1f; }
        .upsell-cta { background: #1d1d1f; color: #fff; border: none; padding: 7px 14px; border-radius: 980px; font-size: 12px; font-weight: 500; cursor: pointer; white-space: nowrap; font-family: inherit; transition: background 0.2s; }
        .upsell-cta:hover { background: #c9a227; color: #1d1d1f; }
        .benefits { padding: 120px 48px; background: #fff; }
        .benefits-inner { max-width: 1100px; margin: 64px auto 0; display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
        .benefits-img { border-radius: 20px; overflow: hidden; height: 460px; position: relative; }
        .benefits-img img { width: 100%; height: 100%; object-fit: cover; }
        .benefits-img-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(0,0,0,0.12), transparent); }
        .benefits-cards { display: flex; flex-direction: column; gap: 16px; }
        .benefit-card { background: #f5f5f7; border-radius: 16px; padding: 24px; display: flex; gap: 16px; align-items: flex-start; transition: 0.2s; border: 1px solid transparent; }
        .benefit-card:hover { border-color: #e8e8ed; background: #fff; transform: translateX(4px); }
        .benefit-ico { width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .bi1 { background: #e8f0fe; } .bi2 { background: #faf6e8; } .bi3 { background: #e8faf0; }
        .benefit-card h4 { font-size: 15px; font-weight: 600; color: #1d1d1f; margin-bottom: 5px; }
        .benefit-card p { font-size: 13px; color: #6e6e73; line-height: 1.6; font-weight: 300; }
        .testi { padding: 120px 48px; background: #f5f5f7; text-align: center; }
        .testi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; max-width: 1100px; margin: 64px auto 0; }
        .testi-card { background: #fff; border: 1px solid #e8e8ed; border-radius: 20px; padding: 32px; text-align: left; position: relative; transition: 0.3s; }
        .testi-card:hover { box-shadow: 0 16px 48px rgba(0,0,0,0.08); transform: translateY(-4px); }
        .testi-verified { position: absolute; top: 20px; right: 20px; background: #e8faf0; color: #1a7a40; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 980px; border: 1px solid #b0edca; }
        .testi-stars { color: #f59e0b; font-size: 14px; margin-bottom: 18px; letter-spacing: 2px; }
        .testi-quote { font-size: 15px; color: #1d1d1f; line-height: 1.75; margin-bottom: 24px; font-weight: 300; }
        .testi-author { display: flex; align-items: center; gap: 12px; }
        .testi-av { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; color: #fff; flex-shrink: 0; }
        .av1{background:linear-gradient(135deg,#f59e0b,#d97706)} .av2{background:linear-gradient(135deg,#3b82f6,#1d4ed8)} .av3{background:linear-gradient(135deg,#10b981,#059669)}
        .testi-name { font-weight: 600; font-size: 14px; color: #1d1d1f; margin-bottom: 2px; }
        .testi-role { font-size: 12px; color: #86868b; font-weight: 300; }
        .pricing { padding: 120px 48px; text-align: center; background: linear-gradient(160deg, #0a0e1e 0%, #0f172a 60%, #0a0e1e 100%); position: relative; overflow: hidden; }
        .pricing::before { content: ''; position: absolute; top: -20%; right: -5%; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, rgba(201,162,39,0.07) 0%, transparent 70%); pointer-events: none; }
        .pricing .s-h2 { color: #fff; }
        .pricing .s-sub { color: rgba(255,255,255,0.45); max-width: 480px; margin: 0 auto 64px; }
        .price-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(20px); border-radius: 24px; padding: 48px 44px; max-width: 440px; margin: 0 auto; position: relative; }
        .price-promo { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #c9a227, #e8c84a); color: #1d1d1f; padding: 5px 22px; border-radius: 980px; font-size: 12px; font-weight: 600; white-space: nowrap; }
        .plan-label { font-size: 12px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 2px; font-weight: 500; margin-bottom: 24px; }
        .price-amount { font-size: 72px; font-weight: 300; color: #fff; line-height: 1; margin-bottom: 4px; letter-spacing: -3px; }
        .price-amount sup { font-size: 24px; font-weight: 400; vertical-align: super; }
        .price-amount span { font-size: 20px; font-weight: 300; color: rgba(255,255,255,0.4); }
        .price-note { font-size: 13px; color: rgba(255,255,255,0.3); margin-bottom: 36px; font-weight: 300; }
        .price-divider { border: none; border-top: 1px solid rgba(255,255,255,0.07); margin-bottom: 28px; }
        .price-feats { text-align: left; margin-bottom: 36px; display: flex; flex-direction: column; gap: 14px; }
        .price-feat { display: flex; align-items: center; gap: 12px; font-size: 14px; color: rgba(255,255,255,0.65); font-weight: 300; }
        .price-check { width: 20px; height: 20px; border-radius: 50%; background: rgba(201,162,39,0.18); display: flex; align-items: center; justify-content: center; color: #e8c84a; font-size: 10px; font-weight: 700; flex-shrink: 0; }
        .price-cta { background: #c9a227; color: #1d1d1f; padding: 17px; border-radius: 14px; font-weight: 600; font-size: 16px; display: block; transition: 0.2s; }
        .price-cta:hover { background: #e8c84a; transform: scale(1.01); }
        .price-security { margin-top: 16px; font-size: 12px; color: rgba(255,255,255,0.22); display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: 300; }
        .referral { padding: 100px 48px; background: #fff; text-align: center; border-top: 1px solid #f5f5f7; }
        .referral-inner { max-width: 640px; margin: 0 auto; }
        .referral h2 { font-size: clamp(32px, 4vw, 48px); font-weight: 300; color: #1d1d1f; margin-bottom: 16px; letter-spacing: -1.2px; line-height: 1.1; }
        .referral h2 strong { font-weight: 600; }
        .referral-inner > p { font-size: 18px; color: #6e6e73; line-height: 1.65; margin-bottom: 40px; font-weight: 300; }
        .referral-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; max-width: 480px; margin: 0 auto 40px; }
        .referral-card { background: #f5f5f7; border-radius: 16px; padding: 28px; text-align: center; }
        .referral-number { font-size: 56px; font-weight: 300; color: #c9a227; line-height: 1; margin-bottom: 8px; letter-spacing: -2px; }
        .referral-label { font-size: 13px; color: #6e6e73; font-weight: 400; }
        footer { background: #1d1d1f; color: #6e6e73; padding: 64px 48px 28px; }
        .footer-inner { max-width: 1100px; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 40px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 48px; margin-bottom: 24px; }
        .footer-brand-col { max-width: 220px; }
        .footer-logo { font-size: 20px; font-weight: 600; color: #fff; display: block; margin-bottom: 12px; }
        .footer-logo span { color: #c9a227; }
        .footer-brand-col p { font-size: 13px; line-height: 1.7; color: #6e6e73; font-weight: 300; }
        .footer-col h4 { color: rgba(255,255,255,0.5); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px; }
        .footer-col ul { list-style: none; }
        .footer-col ul li { margin-bottom: 10px; }
        .footer-col ul li a { font-size: 14px; color: #6e6e73; transition: color 0.2s; font-weight: 300; }
        .footer-col ul li a:hover { color: rgba(255,255,255,0.7); }
        .footer-bottom { text-align: center; font-size: 12px; color: #424245; font-weight: 300; }
        @media (max-width: 768px) {
          nav { padding: 0 20px; }
          .nav-link { display: none; }
          .nav-links { gap: 12px; }
          .hero { padding: 110px 20px 80px; background-attachment: scroll; }
          .logos, .pillars, .pain, .demo, .urgence, .upsells-section, .benefits, .testi, .pricing, .referral { padding: 80px 20px; }
          .pain { background-attachment: scroll; }
          .pillars-grid { grid-template-columns: 1fr; }
          .demo-layout, .upsells-inner, .benefits-inner { grid-template-columns: 1fr; gap: 48px; }
          .urgence-inner { gap: 48px; }
          .benefits-img { height: 260px; }
          footer { padding: 48px 20px 24px; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav>
        <Link href="/es" passHref legacyBehavior>
          <a className="brand">Alfred<span className="brand-gold">Major</span></a>
        </Link>
        <div className="nav-links">
          <a href="#funciones" className="nav-link">Funciones</a>
          <a href="#precios" className="nav-link">Precios</a>
          <div className="nav-lang">
            <button className="lang-btn" onClick={() => router.push('/')}>🇫🇷</button>
            <button className="lang-btn" onClick={() => router.push('/en')}>🇬🇧</button>
            <button className="lang-btn active">🇪🇸</button>
          </div>
          <Link href="/login" passHref legacyBehavior>
            <a className="nav-cta">Iniciar sesión</a>
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🎁 1er mes 100% gratis — Sin compromiso</div>
          <h1>
            Gestiona tus alquileres<br />
            en <strong>piloto automático.</strong>
          </h1>
          <p className="hero-sub">
            Mayordomo IA 24/7 · Limpieza automatizada · Upsells sin comisión · Alertas de emergencia.<br/>
            Todo en uno, a 9,90€/mes.
          </p>
          <div className="hero-actions">
            <Link href="/register" passHref legacyBehavior>
              <a className="cta-primary">Empieza gratis →</a>
            </Link>
            <a href="#demo" className="cta-secondary">Ver la demo ↓</a>
          </div>
          <div className="hero-trust">
            <span className="trust-item">✓ Sin tarjeta</span>
            <span className="trust-sep" />
            <span className="trust-item">✓ Configuración en 5 min</span>
            <span className="trust-sep" />
            <span className="trust-item">✓ 30+ idiomas</span>
            <span className="trust-sep" />
            <span className="trust-item">✓ 0% comisión</span>
          </div>
        </div>
      </section>

      {/* ── LOGOS ── */}
      <section className="logos">
        <p className="logos-label">Compatible con todas las plataformas principales</p>
        <div className="logos-row">
          {['Airbnb', 'Booking.com', 'Abritel', 'Vrbo', 'Expedia'].map(p => (
            <span key={p} className="logo-pill">{p}</span>
          ))}
        </div>
      </section>

      {/* ── PILLARS ── */}
      <section className="pillars" id="funciones">
        <div className="pillars-header">
          <div className="eyebrow">Todo incluido</div>
          <h2 className="s-h2">6 herramientas. 1 suscripción.<br/><strong>Cero fricción.</strong></h2>
          <p className="s-sub" style={{maxWidth:'520px', margin:'0 auto'}}>Donde otros cobran 300€/mes por juntar 6 herramientas separadas, Alfred Major lo hace todo por 9,90€.</p>
        </div>
        <div className="pillars-grid">
          {[
            { icon: '🎩', title: 'Mayordomo IA', desc: 'Responde a los huéspedes 24/7 en 30+ idiomas. Tono cálido, respuestas precisas, memoria de conversación.', tag: 'Disponible 24/7' },
            { icon: '🧹', title: 'Limpieza automatizada', desc: 'Detecta nuevas reservas, notifica a tu proveedor, confirma la limpieza con fotos antes de cada llegada.', tag: 'Cero gestión manual' },
            { icon: '💰', title: 'Upsells sin comisión', desc: 'Salida tardía, pack romántico, traslado... Alfred sugiere en el momento justo. Pago directo en tu Stripe.', tag: '0% comisión' },
            { icon: '📅', title: 'Calendario sincronizado', desc: 'Sincronización iCal Airbnb y Booking en tiempo real. Reservas detectadas automáticamente, limpiezas creadas al instante.', tag: 'Sincronización en tiempo real' },
            { icon: '🚨', title: 'Alertas de emergencia', desc: 'Fuga, avería, incendio — Alfred detecta y te alerta instantáneamente en Telegram con traducción automática.', tag: 'Telegram + Push' },
            { icon: '🎁', title: 'Programa de referidos', desc: '2 meses gratis por cada anfitrión referido que se activa. Tu red trabaja para reducir tu suscripción a cero.', tag: '2 meses gratis' },
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

      {/* ── PAIN ── */}
      <section className="pain">
        <div className="eyebrow">Se acabaron las noches interrumpidas</div>
        <h2 className="s-h2" style={{color:'white', marginBottom:'12px'}}>La gestión de alquileres<br/><strong>reinventada.</strong></h2>
        <p className="s-sub" style={{margin:'0 auto 64px', textAlign:'center', color:'rgba(255,255,255,0.45)', maxWidth:'480px'}}>Alfred elimina las interrupciones del día a día.</p>
        <div className="pain-grid">
          {[
            { img: '/pain-nuit.png', alt: 'Mensaje de madrugada', title: 'El mensaje a las 23:30', desc: 'El huésped no encuentra el WiFi. Tu teléfono suena mientras duermes. Alfred responde al instante, en plena noche.' },
            { img: '/pain-langue.png', alt: 'Barrera del idioma', title: 'La barrera del idioma', desc: 'Alfred habla más de 30 idiomas con fluidez. Tus huéspedes internacionales son atendidos en su idioma, sin esfuerzo.' },
            { img: '/pain-questions.png', alt: 'Preguntas repetidas', title: 'Las mismas preguntas, una y otra vez', desc: 'Basura, salida, aparcamiento... Alfred responde con precisión, cada vez como si fuera la primera.' },
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

      {/* ── DEMO ── */}
      <section className="demo" id="demo">
        <div style={{textAlign:'center'}}>
          <div className="eyebrow">En acción</div>
          <h2 className="s-h2">La ilusión perfecta<br/>de un <strong>conserje humano.</strong></h2>
          <p className="s-sub" style={{maxWidth:'480px', margin:'0 auto'}}>Tus huéspedes no saben que están hablando con una IA.</p>
        </div>
        <div className="demo-layout">
          <div className="phone-wrap">
            <div className="phone-frame">
              <div className="phone-notch" />
              <div className="chat-app">
                <div className="chat-head">
                  <div className="chat-head-title">🎩 Alfred — Villa Noam</div>
                  <div className="chat-head-sub">Disponible 24/7</div>
                </div>
                <div className="chat-msgs">
                  <div className="msg msg-user">¡Hola! ¿Cuál es la contraseña del WiFi? 📶</div>
                  <div className="msg msg-alfred">¡Bienvenido a Villa Noam! 🎩 Red: <strong>VillaNomad_5G</strong>, contraseña: <strong>Holiday2024</strong></div>
                  <div className="msg msg-user">¿Podemos salir a las 14h?</div>
                  <div className="msg msg-alfred">¡Claro! La salida tardía hasta las 14h está disponible por 30€. Puedes reservarla aquí → ✨</div>
                  <div className="msg msg-user">¡Hay una fuga debajo del fregadero!</div>
                  <div className="msg msg-alfred">Quédate tranquilo. La llave de paso está debajo del fregadero a la derecha. Estoy avisando a tu anfitrión ahora mismo. 🚨</div>
                </div>
              </div>
            </div>
          </div>
          <div className="demo-text">
            <h2>Responde, recomienda, alerta —<br/><strong>sin molestarte nunca.</strong></h2>
            <p>Alfred se nutre de la base de conocimiento que has configurado para responder con precisión. Busca los mejores sitios locales en tiempo real y detecta emergencias automáticamente.</p>
            <div className="demo-feats">
              {[
                { title: 'Recomendaciones locales en tiempo real', desc: 'Restaurantes, farmacias, transporte — Alfred escanea los alrededores vía Google Maps.' },
                { title: 'Sugiere tus upsells naturalmente', desc: 'Si un huésped pregunta por salida tardía, Alfred propone tu servicio directamente.' },
                { title: 'Detecta emergencias y alerta', desc: 'Fuga, avería, gas — Alfred te alerta en Telegram con traducción automática.' },
                { title: 'Memoria de conversación', desc: 'Alfred entiende el contexto y nunca pregunta lo mismo dos veces.' },
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
            <div className="urgence-tag"><div className="urgence-dot" /> Alerta en tiempo real</div>
            <h2>Solo te molestamos<br/><strong>cuando es verdaderamente urgente.</strong></h2>
            <p>Si un huésped reporta una emergencia, Alfred te reenvía instantáneamente la información en Telegram — con traducción automática si es necesario.</p>
            <p><strong>Resultado:</strong> Filtras el 95% del ruido diario y mantienes el control sobre lo esencial.</p>
          </div>
          <div className="urgence-mockup">
            <div className="notif-phone">
              <div className="notif-screen">
                <div className="notif-row">
                  <div className="notif-icon">✈️</div>
                  <div>
                    <div className="notif-app">Telegram</div>
                    <div className="notif-time">ahora</div>
                  </div>
                </div>
                <div className="notif-bubble">
                  <p>🚨 <strong>ALERTA ALFRED MAJOR</strong><br/><br/>🏠 Villa Noam — París<br/>💬 "¡Hay una enorme fuga debajo del fregadero!"<br/>🔄 Traduction: Fuite sous l'évier</p>
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
            <div className="eyebrow">Ingresos adicionales</div>
            <h2>Aumenta tus ingresos.<br/><strong>0% comisión.</strong></h2>
            <p>Tus huéspedes pueden contratar servicios premium directamente con Alfred. El pago va directo a tu cuenta Stripe — Alfred Major no se lleva nada.</p>
            <div className="upsells-perks">
              {[
                { icon: '💶', text: 'Pago directo en tu cuenta Stripe' },
                { icon: '0️⃣', text: 'Alfred Major no cobra comisión' },
                { icon: '🤖', text: 'Alfred sugiere en el momento justo, naturalmente' },
                { icon: '🌍', text: 'Página de huésped multilingüe y personalizada' },
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
              { emoji: '🕐', name: 'Salida tardía', desc: 'Salida hasta las 14h', price: '30€' },
              { emoji: '🌅', name: 'Entrada anticipada', desc: 'Llegada desde las 10h', price: '25€' },
              { emoji: '🥂', name: 'Pack romántico', desc: 'Cava y flores', price: '45€' },
              { emoji: '🚗', name: 'Traslado aeropuerto', desc: 'Lanzadera privada', price: '50€' },
            ].map((u, i) => (
              <div key={i} className="upsell-card">
                <div className="upsell-emoji">{u.emoji}</div>
                <div className="upsell-info">
                  <div className="upsell-name">{u.name}</div>
                  <div className="upsell-desc">{u.desc}</div>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                  <div className="upsell-price">{u.price}</div>
                  <button className="upsell-cta">Reservar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section className="benefits">
        <div style={{textAlign:'center'}}>
          <div className="eyebrow">Por qué Alfred</div>
          <h2 className="s-h2">Lo que viven nuestros anfitriones<br/><strong>cada día.</strong></h2>
        </div>
        <div className="benefits-inner">
          <div className="benefits-img">
            <img src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80" alt="Anfitrión relajado" loading="lazy" />
            <div className="benefits-img-overlay" />
          </div>
          <div className="benefits-cards">
            {[
              { ico: '😴', cls: 'bi1', title: 'Noches completas garantizadas', desc: 'No más estar pendiente del teléfono. Alfred gestiona WiFi, códigos y equipamiento por ti, 24/7.' },
              { ico: '🧹', cls: 'bi2', title: 'Limpieza en piloto automático', desc: 'En cuanto se detecta una reserva, tu proveedor es notificado. Recibes una confirmación con fotos antes de cada llegada.' },
              { ico: '⭐', cls: 'bi3', title: 'Mejores valoraciones en Airbnb', desc: 'Los huéspedes mejor atendidos dejan mejores reseñas. La disponibilidad instantánea y el servicio multilingüe marcan la diferencia.' },
            ].map((b, i) => (
              <div key={i} className="benefit-card">
                <div className={`benefit-ico ${b.cls}`}>{b.ico}</div>
                <div><h4>{b.title}</h4><p>{b.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="testi">
        <div className="eyebrow">Nos avalan</div>
        <h2 className="s-h2">Lo que dicen nuestros primeros anfitriones.</h2>
        <div className="testi-grid">
          {[
            { av: 'av1', initials: 'SL', name: 'Sophie L.', role: '3 alojamientos · Niza', quote: "Alfred responde a todas las preguntas de mis huéspedes, incluso a las 3am. No he recibido una sola llamada sobre el código WiFi desde que lo instalé. Un verdadero alivio." },
            { av: 'av2', initials: 'TR', name: 'Thomas R.', role: '2 alojamientos · Burdeos', quote: "Tenía huéspedes extranjeros que no hablaban francés. Alfred les respondió en inglés, español e incluso alemán. Mis valoraciones en Airbnb han subido desde entonces." },
            { av: 'av3', initials: 'MC', name: 'Marie C.', role: '5 alojamientos · París', quote: "La alerta de Telegram me salvó: un huésped reportó una fuga, recibí el mensaje al instante y pude enviar un fontanero antes de que empeorara." },
          ].map((t, i) => (
            <div key={i} className="testi-card">
              <span className="testi-verified">✓ Anfitrión verificado</span>
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
      <section className="pricing" id="precios">
        <div className="eyebrow">Precios</div>
        <h2 className="s-h2" style={{marginBottom:'12px'}}>Simple. Transparente.<br/><strong>Sin sorpresas.</strong></h2>
        <p className="s-sub" style={{margin:'0 auto 64px', color:'rgba(255,255,255,0.45)', maxWidth:'440px'}}>Un mayordomo privado 24/7 a una fracción del coste de una conserjería tradicional.</p>
        <div className="price-card">
          <div className="price-promo">🎁 1er mes 100% gratis</div>
          <div className="plan-label">Licencia por alojamiento</div>
          <div className="price-amount"><sup>€</sup>9,90<span>/mes</span></div>
          <div className="price-note">Sin compromiso · Cancela en 1 clic</div>
          <hr className="price-divider" />
          <div className="price-feats">
            {[
              'Mayordomo IA 24/7 · 30+ idiomas',
              'Gestión de limpieza automatizada',
              'Upsells 0% comisión (Stripe Connect)',
              'Sincronización iCal Airbnb & Booking',
              'Alertas emergencia Telegram + Push',
              'Historial de conversaciones con huéspedes',
              'Programa de referidos — 2 meses gratis',
            ].map((f, i) => (
              <div key={i} className="price-feat">
                <div className="price-check">✓</div>
                {f}
              </div>
            ))}
          </div>
          <Link href="/register" passHref legacyBehavior>
            <a className="price-cta">Empieza gratis — 1er mes incluido</a>
          </Link>
          <div className="price-security">🔒 Pago seguro vía Stripe · 0% comisión sobre tus reservas</div>
        </div>
      </section>

      {/* ── REFERRAL ── */}
      <section className="referral">
        <div className="referral-inner">
          <div className="eyebrow">Programa de referidos</div>
          <h2>Refiere. Ahorra.<br/><strong>Reduce tu suscripción a cero.</strong></h2>
          <p>Comparte tu enlace único con otros anfitriones. En cuanto un referido activa su primer alojamiento, los dos recibís la recompensa automáticamente.</p>
          <div className="referral-cards">
            <div className="referral-card">
              <div className="referral-number">2</div>
              <div className="referral-label">meses gratis para ti</div>
            </div>
            <div className="referral-card">
              <div className="referral-number">1</div>
              <div className="referral-label">mes gratis para tu referido</div>
            </div>
          </div>
          <Link href="/register" passHref legacyBehavior>
            <a className="cta-primary" style={{display:'inline-flex'}}>Crear mi cuenta y obtener mi enlace →</a>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-inner">
          <div className="footer-brand-col">
            <span className="footer-logo">Alfred<span>Major</span></span>
            <p>La plataforma todo en uno para gestionar tus alquileres de corta estancia en piloto automático.</p>
          </div>
          <div className="footer-col">
            <h4>Producto</h4>
            <ul>
              <li><Link href="/login" passHref legacyBehavior><a>Espacio Anfitrión</a></Link></li>
              <li><Link href="/register" passHref legacyBehavior><a>Crear una cuenta</a></Link></li>
              <li><a href="#precios">Precios</a></li>
              <li><a href="#funciones">Funciones</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <ul>
              <li><Link href="/conditions-generales" passHref legacyBehavior><a>Términos y Condiciones</a></Link></li>
              <li><Link href="/confidentialite" passHref legacyBehavior><a>Política de privacidad (RGPD)</a></Link></li>
              <li><Link href="/mentions-legales" passHref legacyBehavior><a>Aviso Legal</a></Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contacto</h4>
            <ul>
              <li><a href="mailto:contact@alfredmajor.com">contact@alfredmajor.com</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Alfred Major — Todos los derechos reservados · Dorian BISCARRAT · SIRET 531 965 044 00039</p>
        </div>
      </footer>
    </div>
  );
}
