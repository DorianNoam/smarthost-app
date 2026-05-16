import Script from 'next/script';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <>
      {/* Google Analytics */}
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
