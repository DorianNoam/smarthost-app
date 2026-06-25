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

  const handleRegisterClick = (e) => {
    e.preventDefault();
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track('CompleteRegistration', {
        "contents": [{ "content_name": "Inscription Alfred Major" }],
        "value": 9.90, "currency": "EUR"
      });
    }
    router.push('/register');
  };

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
        <link rel="alternate" hrefLang="it" href="https://www.alfredmajor.com/it" />
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
        <meta name="theme-color" content="#ffffff" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "SoftwareApplication",
          "name": "Alfred Major", "url": "https://www.alfredmajor.com",
          "description": "Plateforme tout-en-un pour la gestion de locations courte durée.",
          "applicationCategory": "BusinessApplication", "operatingSystem": "Web, Android, iOS",
          "offers": { "@type": "Offer", "price": "9.90", "priceCurrency": "EUR" },
          "publisher": { "@type": "Organization", "name": "Alfred Major", "url": "https://www.alfredmajor.com" }
        })}} />
        <script dangerouslySetInnerHTML={{ __html: `
          !function (w, d, t) {
            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
          var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
          ;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
            ttq.load('D8I61URC77UB4KU2EVFG');
            ttq.page();
          }(window, document, 'ttq');
        `}} />
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
        nav { display: flex; justify-content: space-between; align-items: center; padding: 0 48px; height: 64px; position: fixed; top: 0; left: 0; right: 0; z-index: 1000; transition: background 0.4s ease, border-color 0.4s ease; background: ${scrolled ? 'rgba(255,255,255,0.88)' : 'transparent'}; backdrop-filter: ${scrolled ? 'saturate(180%) blur(20px)' : 'none'}; border-bottom: 1px solid ${scrolled ? 'rgba(0,0,0,0.08)' : 'transparent'}; }
        .brand { font-size: 20px; font-weight: 600; letter-spacing: -0.4px; color: ${scrolled ? '#1d1d1f' : '#fff'}; transition: color 0.4s; }
        .brand-gold { color: #c9a227; }
        .nav-links { display: flex; align-items: center; gap: 32px; }
        .nav-link { font-size: 14px; font-weight: 400; color: ${scrolled ? '#6e6e73' : 'rgba(255,255,255,0.75)'}; transition: color 0.2s; letter-spacing: -0.1px; }
        .nav-link:hover { color: ${scrolled ? '#1d1d1f' : '#fff'}; }
        .nav-lang { display: flex; align-items: center; gap: 2px; background: ${scrolled ? '#f5f5f7' : 'rgba(255,255,255,0.12)'}; border-radius: 20px; padding: 3px; }
        .lang-btn { background: none; border: none; padding: 4px 9px; border-radius: 16px; cursor: pointer; font-size: 13px; font-family: inherit; transition: background 0.2s; line-height: 1; color: inherit; }
        .lang-btn:hover, .lang-btn.active { background: white; }
        .nav-cta { background: #1d1d1f; color: #fff; padding: 9px 20px; border-radius: 980px; font-size: 13px; font-weight: 500; letter-spacing: -0.1px; transition: background 0.2s; }
        .nav-cta:hover { background: #c9a227; color: #1d1d1f; }
        .hero { min-height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 120px 24px 100px; position: relative; overflow: hidden; background: linear-gradient(180deg, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.38) 60%, rgba(0,0,0,0.62) 100%), url('https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1920&q=80') center/cover no-repeat; background-attachment: fixed; }
        .hero-content { max-width: 880px; margin: 0 auto; position: relative; z-index: 2; }
        .hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(201,162,39,0.18); border: 1px solid rgba(201,162,39,0.35); color: #f0d060; padding: 7px 16px; border-radius: 980px; font-size: 13px; font-weight: 500; margin-bottom: 40px; letter-spacing: -0.1px; }
        .hero h1 { font-size: clamp(48px, 8vw, 88px); font-weight: 300; color: #fff; line-height: 1.04; letter-spacing: -2.5px; margin-bottom: 24px; }
        .hero h1 strong { font-weight: 600; color: #f0d060; }
        .hero-sub { font-size: clamp(17px, 2vw, 21px); color: rgba(255,255,255,0.58); line-height: 1.6; max-width: 560px; margin: 0 auto 48px; font-weight: 300; letter-spacing: -0.2px; }
        .hero-actions { display: flex; align-items: center; justify-content: center; gap: 16px; flex-wrap: wrap; }
        .cta-primary { background: #c9a227; color: #1d1d1f; padding: 17px 38px; border-radius: 980px; font-weight: 600; font-size: 16px; letter-spacing: -0.3px; display: inline-flex; align-items: center; gap: 6px; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 8px 32px rgba(201,162,39,0.4); }
        .cta-primary:hover { transform: scale(1.02); box-shadow: 0 16px 48px rgba(201,162,39,0.5); }
        .cta-secondary { color: rgba(255,255,255,0.65); font-size: 16px; font-weight: 400; letter-spacing: -0.2px; display: inline-flex; align-items: center; gap: 4px; transition: color 0.2s; }
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
        .s-sub { font-size: 19px; color: #6e6e73; line-height: 1.6; font-weight: 300; letter-spacing: -0.2px; }
        .pillars { padding: 120px 48px; background: #fff; }
        .pillars-header { margin-bottom: 64px; }
        .pillars-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #e8e8ed; border: 1px solid #e8e8ed; border-radius: 18px; overflow: hidden; max-width: 1200px; margin: 0 auto; }
        .pillar-card { background: #fff; padding: 36px 32px; transition: background 0.2s; }
        .pillar-card:hover { background: #fbfaf5; }
        .pillar-icon { width: 48px; height: 48px; border-radius: 12px; background: #f5f5f7; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 20px; }
        .pillar-card h3 { font-size: 17px; font-weight: 600; color: #1d1d1f; margin-bottom: 8px; letter-spacing: -0.3px; }
        .pillar-card p { font-size: 14px; color: #6e6e73; line-height: 1.65; font-weight: 300; }
        .pillar-tag { display: inline-block; margin-top: 16px; font-size: 11px; font-weight: 600; color: #c9a227; background: #faf6e8; border: 1px solid #f0e6b0; padding: 3px 10px; border-radius: 980px; letter-spacing: 0.2px; }
        .pain { padding: 120px 48px; text-align: center; background: linear-gradient(rgba(0,0,0,0.88), rgba(0,0,0,0.84)), url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1920&q=80') center/cover; background-attachment: fixed; color: #fff; }
        .pain .s-h2 { color: #fff; }
        .pain .s-sub { color: rgba(255,255,255,0.48); max-width: 520px; margin: 0 auto 64px; }
        .pain-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; max-width: 1100px; margin: 0 auto; }
        .pain-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 18px; overflow: hidden; text-align: left; transition: 0.3s; }
        .pain-card:hover { background: rgba(255,255,255,0.09); transform: translateY(-4px); }
        .pain-img { width: 100%; height: 180px; object-fit: cover; opacity: 0.85; }
        .pain-body { padding: 24px; }
        .pain-body h3 { font-size: 20px; font-weight: 500; color: #fff; margin-bottom: 10px; letter-spacing: -0.4px; }
        .pain-body p { font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.7; font-weight: 300; }
        .demo { padding: 120px 48px; background: #f5f5f7; }
        .demo-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; max-width: 1100px; margin: 64px auto 0; align-items: center; }
        .phone-wrap { position: relative; max-width: 270px; margin: 0 auto; }
        .phone-frame { border: 8px solid #1d1d1f; border-radius: 48px; overflow: hidden; background: #fff; box-shadow: 0 48px 100px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.04); height: 560px; }
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
        .demo-text > p { font-size: 17px; color: #6e6e73; line-height: 1.7; margin-bottom: 32px; font-weight: 300; letter-spacing: -0.1px; }
        .demo-feats { display: flex; flex-direction: column; gap: 16px; }
        .demo-feat { display: flex; align-items: flex-start; gap: 14px; }
        .feat-dot { width: 22px; height: 22px; border-radius: 50%; background: #faf6e8; border: 1.5px solid #c9a227; display: flex; align-items: center; justify-content: center; color: #c9a227; font-size: 10px; font-weight: 700; flex-shrink: 0; margin-top: 2px; }
        .demo-feat div h4 { font-size: 14px; font-weight: 600; color: #1d1d1f; margin-bottom: 3px; letter-spacing: -0.2px; }
        .demo-feat div p { font-size: 13px; color: #6e6e73; line-height: 1.55; font-weight: 300; }
        .urgence { background: #fff; padding: 100px 48px; border-top: 1px solid #f5f5f7; }
        .urgence-inner { max-width: 1000px; margin: 0 auto; display: flex; align-items: center; gap: 80px; flex-wrap: wrap; }
        .urgence-text { flex: 1; min-width: 280px; }
        .urgence-tag { display: inline-flex; align-items: center; gap: 8px; background: #fff5f5; border: 1px solid #fecaca; color: #dc2626; padding: 6px 14px; border-radius: 980px; font-size: 12px; font-weight: 600; margin-bottom: 24px; }
        .urgence-dot { width: 7px; height: 7px; border-radius: 50%; background: #dc2626; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }
        .urgence-text h2 { font-size: clamp(28px, 3.5vw, 40px); font-weight: 300; color: #1d1d1f; margin-bottom: 16px; line-height: 1.1; letter-spacing: -1px; }
        .urgence-text h2 strong { font-weight: 600; }
        .urgence-text p { font-size: 16px; color: #6e6e73; line-height: 1.7; font-weight: 300; letter-spacing: -0.1px; }
        .urgence-text p + p { margin-top: 12px; }
        .urgence-mockup { flex: 1; min-width: 280px; }
        .notif-phone { background: #1d1d1f; border-radius: 24px; padding: 20px; max-width: 320px; }
        .notif-screen { background: #f5f5f7; border-radius: 14px; padding: 16px; }
        .notif-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .notif-icon { width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #0088cc, #005fa3); display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
        .notif-meta { flex: 1; }
        .notif-app { font-size: 12px; font-weight: 600; color: #1d1d1f; }
        .notif-time { font-size: 11px; color: #86868b; }
        .notif-bubble { background: #fff; border-radius: 12px; padding: 14px; border-left: 3px solid #dc2626; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .notif-bubble p { font-size: 13px; color: #1d1d1f; line-height: 1.6; margin: 0; }
        .upsells-section { padding: 120px 48px; background: #f5f5f7; }
        .upsells-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .upsells-text h2 { font-size: clamp(28px, 3.5vw, 44px); font-weight: 300; color: #1d1d1f; margin-bottom: 16px; letter-spacing: -1px; line-height: 1.1; }
        .upsells-text h2 strong { font-weight: 600; }
        .upsells-text > p { font-size: 17px; color: #6e6e73; line-height: 1.7; margin-bottom: 32px; font-weight: 300; letter-spacing: -0.1px; }
        .upsells-perks { display: flex; flex-direction: column; gap: 14px; }
        .perk { display: flex; align-items: center; gap: 12px; font-size: 15px; color: #1d1d1f; font-weight: 400; letter-spacing: -0.2px; }
        .perk-icon { width: 34px; height: 34px; background: #fff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .upsells-mockup { display: flex; flex-direction: column; gap: 10px; }
        .upsell-card { background: #fff; border: 1px solid #e8e8ed; border-radius: 14px; padding: 16px 18px; display: flex; align-items: center; gap: 14px; transition: 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
        .upsell-card:hover { border-color: #c9a227; box-shadow: 0 4px 16px rgba(201,162,39,0.12); }
        .upsell-emoji { font-size: 26px; flex-shrink: 0; }
        .upsell-info { flex: 1; }
        .upsell-name { font-size: 14px; font-weight: 600; color: #1d1d1f; margin-bottom: 2px; letter-spacing: -0.2px; }
        .upsell-desc { font-size: 12px; color: #86868b; font-weight: 300; }
        .upsell-price { font-size: 16px; font-weight: 600; color: #1d1d1f; letter-spacing: -0.3px; }
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
        .benefit-card h4 { font-size: 15px; font-weight: 600; color: #1d1d1f; margin-bottom: 5px; letter-spacing: -0.2px; }
        .benefit-card p { font-size: 13px; color: #6e6e73; line-height: 1.6; font-weight: 300; }
        .testi { padding: 120px 48px; background: #f5f5f7; text-align: center; }
        .testi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; max-width: 1100px; margin: 64px auto 0; }
        .testi-card { background: #fff; border: 1px solid #e8e8ed; border-radius: 20px; padding: 32px; text-align: left; position: relative; transition: 0.3s; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
        .testi-card:hover { box-shadow: 0 16px 48px rgba(0,0,0,0.08); transform: translateY(-4px); }
        .testi-verified { position: absolute; top: 20px; right: 20px; background: #e8faf0; color: #1a7a40; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 980px; border: 1px solid #b0edca; }
        .testi-stars { color: #f59e0b; font-size: 14px; margin-bottom: 18px; letter-spacing: 2px; }
        .testi-quote { font-size: 15px; color: #1d1d1f; line-height: 1.75; margin-bottom: 24px; font-weight: 300; letter-spacing: -0.1px; }
        .testi-author { display: flex; align-items: center; gap: 12px; }
        .testi-av { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; color: #fff; flex-shrink: 0; }
        .av1{background:linear-gradient(135deg,#f59e0b,#d97706)} .av2{background:linear-gradient(135deg,#3b82f6,#1d4ed8)} .av3{background:linear-gradient(135deg,#10b981,#059669)}
        .testi-name { font-weight: 600; font-size: 14px; color: #1d1d1f; margin-bottom: 2px; letter-spacing: -0.2px; }
        .testi-role { font-size: 12px; color: #86868b; font-weight: 300; }
        .pricing { padding: 120px 48px; text-align: center; background: linear-gradient(160deg, #0a0e1e 0%, #0f172a 60%, #0a0e1e 100%); position: relative; overflow: hidden; }
        .pricing::before { content: ''; position: absolute; top: -20%; right: -5%; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, rgba(201,162,39,0.07) 0%, transparent 70%); pointer-events: none; }
        .pricing .s-h2 { color: #fff; }
        .pricing .s-sub { color: rgba(255,255,255,0.45); max-width: 480px; margin: 0 auto 64px; }
        .price-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(20px); border-radius: 24px; padding: 48px 44px; max-width: 440px; margin: 0 auto; position: relative; }
        .price-promo { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #c9a227, #e8c84a); color: #1d1d1f; padding: 5px 22px; border-radius: 980px; font-size: 12px; font-weight: 600; white-space: nowrap; }
        .plan-label { font-size: 12px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 2px; font-weight: 500; margin-bottom: 24px; }
        .price-amount { font-size: 72px; font-weight: 300; color: #fff; line-height: 1; margin-bottom: 4px; letter-spacing: -3px; }
        .price-amount sup { font-size: 24px; letter-spacing: -0.5px; font-weight: 400; vertical-align: super; }
        .price-amount span { font-size: 20px; font-weight: 300; color: rgba(255,255,255,0.4); letter-spacing: 0; }
        .price-note { font-size: 13px; color: rgba(255,255,255,0.3); margin-bottom: 36px; font-weight: 300; letter-spacing: -0.1px; }
        .price-divider { border: none; border-top: 1px solid rgba(255,255,255,0.07); margin-bottom: 28px; }
        .price-feats { text-align: left; margin-bottom: 36px; display: flex; flex-direction: column; gap: 14px; }
        .price-feat { display: flex; align-items: center; gap: 12px; font-size: 14px; color: rgba(255,255,255,0.65); font-weight: 300; letter-spacing: -0.1px; }
        .price-check { width: 20px; height: 20px; border-radius: 50%; background: rgba(201,162,39,0.18); display: flex; align-items: center; justify-content: center; color: #e8c84a; font-size: 10px; font-weight: 700; flex-shrink: 0; }
        .price-cta { background: #c9a227; color: #1d1d1f; padding: 17px; border-radius: 14px; font-weight: 600; font-size: 16px; display: block; transition: 0.2s; letter-spacing: -0.3px; }
        .price-cta:hover { background: #e8c84a; transform: scale(1.01); }
        .price-security { margin-top: 16px; font-size: 12px; color: rgba(255,255,255,0.22); display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: 300; }
        .referral { padding: 100px 48px; background: #fff; text-align: center; border-top: 1px solid #f5f5f7; }
        .referral-inner { max-width: 640px; margin: 0 auto; }
        .referral h2 { font-size: clamp(32px, 4vw, 48px); font-weight: 300; color: #1d1d1f; margin-bottom: 16px; letter-spacing: -1.2px; line-height: 1.1; }
        .referral h2 strong { font-weight: 600; }
        .referral > .referral-inner > p { font-size: 18px; color: #6e6e73; line-height: 1.65; margin-bottom: 40px; font-weight: 300; letter-spacing: -0.2px; }
        .referral-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; max-width: 480px; margin: 0 auto 40px; }
        .referral-card { background: #f5f5f7; border-radius: 16px; padding: 28px; text-align: center; transition: 0.2s; }
        .referral-card:hover { background: #faf6e8; }
        .referral-number { font-size: 56px; font-weight: 300; color: #c9a227; line-height: 1; margin-bottom: 8px; letter-spacing: -2px; }
        .referral-label { font-size: 13px; color: #6e6e73; font-weight: 400; letter-spacing: -0.1px; }
        footer { background: #1d1d1f; color: #6e6e73; padding: 64px 48px 28px; }
        .footer-inner { max-width: 1100px; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 40px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 48px; margin-bottom: 24px; }
        .footer-brand-col { max-width: 220px; }
        .footer-logo { font-size: 20px; font-weight: 600; color: #fff; display: block; margin-bottom: 12px; letter-spacing: -0.3px; }
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
          .logos { padding: 20px; }
          .pillars { padding: 80px 20px; }
          .pillars-grid { grid-template-columns: 1fr; }
          .pain { padding: 80px 20px; background-attachment: scroll; }
          .demo { padding: 80px 20px; }
          .demo-layout { grid-template-columns: 1fr; gap: 48px; }
          .urgence { padding: 80px 20px; }
          .urgence-inner { gap: 48px; }
          .upsells-section { padding: 80px 20px; }
          .upsells-inner { grid-template-columns: 1fr; gap: 48px; }
          .benefits { padding: 80px 20px; }
          .benefits-inner { grid-template-columns: 1fr; gap: 40px; }
          .benefits-img { height: 260px; }
          .testi { padding: 80px 20px; }
          .pricing { padding: 80px 20px; }
          .referral { padding: 80px 20px; }
          footer { padding: 48px 20px 24px; }
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
            <button className="lang-btn" onClick={() => router.push('/it')}>🇮🇹</button>
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
          <h1>
            Gérez vos locations<br />
            en mode <strong>autopilote.</strong>
          </h1>
          <p className="hero-sub">
            Majordome IA 24h/24 · Ménage automatisé · Upsells sans commission · Alertes urgences.<br/>
            Tout en un, à 9,90 €/mois.
          </p>
          <div className="hero-actions">
            <a className="cta-primary" href="/register" onClick={handleRegisterClick}>
              Démarrer gratuitement →
            </a>
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
        <div className="pillars-header" style={{textAlign:'center'}}>
          <div className="eyebrow">Tout inclus</div>
          <h2 className="s-h2">6 outils. 1 abonnement.<br/><strong>Zéro friction.</strong></h2>
          <p className="s-sub" style={{maxWidth:'520px', margin:'0 auto'}}>Là où d'autres facturent 300 €/mois pour assembler 6 outils séparés, Alfred Major fait tout pour 9,90 €.</p>
        </div>
        <div className="pillars-grid">
          {[
            { icon: '🎩', title: 'Majordome IA', desc: 'Répond aux voyageurs 24h/24 en 30+ langues. Ton chaleureux, réponses précises, mémoire de conversation.', tag: 'Disponible 24h/24' },
            { icon: '🧹', title: 'Ménage automatisé', desc: 'Détecte les nouvelles réservations, notifie votre prestataire, confirme le ménage par photos avant chaque arrivée.', tag: 'Zéro gestion manuelle' },
            { icon: '💰', title: 'Upsells sans commission', desc: 'Late checkout, pack romantique, transfert... Alfred propose au bon moment. Paiement direct sur votre compte Stripe.', tag: '0% de commission' },
            { icon: '📅', title: 'Calendrier synchronisé', desc: 'Sync iCal Airbnb & Booking en temps réel. Réservations détectées automatiquement, missions ménage créées dans la foulée.', tag: 'Sync en temps réel' },
            { icon: '🚨', title: 'Alertes urgences', desc: 'Fuite, panne, incendie — Alfred détecte et vous alerte instantanément sur Telegram et votre mobile, avec traduction auto.', tag: 'Telegram + Push' },
            { icon: '🎁', title: 'Programme parrainage', desc: "2 mois offerts pour chaque hôte parrainé qui s'active. Votre réseau travaille pour réduire votre abonnement à zéro.", tag: '2 mois offerts' },
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
        <div className="eyebrow">Fini les nuits coupées</div>
        <h2 className="s-h2" style={{color:'white', marginBottom:'12px'}}>La gestion locative<br/><strong>réinventée.</strong></h2>
        <p className="s-sub pain-sub" style={{margin:'0 auto 64px', textAlign:'center', color:'rgba(255,255,255,0.45)', maxWidth:'480px'}}>Alfred élimine les interruptions du quotidien.</p>
        <div className="pain-grid">
          {[
            { img: '/pain-nuit.png', alt: 'Message de nuit', title: 'Le message à 23h30', desc: 'Le voyageur ne trouve pas le WiFi. Votre téléphone sonne pendant votre sommeil. Alfred répond instantanément, sans vous déranger.' },
            { img: '/pain-langue.png', alt: 'Barrière de la langue', title: 'La barrière de la langue', desc: 'Alfred parle 30+ langues couramment. Vos voyageurs étrangers sont servis dans leur langue, sans effort de votre part.' },
            { img: '/pain-questions.png', alt: 'Questions répétées', title: 'Les questions répétées', desc: "Poubelles, départ, parking... Alfred répond avec précision, chaque fois comme si c'était la première." },
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
        <div style={{textAlign:'center'}}>
          <div className="eyebrow">En action</div>
          <h2 className="s-h2">L'illusion parfaite<br/>d'un <strong>concierge humain.</strong></h2>
          <p className="s-sub" style={{maxWidth:'480px', margin:'0 auto'}}>Vos voyageurs ne savent pas qu'ils parlent à une IA.</p>
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
            <h2>Répond, recommande, alerte —<br/><strong>sans jamais vous déranger.</strong></h2>
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
            <h2>Vous n'êtes dérangé<br/><strong>que lorsque c'est vital.</strong></h2>
            <p>Si un voyageur signale une urgence, Alfred vous transfère instantanément l'information sur Telegram — avec traduction automatique si nécessaire.</p>
            <p><strong>Résultat :</strong> Vous filtrez 95 % du bruit quotidien et gardez le contrôle sur l'essentiel.</p>
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
            <div className="eyebrow">Revenus additionnels</div>
            <h2>Boostez vos revenus.<br/><strong>0% de commission.</strong></h2>
            <p>Vos voyageurs commandent des services premium directement depuis Alfred. Le paiement arrive directement sur votre compte Stripe — Alfred Major ne prend rien.</p>
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
              { emoji: '🕐', name: 'Late check-out', desc: "Départ jusqu'à 14h", price: '30 €' },
              { emoji: '🌅', name: 'Early check-in', desc: 'Arrivée dès 10h', price: '25 €' },
              { emoji: '🥂', name: 'Pack romantique', desc: 'Champagne & fleurs', price: '45 €' },
              { emoji: '🚗', name: 'Transfert aéroport', desc: 'Navette privée', price: '50 €' },
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
        <div style={{textAlign:'center'}}>
          <div className="eyebrow">Pourquoi Alfred</div>
          <h2 className="s-h2">Ce que vivent nos hôtes<br/><strong>au quotidien.</strong></h2>
        </div>
        <div className="benefits-inner">
          <div className="benefits-img">
            <img src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80" alt="Hôte détendu" loading="lazy" />
            <div className="benefits-img-overlay" />
          </div>
          <div className="benefits-cards">
            {[
              { ico: '😴', cls: 'bi1', title: 'Nuits complètes garanties', desc: 'Plus besoin de garder un œil sur votre téléphone. Alfred gère les questions WiFi, codes et équipements à votre place, 24h/24.' },
              { ico: '🧹', cls: 'bi2', title: 'Ménage géré automatiquement', desc: "Dès qu'une réservation est détectée, votre prestataire est notifié. Vous recevez une confirmation avec photos avant chaque arrivée." },
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

      {/* ── TÉMOIGNAGES ── */}
      <section className="testi">
        <div className="eyebrow">Ils nous font confiance</div>
        <h2 className="s-h2">Ce que disent<br/><strong>nos premiers hôtes.</strong></h2>
        <div className="testi-grid">
          {[
            { av: 'av1', initials: 'SL', name: 'Sophie L.', role: '3 logements · Nice', quote: "Alfred répond à toutes les questions de mes voyageurs, même à 3h du matin. Je n'ai plus reçu un seul appel pour le code WiFi depuis que je l'ai installé. Un vrai soulagement." },
            { av: 'av2', initials: 'TR', name: 'Thomas R.', role: '2 logements · Bordeaux', quote: "J'avais des voyageurs étrangers qui ne parlaient pas français. Alfred leur a répondu en anglais, espagnol et même en allemand. Mes notes Airbnb ont augmenté depuis." },
            { av: 'av3', initials: 'MC', name: 'Marie C.', role: '5 logements · Paris', quote: "L'alerte Telegram m'a sauvé la mise : un voyageur a signalé une fuite, j'ai reçu le message instantanément et j'ai pu envoyer un plombier avant que ça empire." },
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
        <div className="eyebrow">Tarifs</div>
        <h2 className="s-h2" style={{marginBottom:'12px'}}>Simple. Transparent.<br/><strong>Sans surprise.</strong></h2>
        <p className="s-sub" style={{margin:'0 auto 64px', color:'rgba(255,255,255,0.45)', maxWidth:'440px'}}>Boostez votre productivité et passez à une étape supérieure avec Alfred Major.</p>
        <div className="price-card">
          <div className="price-promo">🎁 1er mois 100% offert</div>
          <div className="plan-label">Licence par logement</div>
          <div className="price-amount"><sup>€</sup>9,90<span>/mois</span></div>
          <div className="price-note">Sans engagement · Résiliable en 1 clic</div>
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
          <a className="price-cta" href="/register" onClick={handleRegisterClick}>
            Commencer gratuitement — 1er mois offert
          </a>
          <div className="price-security">🔒 Paiement sécurisé via Stripe · 0% commission sur vos réservations</div>
        </div>
      </section>

      {/* ── PARRAINAGE ── */}
      <section className="referral">
        <div className="referral-inner">
          <div className="eyebrow">Parrainage</div>
          <h2>Parrainez. Économisez.<br/><strong>Réduisez votre abonnement à zéro.</strong></h2>
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
          <a className="cta-primary" style={{display:'inline-flex'}} href="/register" onClick={handleRegisterClick}>
            Créer mon compte et obtenir mon lien →
          </a>
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
              <li><a href="/register" onClick={handleRegisterClick}>Créer un compte</a></li>
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
          <p>© 2026 Alfred Major — Tous droits réservés · Alfred Major · SIRET 531 965 044 00039</p>
        </div>
      </footer>
    </div>
  );
}
