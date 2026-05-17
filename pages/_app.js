import Script from 'next/script';
import { useEffect } from 'react';
import Head from 'next/head';

export default function App({ Component, pageProps }) {

  useEffect(() => {
    // Enregistrement du Service Worker PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('Alfred SW enregistré:', reg.scope);
          })
          .catch((err) => {
            console.error('Alfred SW erreur:', err);
          });
      });
    }
  }, []);

  return (
    <>
      <Head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Alfred Major" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Alfred Major" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#d4af37" />
        <meta name="msapplication-TileColor" content="#0f172a" />

        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512x512.png" />

        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-192x192.png" />
      </Head>

      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-Z2KKW1DB52"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-Z2KKW1DB52');
        `}
      </Script>

      <Component {...pageProps} />
    </>
  );
}
