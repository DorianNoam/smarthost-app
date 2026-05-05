import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Register() {
  const router = useRouter();
  const { plan } = router.query;

  const planNames = {
    solo: "Solo (1 logement)",
    multi: "Multi-Prestige (5 logements)",
    empire: "Empire LCD (15 logements)"
  };

  return (
    <div className="container">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@300;400;600;700&display=swap');

        .container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1a2a6c;
          font-family: 'Montserrat', sans-serif;
          padding: 20px;
        }

        .register-box {
          background: white;
          width: 100%;
          max-width: 450px;
          padding: 50px 40px;
          border-radius: 30px;
          box-shadow: 0 25px 50px rgba(0,0,0,0.2);
          text-align: center;
        }

        h1 { font-family: 'Playfair Display', serif; color: #1a2a6c; margin-bottom: 10px; font-size: 28px; }
        .gold { color: #d4af37; }
        
        .plan-summary {
          background: #fdfbf7;
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 30px;
          font-size: 14px;
          border: 1px solid #eee;
          color: #555;
        }

        form { display: flex; flex-direction: column; gap: 20px; }

        .input-group { text-align: left; }
        label { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #999; margin-bottom: 8px; display: block; }
        
        input {
          width: 100%;
          padding: 15px;
          border: 1px solid #eee;
          border-radius: 12px;
          background: #f9f9f9;
          font-size: 16px;
          outline: none;
          transition: 0.3s;
          box-sizing: border-box;
        }

        input:focus { border-color: #d4af37; background: white; }

        .btn-register {
          background: #d4af37;
          color: #1a2a6c;
          border: none;
          padding: 18px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: 0.3s;
          margin-top: 10px;
        }

        .btn-register:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(212, 175, 55, 0.3); }

        .footer-links { margin-top: 25px; font-size: 14px; color: #777; }
        .footer-links a { color: #1a2a6c; font-weight: 600; text-decoration: none; }
      `}</style>

      <div className="register-box">
        <Link href="/" style={{textDecoration: 'none'}}>
          <h1>Major<span className="gold">Marc</span></h1>
        </Link>
        <p style={{marginBottom: '20px', color: '#666'}}>Créez votre espace hôte</p>

        {plan && (
          <div className="plan-summary">
            Plan sélectionné : <b>{planNames[plan] || plan}</b>
          </div>
        )}

        <form>
          <div className="input-group">
            <label>Nom Complet</label>
            <input type="text" placeholder="Jean Dupont" required />
          </div>

          <div className="input-group">
            <label>Adresse Email</label>
            <input type="email" placeholder="jean@exemple.com" required />
          </div>

          <div className="input-group">
            <label>Mot de passe</label>
            <input type="password" placeholder="••••••••" required />
          </div>

         <Link href="/dashboard" className="btn-register" style={{ display: 'block', textDecoration: 'none' }}>
  Commencer mon essai
</Link>
        </form>

        <div className="footer-links">
          Déjà inscrit ? <Link href="/login">Se connecter</Link>
        </div>
      </div>
    </div>
  );
}
