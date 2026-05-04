import Link from 'next/link';

export default function Home() {
  return (
    <div className="landing-container">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@300;400;600&display=swap');

        .landing-container {
          font-family: 'Montserrat', sans-serif;
          color: #1a2a6c;
          background: #ffffff;
          overflow-x: hidden;
        }

        /* Navbar */
        nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 5%;
          position: sticky;
          top: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          z-index: 1000;
          border-bottom: 1px solid #f0f0f0;
        }
        .logo { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; }
        .logo span { color: #d4af37; }

        /* Hero Section */
        .hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 80px 20px;
          background: radial-gradient(circle at top right, #fdfbf7, #ffffff);
          text-align: center;
        }
        h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 8vw, 54px);
          line-height: 1.1;
          margin-bottom: 20px;
        }
        .gold-text { color: #d4af37; }
        .subtitle {
          font-size: 18px;
          color: #555;
          max-width: 600px;
          margin-bottom: 40px;
          line-height: 1.6;
        }

        /* Smartphone Mockup en CSS */
        .phone-mockup {
          width: 280px;
          height: 560px;
          background: #111;
          border-radius: 40px;
          padding: 10px;
          box-shadow: 0 50px 100px rgba(0,0,0,0.15);
          border: 4px solid #333;
          position: relative;
          margin-bottom: 60px;
        }
        .screen {
          width: 100%;
          height: 100%;
          background: #f8f5f0;
          border-radius: 30px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .chat-ui-preview { padding: 15px; text-align: left; }
        .bubble { padding: 8px 12px; border-radius: 12px; font-size: 11px; margin-bottom: 8px; max-width: 80%; }
        .bubble.bot { background: white; color: #1a2a6c; border: 1px solid #eee; }
        .bubble.user { background: #1a2a6c; color: white; margin-left: auto; }

        /* Button */
        .cta-primary {
          background: #1a2a6c;
          color: white;
          padding: 18px 40px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 600;
          box-shadow: 0 10px 20px rgba(26, 42, 108, 0.2);
          transition: all 0.3s ease;
        }
        .cta-primary:hover { transform: translateY(-3px); background: #d4af37; }

        /* Features */
        .features { padding: 60px 5%; display: grid; gap: 30px; }
        .card {
          padding: 30px;
          border-radius: 20px;
          background: #fff;
          border: 1px solid #f0f0f0;
          text-align: center;
          transition: 0.3s;
        }
        .card:hover { border-color: #d4af37; box-shadow: 0 15px 30px rgba(0,0,0,0.05); }
        .icon-circle {
          width: 60px;
          height: 60px;
          background: #fdfbf7;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 24px;
          color: #d4af37;
          border: 1px solid #f9f3e6;
        }

        /* Stats Section */
        .stats {
          background: #1a2a6c;
          color: white;
          padding: 50px 20px;
          display: flex;
          flex-direction: column;
          gap: 40px;
          text-align: center;
        }
        .stat-val { font-family: 'Playfair Display', serif; font-size: 40px; color: #d4af37; display: block; }
        .stat-label { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; }

        @media (min-width: 768px) {
          .features { grid-template-columns: repeat(3, 1fr); }
          .stats { flex-direction: row; justify-content: space-around; }
          .hero { padding: 100px 5%; }
        }
      `}</style>

      <nav>
        <div className="logo">SmartHost <span>AI</span></div>
        <Link href="/login" style={{color: '#1a2a6c', fontWeight: '600', textDecoration: 'none'}}>Connexion</Link>
      </nav>

      <header className="hero">
        <h1>L'excellence d'un <br/><span className="gold-text">Concierge Privé</span> 24/7</h1>
        <p className="subtitle">
          Augmentez vos revenus et vos notes Airbnb. Marc automatise vos échanges voyageurs avec l'élégance d'un majordome.
        </p>
        
        {/* Mockup visuel pour rassurer le client sur le rendu mobile */}
        <div className="phone-mockup">
          <div className="screen">
            <div style={{background: 'white', padding: '10px', borderBottom: '1px solid #eee', fontSize: '10px', fontWeight: 'bold'}}>
              SmartHost AI - Marc
            </div>
            <div className="chat-ui-preview">
              <div className="bubble bot">Bienvenue ! Comment puis-je vous aider aujourd'hui ?</div>
              <div className="bubble user">Quel est le code wifi ?</div>
              <div className="bubble bot">Le code est RhumEtPiratage2026. Profitez bien !</div>
            </div>
          </div>
        </div>

        <Link href="/register" className="cta-primary">
          Démarrer mon essai gratuit
        </Link>
      </header>

      <section className="features">
        <div className="card">
          <div className="icon-circle">✨</div>
          <h3>Zéro Hallucination</h3>
          <p>Marc ne répond qu'avec vos données. S'il ne sait pas, il vous alerte immédiatement.</p>
        </div>
        <div className="card">
          <div className="icon-circle">🌍</div>
          <h3>Multilingue</h3>
          <p>Répondez à vos clients internationaux dans leur langue maternelle sans aucun effort.</p>
        </div>
        <div className="card">
          <div className="icon-circle">📱</div>
          <h3>Alertes SMS/Telegram</h3>
          <p>Restez informé uniquement quand c'est nécessaire. Marc gère tout le reste.</p>
        </div>
      </section>

      <section className="stats">
        <div>
          <span className="stat-val">95%</span>
          <span className="stat-label">Gain de temps</span>
        </div>
        <div>
          <span className="stat-val">5 ⭐</span>
          <span className="stat-label">Notes voyageurs</span>
        </div>
        <div>
          <span className="stat-val">0€</span>
          <span className="stat-label">Frais d'installation</span>
        </div>
      </section>

      <footer style={{padding: '60px 20px', textAlign: 'center', background: '#fdfbf7'}}>
        <h2 style={{fontFamily: 'Playfair Display', marginBottom: '20px'}}>Prêt à passer au niveau supérieur ?</h2>
        <Link href="/register" className="cta-primary">Créer mon compte propriétaire</Link>
      </footer>
    </div>
  );
                }
  
