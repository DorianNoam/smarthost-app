import Link from 'next/link';

export default function Home() {
  return (
    <div className="container">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Montserrat:wght@300;400;500;600;700&display=swap');

        :global(a) { text-decoration: none; color: inherit; }
        :global(html), :global(body) { margin: 0; padding: 0; overflow-x: hidden; width: 100%; background-color: #fafafa; }
        
        .container { font-family: 'Montserrat', sans-serif; color: #0f172a; width: 100%; }

        /* --- NAVBAR --- */
        nav {
          display: flex; justify-content: space-between; align-items: center; padding: 15px 5%;
          position: fixed; top: 0; left: 0; right: 0; background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px); z-index: 1000; box-shadow: 0 1px 10px rgba(0,0,0,0.05); box-sizing: border-box;
        }
        .brand { display: flex; align-items: center; font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 800; color: #1a2a6c; cursor: pointer; }
        .gold { color: #d4af37; }
        .nav-links { display: flex; align-items: center; gap: 30px; }
        .nav-link { color: #1e293b; font-weight: 600; font-size: 15px; transition: 0.3s; cursor: pointer; }
        .nav-link:hover { color: #d4af37; }
        .nav-login { font-weight: 600; color: #1a2a6c; padding: 10px 24px; border: 2px solid #1a2a6c; border-radius: 50px; font-size: 15px; transition: 0.3s; cursor: pointer; }
        .nav-login:hover { background: #1a2a6c; color: white; }

        /* --- HERO SECTION (La Promesse) --- */
        .hero {
          position: relative; min-height: 85vh; display: flex; align-items: center; justify-content: center;
          text-align: center; padding: 140px 20px 80px; box-sizing: border-box;
          background: linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.85)), url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80') center/cover;
        }
        .hero-content { max-width: 950px; z-index: 10; }
        .badge-hero { background: rgba(212, 175, 55, 0.2); color: #d4af37; padding: 8px 16px; border-radius: 30px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 25px; border: 1px solid rgba(212, 175, 55, 0.5); }
        h1 { font-family: 'Playfair Display', serif; font-size: clamp(38px, 6vw, 64px); color: white; margin-bottom: 25px; line-height: 1.1; }
        .subtitle { font-size: clamp(16px, 3vw, 22px); margin-bottom: 40px; color: #e2e8f0; line-height: 1.6; font-weight: 300; }
        
        .cta-main {
          background-color: #d4af37; color: #1a2a6c; padding: 22px 50px; border-radius: 50px; font-weight: 700; font-size: 18px;
          box-shadow: 0 10px 30px rgba(212, 175, 55, 0.4); display: inline-block; transition: 0.3s; cursor: pointer;
        }
        .cta-main:hover { transform: translateY(-3px); background-color: #fff; box-shadow: 0 15px 40px rgba(255, 255, 255, 0.3); }

        /* --- PAIN POINTS (Remuer le couteau dans la plaie) --- */
        .pain-section { padding: 100px 5%; background: #fff; text-align: center; }
        .pain-title { font-family: 'Playfair Display', serif; font-size: 36px; color: #1a2a6c; margin-bottom: 15px; }
        .pain-subtitle { font-size: 18px; color: #64748b; margin-bottom: 60px; }
        .pain-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; max-width: 1200px; margin: 0 auto; }
        .pain-card { background: #f8fafc; padding: 40px 30px; border-radius: 24px; text-align: left; transition: 0.3s; border: 1px solid #e2e8f0; }
        .pain-card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.04); border-color: #d4af37; }
        .pain-icon { font-size: 40px; margin-bottom: 20px; display: inline-block; }
        .pain-card h3 { font-size: 20px; color: #1e293b; margin-bottom: 15px; }
        .pain-card p { color: #475569; line-height: 1.6; font-size: 15px; }

        /* --- DEMO SECTION (Show, Don't Tell) --- */
        .demo-section { padding: 100px 5%; background: #1a2a6c; color: white; overflow: hidden; }
        .demo-header { text-align: center; margin-bottom: 70px; }
        .demo-header h2 { font-family: 'Playfair Display', serif; font-size: 42px; margin-bottom: 20px; }
        
        .demo-layout { display: flex; flex-direction: column; gap: 60px; max-width: 1200px; margin: 0 auto; align-items: center; }
        @media (min-width: 1024px) { .demo-layout { flex-direction: row; justify-content: space-between; } }
        
        .phone-wrapper { position: relative; width: 100%; max-width: 350px; }
        .phone-frame { border: 12px solid #0f172a; border-radius: 40px; background: white; height: 700px; overflow: hidden; position: relative; box-shadow: 0 30px 60px rgba(0,0,0,0.4); }
        .phone-notch { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 150px; height: 25px; background: #0f172a; border-bottom-left-radius: 15px; border-bottom-right-radius: 15px; z-index: 10; }
        
        .chat-app { display: flex; flex-direction: column; height: 100%; background: #f0f2f5; }
        .chat-header { background: #075e54; color: white; padding: 40px 20px 15px; text-align: center; font-weight: 600; font-size: 16px; }
        .chat-body { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; }
        
        .msg { padding: 12px 16px; border-radius: 15px; font-size: 13.5px; line-height: 1.5; max-width: 85%; position: relative; }
        .msg-user { background: #dcf8c6; color: #111; align-self: flex-end; border-bottom-right-radius: 2px; }
        .msg-marc { background: white; color: #111; align-self: flex-start; border-bottom-left-radius: 2px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
        .msg-time { display: block; font-size: 10px; color: #888; text-align: right; margin-top: 5px; }

        .demo-features { flex: 1; max-width: 500px; }
        .feat-row { margin-bottom: 40px; display: flex; gap: 20px; align-items: flex-start; }
        .feat-icon { background: rgba(212, 175, 55, 0.1); color: #d4af37; width: 60px; height: 60px; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
        .feat-text h4 { font-size: 22px; margin-bottom: 10px; color: white; font-family: 'Playfair Display', serif; }
        .feat-text p { color: #cbd5e1; line-height: 1.6; font-size: 15px; }

        /* --- THE KILLER FEATURE (L'alerte) --- */
        .killer-feature { background: #fff; padding: 80px 5%; margin: 60px auto; max-width: 1000px; border-radius: 30px; box-shadow: 0 20px 50px rgba(0,0,0,0.08); display: flex; flex-wrap: wrap; align-items: center; gap: 40px; }
        .kf-text { flex: 1; min-width: 300px; }
        .kf-text h3 { font-family: 'Playfair Display', serif; font-size: 32px; color: #1a2a6c; margin-bottom: 20px; }
        .kf-text p { color: #475569; line-height: 1.7; font-size: 16px; margin-bottom: 20px; }
        .notif-mockup { flex: 1; min-width: 300px; background: #f8fafc; padding: 25px; border-radius: 20px; border: 1px solid #e2e8f0; }
        .notif-bubble { background: white; padding: 20px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border-left: 5px solid #ef4444; }
        .notif-head { display: flex; justify-content: space-between; font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 10px; }
        .notif-bubble b { color: #0f172a; }

        /* --- PRICING ANCHOR --- */
        .pricing-anchor { padding: 100px 5%; background: #fdfbf7; text-align: center; }
        .anchor-box { max-width: 800px; margin: 0 auto; }
        .anchor-box h2 { font-family: 'Playfair Display', serif; font-size: 40px; color: #1a2a6c; margin-bottom: 20px; }
        .anchor-box p { font-size: 18px; color: #475569; margin-bottom: 40px; line-height: 1.6; }
        .price-highlight { font-size: 64px; font-weight: 800; color: #1a2a6c; font-family: 'Playfair Display', serif; display: block; margin: 20px 0; }
        .price-highlight span { font-size: 20px; color: #64748b; font-family: 'Montserrat', sans-serif; font-weight: 500; }
        
        /* --- FOOTER --- */
        footer { padding: 40px 5%; text-align: center; background: #0f172a; color: #94a3b8; font-size: 14px; }
      `}</style>

      {/* NAVIGATION */}
      <nav>
        <Link href="/" passHref legacyBehavior>
          <a className="brand">Major<span className="gold">Marc</span></a>
        </Link>
        <div className="nav-links">
          <Link href="/pricing" passHref legacyBehavior><a className="nav-link">Tarifs</a></Link>
          <Link href="/login" passHref legacyBehavior><a className="nav-login">Espace Hôte</a></Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-content">
          <span className="badge-hero">L'Intelligence Artificielle au service de votre location</span>
          <h1>Dormez sur vos deux oreilles.<br/>Marc gère vos voyageurs.</h1>
          <p className="subtitle">
            Le premier majordome IA qui répond aux questions 24h/24, recommande les meilleurs restaurants locaux, et vous alerte uniquement en cas d'urgence. Divisez votre charge mentale par 10.
          </p>
          <Link href="/register" passHref legacyBehavior>
            <a className="cta-main">Engager mon Majordome (Essai gratuit)</a>
          </Link>
        </div>
      </section>

      {/* PAIN POINTS */}
      <section className="pain-section">
        <h2 className="pain-title">Pourquoi continuer à subir ça ?</h2>
        <p className="pain-subtitle">La gestion locative ne devrait pas être un second travail à temps plein.</p>
        <div className="pain-grid">
          <div className="pain-card">
            <span className="pain-icon">📱</span>
            <h3>Le message à 23h30</h3>
            <p>Le voyageur vient d'arriver, il est fatigué, et il ne trouve pas le code de la boîte à clés ou le mot de passe Wifi. Votre téléphone sonne alors que vous dormiez.</p>
          </div>
          <div className="pain-card">
            <span className="pain-icon">🌍</span>
            <h3>La barrière de la langue</h3>
            <p>Traduire vos livrets d'accueil et faire des allers-retours sur Google Translate pour expliquer où sortir les poubelles à des touristes internationaux.</p>
          </div>
          <div className="pain-card">
            <span className="pain-icon">😫</span>
            <h3>Les questions répétitives</h3>
            <p>Répondre inlassablement aux mêmes questions : "Où est le supermarché le plus proche ?", "À quelle heure est le départ ?", "Comment on allume le four ?".</p>
          </div>
        </div>
      </section>

      {/* DEMO SECTION */}
      <section className="demo-section">
        <div className="demo-header">
          <h2>L'illusion parfaite d'une conciergerie de luxe</h2>
          <p style={{fontSize: '18px', color: '#cbd5e1', maxWidth: '700px', margin: '0 auto'}}>Marc comprend le contexte, cherche sur le web pour des recommandations locales, et répond dans un langage naturel impeccable.</p>
        </div>

        <div className="demo-layout">
          {/* Faux Téléphone */}
          <div className="phone-wrapper">
            <div className="phone-frame">
              <div className="phone-notch"></div>
              <div className="chat-app">
                <div className="chat-header">La Villa Noam</div>
                <div className="chat-body">
                  <div className="msg msg-user">
                    Hi! Just arrived. Where can I park my car and do you know a good place to eat pizza around here?
                    <span className="msg-time">19:42</span>
                  </div>
                  <div className="msg msg-marc">
                    Welcome to Villa Noam! 🎩<br/><br/>
                    You can park safely in the private driveway behind the white gate. The code to enter is 1985.<br/><br/>
                    For a great pizza, I highly recommend "Pizzeria Da Luigi", located just a 5-minute walk from the villa. It's excellent! 🍕
                    <span className="msg-time">19:42</span>
                  </div>
                  <div className="msg msg-user">
                    Amazing, thanks! One last thing, I can't find the trash bins.
                    <span className="msg-time">19:45</span>
                  </div>
                  <div className="msg msg-marc">
                    You're very welcome! The grey bin (regular trash) is collected on Monday evenings, and the green one (recycling) on Wednesdays. You can leave them on the sidewalk.
                    <span className="msg-time">19:45</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Explications des features */}
          <div className="demo-features">
            <div className="feat-row">
              <div className="feat-icon">⚡</div>
              <div className="feat-text">
                <h4>Réponses Instantanées</h4>
                <p>Vos voyageurs n'attendent plus. Marc répond dans la seconde en piochant dans votre base de données sécurisée.</p>
              </div>
            </div>
            <div className="feat-row">
              <div className="feat-icon">🌐</div>
              <div className="feat-text">
                <h4>Recherche Web Intégrée</h4>
                <p>Besoin d'un restaurant, d'une pharmacie ou d'un transport ? Marc scanne les environs du logement sur internet pour faire des recommandations personnalisées.</p>
              </div>
            </div>
            <div className="feat-row">
              <div className="feat-icon">🗣️</div>
              <div className="feat-text">
                <h4>100% Polyglotte</h4>
                <p>Peu importe la langue du voyageur, Marc détecte automatiquement l'idiome et formule une réponse courtoise, sans que vous n'ayez rien à traduire.</p>
              </div>
            </div>
          </div>
        </div>

        {/* KILLER FEATURE (ALERTE) */}
        <div className="killer-feature">
          <div className="kf-text">
            <span style={{color: '#ef4444', fontWeight: '700', letterSpacing: '2px', fontSize: '13px', textTransform: 'uppercase'}}>Le Filet de Sécurité</span>
            <h3>Vous n'êtes dérangé que lorsque c'est vital.</h3>
            <p>Marc est intelligent. Si un client signale une fuite d'eau, une panne de courant, ou une situation d'urgence qu'il ne peut pas résoudre seul, il vous transfère immédiatement l'information sur votre téléphone.</p>
            <p><b>Résultat :</b> Vous filtrez 95% du bruit quotidien, et gardez le contrôle sur les 5% qui comptent vraiment.</p>
          </div>
          <div className="notif-mockup">
            <div className="notif-bubble">
              <div className="notif-head">
                <span>Telegram</span>
                <span>Maintenant</span>
              </div>
              <p style={{fontSize: '14px', margin: 0, color: '#475569', lineHeight: '1.5'}}>
                🚨 <b>ALERTE MAJOR MARC</b><br/><br/>
                🏠 Logement : La Villa Noam<br/>
                💬 Client : "Il y a une énorme fuite sous l'évier de la cuisine !"<br/><br/>
                <i>Marc a indiqué la vanne d'arrêt et vous demande de prendre le relais.</i>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING ANCHOR */}
      <section className="pricing-anchor">
        <div className="anchor-box">
          <h2>Pour le prix d'un seul frais de ménage.</h2>
          <p>La plupart des conciergeries traditionnelles prennent 20% de vos revenus. Offrez-vous le service d'un majordome privé 24h/24 pour une fraction de ce coût, et conservez vos marges.</p>
          <span className="price-highlight">29€ <span>/ logement / mois</span></span>
          <p style={{fontSize: '14px', marginTop: '-10px', color: '#94a3b8', marginBottom: '30px'}}>Sans engagement. Facturation simple.</p>
          <Link href="/register" passHref legacyBehavior>
            <a className="cta-main" style={{padding: '18px 40px'}}>Créer mon compte maintenant</a>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <p>© 2026 Major Marc - L'excellence de la conciergerie automatisée.</p>
      </footer>
    </div>
  );
            }
        
