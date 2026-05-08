import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Pricing() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // On vérifie si l'utilisateur est connecté pour la logique du bouton
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  const handleCheckout = async () => {
    // Si pas connecté, on redirige vers l'inscription
    if (!user) {
      router.push('/register');
      return;
    }

    setLoading(true);
    try {
      // Appel à l'API Stripe
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: user.email, userId: user.id }),
      });
      
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Go vers Stripe
      } else {
        console.error("Erreur API:", data.error);
        alert("Erreur lors de l'initialisation du paiement.");
      }
    } catch (err) {
      console.error("Erreur réseau:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Montserrat:wght@300;400;600;700&display=swap');

        :global(html), :global(body) { margin: 0; padding: 0; overflow-x: hidden; width: 100%; }
        .container { font-family: 'Montserrat', sans-serif; color: #1a2a6c; background: #fdfbf7; min-height: 100vh; }
        
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
        
        .brand { display: flex; align-items: center; font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; color: #1a2a6c !important; text-decoration: none; }
        .gold { color: #d4af37; }
        .nav-back { color: #555; font-weight: 600; text-decoration: none; font-size: 14px; transition: 0.3s; }
        .nav-back:hover { color: #1a2a6c; }
        
        .pricing-header { padding: 150px 20px 60px; text-align: center; background: white; }
        h1 { font-family: 'Playfair Display', serif; font-size: clamp(32px, 5vw, 48px); margin-bottom: 20px; }
        .subtitle { max-width: 700px; margin: 0 auto; color: #555; line-height: 1.6; }
        
        .pricing-wrapper { 
          display: flex; 
          justify-content: center; 
          max-width: 1200px; 
          margin: -50px auto 80px; 
          padding: 0 20px; 
        }
        
        .price-card { 
          background: white; 
          padding: 50px 40px; 
          border-radius: 20px; 
          box-shadow: 0 20px 40px rgba(0,0,0,0.08); 
          text-align: center; 
          border: 2px solid #d4af37; /* Mise en avant de l'offre unique */
          transition: 0.3s; 
          display: flex; 
          flex-direction: column; 
          position: relative; 
          width: 100%;
          max-width: 450px;
        }
        
        .plan-name { font-weight: 700; text-transform: uppercase; letter-spacing: 2px; font-size: 13px; color: #d4af37; margin-bottom: 15px; }
        .price { font-family: 'Playfair Display', serif; font-size: 52px; font-weight: 700; margin-bottom: 5px; color: #1a2a6c; }
        .price span { font-size: 18px; font-weight: 400; color: #777; }
        .billing-cycle { color: #555; font-size: 14px; margin-bottom: 20px; }
        
        .features-list { text-align: left; margin-bottom: 40px; flex-grow: 1; border-top: 1px solid #f9f9f9; padding-top: 30px; }
        .feature { margin-bottom: 18px; font-size: 15px; display: flex; align-items: center; gap: 12px; color: #333; }
        .check { color: #d4af37; font-weight: bold; font-size: 18px; }
        
        .cta-pricing { 
          background: #d4af37; 
          color: #1a2a6c; 
          padding: 18px; 
          border-radius: 50px; 
          text-decoration: none; 
          font-weight: 700; 
          font-size: 16px;
          transition: 0.3s; 
          text-align: center; 
          border: none;
          cursor: pointer;
          font-family: 'Montserrat', sans-serif;
          width: 100%;
        }
        .cta-pricing:hover:not(:disabled) { background: #e5c158; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(212, 175, 55, 0.2); }
        .cta-pricing:disabled { background: #ccc; color: #666; cursor: not-allowed; transform: none; box-shadow: none; }
        
        footer { padding: 40px; text-align: center; background: #fdfbf7; font-size: 13px; color: #777; }
      `}</style>

      <nav>
        <Link href="/" className="brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2.5" style={{marginRight: '10px'}}>
            <path d="M22 17H2a1 1 0 0 1-1-1v-1a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1z"/><path d="M12 4a8 8 0 0 0-8 8h16a8 8 0 0 0-8-8z"/><circle cx="12" cy="3" r="1.5" fill="#d4af37"/>
          </svg>
          Major<span className="gold">Marc</span>
        </Link>
        <Link href="/" className="nav-back">← Accueil</Link>
      </nav>

      <header className="pricing-header">
        <h1>Investissez dans votre <span className="gold">Sérénité</span></h1>
        <p className="subtitle">L'excellence au service de vos voyageurs, sans barrière de la langue. <br/>Une tarification simple, par logement.</p>
      </header>

      <div className="pricing-wrapper">
        <div className="price-card">
          <div className="plan-name">Forfait Unique</div>
          <div className="price">24,90€<span>/mois</span></div>
          <div className="billing-cycle">Sans aucun engagement.</div>
          
          <div className="features-list">
            <div className="feature"><span className="check">✔</span> Majordome IA 24h/24</div>
            <div className="feature"><span className="check">✔</span> Traduction multi-langues automatique</div>
            <div className="feature"><span className="check">✔</span> Alertes d'urgence sur Telegram</div>
            <div className="feature"><span className="check">✔</span> Recherche web locale intégrée</div>
            <div className="feature"><span className="check">✔</span> Lien de Conciergerie Privé</div>
          </div>

          <button 
            className="cta-pricing" 
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? 'Redirection en cours...' : (user ? 'Activer mon Majordome' : 'Démarrer maintenant')}
          </button>
        </div>
      </div>
      
      <footer>© 2026 MajorMarc - L'élégance technologique pour vos séjours.</footer>
    </div>
  );
}
