import Link from 'next/link';

export default function Pricing() {
  return (
    <div className="container">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Montserrat:wght@300;400;600;700&display=swap');

        :global(html), :global(body) {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          width: 100%;
        }

        .container {
          font-family: 'Montserrat', sans-serif;
          color: #1a2a6c;
          background: #fdfbf7;
          min-height: 100vh;
        }

        /* Navbar */
        nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 5%;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(10px);
          z-index: 1000;
          box-shadow: 0 2px 15px rgba(0,0,0,0.05);
          box-sizing: border-box;
        }

        .brand {
          display: flex;
          align-items: center;
          font-family: 'Playfair Display', serif;
          font-size: 24px;
          font-weight: 700;
          color: #1a2a6c !important;
          text-decoration: none;
        }

        .gold { color: #d4af37; }

        /* Header */
        .pricing-header {
          padding: 150px 20px 60px;
          text-align: center;
          background: white;
        }

        h1 { font-family: 'Playfair Display', serif; font-size: clamp(32px, 5vw, 48px); margin-bottom: 20px; }
        .subtitle { max-width: 700px; margin: 0 auto; color: #555; line-height: 1.6; }

        /* Grille de prix */
        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 40px;
          max-width: 1200px;
          margin: -50px auto 80px;
          padding: 0 20px;
          align-items: stretch;
        }

        .price-card {
          background: white;
          padding: 50px 40px;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.05);
          text-align: center;
          border: 1px solid #eee;
          transition: 0.3s;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .price-card.featured {
          border: 2px solid #d4af37;
          transform: scale(1.05);
          z-index: 2;
        }

        /* Badge Économie */
        .savings-badge {
          background: #d4af37;
          color: #1a2a6c;
          font-weight: 800;
          font-size: 11px;
          padding: 8px 18px;
          border-radius: 50px;
          position: absolute;
          top: -18px;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);
          letter-spacing: 1px;
        }

        .plan-name { font-weight: 700; text-transform: uppercase; letter-spacing: 2px; font-size: 13px; color: #d4af37; margin-bottom: 15px; }
        .price { font-family: 'Playfair Display', serif; font-size: 52px; font-weight: 700; margin-bottom: 5px; color: #1a2a6c; }
        .price span { font-size: 18px; font-weight: 400; color: #777; }
        .billing-cycle { font-size: 13px; color: #999; margin-bottom: 35px; font-style: italic; }

        .features-list { text-align: left; margin-bottom: 40px; flex-grow: 1; border-top: 1px solid #f9f9f9; padding-top: 30px; }
        .feature { margin-bottom: 18px; font-size: 15px; display: flex; align-items: center; gap: 12px; color: #333; }
        .check { color: #d4af37; font-weight: bold; font-size: 18px; }

        .cta-pricing {
          background: #1a2a6c;
          color: white;
          padding: 20px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 700;
          transition: 0.3s;
          font-size: 16px;
        }

        .price-card.featured .cta-pricing {
          background: #d4af37;
          color: #1a2a6c;
        }

        .cta-pricing:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(26, 42, 108, 0.2); }

        /* Bandeau de réassurance Fixe */
        .trust-banner {
          background: #1a2a6c;
          color: white;
          padding: 30px 5%;
          display: flex;
          justify-content: center;
          gap: 50px;
          flex-wrap: wrap;
        }
        .trust-item { display: flex; align-items: center; gap: 12px; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
        .trust-item span { color: #d4af37; font-size: 22px; }

        footer { padding: 60px 20px; text-align: center; background: #fdfbf7; font-size: 14px; color: #777; }
      `}</style>

      <nav>
        <Link href="/" passHref style={{ textDecoration: 'none' }}>
          <span className="brand">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2.5" style={{marginRight: '10px'}}>
              <path d="M22 17H2a1 1 0 0 1-1-1v-1a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1z"/><path d="M12 4a8 8 0 0 0-8 8h16a8 8 0 0 0-8-8z"/><circle cx="12" cy="3" r="1.5" fill="#d4af37"/>
            </svg>
            Major<span className="gold">Marc</span>
          </span>
        </Link>
      </nav>

      <header className="pricing-header">
        <h1>Investissez dans votre <span className="gold">Sérénité</span></h1>
        <p className="subtitle">
          Une tarification transparente adaptée à vos ambitions. 
          Reprenez le contrôle de votre temps dès maintenant.
        </p>
      </header>

      <div className="pricing-grid">
        {/* Pack Solo */}
        <div className="price-card">
          <div className="plan-name">Solo</div>
          <div className="price">24,90€<span>/mois</span></div>
          <div className="billing-cycle">Pour 1 logement LCD</div>
          <div className="features-list">
            <div className="feature"><span className="check">✔</span> 1 Logement unique</div>
            <div className="feature"><span className="check">✔</span> Majordome 24h/24</div>
            <div className="feature"><span className="check">✔</span> Alertes Telegram Urgences</div>
            <div className="feature"><span className="check">✔</span> Lien de Conciergerie Privé</div>
            <div className="feature"><span className="check">✔</span> Configuration en 5 minutes</div>
          </div>
          <Link href="/register?plan=solo" className="cta-pricing">Démarrer maintenant</Link>
        </div>

        {/* Pack Multi-Prestige */}
        <div className="price-card featured">
          <div className="savings-badge">ÉCONOMISEZ 24,60€ / MOIS</div>
          <div className="plan-name">Multi-Prestige</div>
          <div className="price">99,90€<span>/mois</span></div>
          <div className="billing-cycle">Jusqu'à 5 logements</div>
          <div className="features-list">
            <div className="feature"><span className="check">✔</span> Jusqu'à 5 logements</div>
            <div className="feature"><span className="check">✔</span> Majordome 24h/24</div>
            <div className="feature"><span className="check">✔</span> Alertes Telegram Urgences</div>
            <div className="feature"><span className="check">✔</span> Lien de Conciergerie Privé</div>
            <div className="feature"><span className="check">✔</span> Support Hôte Prioritaire</div>
            <div className="feature"><span className="check">✔</span> Personnalisation du Majordome</div>
          </div>
          <Link href="/register?plan=multi" className="cta-pricing">Choisir Multi-Prestige</Link>
        </div>

        {/* Pack Empire LCD */}
        <div className="price-card">
          <div className="savings-badge">ÉCONOMISEZ 148,60€ / MOIS</div>
          <div className="plan-name">Empire LCD</div>
          <div className="price">224,90€<span>/mois</span></div>
          <div className="billing-cycle">Jusqu'à 15 logements</div>
          <div className="features-list">
            <div className="feature"><span className="check">✔</span> Jusqu'à 15 logements</div>
            <div className="feature"><span className="check">✔</span> Majordome 24h/24</div>
            <div className="feature"><span className="check">✔</span> Alertes Telegram Urgences</div>
            <div className="feature"><span className="check">✔</span> Lien de Conciergerie Privé</div>
            <div className="feature"><span className="check">✔</span> Gestion multi-comptes</div>
            <div className="feature"><span className="check">✔</span> Statistiques de satisfaction</div>
            <div className="feature"><span className="check">✔</span> Account Manager Dédié</div>
          </div>
          <Link href="/register?plan=empire" className="cta-pricing">Lancer mon Empire</Link>
        </div>
      </div>

      <div className="trust-banner">
        <div className="trust-item"><span>🕒</span> Disponibilité 24/7</div>
        <div className="trust-item"><span>🛡️</span> Sans Engagement</div>
        <div className="trust-item"><span>✨</span> Service de Prestige</div>
      </div>

      <footer>
        <p>© 2026 MajorMarc - L'excellence au service des hôtes d'exception.</p>
      </footer>
    </div>
  );
}
