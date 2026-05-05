import { useState } from 'react';
import Link from 'next/link';
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
          .insert([{ id: authData.user.id, full_name: fullName, email: email }]);

        if (profileError) throw profileError;
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@300;400;600;700&display=swap');
        :global(a) { text-decoration: none; color: inherit; }
        .container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #1a2a6c; font-family: 'Montserrat', sans-serif; padding: 20px; }
        .register-box { background: white; width: 100%; max-width: 450px; padding: 50px 40px; border-radius: 30px; box-shadow: 0 25px 50px rgba(0,0,0,0.2); text-align: center; }
        h1 { font-family: 'Playfair Display', serif; color: #1a2a6c; margin-bottom: 10px; }
        .gold { color: #d4af37; }
        form { display: flex; flex-direction: column; gap: 15px; margin-top: 25px; }
        .input-group { text-align: left; }
        label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #999; margin-bottom: 5px; display: block; }
        input { width: 100%; padding: 12px; border: 1px solid #eee; border-radius: 10px; background: #f9f9f9; outline: none; box-sizing: border-box; }
        input:focus { border-color: #d4af37; }
        .btn-register { background: #d4af37; color: #1a2a6c; border: none; padding: 15px; border-radius: 50px; font-weight: 700; cursor: pointer; margin-top: 10px; }
        .btn-register:disabled { opacity: 0.5; }
        .error-msg { background: #fee2e2; color: #b91c1c; padding: 10px; border-radius: 8px; font-size: 13px; margin-bottom: 15px; }
      `}</style>

      <div className="register-box">
        <Link href="/" legacyBehavior passHref>
          <a style={{cursor: 'pointer'}}><h1>Major<span className="gold">Marc</span></h1></a>
        </Link>
        <form onSubmit={handleRegister}>
          {error && <div className="error-msg">{error}</div>}
          <div className="input-group">
            <label>Nom complet</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-register" disabled={loading}>
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>
        <p style={{marginTop: '25px', fontSize: '13px'}}>
          Déjà un compte ? <Link href="/login" style={{color: '#1a2a6c', fontWeight: '700'}}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
