import Link from 'next/link';

export default function Home() {
  return (
    <div className="container">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Montserrat:wght@300;400;600;700&display=swap');

        .container {
          font-family: 'Montserrat', sans-serif;
          color: #1a2a6c;
          background: #fff;
        }

        /* Navbar avec Logo MajorMarc */
        nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 5%;
          position: fixed;
          width: 100%;
          top: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          z-index: 1000;
          box-shadow: 0 2px 15px rgba(0,0,0,0.05);
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

        .nav-login {
          font-weight: 600;
          color: #1a2a6c !important;
          text-decoration: none;
          padding: 8px 20px;
          border: 2px solid #1a2a6c;
          border-radius: 50px;
          transition: 0.3s;
          display: inline-block;
          font-size: 14px;
        }
        
        .nav-login:hover {
          background: #1a2a6c;
          color: white !important;
        }

        /* Hero Section - Taille réduite */
        .hero {
          position: relative;
          min-height: 75vh; /* Plus petit pour voir la suite de la page */
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 100px 20px 40px;
          background: linear-gradient(rgba(15, 25, 65, 0.6), rgba(15, 25, 65, 0.7)), 
                      url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80');
          background-size: cover;
          background-position: center;
        }

        .hero-content {
          max-width: 800px;
          z-index: 10;
        }

        h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 6vw, 56px);
          margin-bottom: 20px;
          line-height: 1.1;
          color: white;
          text-shadow: 0 4px 15px rgba(0,0,0,0.5);
        }

        .subtitle {
          font-size: clamp(16px, 3vw, 20px);
          margin-bottom: 30px;
          font-weight: 300;
          line-height: 1.6;
          color: #f0f0f0;
          text-shadow: 0 2px 10px rgba(0,0,0,0.5);
        }

        /* Bouton CTA */
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
          color: #1a2a6c !important;
          border-color: #fff;
          box-shadow: 0 15px 35px rgba(255, 255, 255, 0.3);
        }

        /* NOUVELLE SECTION : Rencontrez Marc */
        .meet-marc {
          padding: 80px 5%;
          background: #fdfbf7;
        }

        .marc-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 50px;
          align-items: center;
        }

        .marc-profile {
          flex: 1;
          text-align: center;
        }

        .marc-photo {
          width: 250px;
          height: 250px;
          border-radius: 50%;
          object-fit: cover;
          border: 8px solid white;
          box-shadow: 0 15px 35px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }

        .marc-features {
          flex: 2;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 30px;
        }

        .feature-item {
          background: white;
          padding: 25px;
          border-radius: 15px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.03);
          border-left: 4px solid #d4af37;
        }

        .feature-item h3 {
          font-size: 18px;
          color: #1a2a6c;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .feature-item p {
          font-size: 14px;
          color: #555;
          line-height: 1.6;
        }

        /* Section Charge Mentale */
        .mental-load {
          padding: 80px 5%;
          display: flex;
          flex-direction: column;
          gap: 50px;
          align-items: center;
          background: white;
        }

        .split {
          display: flex;
          flex-direction: column;
          gap: 50px;
          align-items: center;
          max-width: 1200px;
        }

        .text-block { flex: 1; text-align: center; }
        
        .image-block {
          flex: 1;
          width: 100%;
          max-width: 500px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(26, 42, 108, 0.15);
        }

        .image-block img { width: 100%; height: auto; display: block; }

        /* Section Avis Clients */
        .testimonials {
          padding: 80px 5%;
          background: #fdfbf7;
          text-align: center;
        }

        .testimonials h2 {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
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
          background: white;
          padding: 30px;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          text-align: left;
        }

        .stars { color: #d4af37; font-size: 18px; margin-bottom: 15px; letter-spacing: 2px; }
        .review-text { font-size: 15px; line-height: 1.6; font-style: italic; margin-bottom: 20px; color: #555; }
        .author { font-weight: 600; color: #1a2a6c; display: flex; alignItems: center; gap: 10px; font-size: 14px; }
        .author-badge { background: #1a2a6c; color: white; font-size: 10px; padding: 3px 8px; border-radius: 10px; text-transform: uppercase; }

        @media (min-width: 900px) {
          .split { flex-direction: row; text-align: left; }
          .text-block { text-align: left; }
          .marc-container { flex-direction: row; align-items: stretch; }
          .marc-profile { flex: 1; position: sticky; top: 100px; height: fit-content; }
          .marc-features { flex: 2; }
        }
      `}</style>

      {/* Navigation */}
      <nav>
        <Link href="/" passHref style={{ textDecoration: 'none' }}>
          <span className="brand">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '10px'}}>
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
            Cessez de surveiller vos notifications Airbnb. MajorMarc gère vos voyageurs 24h/24, 
            vous profitez enfin de votre temps libre.
          </p>
          <Link href="/register" passHref style={{ textDecoration: 'none' }}>
            <span className="cta-main">
              Libérer mon esprit maintenant
            </span>
          </Link>
        </div>
      </section>

      {/* NOUVELLE SECTION : Rencontrez Marc avec tous les points forts */}
      <section className="meet-marc">
        <div className="marc-container">
          <div className="marc-profile">
            <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80" alt="Marc, votre majordome" className="marc-photo" />
            <h2 style={{fontFamily: "'Playfair Display', serif", fontSize: '28px', color: '#1a2a6c'}}>
              Rencontrez Marc
            </h2>
            <p style={{color: '#d4af37', fontWeight: '600', marginTop: '5px'}}>Votre IA Majordome</p>
          </div>

          <div className="marc-features">
            <div className="feature-item">
              <h3>⚡ Réponses Instantanées</h3>
              <p>Marc répond en moins de 2 secondes à vos voyageurs, 24h/24 et 7j/7. Fini l'attente, bonjour les notes 5 étoiles.</p>
            </div>
            <div className="feature-item">
              <h3>🛡️ Zéro Hallucination</h3>
              <p>Connecté à votre base de données personnelle, Marc ne devine jamais. S'il ne connaît pas la réponse, il vous le dit.</p>
            </div>
            <div className="feature-item">
              <h3>🚨 Ligne Directe Telegram</h3>
              <p>Une panne d'eau ? Un problème urgent ? Marc détecte les urgences et vous envoie une alerte immédiate sur votre téléphone.</p>
            </div>
            <div className="feature-item">
              <h3>🌍 100% Multilingue</h3>
              <p>Qu'ils viennent du Japon, d'Espagne ou des États-Unis, Marc accueille vos voyageurs avec un niveau de langue irréprochable.</p>
            </div>
            <div className="feature-item">
              <h3>🎩 Ton de Prestige</h3>
              <p>Programmé pour l'excellence, Marc s'exprime avec la courtoisie et le professionnalisme d'un véritable concierge de palace.</p>
            </div>
            <div className="feature-item">
              <h3>⏱️ Gain de Temps Massif</h3>
              <p>Éliminez 90% des questions répétitives (Wi-Fi, poubelles, codes d'accès). Concentrez-vous sur ce qui compte vraiment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Charge Mentale */}
      <section className="mental-load">
        <div className="split">
          <div className="text-block">
            <h2 style={{fontFamily: "'Playfair Display', serif", fontSize: '32px', marginBottom: '20px'}}>
              Déléguez la charge,<br/>gardez le <span className="gold">contrôle</span>.
            </h2>
            <p style={{lineHeight: '1.8', fontSize: '16px', color: '#555'}}>
              La gestion locative ne devrait pas dévorer vos soirées et vos week-ends. 
              En confiant l'accueil virtuel à MajorMarc, vous offrez une expérience premium à vos voyageurs, 
              tout en préservant votre tranquillité d'esprit. 
            </p>
            <p style={{marginTop: '20px', fontWeight: '700', fontSize: '16px', color: '#1a2a6c'}}>
              Dormez tranquille, la conciergerie est ouverte.
            </p>
          </div>
          <div className="image-block">
            <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80" alt="Hôte sereine" />
          </div>
        </div>
      </section>

      {/* Section Avis Clients */}
      <section className="testimonials">
        <h2>Ils ont délégué leur charge mentale</h2>
        <div className="reviews-grid">
          <div className="review-card">
            <div className="stars">★★★★★</div>
            <p className="review-text">"Je gère 4 appartements. Avant MajorMarc, je passais mes soirées à donner les codes Wi-Fi ou expliquer comment marche la machine à laver. Aujourd'hui, je ne gère que les vraies urgences."</p>
            <div className="author">Sophie L. <span className="author-badge">Superhost</span></div>
          </div>
          <div className="review-card">
            <div className="stars">★★★★★</div>
            <p className="review-text">"Mes voyageurs adorent la réactivité. Ils ont une réponse en 2 secondes, même à 3h du matin, et dans leur propre langue. Mes notes sur la communication ont explosé."</p>
            <div className="author">Thomas D. <span className="author-badge">Conciergerie</span></div>
          </div>
          <div className="review-card">
            <div className="stars">★★★★★</div>
            <p className="review-text">"Le système d'alerte Telegram est brillant. Je suis prévenu immédiatement s'il y a un vrai problème d'eau ou d'électricité, le reste du temps, mon téléphone reste silencieux."</p>
            <div className="author">Camille V. <span className="author-badge">Investisseuse</span></div>
          </div>
        </div>
      </section>

      <footer style={{padding: '40px', textAlign: 'center', background: '#1a2a6c', color: 'white'}}>
        <p style={{opacity: 0.8}}>© 2026 MajorMarc - La conciergerie IA nouvelle génération.</p>
      </footer>
    </div>
  );
}
