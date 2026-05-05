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

        /* Navbar (Identique à l'accueil pour la cohérence) */
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

        /* Header de la page Tarifs */
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
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          max-width: 1100px;
          margin: -50px auto 80px;
          padding: 0 20px;
        }

        .price-card {
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.05);
          text-align: center;
          border: 1px solid #eee;
          transition: transform 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .price-card.featured {
          border: 2px solid #d4af37;
          transform: scale(1.05);
          z-index: 2;
        }

        .plan-name { font-weight: 700; text-transform: uppercase; letter-spacing: 2px; font-size: 14px; color: #d4af37; margin-bottom: 10px; }
        .price { font-family: 'Playfair Display', serif; font-size: 48px; font-weight: 700; margin-bottom: 10px; }
        .price span { font-size: 18px; font-weight: 400; color: #777; }
        .billing-cycle { font-size: 12px; color: #999; margin-bottom: 30px; }

        .features-list { text-align: left; margin-bottom: 40px; flex-grow: 1; }
        .feature { margin-bottom: 15px; font-size: 14px; display: flex; align-items: center; gap: 10px; }
        .check { color: #d4af37; font-weight: bold; }

        .cta-pricing {
          background: #1a2a6c;
          color: white;
          padding: 15px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 700;
          transition: 0.3s;
        }

        .price-card.featured .cta-pricing {
          background: #d4af37;
          color: #1a2a6c;
        }

        .cta-pricing:hover { opacity: 0.9; transform: translateY(-2px); }

        /* Bandeau de réassurance (Fixed comme validé) */
        .trust-banner {
          background: #1a2a6c;
          color: white;
          padding: 25px 5%;
          display: flex;
          justify-content: center;
          gap: 40px;
          flex-wrap: wrap;
          margin-top: 50px;
        }
        .trust-item { display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 13px; }

        footer { padding: 50px; text-align: center; background: #fdfbf7; font-size: 13px; color: #777; }
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
        <h1>Investissez dans votre <span className="gold">Temps Libre</span></h1>
        <p className="subtitle">
          Choisissez l'offre qui correspond à votre parc locatif. 
          Aucun frais caché, une sérénité garantie pour vous et vos voyageurs.
        </p>
      </header>

      <div className="pricing-grid">
        {/* Offre Solo */}
        <div className="price-card">
          <div className="plan-name">Solo</div>
          <div className="price">19€<span>/mois</span></div>
          <div className="billing-cycle">Par logement</div>
          <div className="features-list">
            <div className="feature"><span className="check">✔</span> 1 Logement LCD</div>
            <div className="feature"><span className="check">✔</span> Majordome IA 24h/24</div>
            <div className="feature"><span className="check">✔</span> Alertes Telegram Illimitées</div>
            <div className="feature"><span className="check">✔</span> Lien de Conciergerie Privé</div>
            <div className="feature"><span className="check">✔</span> 10 Langues supportées</div>
          </div>
          <Link href="/register?plan=solo" className="cta-pricing">Démarrer avec Solo</Link>
        </div>

        {/* Offre Multi (La plus populaire) */}
        <div className="price-card featured">
          <div className="plan-name">Multi-Prestige</div>
          <div className="price">79€<span>/mois</span></div>
          <div className="billing-cycle">Jusqu'à 5 logements</div>
          <div className="features-list">
            <div className="feature"><span className="check">✔</span> Jusqu'à 5 Logements</div>
            <div className="feature"><span className="check">✔</span> Tout le plan Solo</div>
            <div className="feature"><span className="check">✔</span> Support Prioritaire</div>
            <div className="feature"><span className="check">✔</span> Personnalisation Avancée</div>
            <div className="feature"><span className="check">✔</span> Statistiques de satisfaction</div>
          </div>
          <Link href="/register?plan=multi" className="cta-pricing">Choisir Multi-Prestige</Link>
        </div>

        {/* Offre Conciergerie */}
        <div className="price-card">
          <div className="plan-name">Empire</div>
          <div className="price">149€<span>/mois</span></div>
          <div className="billing-cycle">Jusqu'à 15 logements</div>
          <div className="features-list">
            <div className="feature"><span className="check">✔</span> Jusqu'à 15 Logements</div>
            <div className="feature"><span className="check">✔</span> Tout le plan Multi</div>
            <div className="feature"><span className="check">✔</span> Gestion multi-comptes</div>
            <div className="feature"><span className="check">✔</span> Accès API (prochainement)</div>
            <div className="feature"><span className="check">✔</span> Account Manager Dédié</div>
          </div>
          <Link href="/register?plan=empire" className="cta-pricing">Contacter un expert</Link>
        </div>
      </div>

      <div className="trust-banner">
        <div className="trust-item">🕒 24/7 Assistance</div>
        <div className="trust-item">🛡️ Sans engagement</div>
        <div className="trust-item">⚡ Activation instantanée</div>
      </div>

      <footer>
        <p>© 2026 MajorMarc - Tarifs transparents pour une gestion sereine.</p>
      </footer>
    </div>
  );
}
