import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

export default function Pricing() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Vérification de la connexion
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  const handleCheckout = async () => {
    if (!user) {
      router.push('/register');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: user.email, userId: user.id }),
      });
      
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; 
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
      <Head>
        <title>Tarifs | alfred major</title>
        <meta name="description" content="Découvrez le tarif de alfred major, votre majordome IA pour location courte durée. Sans engagement, 1er mois offert." />
      </Head>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

        :global(html), :global(body) { margin: 0; padding: 0; overflow-x: hidden; width: 100%; background-color: #f8fafc; }
        .container { font-family: 'Inter', sans-serif; color: #0f172a; min-height: 100vh; display: flex; flex-direction: column; }
        
        /* --- NAVBAR --- */
        nav { 
          display: flex; justify-content: space-between; align-items: center; padding: 15px 5%; 
          position: fixed; top: 0; left: 0; right: 0; background: rgba(255, 255, 255, 0.95); 
          backdrop-filter: blur(10px); z-index: 1000; box-shadow: 0 1px 10px rgba(0,0,0,0.05); box-sizing: border-box; 
        }
        .brand { display: flex; align-items: center; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 24px; font-weight: 800; color: #1a2a6c; text-decoration: none; letter-spacing: -0.5px; }
        .gold { color: #d4af37; }
        .nav-back { color: #64748b; font-weight: 600; text-decoration: none; font-size: 14px; transition: 0.3s; }
        .nav-back:hover { color: #1a2a6c; }
        
        /* --- HEADER --- */
        .pricing-header { padding: 150px 20px 60px; text-align: center; }
        h1 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: clamp(32px, 5vw, 48px); margin-bottom: 20px; font-weight: 800; color: #0f172a; letter-spacing: -1px; }
        .subtitle { max-width: 600px; margin: 0 auto; color: #475569; line-height: 1.6; font-size: 18px; }
        
        /* --- PRICING CARD --- */
        .pricing-wrapper { display: flex; justify-content: center; padding: 0 20px 80px; flex-grow: 1; }
        
        .price-card { 
          background: white; padding: 50px 40px; border-radius: 24px; 
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1); text-align: center; 
          border: 2px solid #d4af37; position: relative; width: 100%; max-width: 420px; 
          display: flex; flex-direction: column; 
        }
        
        .badge-free {
          position: absolute; top: -18px; left: 50%; transform: translateX(-50%);
          background: #d4af37; color: #1a2a6c; padding: 8px 24px; border-radius: 30px;
          font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;
          box-shadow: 0 10px 20px rgba(212, 175, 55, 0.3); white-space: nowrap;
        }

        .plan-name { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 22px; color: #1a2a6c; margin-bottom: 15px; }
        .price { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 56px; font-weight: 800; color: #0f172a; letter-spacing: -2px; margin-bottom: 5px; }
        .price span { font-size: 18px; font-weight: 600; color: #64748b; letter-spacing: 0; }
        .billing-cycle { color: #64748b; font-size: 14px; margin-bottom: 30px; font-weight: 500; }
        
        .features-list { text-align: left; margin-bottom: 40px; flex-grow: 1; border-top: 1px solid #e2e8f0; padding-top: 30px; }
        .feature { margin-bottom: 18px; font-size: 15px; display: flex; align-items: center; gap: 12px; color: #1e293b; font-weight: 500; }
        .check-icon { 
          background: rgba(212, 175, 55, 0.15); color: #d4af37; width: 24px; height: 24px; 
          border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; 
        }
        
        .cta-pricing { 
          background: #1a2a6c; color: white; padding: 18px; border-radius: 16px; 
          font-weight: 700; font-size: 16px; transition: 0.3s; border: none; cursor: pointer; width: 100%;
        }
        .cta-pricing:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(26, 42, 108, 0.2); background: #1e3280; }
        .cta-pricing:disabled { background: #94a3b8; cursor: not-allowed; transform: none; box-shadow: none; }
        
        .guarantee { margin-top: 20px; font-size: 13px; color: #64748b; display: flex; align-items: center; justify-content: center; gap: 8px; }

        footer { padding: 40px; text-align: center; font-size: 14px; color: #94a3b8; }

        @media (max-width: 600px) {
          .pricing-header { padding: 120px 15px 40px; }
          .price-card { padding: 40px 25px; }
          .price { font-size: 48px; }
        }
      `}</style>

      <nav>
        <Link href="/" className="brand">
          Major<span className="gold">Marc</span>
        </Link>
        <Link href="/" className="nav-back">← Retour à l'accueil</Link>
      </nav>

      <header className="pricing-header">
        <h1>L'excellence accessible.</h1>
        <p className="subtitle">Bénéficiez d'un majordome privé disponible 24h/24 pour vos voyageurs, sans les 20% de frais d'une agence classique.</p>
      </header>

      <div className="pricing-wrapper">
        <div className="price-card">
          <div className="badge-free">🎁 Votre 1er mois offert</div>
          <div className="plan-name">Licence Unique</div>
          
          <div className="price">19,90€<span>/mois</span></div>
          
          <div className="billing-cycle">Facturé par logement. Sans engagement.</div>
          
          <div className="features-list">
            <div className="feature">
              <div className="check-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
              Majordome IA disponible 24h/24
            </div>
            <div className="feature">
              <div className="check-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
              Traduction automatique (30+ langues)
            </div>
            <div className="feature">
              <div className="check-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
              Recherche locale web intégrée
            </div>
            <div className="feature">
              <div className="check-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
              Alerte urgence en direct sur Telegram
            </div>
            <div className="feature">
              <div className="check-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
              Lien web personnalisé pour vos clients
            </div>
          </div>

          <button 
            className="cta-pricing" 
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? 'Redirection sécurisée...' : (user ? 'Activer mon 1er mois offert' : 'Créer mon compte (1er mois offert)')}
          </button>
          
          <div className="guarantee">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            Paiement sécurisé via Stripe
          </div>
        </div>
      </div>
      
      <footer>© 2026 alfred major - Tous droits réservés.</footer>
    </div>
  );
}
