import Link from 'next/link';

export default function Home() {
  return (
    <div className="container">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@300;400;600&display=swap');

        .container {
          font-family: 'Montserrat', sans-serif;
          color: #1a2a6c;
          background: #fff;
        }

        /* Hero Section avec Image de fond */
        .hero {
          position: relative;
          height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          text-align: center;
          padding: 0 20px;
          background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), 
                      url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80');
          background-size: cover;
          background-position: center;
        }

        .hero-content {
          max-width: 800px;
          backdrop-filter: blur(5px);
          background: rgba(26, 42, 108, 0.2);
          padding: 40px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.3);
        }

        h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 7vw, 58px);
          margin-bottom: 20px;
          line-height: 1.1;
        }

        .gold { color: #d4af37; }

        .subtitle {
          font-size: clamp(16px, 4vw, 20px);
          margin-bottom: 35px;
          font-weight: 300;
          line-height: 1.6;
        }

        .cta-main {
          background: #d4af37;
          color: white;
          padding: 18px 40px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 600;
          font-size: 18px;
          transition: all 0.3s ease;
          display: inline-block;
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }

        .cta-main:hover {
          transform: translateY(-3px);
          background: #c19b2e;
          box-shadow: 0 15px 30px rgba(0,0,0,0.3);
        }

        /* Section Argumentaire "Charge Mentale" */
        .mental-load {
          padding: 80px 5%;
          display: flex;
          flex-direction: column;
          gap: 40px;
          align-items: center;
          background: #fdfbf7;
        }

        .split {
          display: flex;
          flex-direction: column;
          gap: 40px;
          align-items: center;
          max-width: 1100px;
        }

        .text-block { flex: 1; text-align: center; }
        
        .image-block {
          flex: 1;
          width: 100%;
          max-width: 500px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }

        .image-block img { width: 100%; height: auto; display: block; }

        h2 { font-family: 'Playfair Display', serif; font-size: 32px; margin-bottom: 20px; }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          width: 100%;
          margin-top: 40px;
        }

        .feature-card {
          background: white;
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
          border-bottom: 3px solid #d4af37;
        }

        @media (min-width: 768px) {
          .split { flex-direction: row; text-align: left; }
          .text-block { text-align: left; }
          .mental-load { padding: 100px 10%; }
        }
      `}</style>

      {/* Hero Section : L'émotion brute */}
      <section className="hero">
        <div className="hero-content">
          <h1>Retrouvez votre <span className="gold">Sérénité</span></h1>
          <p className="subtitle">
            Cessez de surveiller vos notifications. Marc gère vos voyageurs, <br/>
            vous profitez enfin de votre temps libre.
          </p>
          <Link href="/register" className="cta-main">
            Libérer mon esprit maintenant
          </Link>
        </div>
      </section>

      {/* Section Charge Mentale : La Solution */}
      <section className="mental-load">
        <div className="split">
          <div className="text-block">
            <h2>Plus qu'un chatbot,<br/>un <span className="gold">Majordome</span>.</h2>
            <p>
              La gestion Airbnb ne devrait pas être un second métier à plein temps. 
              SmartHost AI prend le relais sur 90% de vos échanges : Wi-Fi, arrivée autonome, 
              règles de la maison... 
            </p>
            <p style={{marginTop: '15px', fontWeight: '600'}}>
              Dormez tranquille, Marc veille au grain.
            </p>
          </div>
          <div className="image-block">
            {/* Image d'une personne zen libérée de son téléphone */}
            <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80" alt="Hôte sereine" />
          </div>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <h3>🔇 Silence Radio</h3>
            <p>Finies les notifications à 23h pour un code Wi-Fi. Marc répond instantanément.</p>
          </div>
          <div className="feature-card">
            <h3>⭐ Notes 5 Étoiles</h3>
            <p>La réactivité est le premier critère des voyageurs. Offrez-leur l'excellence.</p>
          </div>
          <div className="feature-card">
            <h3>🚨 Filtre Intelligent</h3>
            <p>Vous n'êtes dérangé que si Marc détecte une panne ou un besoin urgent.</p>
          </div>
        </div>
      </section>

      <footer style={{padding: '40px', textAlign: 'center', background: '#1a2a6c', color: 'white'}}>
        <p>© 2026 SmartHost AI - La conciergerie nouvelle génération.</p>
      </footer>
    </div>
  );
        }
        
