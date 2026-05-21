import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase'; 

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([{ 
            id: authData.user.id, 
            full_name: fullName, 
            email: email,
            active_licenses: 0 
          }], { onConflict: 'email' });

        if (profileError) throw profileError;
        
        router.push('/add-property?first=true');
      }
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>Créer un compte — Alfred Major | Majordome IA pour locations</title>
        <meta name="description" content="Créez votre compte Alfred Major gratuitement. Configurez votre majordome IA en 5 minutes et déléguez la gestion de vos voyageurs 24h/24." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.alfredmajor.com/register" />
        <meta property="og:title" content="Créer un compte Alfred Major — Majordome IA pour locations" />
        <meta property="og:description" content="Inscription gratuite. Configurez votre majordome IA en 5 minutes. Premier mois offert, sans engagement." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.alfredmajor.com/register" />
        <meta property="og:image" content="https://www.alfredmajor.com/og-image.jpg" />
        <meta property="og:locale" content="fr_FR" />
        <meta property="og:site_name" content="Alfred Major" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Créer un compte Alfred Major" />
        <meta name="twitter:description" content="Inscription gratuite. Premier mois offert, sans engagement." />
        <meta name="twitter:image" content="https://www.alfredmajor.com/og-image.jpg" />
      </Head>
      <style jsx>{`
        .container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #1a2a6c; font-family: 'Montserrat', sans-serif; padding: 20px; }
        .register-box { background: white; width: 100%; max-width: 450px; padding: 50px 40px; border-radius: 30px; box-shadow: 0 25px 50px rgba(0,0,0,0.2); text-align: center; }
        h1 { color: #1a2a6c; margin-bottom: 10px; font-weight: 800; }
        .gold { color: #d4af37; }
        form { display: flex; flex-direction: column; gap: 15px; margin-top: 25px; }
        label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #999; text-align: left; display: block; }
        input { width: 100%; padding: 12px; border: 1px solid #eee; border-radius: 10px; background: #f9f9f9; box-sizing: border-box; }
        .btn-register { background: #d4af37; color: #1a2a6c; border: none; padding: 15px; border-radius: 50px; font-weight: 700; cursor: pointer; margin-top: 10px; }
        .error-msg { background: #fee2e2; color: #b91c1c; padding: 10px; border-radius: 8px; font-size: 13px; margin-bottom: 15px; }
      `}</style>

      <div className="register-box">
        <Link href="/" legacyBehavior>
          <a style={{textDecoration: 'none'}}><h1>Alfred<span className="gold">Major</span></h1></a>
        </Link>
        <form onSubmit={handleRegister}>
          {error && <div className="error-msg">{error}</div>}
          <label>Nom complet</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label>Mot de passe</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" className="btn-register" disabled={loading}>
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>
      </div>
    </div>
  );
}
