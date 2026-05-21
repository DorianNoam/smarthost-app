import Script from 'next/script';
import Head from 'next/head';
import CookieBanner from '../components/CookieBanner';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1a2a6c" />
      </Head>

      {/*
        ✅ RGPD : Google Analytics chargé UNIQUEMENT si le consentement est accordé.
        La stratégie "lazyOnload" + la vérification du consentement en JS
        garantissent qu'aucun cookie tiers n'est déposé sans accord.
      */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-Z2KKW1DB52"
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          // N'active GA que si le consentement a été accordé
          const consent = typeof window !== 'undefined'
            ? localStorage.getItem('alfred_cookie_consent')
            : null;
          if (consent === 'accepted') {
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-Z2KKW1DB52', { anonymize_ip: true });
          }
        `}
      </Script>

      <Component {...pageProps} />

      {/* ✅ Bandeau consentement RGPD — affiché sur toutes les pages publiques */}
      <CookieBanner />
    </>
  );
}
