// components/CookieBanner.js
// Bandeau de consentement cookies — Conforme RGPD / CNIL
// À importer dans _app.js

import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('alfred_cookie_consent');
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem('alfred_cookie_consent', 'accepted');
    localStorage.setItem('alfred_cookie_date', new Date().toISOString());
    setVisible(false);
    // Ici vous pouvez initialiser GTM/Analytics si nécessaire
  };

  const decline = () => {
    localStorage.setItem('alfred_cookie_consent', 'declined');
    localStorage.setItem('alfred_cookie_date', new Date().toISOString());
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      <style>{`
        .cookie-overlay {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          padding: 0 16px 16px;
          pointer-events: none;
        }
        .cookie-banner {
          background: #0f172a;
          color: white;
          border-radius: 16px;
          padding: 20px 24px;
          max-width: 680px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          box-shadow: 0 -4px 40px rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.1);
          pointer-events: all;
          font-family: 'Inter', sans-serif;
        }
        .cookie-text {
          flex: 1;
          font-size: 13px;
          line-height: 1.6;
          color: rgba(255,255,255,0.8);
          min-width: 200px;
        }
        .cookie-text strong {
          color: white;
          display: block;
          margin-bottom: 4px;
          font-size: 14px;
        }
        .cookie-text a {
          color: #d4af37;
          text-decoration: underline;
        }
        .cookie-actions {
          display: flex;
          gap: 10px;
          flex-shrink: 0;
        }
        .cookie-btn-accept {
          background: #d4af37;
          color: #0f172a;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          white-space: nowrap;
          font-family: inherit;
        }
        .cookie-btn-decline {
          background: transparent;
          color: rgba(255,255,255,0.5);
          border: 1px solid rgba(255,255,255,0.2);
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          white-space: nowrap;
          font-family: inherit;
        }
        .cookie-btn-decline:hover { color: white; border-color: rgba(255,255,255,0.5); }
        @media (max-width: 600px) {
          .cookie-banner { padding: 16px; gap: 14px; }
          .cookie-actions { width: 100%; justify-content: stretch; }
          .cookie-btn-accept, .cookie-btn-decline { flex: 1; text-align: center; }
        }
      `}</style>
      <div className="cookie-overlay" role="dialog" aria-label="Gestion des cookies" aria-live="polite">
        <div className="cookie-banner">
          <div className="cookie-text">
            <strong>🍪 Cookies & confidentialité</strong>
            Nous utilisons des cookies techniques essentiels au fonctionnement du site. En cliquant sur "Accepter", vous consentez à l'utilisation de cookies d'analyse anonyme.{' '}
            <a href="/confidentialite">En savoir plus</a>
          </div>
          <div className="cookie-actions">
            <button className="cookie-btn-decline" onClick={decline}>Refuser</button>
            <button className="cookie-btn-accept" onClick={accept}>Accepter</button>
          </div>
        </div>
      </div>
    </>
  );
}
