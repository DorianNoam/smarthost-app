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

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      alert("Erreur : " + error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from('profiles').insert([{ id: data.user.id, email: email, active_licenses: 0 }]);
      // Redirection immédiate pour engager le client
      router.push('/add-property?first=true');
    }
  };

  return (
    <div className="auth-container">
      <style jsx>{`
        .auth-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #fdfbf7; font-family: 'Inter', sans-serif; }
        .auth-box { background: white; padding: 40px; border-radius: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); width: 100%; max-width: 400px; text-align: center; }
        h1 { color: #1a2a6c; margin-bottom: 30px; font-weight: 800; font-size: 24px; }
        input { width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #e2e8f0; border-radius: 12px; width: 100%; box-sizing: border-box; }
        button { width: 100%; padding: 14px; background: #1a2a6c; color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; }
      `}</style>
      <div className="auth-box">
        <h1>Bienvenue chez Major Marc 🎩</h1>
        <form onSubmit={handleSignUp}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button disabled={loading}>{loading ? 'Création...' : 'Accéder à mon Dashboard'}</button>
        </form>
      </div>
    </div>
  );
}
