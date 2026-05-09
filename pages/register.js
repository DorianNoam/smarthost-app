import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Inscription Auth
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
    });

    if (error) {
      alert("Erreur : " + error.message);
      setLoading(false);
      return;
    }

    // 2. Création du profil & Redirection immédiate
    if (data.user) {
      await supabase.from('profiles').insert([
        { id: data.user.id, email: email, active_licenses: 0 }
      ]);
      // On l'envoie direct configurer sa villa sans passer par le login
      router.push('/add-property?first=true');
    }
  };

  return (
    <div className="auth-container">
      <style jsx>{`
        .auth-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #fdfbf7; font-family: 'Inter', sans-serif; }
        .auth-box { background: white; padding: 40px; border-radius: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); width: 100%; max-width: 400px; text-align: center; }
        h1 { color: #1a2a6c; margin-bottom: 10px; font-weight: 800; font-size: 24px; }
        p { color: #64748b; margin-bottom: 30px; font-size: 14px; }
        input { width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #e2e8f0; border-radius: 12px; box-sizing: border-box; font-size: 16px; }
        button { width: 100%; padding: 14px; background: #1a2a6c; color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.3s; }
        button:hover { background: #fbbf24; color: #1a2a6c; }
        .footer-link { margin-top: 20px; color: #64748b; font-size: 14px; }
      `}</style>
      
      <div className="auth-box">
        <h1>Bienvenue chez Major Marc 🎩</h1>
        <p>Créez votre compte pour commencer la configuration.</p>
        <form onSubmit={handleSignUp}>
          <input type="email" placeholder="Votre email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button disabled={loading}>{loading ? 'Création...' : 'Accéder à ma Villa'}</button>
        </form>
        <div className="footer-link">
          Déjà un compte ? <Link href="/login">Se connecter</Link>
        </div>
      </div>
    </div>
  );
}
