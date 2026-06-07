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

  // ── FONCTION DE TRACKING TIKTOK PERSONNALISÉ AU CLIC ──
  const handleRegisterClick = (e) => {
    e.preventDefault(); // Bloque la redirection brute le temps d'envoyer le pixel

    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track('CompleteRegistration', {
        "contents": [
          {
            "content_name": "Inscription Alfred Major"
          }
        ],
        "value": 9.90,
        "currency": "EUR"
      });
    }

    // Redirection fluide une fois le pixel déclenché
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
        
        {/* Données structurées JSON-LD */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "SoftwareApplication",
          "name": "Alfred Major", "url": "https://www.alfredmajor.com",
          "description": "Plateforme tout-en-un pour la gestion de locations courte durée. Majordome IA, gestion ménage, upsells, alertes urgences.",
          "applicationCategory": "BusinessApplication", "operatingSystem": "Web, Android, iOS",
          "offers": { "@type": "Offer", "price": "9.90", "priceCurrency": "EUR" },
          "publisher": { "@type": "Organization", "name": "Alfred Major", "url": "https://www.alfredmajor.com" }
        })}} />

        {/* ── PIXEL TIKTOK INJECTÉ DIRECTEMENT DANS LE HEAD ── */}
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
        .container {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #1d1d1f;
          background: #fff;
          font-weight: 400;
        }

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
        .brand {
          font-size: 20px; font-weight: 600; letter-spacing: -0.4px;
          color: ${scrolled ? '#1d1d1f' : '#fff'};
          transition: color 0.4s;
        }
        .brand-gold { color: #c9a227; }
        .nav-links { display: flex; align-items: center; gap: 32px; }
        .nav-link {
          font-size: 14px; font-weight: 400;
          color: ${scrolled ? '#6e6e73' : 'rgba(255,255,255,0.75)'};
          transition: color 0.2s; letter-spacing: -0.1px;
        }
        .nav-link:hover { color: ${scrolled ? '#1d1d1f' : '#fff'}; }
        .nav-lang {
          display: flex; align-items: center; gap: 2px;
          background: ${scrolled ? '#f5f5f7' : 'rgba(255,255,255,0.12)'};
          border-radius: 20px; padding: 3px;
        }
        .lang-btn {
          background: none; border: none; padding: 4px 9px; border-radius: 16px;
          cursor: pointer; font-size: 13px; font-family: inherit;
          transition: background 0.2s; line-height: 1; color: inherit;
        }
        .lang-btn:hover, .lang-btn.active { background: white; }
