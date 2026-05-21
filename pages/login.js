import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import Head from 'next/head';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Identifiants invalides ou compte non confirmé.");
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="container">
      <Head>
        <title>Connexion — Alfred Major | Espace Hôte</title>
        <meta name="description" content="Connectez-vous à votre espace hôte Alfred Major pour gérer vos logements, consulter les conversations voyageurs et configurer votre majordome IA." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.alfredmajor.com/login" />
        <meta property="og:title" content="Connexion — Alfred Major | Espace Hôte" />
        <meta property="og:description" content="Accédez à votre tableau de bord Alfred Major pour gérer vos logements et votre majordome IA." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.alfredmajor.com/login" />
        <meta property="og:image" content="https://www.alfredmajor.com/og-image.jpg" />
        <meta property="og:locale" content="fr_FR" />
        <meta property="og:site_name" content="Alfred Major" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Connexion — Alfred Major" />
        <meta name="twitter:image" content="https://www.alfredmajor.com/og-image.jpg" />
      </Head>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@300;400;600;700&display=swap');
        :global(a) { text-decoration: none; color: inherit; }
        .container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #1a2a6c; font-family: 'Montserrat', sans-serif; padding: 20px; }
        .login-box { background: white; width: 100%; max-width: 400px; padding: 50px 40px; border-radius: 30px; box-shadow: 0 25px 50px rgba(0,0,0,0.2); text-align: center; }
        h1 { font-family: 'Playfair Display', serif; color: #1a2a6c; margin-bottom: 5px; font-size: 28px; cursor: pointer; }
        .gold { color: #d4af37; }
        form { display: flex; flex-direction: column; gap: 20px; margin-top: 30px; }
        .input-group { text-align: left; position: relative; }
        label { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #999; margin-bottom: 8px; display: block; }
        input { width: 100%; padding: 15px; border: 1px solid #eee; border-radius: 12px; background: #f9f9f9; font-size: 15px; outline: none; box-sizing: border-box; }
        input:focus { border-color: #d4af37; background: white; }
        
        .forgot-link { 
          display: block; text-align: right; font-size: 12px; color: #64748b; 
          margin-top: 8px; font-weight: 500; transition: 0.2s;
        }
        .forgot-link:hover { color: #1a2a6c; text-decoration: underline; }

        .btn-login { background-color: #d4af37; color: #1a2a6c; border: none; padding: 18px; border-radius: 50px; font-weight: 700; font-size: 16px; cursor: pointer; transition: 0.3s; margin-top: 10px; }
        .btn-login:hover { background-color: #e5c158; transform: translateY(-2px); }
        .btn-login:disabled { opacity: 0.5; cursor: not-allowed; }
        .error-msg { background: #fee2e2; color: #b91c1c; padding: 10px; border-radius: 8px; font-size: 13px; margin-bottom: 15px; }
        .footer-links { margin-top: 30px; font-size: 13px; color: #777; }
      `}</style>

      <div className="login-box">
        <Link href="/">
          <h1>Alfred<span className="gold">Major</span></h1>
        </Link>
        <p style={{color: '#666'}}>Ravi de vous revoir.</p>

        <form onSubmit={handleLogin}>
          {error && <div className="error-msg">{error}</div>}
          
          <div className="input-group">
            <label>Email</label>
            <input 
              type="email" 
              placeholder="votre@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="input-group">
            <label>Mot de passe</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            <Link href="/forgot-password">
              <span className="forgot-link">Mot de passe oublié ?</span>
            </Link>
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="footer-links">
          Pas encore de compte ? <br/><br/>
          <Link href="/register" style={{color: '#1a2a6c', fontWeight: '700'}}>
            Créer mon espace hôte
          </Link>
        </div>
      </div>
    </div>
  );
}
