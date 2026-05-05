import Link from 'next/link';

export default function Home() {
  return (
    <div className="container">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Montserrat:wght@300;400;600;700&display=swap');

        /* RESET GLOBAL DES LIENS */
        :global(a) {
          text-decoration: none;
          color: inherit;
        }

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
          color: #1a2a6c;
          text-decoration: none;
          cursor: pointer;
        }

        .gold { color: #d4af37; }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 25px;
        }

        .nav-link {
          color: #1a2a6c;
          font-weight: 600;
          text-decoration: none;
          font-size: 14px;
          transition: 0.3s;
          cursor: pointer;
        }

        .nav-link:hover { color: #d4af37; }

        .nav-login {
          font-weight: 600;
          color: #1a2a6c;
          text-decoration: none;
          padding: 8px 22px;
          border: 2px solid #1a2a6c;
          border-radius: 50px;
          font-size: 14px;
          transition: 0.3s;
          cursor: pointer;
          display: inline-block;
        }

        .nav-login:hover {
          background: #1a2a6c;
          color: white;
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
        h1 { font-family: 'Playfair Display', serif; font-size: clamp(32px, 6vw, 58px); color: white; margin-bottom: 25px; }
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
          display: inline-block;
          transition: 0.3s;
          cursor: pointer;
        }

        .cta-main:hover {
          transform: translateY(-3px);
          background-color: #fff !important;
        }

        /* Bandeau Réassurance */
        .trust-banner {
          background: #1a2a6c;
          color: white;
          padding: 25px 5%;
          display: flex;
          justify-content: center;
          gap: 40px;
          flex-wrap: wrap;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .trust-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 600;
          font-size: 14px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .trust-item span { color: #d4af37; font-size: 20px; }

        /* Section Démo */
        .demo-section { padding: 80px 5%; background: white; }
        .demo-section h2 { text-align: center; font-family: 'Playfair Display', serif; font-size: 32px; margin-bottom: 60px; }
        
        .demo-block {
          display: flex;
          flex-direction: column;
          gap: 50px;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto 80px;
        }

        .demo-text { flex: 1; text-align: left; }
        .demo-label { font-weight: 700; text-transform: uppercase; font-size: 12px; letter-spacing: 2px; color: #d4af37; margin-bottom: 15px; display: block; }
        .demo-text h3 { font-family: 'Playfair Display', serif; font-size: 28px; margin-bottom: 20px; color: #1a2a6c; line-height: 1.2; }
        .demo-text p { font-size: 16px; color: #555; line-height: 1.8; margin-bottom: 15px; }

        .demo-visual { flex: 1; width: 100%; max-width: 550px; display: flex; justify-content: center; }

        @media (min-width: 900px) { 
          .demo-block { flex-direction: row; }
          .demo-block.reverse { flex-direction: row-reverse; }
        }

        /* Chat & Téléphone */
        .chat-mockup {
          background: #f8f9fa;
          border-radius: 20px;
          padding: 25px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.05);
          border: 1px solid #eee;
          width: 100%;
        }

        .message { margin-bottom: 15px; padding: 12px 18px; border-radius: 15px; font-size: 14px; line-height: 1.5; max-width: 85%; }
        .msg-user { background: #1a2a6c; color: white; margin-left: auto; border-bottom-right-radius: 2px; }
        .msg-marc { background: white; color: #333; border: 1px solid #eee; border-bottom-left-radius: 2px; }

        .phone-notif { background: #111; border-radius: 35px; padding: 12px; width: 300px; border: 4px solid #333; height: 440px; position: relative; }
        .notif-bubble { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); padding: 18px; border-radius: 18px; margin-top: 40px; box-shadow: 0 10px 20px rgba(0,0,0,0.2); text-align: left; }
        .notif-header { display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; margin-bottom: 12px; color: #666; }
        .notif-body { font-size: 13px; color: #333; line-height: 1.6; }
        .notif-body b { color: #1a2a6c; }

        /* Section Marc */
        .meet-marc { padding: 80px 5%; background: #fdfbf7; }
        .marc-container { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 40px; align-items: center; }
        .marc-photo { width: 200px; height: 200px; border-radius: 50%; object-fit: cover; border: 6px solid white; box-shadow: 0 15px 35px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .marc-features { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; width: 100%; }
        .feature-item { background: white; padding: 25px; border-radius: 15px; border-left: 4px solid #d4af37; text-align: left; }
        @media (min-width: 900px) { .marc-container { flex-direction: row; align-items: flex-start; } .marc-profile { position: sticky; top: 100px; } }

        /* Pricing Teaser */
        .pricing-teaser {
          padding: 80px 5%;
          background: #1a2a6c;
          color: white;
          text-align: center;
        }
        
        .teaser-title { font-family: 'Playfair Display', serif; font-size: clamp(26px, 4vw, 36px); margin-bottom: 20px; }
        .teaser-text { font-size: 18px; margin-bottom: 10px; opacity: 0.9; line-height: 1.6; }
        .teaser-subtext { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: #d4af37; margin-bottom: 40px; display: block; }
        
        .cta-teaser {
          background-color: #d4af37 !important;
          color: #1a2a6c !important;
          padding: 18px 40px;
          border-radius: 50px;
          font-weight: 700;
          text-decoration: none !important;
          display: inline-block;
          transition: 0.3s;
          box-shadow: 0 10px 25px rgba(212, 175, 55, 0.2);
          cursor: pointer;
        }
        .cta-teaser:hover { transform: translateY(-3px); background-color: #fff !important; }

        /* Testimonials & Footer */
        .testimonials { padding: 80px 5%; background: #fff; text-align: center; }
        .reviews-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; max-width: 1200px; margin: 40px auto 0; }
        .review-card { background: #fdfbf7; padding: 35px; border-radius: 20px; text-align: left; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
        .stars { color: #d4af37 !important; font-size: 20px; margin-bottom: 15px; letter-spacing: 3px; }
        .author-badge { background: #1a2a6c; color: white; font-size: 10px; padding: 3px 8px; border-radius: 10px; text-transform: uppercase; margin-left: 10px; }

      `}</style>

      <nav>
        {/* LA CORRECTION MAGIQUE : legacyBehavior + vraie balise <a> */}
        <Link href="/" passHref legacyBehavior>
          <a className="brand">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2.5" style={{marginRight: '10px'}}>
              <path d="M22 17H2a1 1 0 0 1-1-1v-1a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1z"/><path d="M12 4a8 8 0 0 0-8 8h16a8 8 0 0 0-8-8z"/><circle cx="12" cy="3" r="1.5" fill="#d4af37"/>
            </svg>
            Major<span className="gold">Marc</span>
          </a>
        </Link>
        <div className="nav-links">
          <Link href="/pricing" passHref legacyBehavior>
            <a className="nav-link">Tarifs</a>
          </Link>
          <Link href="/login" passHref legacyBehavior>
            <a className="nav-login">Espace Hôte</a>
          </Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <h1>Retrouvez votre <span className="gold">Sérénité</span></h1>
          <p className="subtitle">
            MajorMarc gère vos voyageurs en location courte durée 24h/24. <br/>
            Que vous soyez sur Airbnb, Booking, Abritel ou en direct, profitez enfin de votre temps libre.
          </p>
          {/* LE BOUTON DU HERO */}
          <Link href="/register" passHref legacyBehavior>
            <a className="cta-main">Libérer mon esprit maintenant</a>
          </Link>
        </div>
      </section>

      <div className="trust-banner">
        <div className="trust-item"><span>🕒</span> Disponible 24h/24 et 7j/7</div>
        <div className="trust-item"><span>🔓</span> 100% Sans Engagement</div>
        <div className="trust-item"><span>⚡</span> Réponses instantanées</div>
      </div>

      <section className="demo-section">
        <h2>L'excellence en action</h2>
        
        <div className="demo-block">
          <div className="demo-text">
            <span className="demo-label">Côté Voyageur</span>
            <h3>Une communication fluide et naturelle.</h3>
            <p>MajorMarc s'intègre directement à votre messagerie (Airbnb, Booking ou canal direct). Il comprend l'intention de vos voyageurs et répond instantanément avec le ton d'un véritable concierge.</p>
            <p>Il ne devine rien : toutes ses réponses proviennent exclusivement du livret d'accueil et des consignes que vous lui avez paramétrés. Si une question dépasse ses compétences, il prévient le voyageur que vous allez prendre le relais.</p>
          </div>
          <div className="demo-visual">
            <div className="chat-mockup">
              <div className="message msg-user">Bonjour ! Quel est le code Wi-Fi ?</div>
              <div className="message msg-marc">
                Bonjour ! Bienvenue. 🎩<br/><br/>
                Le réseau est <b>"Villa_Bella_Guest"</b> et le mot de passe est <b>"MotDePasse2026!"</b>.
              </div>
              <div className="message msg-user">Super merci ! Et vous auriez une bonne adresse pour dîner à côté ?</div>
              <div className="message msg-marc">
                Avec plaisir ! Je vous recommande vivement <b>"L'Assiette Bleue"</b> à 5 min à pied. Ils font d'excellents poissons frais. 
              </div>
            </div>
          </div>
        </div>

        <div className="demo-block reverse">
          <div className="demo-text">
            <span className="demo-label">Côté Propriétaire</span>
            <h3>Vous gardez le contrôle, sans le stress.</h3>
            <p>La puissance de MajorMarc réside dans sa capacité à filtrer les messages. Fini d'être réveillé en pleine nuit pour un simple code de boîte à clés ou une question sur le parking.</p>
            <p>Cependant, en cas de problème nécessitant une action humaine (une fuite, une coupure de courant), l'IA détecte l'urgence et vous envoie une alerte immédiate sur votre téléphone via Telegram. Vous n'êtes dérangé que pour l'essentiel.</p>
          </div>
          <div className="demo-visual">
            <div className="phone-notif">
              <div className="notif-bubble">
                <div className="notif-header"><span>TELEGRAM</span><span>À L'INSTANT</span></div>
                <div className="notif-body">
                  🚨 <b>ALERTE MAJORMARC - Villa Bella</b><br/><br/>
                  Problématique : <b>Coupure d'électricité</b>.<br/><br/>
                  Merci de contacter le client au plus vite.
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      <section className="meet-marc">
        <div className="marc-container">
          <div className="marc-profile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80" alt="Marc" className="marc-photo" />
            <h2 style={{fontFamily: "'Playfair Display', serif", fontSize: '26px', marginBottom: '5px'}}>Rencontrez Marc</h2>
            <p style={{color: '#d4af37', fontWeight: '600', margin: '0'}}>Votre Majordome IA</p>
          </div>
          <div className="marc-features">
            <div className="feature-item"><h3>🛡️ Fiabilité Absolue</h3><p>MajorMarc puise ses réponses exclusivement dans vos consignes pour garantir une précision totale.</p></div>
            <div className="feature-item"><h3>🚨 Alerte Urgence</h3><p>Il identifie les situations critiques et vous alerte instantanément par Telegram.</p></div>
            <div className="feature-item"><h3>🌍 Polyglotte</h3><p>Il accueille vos clients du monde entier dans leur langue maternelle.</p></div>
          </div>
        </div>
      </section>

      <section className="pricing-teaser">
        <h2 className="teaser-title">La Sérénité a enfin un prix abordable</h2>
        <p className="teaser-text">
          Un Majordome disponible 24h/24 pour vos voyageurs, <br/>
          à partir de <b style={{ color: '#d4af37', fontSize: '24px' }}>24,90€ / mois</b>.
        </p>
        <span className="teaser-subtext">Sans engagement. Annulable à tout moment.</span>
        
        {/* LE BOUTON DES TARIFS */}
        <Link href="/pricing" passHref legacyBehavior>
          <a className="cta-teaser">Découvrir nos forfaits sur-mesure</a>
        </Link>
      </section>

      <section className="testimonials">
        <h2 style={{fontFamily: "'Playfair Display', serif"}}>Ils ont délégué leur charge mentale</h2>
        <div className="reviews-grid">
          <div className="review-card">
            <div className="stars">★★★★★</div>
            <p className="review-text">"Je gère plusieurs appartements sur Booking et Airbnb. MajorMarc est devenu mon bras droit pour la communication."</p>
            <div className="author">Sophie L. <span className="author-badge">Multi-plateforme</span></div>
          </div>
          <div className="review-card">
            <div className="stars">★★★★★</div>
            <p className="review-text">"La réactivité est le point fort. Mes notes voyageurs ont grimpé depuis que Marc répond à ma place."</p>
            <div className="author">Thomas D. <span className="author-badge">Conciergerie</span></div>
          </div>
        </div>
      </section>

      <footer style={{padding: '50px 20px', textAlign: 'center', background: '#1a2a6c', color: 'white'}}>
        <p style={{opacity: 0.8, fontSize: '13px'}}>© 2026 MajorMarc - L'excellence de la conciergerie automatisée.</p>
      </footer>
    </div>
  );
}
