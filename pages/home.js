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
          padding: 20px 5%;
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
          font-size: 26px;
          font-weight: 700;
          color: #1a2a6c;
          text-decoration: none;
        }

        .gold { color: #d4af37; }

        .nav-login {
          font-weight: 600;
          color: #1a2a6c;
          text-decoration: none;
          padding: 8px 20px;
          border: 2px solid #1a2a6c;
          border-radius: 50px;
          transition: 0.3s;
        }
        .nav-login:hover {
          background: #1a2a6c;
          color: white;
        }

        /* Hero Section */
        .hero {
          position: relative;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 0 20px;
          background: linear-gradient(rgba(15, 25, 65, 0.6), rgba(15, 25, 65, 0.7)), 
                      url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80');
          background-size: cover;
          background-position: center;
          margin-top: 0;
        }

        .hero-content {
          max-width: 800px;
          z-index: 10;
        }

        h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(36px, 7vw, 64px);
          margin-bottom: 20px;
          line-height: 1.1;
          color: white;
          text-shadow: 0 4px 15px rgba(0,0,0,0.5);
        }

        .subtitle {
          font-size: clamp(16px, 4vw, 22px);
          margin-bottom: 40px;
          font-weight: 300;
          line-height: 1.6;
          color: #f0f0f0;
          text-shadow: 0 2px 10px rgba(0,0,0,0.5);
        }

        /* Bouton CTA ultra-visible */
        .cta-main {
          background-color: #d4af37 !important;
          color: #1a2a6c !important;
          padding: 20px 45px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 700;
          font-size: 18px;
          transition: all 0.3s ease;
          display: inline-block;
          box-shadow: 0 10px 30px rgba(212, 175, 55, 0.4);
          border: 2px solid #d4af37;
        }

        .cta-main:hover {
          transform: translateY(-5px);
          background-color: #fff !important;
          border-color: #fff;
          box-shadow: 0 15px 35px rgba(255, 255, 255, 0.3);
        }

        /* Section Avis Clients */
        .testimonials {
          padding: 100px 5%;
          background: #fdfbf7;
          text-align: center;
        }

        .testimonials h2 {
          font-family: 'Playfair Display', serif;
          font-size: 36px;
          margin-bottom: 50px;
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
          padding: 40px 30px;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          text-align: left;
          position: relative;
        }

        .stars {
          color: #d4af37;
          font-size: 20px;
          margin-bottom: 15px;
          letter-spacing: 2px;
        }

        .review-text {
          font-size: 16px;
          line-height: 1.6;
          font-style: italic;
          margin-bottom: 20px;
          color: #555;
        }

        .author {
          font-weight: 600;
          color: #1a2a6c;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .author-badge {
          background: #1a2a6c;
          color: white;
          font-size: 11px;
          padding: 3px 8px;
          border-radius: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* Section Charge Mentale */
        .mental-load {
          padding: 100px 5%;
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

        @media (min-width: 768px) {
          .split { flex-direction: row; text-align: left; }
          .text-block { text-align: left; }
        }
      `}</style>

      {/* Navigation avec le Logo SVG intégré */}
      <nav>
        <Link href="/" className="brand">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}>
            {/* Icône de cloche de majordome */}
            <path d="M22 17H2a1 1 0 0 1-1-1v-1a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1z"/>
            <path d="M12 4a8 8 0 0 0-8 8h16a8 8 0 0 0-8-8z"/>
            <circle cx="12" cy="3" r="1.5" fill="#d4af37"/>
          </svg>
          Major<span className="gold">Marc</span>
        </Link>
        <Link href="/login" className="nav-login">Espace Hôte</Link>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Retrouvez votre <span className="gold">Sérénité</span></h1>
          <p className="subtitle">
            Cessez de surveiller vos notifications Airbnb. MajorMarc gère vos voyageurs 24h/24, 
            vous profitez enfin de votre temps libre.
          </p>
          <Link href="/register" className="cta-main">
            Libérer mon esprit maintenant
          </Link>
        </div>
      </section>

      {/* NOUVELLE SECTION : Avis Clients */}
      <section className="testimonials">
        <h2>Ils ont délégué leur charge mentale</h2>
        <div className="reviews-grid">
          <div className="review-card">
            <div className="stars">★★★★★</div>
            <p className="review-text">"Je gère 4 appartements. Avant MajorMarc, je passais mes soirées à donner les codes Wi-Fi ou expliquer comment marche la machine à laver. Aujourd'hui, je ne gère que les vraies urgences."</p>
            <div className="author">
              Sophie L. <span className="author-badge">Superhost</span>
            </div>
          </div>
          <div className="review-card">
            <div className="stars">★★★★★</div>
            <p className="review-text">"Mes voyageurs adorent la réactivité. Ils ont une réponse en 2 secondes, même à 3h du matin, et dans leur propre langue. Mes notes sur la communication ont explosé."</p>
            <div className="author">
              Thomas D. <span className="author-badge">Conciergerie</span>
            </div>
          </div>
          <div className="review-card">
            <div className="stars">★★★★★</div>
            <p className="review-text">"Le système d'alerte Telegram est brillant. Je suis prévenu immédiatement s'il y a un vrai problème d'eau ou d'électricité, le reste du temps, mon téléphone reste silencieux."</p>
            <div className="author">
              Camille V. <span className="author-badge">Investisseuse</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section Charge Mentale */}
      <section className="mental-load">
        <div className="split">
          <div className="text-block">
            <h2 style={{fontFamily: "'Playfair Display', serif", fontSize: '32px', marginBottom: '20px'}}>
              Plus qu'un chatbot,<br/>un <span className="gold">Majordome</span>.
            </h2>
            <p style={{lineHeight: '1.8', fontSize: '18px', color: '#555'}}>
              La gestion locative ne devrait pas être un second métier à plein temps. 
              MajorMarc prend le relais sur 90% de vos échanges : Wi-Fi, arrivée autonome, 
              règles de la maison, bonnes adresses... 
            </p>
            <p style={{marginTop: '20px', fontWeight: '700', fontSize: '18px', color: '#1a2a6c'}}>
              Dormez tranquille, MajorMarc veille au grain.
            </p>
          </div>
          <div className="image-block">
            {/* Image de l'hôte zen */}
            <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80" alt="Hôte sereine" />
          </div>
        </div>
      </section>

      <footer style={{padding: '40px', textAlign: 'center', background: '#1a2a6c', color: 'white'}}>
        <p style={{opacity: 0.8}}>© 2026 MajorMarc - La conciergerie IA nouvelle génération.</p>
      </footer>
    </div>
  );
}
