import Link from 'next/link';

export default function Login() {
  return (
    <div className="container">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@300;400;600;700&display=swap');

        /* RESET GLOBAL DES LIENS */
        :global(a) { text-decoration: none; color: inherit; }
        :global(html), :global(body) { margin: 0; padding: 0; width: 100%; }

        .container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1a2a6c;
          font-family: 'Montserrat', sans-serif;
          padding: 20px;
        }

        .login-box {
          background: white;
          width: 100%;
          max-width: 400px;
          padding: 50px 40px;
          border-radius: 30px;
          box-shadow: 0 25px 50px rgba(0,0,0,0.2);
          text-align: center;
        }

        h1 { font-family: 'Playfair Display', serif; color: #1a2a6c; margin-bottom: 5px; font-size: 28px; }
        .gold { color: #d4af37; }
        
        form { display: flex; flex-direction: column; gap: 20px; margin-top: 30px; }

        .input-group { text-align: left; }
        label { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #999; margin-bottom: 8px; display: block; letter-spacing: 1px;}
        
        input {
          width: 100%;
          padding: 15px;
          border: 1px solid #eee;
          border-radius: 12px;
          background: #f9f9f9;
          font-size: 15px;
          outline: none;
          transition: 0.3s;
          box-sizing: border-box;
          font-family: 'Montserrat', sans-serif;
        }

        input:focus { border-color: #d4af37; background: white; }

        .btn-login {
          background-color: #d4af37;
          color: #1a2a6c;
          border: none;
          padding: 18px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: 0.3s;
          margin-top: 10px;
          display: block;
        }

        .btn-login:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(212, 175, 55, 0.3); background-color: #fff; border: 2px solid #d4af37;}

        .footer-links { margin-top: 30px; font-size: 13px; color: #777; }
        .footer-links a { color: #1a2a6c; font-weight: 700; }
        .footer-links a:hover { color: #d4af37; }
      `}</style>

      <div className="login-box">
        <Link href="/" passHref legacyBehavior>
          <a>
            <h1>Major<span className="gold">Marc</span></h1>
          </a>
        </Link>
        <p style={{color: '#666', fontSize: '15px'}}>Content de vous revoir.</p>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="input-group">
            <label>Adresse Email</label>
            <input type="email" placeholder="contact@exemple.com" required />
          </div>

          <div className="input-group">
            <label>Mot de passe</label>
            <input type="password" placeholder="••••••••" required />
          </div>

          {/* Ce bouton simule la connexion et t'envoie sur le Dashboard */}
          <Link href="/dashboard" passHref legacyBehavior>
            <a className="btn-login">
              Se connecter
            </a>
          </Link>
        </form>

        <div className="footer-links">
          Pas encore de compte ? <br/><br/>
          <Link href="/register" passHref legacyBehavior>
            <a>Créer mon espace hôte</a>
          </Link>
        </div>
      </div>
    </div>
  );
}
