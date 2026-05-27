import Script from 'next/script';
import Head from 'next/head';
import CookieBanner from '../components/CookieBanner';
import { GoogleTagManager } from '@next/third-parties/google';

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
        ✅ Intégration officielle de Google Tag Manager.
        La gestion du consentement (RGPD) se fera désormais directement 
        depuis l'interface GTM pour une meilleure conformité.
      */}
      <GoogleTagManager gtmId="GTM-P7ZWRDD4" />

      <Component {...pageProps} />

      {/* ✅ Bandeau consentement RGPD — affiché sur toutes les pages publiques */}
      <CookieBanner />
    </>
  );
}
