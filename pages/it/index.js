import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function HomeIT() {
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
        <title>Alfred Major | Il Maggiordomo IA per Affitti Brevi</title>
        <meta name="description" content="Gestisci i tuoi affitti brevi col pilota automatico. Maggiordomo IA 24/7, pulizie automatizzate, upsell senza commissioni. Primo mese gratis, senza impegno." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.alfredmajor.com/it" />
        <link rel="alternate" hrefLang="fr" href="https://www.alfredmajor.com/" />
        <link rel="alternate" hrefLang="en" href="https://www.alfredmajor.com/en" />
        <link rel="alternate" hrefLang="es" href="https://www.alfredmajor.com/es" />
        <link rel="alternate" hrefLang="it" href="https://www.alfredmajor.com/it" />
        <link rel="alternate" hrefLang="x-default" href="https://www.alfredmajor.com/" />
        <meta property="og:title" content="Alfred Major — Gestisci i tuoi affitti col pilota automatico" />
        <meta property="og:description" content="Maggiordomo IA 24/7, pulizie automatizzate, upsell senza commissioni, avvisi di emergenza. Primo mese gratis, senza impegno." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.alfredmajor.com/it" />
        <meta property="og:image" content="https://www.alfredmajor.com/og-image.jpg" />
        <meta property="og:locale" content="it_IT" />
        <meta property="og:site_name" content="Alfred Major" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "SoftwareApplication",
          "name": "Alfred Major", "url": "https://www.alfredmajor.com/it",
          "description": "Piattaforma all-in-one per la gestione degli affitti brevi. Maggiordomo IA, pulizie, upsell, avvisi di emergenza.",
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

        /* ── NAVBAR ── */
        nav {
          display: flex; justify-content: space-between; align-items: center;
          padding: 0 48px; height: 64px;
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          transition: background 0.4s ease, border-color 0.4s ease;
          background: ${scrolled ? 'rgba(255,255,255,0.88)' : 'transparent'};
          backdrop-filter: ${scrolled ? 'saturate(180%) blur(20px)' : 'none'};
          border-bottom: 1px solid ${scrolled ? 'rgba(0,0,0,0.08)' : 'transparent'};
        }
        .brand { font-size: 20px; font-weight: 600; letter-spacing: -0.4px; color: ${scrolled ? '#1d1d1f' : '#fff'}; transition: color 0.4s; }
        .brand-gold { color: #c9a227; }
        .nav-links { display: flex; align-items: center; gap: 32px; }
        .nav-link { font-size: 14px; font-weight: 400; color: ${scrolled ? '#6e6e73' : 'rgba(255,255,255,0.75)'}; transition: color 0.2s; letter-spacing: -0.1px; }
        .nav-link:hover { color: ${scrolled ? '#1d1d1f' : '#fff'}; }
        .nav-lang { display: flex; align-items: center; gap: 2px; background: ${scrolled ? '#f5f5f7' : 'rgba(255,255,255,0.12)'}; border-radius: 20px; padding: 3px; }
        .lang-btn { background: none; border: none; padding: 4px 9px; border-radius: 16px; cursor: pointer; font-size: 13px; font-family: inherit; transition: background 0.2s; line-height: 1; color: inherit; }
        .lang-btn:hover, .lang-btn.active { background: white; color: #1d1d1f; }
        .nav-cta { background: #1d1d1f; color: #fff; padding: 9px 20px; border-radius: 980px; font-size: 13px; font-weight: 500; letter-spacing: -0.1px; transition: background 0.2s; }
        .nav-cta:hover { background: #c9a227; color: #1d1d1f; }

        /* ── HERO ── */
        .hero {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          text-align: center; padding: 120px 24px 100px; position: relative; overflow: hidden;
          background: linear-gradient(180deg, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.38) 60%, rgba(0,0,0,0.62) 100%),
            url('https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1920&q=80') center/cover no-repeat;
          background-attachment: fixed;
        }
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

        /* ── LOGOS ── */
        .logos { background: #f5f5f7; padding: 24px 48px; text-align: center; border-bottom: 1px solid #e8e8ed; }
        .logos-label { font-size: 11px; color: #86868b; text-transform: uppercase; letter-spacing: 2px; font-weight: 500; margin-bottom: 14px; }
        .logos-row { display: flex; justify-content: center; align-items: center; gap: 40px; flex-wrap: wrap; }
        .logo-pill { font-size: 15px; font-weight: 500; color: #aeaeb2; letter-spacing: -0.2px; transition: color 0.2s; }
        .logo-pill:hover { color: #6e6e73; }

        /* ── SHARED ── */
        .eyebrow { font-size: 12px; font-weight: 600; color: #c9a227; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
        .s-h2 { font-size: clamp(36px, 5vw, 56px); font-weight: 300; color: #1d1d1f; line-height: 1.07; letter-spacing: -1.5px; margin-bottom: 16px; }
        .s-h2 strong { font-weight: 600; }
        .s-sub { font-size: 19px; color: #6e6e73; line-height: 1.6; font-weight: 300; letter-spacing: -0.2px; }

        /* ── PILLARS ── */
        .pillars { padding: 120px 48px; background: #fff; }
        .pillars-header { margin-bottom: 64px; text-align: center; }
        .pillars-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #e8e8ed; border: 1px solid #e8e8ed; border-radius: 18px; overflow: hidden; max-width: 1200px; margin: 0 auto; }
        .pillar-card { background: #fff; padding: 36px 32px; transition: background 0.2s; }
        .pillar-card:hover { background: #fbfaf5; }
        .pillar-icon { width: 48px; height: 48px; border-radius: 12px; background: #f5f5f7; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 20px; }
        .pillar-card h3 { font-size: 17px; font-weight: 600; color: #1d1d1f; margin-bottom: 8px; letter-spacing: -0.3px; }
        .pillar-card p { font-size: 14px; color: #6e6e73; line-height: 1.65; font-weight: 300; }
        .pillar-tag { display: inline-block; margin-top: 16px; font-size: 11px; font-weight: 600; color: #c9a227; background: #faf6e8; border: 1px solid #f0e6b0; padding: 3px 10px; border-radius: 980px; letter-spacing: 0.2px; }

        /* ── PAIN ── */
        .pain { padding: 120px 48px; text-align: center; background: linear-gradient(rgba(0,0,0,0.88), rgba(0,0,0,0.84)), url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1920&q=80') center/cover; background-attachment: fixed; color: #fff; }
        .pain .s-h2 { color: #fff; }
        .pain-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; max-width: 1100px; margin: 0 auto; }
        .pain-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 18px; overflow: hidden; text-align: left; transition: 0.3s; }
        .pain-card:hover { background: rgba(255,255,255,0.09); transform: translateY(-4px); }
        .pain-img { width: 100%; height: 180px; object-fit: cover; opacity: 0.85; }
        .pain-body { padding: 24px; }
        .pain-body h3 { font-size: 20px; font-weight: 500; color: #fff; margin-bottom: 10px; letter-spacing: -0.4px; }
        .pain-body p { font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.7; font-weight: 300; }

        /* ── DEMO ── */
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
        .demo-text > p { font-size: 17px; color: #6e6e73; line-height: 1.7; margin-bottom: 32px; font-weight: 300; letter-spacing: -0.1px; }
        .demo-feats { display: flex; flex-direction: column; gap: 16px; }
        .demo-feat { display: flex; align-items: flex-start; gap: 14px; }
        .feat-dot { width: 22px; height: 22px; border-radius: 50%; background: #faf6e8; border: 1.5px solid #c9a227; display: flex; align-items: center; justify-content: center; color: #c9a227; font-size: 10px; font-weight: 700; flex-shrink: 0; margin-top: 2px; }
        .demo-feat div h4 { font-size: 14px; font-weight: 600; color: #1d1d1f; margin-bottom: 3px; letter-spacing: -0.2px; }
        .demo-feat div p { font-size: 13px; color: #6e6e73; line-height: 1.55; font-weight: 300; }

        /* ── URGENCE ── */
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
        .notif-app { font-size: 12px; font-weight: 600; color: #1d1d1f; }
        .notif-time { font-size: 11px; color: #86868b; }
        .notif-bubble { background: #fff; border-radius: 12px; padding: 14px; border-left: 3px solid #dc2626; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .notif-bubble p { font-size: 13px; color: #1d1d1f; line-height: 1.6; margin: 0; }

        /* ── UPSELLS ── */
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

        /* ── BENEFITS ── */
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

        /* ── TESTIMONIALS ── */
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

        /* ── PRICING ── */
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
        .price-note { font-size: 13px; color: rgba(255,255,255,0.3); margin-bottom: 36px; font-weight: 300; }
        .price-divider { border: none; border-top: 1px solid rgba(255,255,255,0.07); margin-bottom: 28px; }
        .price-feats { text-align: left; margin-bottom: 36px; display: flex; flex-direction: column; gap: 14px; }
        .price-feat { display: flex; align-items: center; gap: 12px; font-size: 14px; color: rgba(255,255,255,0.65); font-weight: 300; letter-spacing: -0.1px; }
        .price-check { width: 20px; height: 20px; border-radius: 50%; background: rgba(201,162,39,0.18); display: flex; align-items: center; justify-content: center; color: #e8c84a; font-size: 10px; font-weight: 700; flex-shrink: 0; }
        .price-cta { background: #c9a227; color: #1d1d1f; padding: 17px; border-radius: 14px; font-weight: 600; font-size: 16px; display: block; transition: 0.2s; letter-spacing: -0.3px; }
        .price-cta:hover { background: #e8c84a; transform: scale(1.01); }
        .price-security { margin-top: 16px; font-size: 12px; color: rgba(255,255,255,0.22); display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: 300; }

        /* ── REFERRAL ── */
        .referral { padding: 100px 48px; background: #fff; text-align: center; border-top: 1px solid #f5f5f7; }
        .referral-inner { max-width: 640px; margin: 0 auto; }
        .referral h2 { font-size: clamp(32px, 4vw, 48px); font-weight: 300; color: #1d1d1f; margin-bottom: 16px; letter-spacing: -1.2px; line-height: 1.1; }
        .referral h2 strong { font-weight: 600; }
        .referral-inner > p { font-size: 18px; color: #6e6e73; line-height: 1.65; margin-bottom: 40px; font-weight: 300; letter-spacing: -0.2px; }
        .referral-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; max-width: 480px; margin: 0 auto 40px; }
        .referral-card { background: #f5f5f7; border-radius: 16px; padding: 28px; text-align: center; transition: 0.2s; }
        .referral-card:hover { background: #faf6e8; }
        .referral-number { font-size: 56px; font-weight: 300; color: #c9a227; line-height: 1; margin-bottom: 8px; letter-spacing: -2px; }
        .referral-label { font-size: 13px; color: #6e6e73; font-weight: 400; letter-spacing: -0.1px; }

        /* ── FOOTER ── */
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

        /* ── RESPONSIVE ── */
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
        <Link href="/it" passHref legacyBehavior>
          <a className="brand">Alfred<span className="brand-gold">Major</span></a>
        </Link>
        <div className="nav-links">
          <a href="#features" className="nav-link">Funzionalità</a>
          <a href="#pricing" className="nav-link">Prezzi</a>
          <div className="nav-lang">
            <button className="lang-btn" onClick={() => router.push('/')}>🇫🇷</button>
            <button className="lang-btn" onClick={() => router.push('/en')}>🇬🇧</button>
            <button className="lang-btn" onClick={() => router.push('/es')}>🇪🇸</button>
            <button className="lang-btn active">🇮🇹</button>
          </div>
          <Link href="/it/login" passHref legacyBehavior>
            <a className="nav-cta">Accesso Host</a>
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🎁 1° mese 100% gratis — Senza impegno</div>
          <h1>
            Gestisci i tuoi affitti<br />
            col <strong>pilota automatico.</strong>
          </h1>
          <p className="hero-sub">
            Maggiordomo IA 24/7 · Pulizie automatizzate · Upsell senza commissioni · Avvisi di emergenza.<br/>
            Tutto incluso, a 9,90€/mese.
          </p>
          <div className="hero-actions">
            <Link href="/it/register" passHref legacyBehavior>
              <a className="cta-primary">Inizia gratis →</a>
            </Link>
            <a href="#demo" className="cta-secondary">Guarda la demo ↓</a>
          </div>
          <div className="hero-trust">
            <span className="trust-item">✓ Nessuna carta di credito</span>
            <span className="trust-sep" />
            <span className="trust-item">✓ Setup in 5 minuti</span>
            <span className="trust-sep" />
            <span className="trust-item">✓ 30+ lingue</span>
            <span className="trust-sep" />
            <span className="trust-item">✓ 0% commissioni</span>
          </div>
        </div>
      </section>

      {/* ── LOGOS ── */}
      <section className="logos">
        <p className="logos-label">Compatibile con le principali piattaforme</p>
        <div className="logos-row">
          {['Airbnb', 'Booking.com', 'Abritel', 'Vrbo', 'Expedia'].map(p => (
            <span key={p} className="logo-pill">{p}</span>
          ))}
        </div>
      </section>

      {/* ── PILLARS ── */}
      <section className="pillars" id="features">
        <div className="pillars-header">
          <div className="eyebrow">Tutto incluso</div>
          <h2 className="s-h2">6 strumenti. 1 abbonamento.<br/><strong>Zero attriti.</strong></h2>
          <p className="s-sub" style={{maxWidth:'520px', margin:'0 auto'}}>Dove gli altri ti chiedono 300€/mese per combinare 6 app, Alfred Major fa tutto a 9,90€.</p>
        </div>
        <div className="pillars-grid">
          {[
            { icon: '🎩', title: 'Maggiordomo IA', desc: 'Risponde agli ospiti 24/7 in 30+ lingue. Tono caloroso, risposte precise, memoria della conversazione.', tag: 'Disponibile 24/7' },
            { icon: '🧹', title: 'Pulizie Automatizzate', desc: 'Rileva nuove prenotazioni, avvisa chi pulisce, e conferma il lavoro con foto prima del check-in.', tag: 'Gestione automatica' },
            { icon: '💰', title: 'Upsell Senza Commissioni', desc: 'Late checkout, pacchetto romantico, transfer... Alfred li propone al momento giusto. Pagamenti dritti sul tuo Stripe.', tag: '0% commissioni' },
            { icon: '📅', title: 'Calendario Sincronizzato', desc: 'Sincronizzazione iCal con Airbnb e Booking in tempo reale. Prenotazioni rilevate all\'istante.', tag: 'Sync in tempo reale' },
            { icon: '🚨', title: 'Avvisi di Emergenza', desc: 'Perdite d\'acqua, guasti, incendi — Alfred rileva e ti avvisa subito via Telegram e app, con traduzione automatica.', tag: 'Telegram + Push' },
            { icon: '🎁', title: 'Programma Referral', desc: 'Guadagna 2 mesi gratis per ogni host invitato che si attiva. Il tuo network azzera il tuo abbonamento.', tag: '2 mesi gratis' },
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
        <div className="eyebrow">Basta notti interrotte</div>
        <h2 className="s-h2" style={{color:'white', marginBottom:'12px'}}>L'affitto breve<br/><strong>reinventato.</strong></h2>
        <p className="s-sub" style={{margin:'0 auto 64px', textAlign:'center', color:'rgba(255,255,255,0.45)', maxWidth:'480px'}}>Alfred elimina le interruzioni quotidiane.</p>
        <div className="pain-grid">
          {[
            { img: '/pain-nuit.png', alt: 'Messaggio a tarda notte', title: 'Il messaggio delle 23:30', desc: "L'ospite non trova il WiFi. Il telefono squilla mentre dormi. Alfred risponde all'istante, nel cuore della notte." },
            { img: '/pain-langue.png', alt: 'Barriera linguistica', title: 'La barriera linguistica', desc: 'Alfred parla 30+ lingue fluentemente. I tuoi ospiti internazionali vengono serviti nella loro lingua, senza sforzo.' },
            { img: '/pain-questions.png', alt: 'Domande ripetitive', title: 'Sempre le stesse domande', desc: "Spazzatura, checkout, parcheggio... Alfred risponde con precisione, ogni volta come se fosse la prima." },
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
          <div className="eyebrow">In azione</div>
          <h2 className="s-h2">L'illusione perfetta<br/>di un <strong>concierge umano.</strong></h2>
          <p className="s-sub" style={{maxWidth:'480px', margin:'0 auto'}}>I tuoi ospiti non sapranno mai di parlare con un'IA.</p>
        </div>
        <div className="demo-layout">
          <div className="phone-wrap">
            <div className="phone-frame">
              <div className="phone-notch" />
              <div className="chat-app">
                <div className="chat-head">
                  <div className="chat-head-title">🎩 Alfred — Villa Noam</div>
                  <div className="chat-head-sub">Disponibile 24/7</div>
                </div>
                <div className="chat-msgs">
                  <div className="msg msg-user">Ciao! Qual è la password del WiFi? 📶</div>
                  <div className="msg msg-alfred">Benvenuti a Villa Noam! 🎩 Rete: <strong>VillaNomad_5G</strong>, password: <strong>Holiday2024</strong></div>
                  <div className="msg msg-user">Possiamo fare il check-out alle 14:00?</div>
                  <div className="msg msg-alfred">Certamente! Il late check-out fino alle 14:00 è disponibile per 30€. Potete prenotarlo qui → ✨</div>
                  <div className="msg msg-user">C'è una perdita sotto il lavandino!</div>
                  <div className="msg msg-alfred">Mantenete la calma. La valvola principale è sotto il lato destro del lavandino. Avviso immediatamente il vostro host. 🚨</div>
                </div>
              </div>
            </div>
          </div>
          <div className="demo-text">
            <h2>Risponde, consiglia, avvisa —<br/><strong>senza mai disturbarti.</strong></h2>
            <p>Alfred attinge alla base di conoscenza che hai impostato per rispondere con precisione. Trova i migliori locali in tempo reale e rileva le emergenze in automatico.</p>
            <div className="demo-feats">
              {[
                { title: 'Consigli locali in tempo reale', desc: 'Ristoranti, farmacie, trasporti — Alfred scansiona la zona via Google Maps.' },
                { title: 'Propone i tuoi upsell con naturalezza', desc: 'Se un ospite chiede un late checkout, Alfred propone il tuo servizio direttamente.' },
                { title: 'Rileva le emergenze e ti avvisa', desc: 'Perdite d\'acqua, guasti, gas — Alfred ti avvisa su Telegram con traduzione automatica.' },
                { title: 'Memoria della conversazione', desc: 'Alfred comprende il contesto e non chiede mai la stessa cosa due volte.' },
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
            <div className="urgence-tag"><div className="urgence-dot" /> Avviso in tempo reale</div>
            <h2>Vieni disturbato<br/><strong>solo quando conta davvero.</strong></h2>
            <p>Se un ospite segnala un'emergenza, Alfred ti inoltra istantaneamente l'informazione su Telegram — con traduzione automatica se necessario.</p>
            <p><strong>Risultato:</strong> Filtri il 95% del rumore quotidiano e mantieni il controllo su ciò che è importante.</p>
          </div>
          <div className="urgence-mockup">
            <div className="notif-phone">
              <div className="notif-screen">
                <div className="notif-row">
                  <div className="notif-icon">✈️</div>
                  <div>
                    <div className="notif-app">Telegram</div>
                    <div className="notif-time">adesso</div>
                  </div>
                </div>
                <div className="notif-bubble">
                  <p>🚨 <strong>ALLERTA ALFRED MAJOR</strong><br/><br/>🏠 Villa Noam — Roma<br/>💬 "C'è un'enorme perdita sotto il lavandino!"<br/>🔄 Traduzione: Fuite sous l'évier</p>
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
            <div className="eyebrow">Ricavi extra</div>
            <h2>Aumenta i tuoi guadagni.<br/><strong>0% di commissioni.</strong></h2>
            <p>Gli ospiti possono ordinare servizi premium direttamente tramite Alfred. Il pagamento va dritto sul tuo account Stripe — Alfred Major non trattiene nulla.</p>
            <div className="upsells-perks">
              {[
                { icon: '💶', text: 'Pagamento diretto sul tuo account Stripe' },
                { icon: '0️⃣', text: 'Alfred Major richiede zero commissioni' },
                { icon: '🤖', text: 'Alfred propone al momento giusto, con naturalezza' },
                { icon: '🌍', text: 'Pagina ospite multilingue e personalizzata' },
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
              { emoji: '🕐', name: 'Late check-out', desc: 'Partenza fino alle 14:00', price: '30€' },
              { emoji: '🌅', name: 'Early check-in', desc: 'Arrivo dalle 10:00', price: '25€' },
              { emoji: '🥂', name: 'Pacchetto romantico', desc: 'Champagne e fiori', price: '45€' },
              { emoji: '🚗', name: 'Transfer per aeroporto', desc: 'Navetta privata', price: '50€' },
            ].map((u, i) => (
              <div key={i} className="upsell-card">
                <div className="upsell-emoji">{u.emoji}</div>
                <div className="upsell-info">
                  <div className="upsell-name">{u.name}</div>
                  <div className="upsell-desc">{u.desc}</div>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                  <div className="upsell-price">{u.price}</div>
                  <button className="upsell-cta">Prenota</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section className="benefits">
        <div style={{textAlign:'center'}}>
          <div className="eyebrow">Perché Alfred</div>
          <h2 className="s-h2">Cosa vivono i nostri host<br/><strong>ogni giorno.</strong></h2>
        </div>
        <div className="benefits-inner">
          <div className="benefits-img">
            <img src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80" alt="Host rilassato" loading="lazy" />
            <div className="benefits-img-overlay" />
          </div>
          <div className="benefits-cards">
            {[
              { ico: '😴', cls: 'bi1', title: 'Notti tranquille garantite', desc: 'Non devi più guardare il telefono. Alfred gestisce per te WiFi, codici e domande, 24/7.' },
              { ico: '🧹', cls: 'bi2', title: 'Pulizie col pilota automatico', desc: 'Appena c\'è una prenotazione, chi pulisce viene avvisato. Ricevi una foto prima di ogni check-in.' },
              { ico: '⭐', cls: 'bi3', title: 'Migliori recensioni su Airbnb', desc: 'Ospiti serviti meglio lasciano recensioni migliori. La disponibilità multilingue fa la differenza.' },
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
        <div className="eyebrow">Approvato dagli host</div>
        <h2 className="s-h2">Cosa dicono i nostri host.</h2>
        <div className="testi-grid">
          {[
            { av: 'av1', initials: 'SL', name: 'Sophie L.', role: '3 proprietà · Nizza', quote: "Alfred risponde a tutte le domande, anche alle 3 del mattino. Non ho più ricevuto una sola chiamata per il WiFi da quando l'ho installato. Un vero sollievo." },
            { av: 'av2', initials: 'TR', name: 'Thomas R.', role: '2 proprietà · Milano', quote: "Avevo ospiti stranieri che non parlavano italiano. Alfred ha risposto loro in inglese, spagnolo e persino tedesco. Le mie recensioni sono migliorate molto." },
            { av: 'av3', initials: 'MC', name: 'Marie C.', role: '5 proprietà · Roma', quote: "L'avviso su Telegram mi ha salvata: un ospite ha segnalato una perdita, ho ricevuto il messaggio all'istante e ho mandato un idraulico prima che peggiorasse." },
          ].map((t, i) => (
            <div key={i} className="testi-card">
              <span className="testi-verified">✓ Host verificato</span>
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
      <section className="pricing" id="pricing">
        <div className="eyebrow">Prezzi</div>
        <h2 className="s-h2" style={{marginBottom:'12px'}}>Semplice. Trasparente.<br/><strong>Nessuna sorpresa.</strong></h2>
        <p className="s-sub" style={{margin:'0 auto 64px', color:'rgba(255,255,255,0.45)', maxWidth:'440px'}}>Un maggiordomo privato 24/7 a una frazione del costo di un concierge tradizionale.</p>
        <div className="price-card">
          <div className="price-promo">🎁 1° mese 100% gratis</div>
          <div className="plan-label">Licenza per proprietà</div>
          <div className="price-amount"><sup>€</sup>9.90<span>/mese</span></div>
          <div className="price-note">Senza impegno · Annulla in 1 clic</div>
          <hr className="price-divider" />
          <div className="price-feats">
            {[
              'Maggiordomo IA 24/7 · 30+ lingue',
              'Gestione automatizzata delle pulizie',
              'Upsell senza commissioni (Stripe Connect)',
              'Sincronizzazione iCal Airbnb e Booking',
              'Avvisi di emergenza Telegram + Push',
              'Storico conversazioni con gli ospiti',
              'Programma referral — 2 mesi gratis',
            ].map((f, i) => (
              <div key={i} className="price-feat">
                <div className="price-check">✓</div>
                {f}
              </div>
            ))}
          </div>
          <Link href="/it/register" passHref legacyBehavior>
            <a className="price-cta">Inizia gratis — 1° mese incluso</a>
          </Link>
          <div className="price-security">🔒 Pagamento sicuro via Stripe · 0% commissioni sulle tue prenotazioni</div>
        </div>
      </section>

      {/* ── REFERRAL ── */}
      <section className="referral">
        <div className="referral-inner">
          <div className="eyebrow">Referral</div>
          <h2>Invita. Risparmia.<br/><strong>Azzera il tuo abbonamento.</strong></h2>
          <p>Condividi il tuo link unico con altri host. Non appena l'host invitato attiva la sua prima proprietà, verrete entrambi ricompensati automaticamente.</p>
          <div className="referral-cards">
            <div className="referral-card">
              <div className="referral-number">2</div>
              <div className="referral-label">mesi gratis per te</div>
            </div>
            <div className="referral-card">
              <div className="referral-number">1</div>
              <div className="referral-label">mese gratis per il tuo amico</div>
            </div>
          </div>
          <Link href="/it/register" passHref legacyBehavior>
            <a className="cta-primary" style={{display:'inline-flex'}}>Crea il mio account e ottieni il link →</a>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-inner">
          <div className="footer-brand-col">
            <span className="footer-logo">Alfred<span>Major</span></span>
            <p>La piattaforma all-in-one per gestire i tuoi affitti brevi col pilota automatico.</p>
          </div>
          <div className="footer-col">
            <h4>Prodotto</h4>
            <ul>
              <li><Link href="/it/login" passHref legacyBehavior><a>Dashboard Host</a></Link></li>
              <li><Link href="/it/register" passHref legacyBehavior><a>Crea un account</a></Link></li>
              <li><a href="#pricing">Prezzi</a></li>
              <li><a href="#features">Funzionalità</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Note Legali</h4>
            <ul>
              <li><Link href="/conditions-generales" passHref legacyBehavior><a>Termini e Condizioni</a></Link></li>
              <li><Link href="/confidentialite" passHref legacyBehavior><a>Privacy Policy (GDPR)</a></Link></li>
              <li><Link href="/mentions-legales" passHref legacyBehavior><a>Note legali</a></Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contatti</h4>
            <ul>
              <li><a href="mailto:contact@alfredmajor.com">contact@alfredmajor.com</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Alfred Major — Tutti i diritti riservati · Dorian BISCARRAT · SIRET 531 965 044 00039</p>
        </div>
      </footer>
    </div>
  );
}