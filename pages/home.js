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
          white-space: nowrap;
        }
        
        .nav-login:hover {
          background: #1a2a6c;
          color: white !important;
        }

        /* Hero Section - 75vh */
        .hero {
          position: relative;
          min-height: 75vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 120px 20px 60px;
          background: linear-gradient(rgba(15, 25, 65, 0.65), rgba(15, 25, 65, 0.75)), 
                      url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80');
          background-size: cover;
          background-position: center;
          box-sizing: border-box;
        }

        .hero-content {
          max-width: 900px;
          z-index: 10;
        }

        h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 6vw, 58px);
          margin-bottom: 25px;
          line-height: 1.1;
          color: white;
          text-shadow: 0 4px 15px rgba(0,0,0,0.5);
        }

        .subtitle {
          font-size: clamp(16px, 3vw, 21px);
          margin-bottom: 35px;
          font-weight: 300;
          line-height: 1.6;
          color: #f0f0f0;
          text-shadow: 0 2px 10px rgba(0,0,0,0.5);
        }

        .cta-main {
          background-color: #d4af37 !important;
          color: #1a2a6c !important;
          padding: 20px 45px;
          border-radius: 50px;
          text-decoration: none !important;
          font-weight: 700;
          font-size: 17px;
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

        /* Section Marc & Super-pouvoirs */
        .meet-marc { padding: 80px 5%; background: #fdfbf7; box-sizing: border-box; }
        .marc-container { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 40px; align-items: center; }
        .marc-profile { flex: 1; text-align: center; }
        .marc-photo { width: 230px; height: 230px; border-radius: 50%; object-fit: cover; border: 6px solid white; box-shadow: 0 15px 35px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .marc-features { flex: 2; display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; width: 100%; }
        .feature-item { background: white; padding: 25px; border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.03); border-left: 4px solid #d4af37; text-align: left; }
        .feature-item h3 { font-size: 17px; color: #1a2a6c; margin-bottom: 10px; display: flex; align-items: center; gap: 10px; font-weight: 700; }
        .feature-item p { font-size: 14px; color: #555; line-height: 1.6; }

        /* Section Témoignages Clients */
        .testimonials {
          padding: 80px 5%;
          background: #fff;
          text-align: center;
          box-sizing: border-box;
        }
        .testimonials h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 5vw, 36px);
          margin-bottom: 40px;
        }
        .reviews-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .review-card {
          background: #fdfbf7;
          padding: 40px 30px;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          text-align: left;
        }
        .stars { color: #d4af37; font-size: 18px; margin-bottom: 15px; letter-spacing: 2px; }
        .review-text { font-size: 15px; line-height: 1.6; font-style: italic; margin-bottom: 20px; color: #555; }
        .author { font-weight: 600; color: #1a2a6c; display: flex; align-items: center; gap: 10px; font-size: 14px; }
        .author-badge { background: #1a2a6c; color: white; font-size: 10px; padding: 3px 8px; border-radius: 10px; text-transform: uppercase; }

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
            Libérez-vous des notifications à toute heure. Que vous soyez sur des plateformes de réservation 
            comme Airbnb, Booking, Abritel ou en direct, MajorMarc gère vos voyageurs 24h/24. 
            Profitez enfin de votre temps libre.
          </p>
          <Link href="/register" passHref style={{ textDecoration: 'none' }}>
            <span className="cta-main">Libérer mon esprit maintenant</span>
          </Link>
        </div>
      </section>

      {/* Section Rencontrez Marc & Super-pouvoirs */}
      <section className="meet-marc">
        <div className="marc-container">
          <div className="marc-profile">
            <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80" alt="Marc, concierge privé" className="marc-photo" />
            <h2 style={{fontFamily: "'Playfair Display', serif", fontSize: '26px'}}>Rencontrez Marc</h2>
            <p style={{color: '#d4af37', fontWeight: '600'}}>Votre Majordome Virtuel</p>
          </div>

          <div className="marc-features">
            <div className="feature-item">
              <h3>⚡ Réactivité Immédiate</h3>
              <p>Marc répond en moins de 2 secondes, garantissant une satisfaction voyageur optimale même en pleine nuit.</p>
            </div>
            <div className="feature-item">
              <h3>🛡️ Fiabilité Certifiée</h3>
              <p>Les réponses sont basées uniquement sur vos données. En cas de doute, Marc vous sollicite immédiatement.</p>
            </div>
            <div className="feature-item">
              <h3>🚨 Détection d'Urgences</h3>
              <p>Grâce à son analyse intelligente, Marc identifie les problèmes techniques et vous alerte par Telegram.</p>
            </div>
            <div className="feature-item">
              <h3>🌍 Polyglotte Expert</h3>
              <p>Il communique avec aisance dans la langue de vos voyageurs, assurant un accueil international sans faille.</p>
            </div>
            <div className="feature-item">
              <h3>🎩 Élegance & Courtoisie</h3>
              <p>Votre image de marque est préservée grâce à un ton professionnel, digne des plus grands hôtels.</p>
            </div>
            <div className="feature-item">
              <h3>⏱️ Gain de Temps Réel</h3>
              <p>Éliminez la gestion répétitive des codes, du Wi-Fi ou du parking. Reprenez le contrôle de votre agenda.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Témoignages */}
      <section className="testimonials">
        <h2>Ils nous font confiance</h2>
        <div className="reviews-grid">
          <div className="review-card">
            <div className="stars">★★★★★</div>
            <p className="review-text">"Je gère plusieurs appartements sur différentes plateformes. Depuis que MajorMarc est en place, je ne gère plus que les vraies urgences techniques."</p>
            <div className="author">Sophie L. <span className="author-badge">Multi-plateforme</span></div>
          </div>
          <div className="review-card">
            <div className="stars">★★★★★</div>
            <p className="review-text">"La réactivité est incroyable. Mes voyageurs soulignent systématiquement la qualité de la communication dans mes commentaires. Un vrai plus."</p>
            <div className="author">Thomas D. <span className="author-badge">Conciergerie</span></div>
          </div>
          <div className="review-card">
            <div className="stars">★★★★★</div>
            <p className="review-text">"Enfin une solution qui comprend les spécificités de la location courte durée. Marc est devenu le pilier de mon organisation."</p>
            <div className="author">Camille V. <span className="author-badge">Investisseuse</span></div>
          </div>
        </div>
      </section>

      <footer style={{padding: '50px 20px', textAlign: 'center', background: '#1a2a6c', color: 'white'}}>
        <p style={{opacity: 0.8, fontSize: '14px'}}>© 2026 MajorMarc - L'excellence de la conciergerie automatisée.</p>
      </footer>
    </div>
  );
}
