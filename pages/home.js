import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="landing-container">
      <style jsx>{`
        .landing-container {
          font-family: 'Playfair Display', serif;
          color: #1a2a6c;
          background: #fff;
          overflow-x: hidden;
        }
        
        /* Navbar */
        nav {
          padding: 20px 5%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .logo { font-weight: bold; font-size: 22px; letter-spacing: 1px; }
        .logo span { color: #d4af37; }

        /* Hero Section */
        .hero {
          padding: 80px 5%;
          text-align: center;
          background: linear-gradient(135deg, #f8f5f0 0%, #ffffff 100%);
          min-height: 80vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        h1 { font-size: clamp(32px, 5vw, 56px); margin-bottom: 20px; line-height: 1.2; }
        .gold { color: #d4af37; }
        p.subtitle { font-size: 18px; color: #666; max-width: 700px; margin: 0 auto 30px; line-height: 1.6; }
        
        .cta-button {
          background: #1a2a6c;
          color: white;
          padding: 18px 35px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: bold;
          font-size: 16px;
          transition: transform 0.3s ease;
          display: inline-block;
        }
        .cta-button:hover { transform: scale(1.05); background: #d4af37; }

        /* Features Section */
        .features { padding: 80px 5%; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; }
        .feature-card {
          padding: 40px;
          border: 1px solid #eee;
          border-radius: 15px;
          transition: all 0.3s ease;
          text-align: center;
        }
        .feature-card:hover { border-color: #d4af37; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .icon { font-size: 40px; margin-bottom: 20px; display: block; }
        h3 { margin-bottom: 15px; font-size: 22px; }

        /* Social Proof / Stats */
        .stats { background: #1a2a6c; color: white; padding: 60px 5%; display: flex; justify-content: space-around; flex-wrap: wrap; gap: 30px; }
        .stat-item b { font-size: 36px; display: block; color: #d4af37; }

        @media (max-width: 768px) {
          .hero { padding: 60px 20px; }
        }
      `}</style>

      <nav>
        <div className="logo">SmartHost <span>AI</span></div>
        <Link href="/login" className="login-link">Connexion</Link>
      </nav>

      <section className="hero">
        <h1>Offrez à vos voyageurs une <br/><span className="gold">Conciergerie de Prestige 24/7</span></h1>
        <p className="subtitle">
          Libérez-vous de la gestion des messages répétitifs. Marc, notre IA spécialisée, répond à vos voyageurs et ne vous sollicite que pour l'essentiel.
        </p>
        <div>
          <Link href="/register" className="cta-button">Commencer l'essai gratuit</Link>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <span className="icon">⏳</span>
          <h3>Réponses Instantanées</h3>
          <p>Wi-Fi, codes d'accès, mode d'emploi... Marc connaît votre logement par cœur et répond en 2 secondes.</p>
        </div>
        <div className="feature-card">
          <span className="icon">🚨</span>
          <h3>Alertes Intelligentes</h3>
          <p>Une panne ? Une demande spéciale ? Recevez une notification immédiate sur Telegram ou WhatsApp.</p>
        </div>
        <div className="feature-card">
          <span className="icon">🌍</span>
          <h3>Multilingue</h3>
          <p>Marc accueille vos voyageurs dans leur propre langue, avec l'élégance d'un majordome cinq étoiles.</p>
        </div>
      </section>

      <section className="stats">
        <div className="stat-item">
          <b>- 80%</b>
          <span>de messages à gérer</span>
        </div>
        <div className="stat-item">
          <b>4.9 / 5</b>
          <span>Note moyenne voyageurs</span>
        </div>
        <div className="stat-item">
          <b>24h / 24</b>
          <span>Disponibilité totale</span>
        </div>
      </section>

      <section style={{textAlign: 'center', padding: '80px 5%'}}>
        <h2>Prêt à automatiser votre succès ?</h2>
        <p style={{marginBottom: '30px'}}>Rejoignez les propriétaires qui ont choisi la tranquillité.</p>
        <Link href="/register" className="cta-button">Créer mon compte maintenant</Link>
      </section>
    </div>
  );
  }
  
