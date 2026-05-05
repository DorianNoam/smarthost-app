import Link from 'next/link';

export default function Home() {
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
          background: #fff;
          width: 100%;
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
          background: linear-gradient(rgba(15, 25, 65, 0.65), rgba(15, 25, 65, 0.75)), 
                      url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80');
          background-size: cover;
          background-position: center;
          box-sizing: border-box;
        }

        .hero-content { max-width: 900px; z-index: 10; }
        h1 { font-family: 'Playfair Display', serif; font-size: clamp(32px, 6vw, 58px); margin-bottom: 25px; color: white; }
        .subtitle { font-size: clamp(16px, 3vw, 21px); margin-bottom: 35px; color: #f0f0f0; line-height: 1.6; }

        .cta-main {
          background-color: #d4af37 !important;
          color: #1a2a6c !important;
          padding: 20px 45px;
          border-radius: 50px;
          text-decoration: none !important;
          font-weight: 700;
          font-size: 17px;
          box-shadow: 0 10px 30px rgba(212, 175, 55, 0.4);
          cursor: pointer;
        }

        /* NOUVELLE SECTION : Démonstration Visuelle */
        .demo-section {
          padding: 100px 5%;
          background: white;
          text-align: center;
        }

        .demo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 50px;
          max-width: 1200px;
          margin: 50px auto 0;
          align-items: start;
        }

        .demo-box {
          text-align: left;
        }

        .demo-label {
          font-weight: 700;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 2px;
          color: #d4af37;
          margin-bottom: 20px;
          display: block;
        }

        /* Mockup Chat Voyageur */
        .chat-mockup {
          background: #f8f9fa;
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.05);
          border: 1px solid #eee;
        }

        .message {
          margin-bottom: 15px;
          padding: 12px 18px;
          border-radius: 15px;
          font-size: 14px;
          line-height: 1.4;
          max-width: 85%;
        }

        .msg-user {
          background: #1a2a6c;
          color: white;
          margin-left: auto;
          border-bottom-right-radius: 2px;
        }

        .msg-marc {
          background: white;
          color: #333;
          border: 1px solid #eee;
          border-bottom-left-radius: 2px;
        }

        /* Mockup Notification Téléphone */
        .phone-notif {
          background: #111;
          border-radius: 30px;
          padding: 10px;
          width: 280px;
          margin: 0 auto;
          border: 4px solid #333;
        }

        .notif-bubble {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          padding: 15px;
          border-radius: 15px;
          margin-top: 40px;
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }

        .notif-header {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #666;
        }

        .notif-body {
          font-size: 12px;
          color: #333;
        }

        .notif-body b { color: #1a2a6c; }

        /* Points Forts & Témoignages (inchangés mais intégrés) */
        .meet-marc { padding: 80px 5%; background: #fdfbf7; }
        .marc-container { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 40px; }
        .marc-photo { width: 200px; height: 200px; border-radius: 50%; object-fit: cover; border: 6px solid white; box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .marc-features { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
        .feature-item { background: white; padding: 25px; border-radius: 15px; border-left: 4px solid #d4af37; }

        @media (min-width: 900px) {
          .marc-container { flex-direction: row; }
        }
      `}</style>

      {/* Navigation */}
      <nav>
        <Link href="/" passHref style={{ textDecoration: 'none' }}>
          <span className="brand">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2.5" style={{marginRight: '10px'}}>
              <path d="M22 17H2a1 1 0 0 1-1-1v-1a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1z"/><path d="M12 4a8 8 0 0 0-8 8h16a8 8 0 0 0-8-8z"/><circle cx="12" cy="3" r="1.5" fill="#d4af37"/>
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

      {/* NOUVELLE SECTION : DÉMONSTRATION CONCRÈTE */}
      <section className="demo-section">
        <h2 style={{fontFamily: "'Playfair Display', serif", fontSize: '32px'}}>Voyez Marc en action</h2>
        <div className="demo-grid">
          
          {/* Côté Voyageur */}
          <div className="demo-box">
            <span className="demo-label">Côté Voyageur</span>
            <p style={{marginBottom: '20px', fontSize: '15px'}}>Une messagerie fluide, polie et instantanée.</p>
            <div className="chat-mockup">
              <div className="message msg-user">Bonjour ! On vient d'arriver, quel est le code Wi-Fi ?</div>
              <div className="message msg-marc">
                Bonjour ! Bienvenue chez vous. 🎩<br/><br/>
                Le réseau est <b>"Capitaine_Guest"</b> et le mot de passe est <b>"RhumEtPiratage2026"</b>. <br/><br/>
                Puis-je vous aider pour autre chose ?
              </div>
              <div className="message msg-user">C'est parfait, merci Marc !</div>
            </div>
          </div>

          {/* Côté Propriétaire */}
          <div className="demo-box">
            <span className="demo-label">Côté Propriétaire</span>
            <p style={{marginBottom: '20px', fontSize: '15px'}}>Vous n'êtes dérangé que pour l'essentiel.</p>
            <div className="phone-notif" style={{height: '350px'}}>
              <div className="notif-bubble">
                <div className="notif-header">
                  <span>TELEGRAM</span>
                  <span>À L'INSTANT</span>
                </div>
                <div className="notif-body">
                  🚨 <b>ALERTE MAJORMARC</b><br/>
                  Appartement : <i>Studio Bord de Mer</i><br/><br/>
                  Le voyageur signale une <b>fuite d'eau</b> sous l'évier. Marc a répondu qu'il vous contactait immédiatement.
                </div>
              </div>
              <p style={{color: '#666', fontSize: '10px', textAlign: 'center', marginTop: '120px'}}>Faites glisser pour répondre</p>
            </div>
          </div>

        </div>
      </section>

      {/* Section Points Forts */}
      <section className="meet-marc">
        <div className="marc-container">
          <div className="marc-profile">
            <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80" alt="Marc" className="marc-photo" />
            <h2 style={{fontFamily: "'Playfair Display', serif", fontSize: '26px'}}>Marc, votre allié</h2>
            <p style={{color: '#d4af37', fontWeight: '600'}}>L'excellence de l'IA</p>
          </div>
          <div className="marc-features">
            <div className="feature-item">
              <h3>🛡️ Fiabilité Certifiée</h3>
              <p>MajorMarc puise ses réponses exclusivement dans vos consignes. En cas de doute, il vous sollicite plutôt que de risquer une erreur.</p>
            </div>
            <div className="feature-item">
              <h3>🚨 Détection d'Urgences</h3>
              <p>Il analyse les messages pour identifier les problèmes techniques et vous alerte en temps réel par Telegram.</p>
            </div>
            <div className="feature-item">
              <h3>🌍 Polyglotte</h3>
              <p>Il accueille vos voyageurs du monde entier dans leur langue maternelle avec une courtoisie irréprochable.</p>
            </div>
          </div>
        </div>
      </section>

      <footer style={{padding: '50px 20px', textAlign: 'center', background: '#1a2a6c', color: 'white'}}>
        <p style={{opacity: 0.8, fontSize: '14px'}}>© 2026 MajorMarc - L'excellence de la conciergerie automatisée.</p>
      </footer>
    </div>
  );
}
