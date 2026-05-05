import Link from 'next/link';

export default function Home() {
  return (
    <div className="container">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Montserrat:wght@300;400;600;700&display=swap');

        /* Reset global pour éviter les débordements */
        :global(html), :global(body) {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          width: 100%;
        }

        .container {
          font-family: 'Montserrat', sans-serif;
          color: #1a2a6c;
          background: #fff;
          width: 100%;
        }

        /* Navbar Corrigée */
        nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 5%;
          position: fixed;
          top: 0;
          left: 0;
          right: 0; /* Remplace width: 100% pour éviter le bug de débordement */
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(10px);
          z-index: 1000;
          box-shadow: 0 2px 15px rgba(0,0,0,0.05);
          box-sizing: border-box; /* Force le calcul du padding à l'intérieur de la largeur */
        }

        .brand {
          display: flex;
          align-items: center;
          font-family: 'Playfair Display', serif;
          font-size: clamp(18px, 4vw, 24px);
          font-weight: 700;
          color: #1a2a6c !important;
          text-decoration: none;
        }

        .gold { color: #d4af37; }

        .nav-login {
          font-weight: 600;
          color: #1a2a6c !important;
          text-decoration: none;
          padding: 8px 22px;
          border: 2px solid #1a2a6c;
          border-radius: 50px;
          transition: 0.3s;
          font-size: 14px;
          white-space: nowrap; /* Empêche le texte de se couper */
        }
        
        .nav-login:hover {
          background: #1a2a6c;
          color: white !important;
        }

        /* Hero Section */
        .hero {
          position: relative;
          min-height: 75vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 120px 20px 60px;
          background: linear-gradient(rgba(15, 25, 65, 0.6), rgba(15, 25, 65, 0.7)), 
                      url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80');
          background-size: cover;
          background-position: center;
          box-sizing: border-box;
        }

        .hero-content {
          max-width: 850px;
          z-index: 10;
        }

        h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(30px, 6vw, 56px);
          margin-bottom: 20px;
          line-height: 1.1;
          color: white;
          text-shadow: 0 4px 15px rgba(0,0,0,0.5);
        }

        .subtitle {
          font-size: clamp(15px, 3vw, 20px);
          margin-bottom: 30px;
          font-weight: 300;
          line-height: 1.6;
          color: #f0f0f0;
          text-shadow: 0 2px 10px rgba(0,0,0,0.5);
        }

        .cta-main {
          background-color: #d4af37 !important;
          color: #1a2a6c !important;
          padding: 18px 40px;
          border-radius: 50px;
          text-decoration: none !important;
          font-weight: 700;
          font-size: 16px;
          transition: all 0.3s ease;
          display: inline-block;
          box-shadow: 0 10px 30px rgba(212, 175, 55, 0.4);
          border: 2px solid #d4af37;
          cursor: pointer;
        }

        .cta-main:hover {
          transform: translateY(-5px);
          background-color: #fff !important;
          border-color: #fff;
        }

        /* Marc & Points Forts */
        .meet-marc { padding: 80px 5%; background: #fdfbf7; box-sizing: border-box; }
        .marc-container { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 40px; align-items: center; }
        .marc-profile { flex: 1; text-align: center; }
        .marc-photo { width: 220px; height: 220px; border-radius: 50%; object-fit: cover; border: 6px solid white; box-shadow: 0 15px 35px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .marc-features { flex: 2; display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; width: 100%; }
        .feature-item { background: white; padding: 25px; border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.03); border-left: 4px solid #d4af37; text-align: left; }
        .feature-item h3 { font-size: 17px; color: #1a2a6c; margin-bottom: 10px; display: flex; align-items: center; gap: 10px; font-weight: 700; }
        .feature-item p { font-size: 14px; color: #555; line-height: 1.6; }

        @media (min-width: 900px) {
          .marc-container { flex-direction: row; align-items: flex-start; }
          .marc-profile { position: sticky; top: 120px; }
        }
      `}</style>

      {/* Navigation */}
      <nav>
        <Link href="/" passHref style={{ textDecoration: 'none' }}>
          <span className="brand">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2.5" style={{marginRight: '10px'}}>
              <path d="M22 17H2a1 1 0 0 1-1-1v-1a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1z"/>
              <path d="M12 4a8 8 0 0 0-8 8h16a8 8 0 0 0-8-8z"/>
              <circle cx="12" cy="3" r="1.5" fill="#d4af37"/>
            </svg>
            Major<span className="gold">Marc</span>
          </span>
        </Link>
        <Link href="/login" passHref style={{ textDecoration: 'none' }}>
          <span className="nav-login">Espace Hôte</span>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Retrouvez votre <span className="gold">Sérénité</span></h1>
          <p className="subtitle">
            Libérez-vous des notifications à toute heure. Que vous soyez sur Booking, Abritel ou en direct, 
            MajorMarc gère vos voyageurs 24h/24. Profitez enfin de votre temps libre.
          </p>
          <Link href="/register" passHref style={{ textDecoration: 'none' }}>
            <span className="cta-main">Libérer mon esprit maintenant</span>
          </Link>
        </div>
      </section>

      {/* Section Points Forts */}
      <section className="meet-marc">
        <div className="marc-container">
          <div className="marc-profile">
            <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80" alt="Marc" className="marc-photo" />
            <h2 style={{fontFamily: "'Playfair Display', serif", fontSize: '26px'}}>Rencontrez Marc</h2>
            <p style={{color: '#d4af37', fontWeight: '600'}}>Votre IA Majordome</p>
          </div>

          <div className="marc-features">
            <div className="feature-item">
              <h3>⚡ Réponses Instantanées</h3>
              <p>Marc répond en moins de 2 secondes, 24h/24. Fini l'attente pour vos voyageurs, bonjour les notes 5 étoiles.</p>
            </div>
            <div className="feature-item">
              <h3>🛡️ Fiabilité Absolue</h3>
              <p>MajorMarc puise ses réponses exclusivement dans vos consignes. S'il n'a pas l'information, il vous sollicite immédiatement.</p>
            </div>
            <div className="feature-item">
              <h3>🚨 Ligne Directe Telegram</h3>
              <p>Une urgence technique ? Marc détecte les situations critiques et vous alerte sur votre téléphone.</p>
            </div>
            <div className="feature-item">
              <h3>🌍 100% Multilingue</h3>
              <p>Il accueille vos voyageurs internationaux dans leur langue maternelle avec une courtoisie irréprochable.</p>
            </div>
            <div className="feature-item">
              <h3>🎩 Standard de Prestige</h3>
              <p>Programmé pour l'excellence, Marc s'exprime avec le professionnalisme d'un concierge de palace.</p>
            </div>
            <div className="feature-item">
              <h3>⏱️ Maîtrise du Temps</h3>
              <p>Éliminez 90% des questions répétitives (Wi-Fi, parking). Concentrez-vous sur vos projets.</p>
            </div>
          </div>
        </div>
      </section>

      <footer style={{padding: '40px', textAlign: 'center', background: '#1a2a6c', color: 'white'}}>
        <p style={{opacity: 0.8, fontSize: '14px'}}>© 2026 MajorMarc - L'excellence de la conciergerie IA.</p>
      </footer>
    </div>
  );
}
