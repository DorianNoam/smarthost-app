import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from '../lib/useTranslation';

export default function Home() {
  const router = useRouter();
  const { t, locale } = useTranslation();

  const switchLocale = (newLocale) => {
    router.push(router.pathname, router.asPath, { locale: newLocale });
  };
  return (
    <div className="container">
      <Head>
        <title>{t.meta.title}</title>
        <meta name="description" content={t.meta.description} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://www.alfredmajor.com${locale === 'fr' ? '/' : `/${locale}/`}`} />
        <link rel="alternate" hrefLang="fr" href="https://www.alfredmajor.com/" />
        <link rel="alternate" hrefLang="en" href="https://www.alfredmajor.com/en" />
        <link rel="alternate" hrefLang="es" href="https://www.alfredmajor.com/es" />
        <link rel="alternate" hrefLang="x-default" href="https://www.alfredmajor.com/" />
        <meta property="og:title" content={t.meta.ogTitle} />
        <meta property="og:description" content={t.meta.ogDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://www.alfredmajor.com${locale === 'fr' ? '/' : `/${locale}/`}`} />
        <meta property="og:image" content="https://www.alfredmajor.com/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Alfred Major — Majordome IA pour locations courte durée" />
        <meta property="og:locale" content={t.meta.ogLocale} />
        <meta property="og:site_name" content="Alfred Major" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t.meta.ogTitle} />
        <meta name="twitter:description" content={t.meta.ogDescription} />
        <meta name="twitter:image" content="https://www.alfredmajor.com/og-image.jpg" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1a2a6c" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Alfred Major",
          "url": "https://www.alfredmajor.com",
          "description": t.meta.description,
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web, Android, iOS",
          "offers": { "@type": "Offer", "price": "9.90", "priceCurrency": "EUR", "priceValidUntil": "2026-12-31" },
          "publisher": { "@type": "Organization", "name": "Alfred Major", "url": "https://www.alfredmajor.com" }
        })}} />
      </Head>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&display=swap');

        :global(a) { text-decoration: none; color: inherit; }
        :global(html), :global(body) { margin: 0; padding: 0; overflow-x: hidden; width: 100%; background-color: #fafafa; scroll-behavior: smooth; }
        .container { font-family: 'Inter', sans-serif; color: #0f172a; width: 100%; }

        /* ══════════════════ NAVBAR ══════════════════ */
        nav {
          display: flex; justify-content: space-between; align-items: center; padding: 15px 5%;
          position: fixed; top: 0; left: 0; right: 0; background: rgba(255,255,255,0.92);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          z-index: 1000; box-shadow: 0 1px 0 rgba(0,0,0,0.06); box-sizing: border-box;
        }
        .brand { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 24px; font-weight: 900; color: #1a2a6c; letter-spacing: -0.5px; }
        .gold { color: #d4af37; }
        .nav-links { display: flex; align-items: center; gap: 30px; }
        .nav-link { color: #475569; font-weight: 500; font-size: 15px; transition: 0.2s; }
        .nav-link:hover { color: #1a2a6c; }
        .nav-login { font-weight: 700; color: white; background: #1a2a6c; padding: 10px 24px; border-radius: 50px; font-size: 14px; transition: 0.3s; }
        .nav-login:hover { background: #d4af37; color: #1a2a6c; transform: translateY(-1px); }
        .lang-switcher { display: flex; align-items: center; gap: 4px; }
        .lang-btn { background: none; border: 1px solid transparent; padding: 5px 8px; border-radius: 8px; cursor: pointer; font-size: 16px; transition: 0.2s; color: #475569; }
        .lang-btn:hover { background: #f1f5f9; border-color: #e2e8f0; }
        .lang-btn.active { background: #eff6ff; border-color: #1a2a6c; }

        /* ══════════════════ HERO ══════════════════ */
        .hero {
          position: relative; min-height: 92vh; display: flex; align-items: center; justify-content: center;
          text-align: center; padding: 140px 20px 100px; box-sizing: border-box; overflow: hidden;
          background: linear-gradient(165deg, rgba(10,15,40,0.88) 0%, rgba(26,42,108,0.75) 50%, rgba(10,15,40,0.92) 100%),
                      url('https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1920&q=80') center/cover fixed;
        }
        .hero-content { max-width: 900px; z-index: 10; margin: 0 auto; display: flex; flex-direction: column; align-items: center; width: 100%; }
        .badge-hero {
          background: rgba(212,175,55,0.18); color: #fbbf24; padding: 10px 20px; border-radius: 50px;
          font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;
          display: inline-flex; align-items: center; gap: 8px; margin-bottom: 30px;
          border: 1px solid rgba(212,175,55,0.35); backdrop-filter: blur(10px);
        }
        h1 {
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(36px, 6vw, 68px);
          color: white; margin-bottom: 24px; line-height: 1.08; font-weight: 900; letter-spacing: -2px;
        }
        h1 em { font-style: normal; color: #d4af37; }
        .subtitle { font-size: clamp(16px, 2.5vw, 19px); margin-bottom: 44px; color: rgba(255,255,255,0.75); line-height: 1.7; font-weight: 400; max-width: 680px; }
        .cta-main {
          background: linear-gradient(135deg, #d4af37, #f0cc5a); color: #1a2a6c; padding: 20px 48px;
          border-radius: 50px; font-weight: 800; font-size: 16px; letter-spacing: 0.3px;
          box-shadow: 0 12px 40px rgba(212,175,55,0.4); display: inline-flex; align-items: center;
          gap: 10px; transition: 0.3s; cursor: pointer;
        }
        .cta-main:hover { transform: translateY(-3px); box-shadow: 0 20px 50px rgba(212,175,55,0.5); }
        .trust-row { margin-top: 28px; display: flex; align-items: center; justify-content: center; gap: 24px; flex-wrap: wrap; }
        .trust-item { font-size: 13px; color: rgba(255,255,255,0.6); display: flex; align-items: center; gap: 6px; }
        .trust-dot { width: 4px; height: 4px; border-radius: 50%; background: rgba(255,255,255,0.3); }

        /* ══════════════════ LOGOS ══════════════════ */
        .logos-section { background: white; padding: 28px 5%; border-bottom: 1px solid #f1f5f9; text-align: center; }
        .logos-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin-bottom: 18px; }
        .logos-flex { display: flex; justify-content: center; align-items: center; gap: 40px; flex-wrap: wrap; }
        .logo-item { font-weight: 800; font-size: 17px; font-family: 'Plus Jakarta Sans', sans-serif; color: #94a3b8; letter-spacing: -0.3px; transition: 0.2s; }
        .logo-item:hover { color: #475569; }

        /* ══════════════════ STEPS ══════════════════ */
        .steps-section { padding: 110px 5%; background: #f8fafc; text-align: center; }
        .section-label { font-size: 12px; font-weight: 700; color: #d4af37; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 14px; }
        .section-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(28px, 5vw, 42px); color: #0f172a; margin: 0 0 12px; font-weight: 800; letter-spacing: -1px; }
        .section-sub { color: #64748b; font-size: 17px; margin: 0 auto; max-width: 600px; line-height: 1.6; }
        .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; max-width: 1000px; margin: 60px auto 0; position: relative; }
        .steps-grid::before { content: ''; position: absolute; top: 40px; left: calc(16.66% + 20px); right: calc(16.66% + 20px); height: 2px; background: linear-gradient(90deg, #d4af37, #1a2a6c, #d4af37); z-index: 0; }
        .step-card { padding: 0 30px; text-align: center; position: relative; z-index: 1; }
        .step-icon-wrap {
          width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 24px;
          display: flex; align-items: center; justify-content: center; font-size: 32px;
          position: relative; z-index: 2;
        }
        .step-icon-wrap.s1 { background: linear-gradient(135deg, #dbeafe, #bfdbfe); box-shadow: 0 8px 24px rgba(59,130,246,0.2); }
        .step-icon-wrap.s2 { background: linear-gradient(135deg, #fef3c7, #fde68a); box-shadow: 0 8px 24px rgba(212,175,55,0.3); }
        .step-icon-wrap.s3 { background: linear-gradient(135deg, #d1fae5, #a7f3d0); box-shadow: 0 8px 24px rgba(16,185,129,0.2); }
        .step-card h3 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 19px; color: #0f172a; margin-bottom: 12px; font-weight: 800; }
        .step-card p { color: #64748b; line-height: 1.65; font-size: 15px; margin: 0; }

        /* ══════════════════ PAIN — SECTION PHOTO ══════════════════ */
        .pain-section {
          padding: 110px 5%; text-align: center; position: relative; overflow: hidden;
          background: linear-gradient(rgba(15,23,42,0.92), rgba(15,23,42,0.88)),
                      url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1920&q=80') center/cover fixed;
        }
        .pain-section .section-title { color: white; }
        .pain-section .section-sub { color: rgba(255,255,255,0.65); }
        .pain-section .section-label { color: #fbbf24; }
        .pain-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; max-width: 1100px; margin: 50px auto 0; }

        /* ✅ PAIN CARD AVEC PHOTO */
        .pain-card {
          background: rgba(255,255,255,0.07); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border-radius: 24px; text-align: left; transition: 0.3s; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.12);
        }
        .pain-card:hover { transform: translateY(-6px); background: rgba(255,255,255,0.12); border-color: rgba(212,175,55,0.4); }

        /* Photo en haut de la card */
        .pain-card-photo {
          width: 100%; height: 200px; overflow: hidden; position: relative;
        }
        .pain-card-photo img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.5s ease;
        }
        .pain-card:hover .pain-card-photo img { transform: scale(1.05); }
        .pain-card-photo-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, transparent 40%, rgba(15,23,42,0.6) 100%);
        }

        /* Contenu sous la photo */
        .pain-card-body { padding: 28px 28px 32px; }
        .pain-card h3 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 20px; color: white; margin: 0 0 12px; font-weight: 800; }
        .pain-card p { color: rgba(255,255,255,0.65); line-height: 1.7; font-size: 15px; margin: 0; }

        /* ══════════════════ DEMO ══════════════════ */
        .demo-section { padding: 110px 5%; background: #0f172a; color: white; overflow: hidden; }
        .demo-header { text-align: center; margin-bottom: 70px; }
        .demo-header .section-title { color: white; }
        .demo-header .section-sub { color: rgba(255,255,255,0.6); }
        .demo-layout { display: flex; flex-direction: column; gap: 60px; max-width: 1100px; margin: 0 auto; align-items: center; }
        @media (min-width: 1024px) { .demo-layout { flex-direction: row; justify-content: space-between; align-items: center; } }
        .phone-wrapper { position: relative; width: 100%; max-width: 300px; margin: 0 auto; }
        .phone-frame { border: 8px solid #1e293b; border-radius: 40px; background: white; height: 560px; overflow: hidden; position: relative; box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05); }
        .phone-notch { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 100px; height: 22px; background: #1e293b; border-bottom-left-radius: 14px; border-bottom-right-radius: 14px; z-index: 10; }
        .chat-app { display: flex; flex-direction: column; height: 100%; background: #f0f2f5; }
        .chat-header { background: linear-gradient(135deg, #1a2a6c, #2a3f9f); color: white; padding: 36px 20px 14px; text-align: center; font-weight: 700; font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif; }
        .chat-sub { font-size: 11px; opacity: 0.7; margin-top: 2px; }
        .chat-body { flex: 1; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }
        .msg { padding: 11px 14px; border-radius: 18px; font-size: 13px; line-height: 1.5; max-width: 85%; position: relative; color: #111; }
        .msg-user { background: #dcf8c6; align-self: flex-end; border-bottom-right-radius: 4px; }
        .msg-alfred { background: white; align-self: flex-start; border-bottom-left-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .msg-time { display: block; font-size: 10px; color: #94a3b8; text-align: right; margin-top: 4px; }
        .demo-features { flex: 1; max-width: 520px; width: 100%; }
        .feat-row { margin-bottom: 36px; display: flex; gap: 18px; align-items: flex-start; }
        .feat-icon { width: 52px; height: 52px; border-radius: 16px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 24px; }
        .feat-icon.fi1 { background: linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05)); }
        .feat-icon.fi2 { background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(99,102,241,0.05)); }
        .feat-icon.fi3 { background: linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05)); }
        .feat-text h4 { font-size: 19px; margin: 0 0 8px; color: white; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; }
        .feat-text p { color: rgba(255,255,255,0.6); line-height: 1.65; font-size: 15px; margin: 0; }

        /* ══════════════════ KILLER FEATURE ══════════════════ */
        .killer-feature {
          background: white; padding: 60px 50px; margin: 80px auto 0; max-width: 1000px;
          border-radius: 28px; box-shadow: 0 30px 60px rgba(0,0,0,0.1);
          display: flex; flex-wrap: wrap; align-items: center; gap: 50px; text-align: left;
        }
        .kf-text { flex: 1; min-width: 280px; }
        .kf-label { color: #ef4444; font-weight: 800; letter-spacing: 1.5px; font-size: 12px; text-transform: uppercase; display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
        .kf-dot { width: 8px; height: 8px; border-radius: 50%; background: #ef4444; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.5); } }
        .kf-text h3 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(22px, 3.5vw, 30px); color: #0f172a; margin: 0 0 16px; font-weight: 900; letter-spacing: -0.5px; }
        .kf-text p { color: #64748b; line-height: 1.7; font-size: 15px; margin-bottom: 14px; }
        .notif-mockup { flex: 1; min-width: 280px; }
        .notif-phone { background: #1e293b; border-radius: 20px; padding: 20px; }
        .notif-screen { background: #f8fafc; border-radius: 12px; padding: 16px; }
        .notif-app { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .notif-app-icon { width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #0088cc, #006699); display: flex; align-items: center; justify-content: center; font-size: 16px; }
        .notif-app-name { font-size: 13px; font-weight: 700; color: #1e293b; }
        .notif-app-time { font-size: 11px; color: #94a3b8; margin-left: auto; }
        .notif-content { background: white; border-radius: 10px; padding: 14px; border-left: 3px solid #ef4444; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .notif-content p { font-size: 13px; margin: 0; color: #334155; line-height: 1.5; }

        /* ══════════════════ BENEFITS ══════════════════ */
        .benefits { padding: 110px 5%; text-align: center; background: white; }
        .benefits-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; max-width: 1100px; margin: 60px auto 0; align-items: center; }
        .benefits-image { border-radius: 28px; overflow: hidden; position: relative; height: 500px; }
        .benefits-image img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .benefits-image-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(26,42,108,0.3), transparent); }
        .benefits-cards { display: flex; flex-direction: column; gap: 20px; }
        .benefit-card { background: #f8fafc; padding: 28px; border-radius: 20px; text-align: left; display: flex; gap: 18px; align-items: flex-start; border: 1px solid #e2e8f0; transition: 0.3s; }
        .benefit-card:hover { transform: translateX(6px); border-color: #d4af37; box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
        .benefit-icon-wrap { width: 52px; height: 52px; border-radius: 14px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 24px; }
        .bi1 { background: linear-gradient(135deg, #dbeafe, #bfdbfe); }
        .bi2 { background: linear-gradient(135deg, #fef3c7, #fde68a); }
        .bi3 { background: linear-gradient(135deg, #d1fae5, #a7f3d0); }
        .benefit-card h4 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 17px; color: #0f172a; margin: 0 0 8px; font-weight: 800; }
        .benefit-card p { color: #64748b; font-size: 14px; line-height: 1.6; margin: 0; }

        /* ══════════════════ TESTIMONIALS ══════════════════ */
        .testimonials { padding: 110px 5%; text-align: center; background: linear-gradient(180deg, #f8fafc 0%, white 100%); }
        .testi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; max-width: 1100px; margin: 50px auto 0; }
        .testi-card { background: white; border-radius: 24px; padding: 36px; text-align: left; border: 1px solid #e2e8f0; transition: 0.3s; position: relative; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
        .testi-card:hover { transform: translateY(-6px); box-shadow: 0 20px 50px rgba(0,0,0,0.08); border-color: #d4af37; }
        .testi-stars { display: flex; gap: 3px; margin-bottom: 20px; }
        .star { color: #fbbf24; font-size: 16px; }
        .testi-quote { font-size: 15px; color: #334155; line-height: 1.75; margin-bottom: 28px; font-style: italic; }
        .testi-quote::before { content: '"'; font-family: Georgia, serif; font-size: 56px; color: #e2e8f0; line-height: 0; vertical-align: -28px; margin-right: 4px; font-style: normal; }
        .testi-author { display: flex; align-items: center; gap: 14px; }
        .testi-avatar { width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 16px; color: white; }
        .av1 { background: linear-gradient(135deg, #f59e0b, #d97706); }
        .av2 { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
        .av3 { background: linear-gradient(135deg, #10b981, #059669); }
        .testi-name { font-weight: 800; color: #1e293b; font-size: 15px; margin: 0 0 3px; }
        .testi-role { color: #94a3b8; font-size: 13px; margin: 0; }
        .testi-badge { position: absolute; top: 20px; right: 20px; background: #ecfdf5; color: #059669; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; border: 1px solid #a7f3d0; }

        /* ══════════════════ PRICING ══════════════════ */
        .pricing-section { padding: 110px 5%; text-align: center; background: linear-gradient(135deg, #0f172a 0%, #1a2a6c 100%); position: relative; overflow: hidden; }
        .pricing-section::before { content: ''; position: absolute; top: -50%; right: -20%; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%); }
        .pricing-section .section-title { color: white; }
        .pricing-section .section-sub { color: rgba(255,255,255,0.6); }
        .pricing-section .section-label { color: #fbbf24; }
        .price-card-home { background: white; padding: 52px 44px; border-radius: 28px; box-shadow: 0 40px 80px rgba(0,0,0,0.3); text-align: center; border: 2px solid transparent; position: relative; width: 100%; max-width: 460px; margin: 50px auto 0; display: flex; flex-direction: column; box-sizing: border-box; background-clip: padding-box; }
        .badge-promo { position: absolute; top: -18px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #d4af37, #f0cc5a); color: #1a2a6c; padding: 8px 28px; border-radius: 50px; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 8px 24px rgba(212,175,55,0.4); white-space: nowrap; }
        .plan-name { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 14px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px; }
        .price-old { font-size: 18px; color: #94a3b8; text-decoration: line-through; margin-bottom: 4px; }
        .price { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 60px; font-weight: 900; color: #0f172a; letter-spacing: -3px; margin-bottom: 4px; line-height: 1; }
        .price span { font-size: 20px; font-weight: 500; color: #64748b; letter-spacing: 0; }
        .price-note { color: #94a3b8; font-size: 13px; margin-bottom: 32px; }
        .features-list { text-align: left; margin-bottom: 36px; border-top: 1px solid #f1f5f9; padding-top: 28px; }
        .feature { margin-bottom: 16px; font-size: 15px; display: flex; align-items: center; gap: 12px; color: #334155; font-weight: 500; }
        .check-icon { background: linear-gradient(135deg, #d4af37, #f0cc5a); color: #1a2a6c; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 11px; font-weight: 900; }
        .cta-pricing { background: linear-gradient(135deg, #1a2a6c, #2a3f9f); color: white; padding: 18px; border-radius: 16px; font-weight: 800; font-size: 16px; transition: 0.3s; text-decoration: none; display: block; box-shadow: 0 8px 24px rgba(26,42,108,0.3); }
        .cta-pricing:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(26,42,108,0.4); }
        .guarantee { margin-top: 18px; font-size: 13px; color: #94a3b8; display: flex; align-items: center; justify-content: center; gap: 8px; }

        /* ══════════════════ FOOTER ══════════════════ */
        footer { background: #060d1f; color: #64748b; padding: 70px 5% 30px; }
        .footer-content { max-width: 1100px; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 50px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 50px; margin-bottom: 30px; }
        .footer-brand { max-width: 260px; }
        .footer-brand .brand { font-size: 22px; display: block; margin-bottom: 14px; }
        .footer-brand p { font-size: 14px; line-height: 1.7; color: #475569; }
        .footer-col h4 { color: rgba(255,255,255,0.85); font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
        .footer-col ul { list-style: none; padding: 0; margin: 0; }
        .footer-col ul li { margin-bottom: 12px; }
        .footer-col ul li a { font-size: 14px; color: #475569; transition: 0.2s; }
        .footer-col ul li a:hover { color: white; }
        .footer-bottom { text-align: center; font-size: 13px; color: #334155; }

        /* ══════════════════ MOBILE ══════════════════ */
        @media (max-width: 1023px) {
          .benefits-layout { grid-template-columns: 1fr; }
          .benefits-image { height: 300px; }
          .steps-grid { grid-template-columns: 1fr; gap: 40px; }
          .steps-grid::before { display: none; }
        }
        @media (max-width: 768px) {
          nav { padding: 14px 20px; }
          .nav-link { display: none; }
          .nav-login { padding: 8px 18px; font-size: 13px; }
          .hero { padding: 120px 20px 70px; background-attachment: scroll; }
          h1 { letter-spacing: -1px; }
          .pain-section { background-attachment: scroll; }
          .steps-section, .pain-section, .demo-section, .benefits, .testimonials, .pricing-section { padding: 70px 20px; }
          .pain-grid, .testi-grid { grid-template-columns: 1fr; gap: 16px; }
          .cta-main { width: 100%; justify-content: center; font-size: 15px; padding: 18px 24px; box-sizing: border-box; }
          .phone-frame { height: 480px; }
          .killer-feature { flex-direction: column; padding: 32px 24px; margin: 40px auto 0; }
          .kf-text, .notif-mockup { min-width: 100%; }
          .price-card-home { padding: 44px 24px; }
          .price { font-size: 48px; }
          .footer-content { flex-direction: column; gap: 36px; }
          .footer-brand { max-width: 100%; }
          .pain-card-photo { height: 160px; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav>
        <Link href="/" passHref legacyBehavior>
          <a className="brand">Alfred<span className="gold">Major</span></a>
        </Link>
        <div className="nav-links">
          <a href="#fonctionnement" className="nav-link">{t.nav.features}</a>
          <a href="#tarifs" className="nav-link">{t.nav.pricing}</a>
          {/* Sélecteur de langue */}
          <div className="lang-switcher">
            <button className={`lang-btn${locale === 'fr' ? ' active' : ''}`} onClick={() => switchLocale('fr')}>🇫🇷</button>
            <button className={`lang-btn${locale === 'en' ? ' active' : ''}`} onClick={() => switchLocale('en')}>🇬🇧</button>
            <button className={`lang-btn${locale === 'es' ? ' active' : ''}`} onClick={() => switchLocale('es')}>🇪🇸</button>
          </div>
          <Link href="/login" passHref legacyBehavior><a className="nav-login">{t.nav.login}</a></Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-content">
          <div className="badge-hero">{t.hero.badge}</div>
          <h1 dangerouslySetInnerHTML={{ __html: t.hero.title }} />
          <p className="subtitle">{t.hero.subtitle}</p>
          <Link href="/register" passHref legacyBehavior>
            <a className="cta-main">{t.hero.cta}</a>
          </Link>
          <div className="trust-row">
            <span className="trust-item">✓ {t.hero.trust1}</span>
            <span className="trust-dot" />
            <span className="trust-item">✓ {t.hero.trust2}</span>
            <span className="trust-dot" />
            <span className="trust-item">✓ {t.hero.trust3}</span>
          </div>
        </div>
      </section>
        </div>
      </section>

      {/* ── LOGOS ── */}
      <section className="logos-section">
        <p className="logos-label">{t.logos.label}</p>
        <div className="logos-flex">
          <span className="logo-item">Airbnb</span>
          <span className="logo-item">Booking.com</span>
          <span className="logo-item">Abritel</span>
          <span className="logo-item">Expedia</span>
          <span className="logo-item">VRBO</span>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section className="steps-section" id="fonctionnement">
        <p className="section-label">{t.steps.label}</p>
        <h2 className="section-title">{t.steps.title}</h2>
        <p className="section-sub">{t.steps.sub}</p>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-icon-wrap s1">🏠</div>
            <h3>{t.steps.s1title}</h3>
            <p>{t.steps.s1desc}</p>
          </div>
          <div className="step-card">
            <div className="step-icon-wrap s2">🔗</div>
            <h3>{t.steps.s2title}</h3>
            <p>{t.steps.s2desc}</p>
          </div>
          <div className="step-card">
            <div className="step-icon-wrap s3">😴</div>
            <h3>{t.steps.s3title}</h3>
            <p>{t.steps.s3desc}</p>
          </div>
        </div>
      </section>

      {/* ── PAIN POINTS ── */}
      <section className="pain-section">
        <p className="section-label">{t.pain.label}</p>
        <h2 className="section-title">{t.pain.title}</h2>
        <p className="section-sub" style={{color: 'rgba(255,255,255,0.6)'}}>{t.pain.sub}</p>
        <div className="pain-grid">
          <div className="pain-card">
            <div className="pain-card-photo">
              <img src="/pain-nuit.png" alt="Personne réveillée la nuit regardant son téléphone" loading="lazy" />
              <div className="pain-card-photo-overlay" />
            </div>
            <div className="pain-card-body">
              <h3>{t.pain.c1title}</h3>
              <p>{t.pain.c1desc}</p>
            </div>
          </div>
          <div className="pain-card">
            <div className="pain-card-photo">
              <img src="/pain-langue.png" alt="Couple de voyageurs internationaux" loading="lazy" />
              <div className="pain-card-photo-overlay" />
            </div>
            <div className="pain-card-body">
              <h3>{t.pain.c2title}</h3>
              <p>{t.pain.c2desc}</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="pain-card">
            <div className="pain-card-photo">
              <img src="pain-questions.png" alt="Service de conciergerie professionnel" loading="lazy" />
              <div className="pain-card-photo-overlay" />
            </div>
            <div className="pain-card-body">
              <h3>{t.pain.c3title}</h3>
              <p>{t.pain.c3desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── DEMO ── */}
      <section id="demo" className="demo-section">
        <div className="demo-header">
          <p className="section-label">En action</p>
          <h2 className="section-title">L'illusion parfaite d'une conciergerie</h2>
          <p className="section-sub">Alfred comprend le contexte, cherche des recommandations locales et répond naturellement.</p>
        </div>

        <div className="demo-layout">
          <div className="phone-wrapper">
            <div className="phone-frame">
              <div className="phone-notch"></div>
              <div className="chat-app">
                <div className="chat-header">
                  🎩 Alfred — Villa Noam
                  <div className="chat-sub">Assistant disponible 24h/24</div>
                </div>
                <div className="chat-body">
                  <div className="msg msg-user">
                    Hi! We just arrived. Where are the trash bins and do you have a restaurant recommendation?
                    <span className="msg-time">19:42</span>
                  </div>
                  <div className="msg msg-alfred">
                    Welcome to Villa Noam! 🎩<br/><br/>
                    Bins are under the kitchen sink. For dinner, I recommend "Pizzeria Da Luigi" — just 5 min walk! 🍕
                    <span className="msg-time">19:42</span>
                  </div>
                  <div className="msg msg-user">
                    Perfect! And what's the WiFi password?
                    <span className="msg-time">19:43</span>
                  </div>
                  <div className="msg msg-alfred">
                    The network is <strong>VillaNomad_Guest</strong> and the password is <strong>Holiday2024</strong>. Enjoy! 🌐
                    <span className="msg-time">19:43</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="demo-features">
            <div className="feat-row">
              <div className="feat-icon fi1">⚡</div>
              <div className="feat-text">
                <h4>Réponses Instantanées</h4>
                <p>Vos voyageurs n'attendent plus. Alfred répond en moins d'une seconde, en piochant dans votre base de données personnalisée.</p>
              </div>
            </div>
            <div className="feat-row">
              <div className="feat-icon fi2">🔍</div>
              <div className="feat-text">
                <h4>Recherche Locale en Temps Réel</h4>
                <p>Alfred scanne les environs de votre logement pour faire des recommandations précises — restos, pharmacies, transports, activités.</p>
              </div>
            </div>
            <div className="feat-row">
              <div className="feat-icon fi3">🌐</div>
              <div className="feat-text">
                <h4>30+ Langues Automatiquement</h4>
                <p>Alfred détecte la langue de votre voyageur et répond dans la sienne — anglais, espagnol, allemand, japonais et bien plus.</p>
              </div>
            </div>
            <div style={{marginTop: '10px'}}>
              <Link href="/register" passHref legacyBehavior>
                <a className="cta-main" style={{background: 'linear-gradient(135deg, #d4af37, #f0cc5a)', color: '#1a2a6c', fontSize: '15px', padding: '16px 36px'}}>
                  Essayer Alfred gratuitement — 1er mois offert
                </a>
              </Link>
            </div>
          </div>
        </div>

        {/* KILLER FEATURE */}
        <div className="killer-feature">
          <div className="kf-text">
            <div className="kf-label"><div className="kf-dot"></div> Alerte en temps réel</div>
            <h3>Vous n'êtes dérangé que lorsque c'est vital.</h3>
            <p>Si un voyageur signale une urgence (fuite d'eau, panne électrique), Alfred vous transfère immédiatement l'information via Telegram — avec traduction automatique si nécessaire.</p>
            <p><strong>Résultat :</strong> Vous filtrez 95% du bruit quotidien et gardez le contrôle sur l'essentiel.</p>
          </div>
          <div className="notif-mockup">
            <div className="notif-phone">
              <div className="notif-screen">
                <div className="notif-app">
                  <div className="notif-app-icon">✈️</div>
                  <span className="notif-app-name">Telegram</span>
                  <span className="notif-app-time">maintenant</span>
                </div>
                <div className="notif-content">
                  <p>🚨 <strong>ALERTE ALFRED MAJOR</strong><br/><br/>🏠 Logement : La Villa Noam<br/>💬 Client : "Il y a une énorme fuite sous l'évier !"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section className="benefits">
        <p className="section-label">{t.benefits.label}</p>
        <h2 className="section-title">{t.benefits.title}</h2>
        <div className="benefits-layout">
          <div className="benefits-image">
            <img src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80" alt="Hôte détendu avec son téléphone" loading="lazy" />
            <div className="benefits-image-overlay" />
          </div>
          <div className="benefits-cards">
            <div className="benefit-card">
              <div className="benefit-icon-wrap bi1">😴</div>
              <div><h4>{t.benefits.b1title}</h4><p>{t.benefits.b1desc}</p></div>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon-wrap bi2">🛡️</div>
              <div><h4>{t.benefits.b2title}</h4><p>{t.benefits.b2desc}</p></div>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon-wrap bi3">⭐</div>
              <div><h4>{t.benefits.b3title}</h4><p>{t.benefits.b3desc}</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ── */}
      <section className="testimonials">
        <p className="section-label">{t.testimonials.label}</p>
        <h2 className="section-title">{t.testimonials.title}</h2>
        <p className="section-sub" style={{color: '#64748b', marginTop: '12px'}}>{t.testimonials.sub}</p>
        <div className="testi-grid">
          <div className="testi-card">
            <span className="testi-badge">{t.testimonials.verified}</span>
            <div className="testi-stars">{'★★★★★'.split('').map((s,i) => <span key={i} className="star">{s}</span>)}</div>
            <p className="testi-quote">{t.testimonials.t1}</p>
            <div className="testi-author">
              <div className="testi-avatar av1">SL</div>
              <div><p className="testi-name">{t.testimonials.t1name}</p><p className="testi-role">{t.testimonials.t1role}</p></div>
            </div>
          </div>
          <div className="testi-card">
            <span className="testi-badge">{t.testimonials.verified}</span>
            <div className="testi-stars">{'★★★★★'.split('').map((s,i) => <span key={i} className="star">{s}</span>)}</div>
            <p className="testi-quote">{t.testimonials.t2}</p>
            <div className="testi-author">
              <div className="testi-avatar av2">TR</div>
              <div><p className="testi-name">{t.testimonials.t2name}</p><p className="testi-role">{t.testimonials.t2role}</p></div>
            </div>
          </div>
          <div className="testi-card">
            <span className="testi-badge">{t.testimonials.verified}</span>
            <div className="testi-stars">{'★★★★★'.split('').map((s,i) => <span key={i} className="star">{s}</span>)}</div>
            <p className="testi-quote">{t.testimonials.t3}</p>
            <div className="testi-author">
              <div className="testi-avatar av3">MC</div>
              <div><p className="testi-name">{t.testimonials.t3name}</p><p className="testi-role">{t.testimonials.t3role}</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="pricing-section" id="tarifs">
        <p className="section-label">{t.pricing.label}</p>
        <h2 className="section-title">{t.pricing.title}</h2>
        <p className="section-sub">{t.pricing.sub}</p>
        <div className="price-card-home">
          <div className="badge-promo">{t.pricing.promo}</div>
          <div className="plan-name">{t.pricing.planName}</div>
          <div className="price-old">{t.pricing.priceOld}</div>
          <div className="price">{t.pricing.price}<span>{t.pricing.pricePeriod}</span></div>
          <div className="price-note">{t.pricing.priceNote}</div>
          <div className="features-list">
            {t.pricing.features.map((f, i) => (
              <div key={i} className="feature">
                <div className="check-icon">✓</div>
                {f}
              </div>
            ))}
          </div>
          <Link href="/register" passHref legacyBehavior>
            <a className="cta-pricing">{t.pricing.cta}</a>
          </Link>
          <div className="guarantee">{t.pricing.secure}</div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-content">
          <div className="footer-brand">
            <span className="brand">Alfred<span className="gold">Major</span></span>
            <p>{t.footer.tagline}</p>
          </div>
          <div className="footer-col">
            <h4>{t.footer.product}</h4>
            <ul>
              <li><Link href="/login" passHref legacyBehavior><a>{t.footer.hostSpace}</a></Link></li>
              <li><Link href="/register" passHref legacyBehavior><a>{t.footer.createAccount}</a></Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>{t.footer.legal}</h4>
            <ul>
              <li><Link href="/conditions-generales" passHref legacyBehavior><a>{t.footer.cgv}</a></Link></li>
              <li><Link href="/confidentialite" passHref legacyBehavior><a>{t.footer.privacy}</a></Link></li>
              <li><Link href="/mentions-legales" passHref legacyBehavior><a>{t.footer.mentions}</a></Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>{t.footer.contact}</h4>
            <ul>
              <li><a href="mailto:contact@alfredmajor.com">contact@alfredmajor.com</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>{t.footer.copyright}</p>
        </div>
      </footer>
    </div>
  );
}
