import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase'; // On importe ton lien vers la base

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

    // 1. Création du compte dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // 2. Création de la ligne dans ta table 'profiles'
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          { 
            id: authData.user.id, 
            full_name: fullName,
            email: email
          }
        ]);

      if (profileError) {
        setError("Compte créé, mais erreur lors de la création du profil.");
      } else {
        // Succès ! Direction le dashboard
        router.push('/dashboard');
      }
    }
    setLoading(false);
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
        .btn-register:disabled { opacity: 0.5; cursor: not-allowed; }
        .error-msg { color: #e74c3c; font-size: 13px; margin-top: 10px; }
      `}</style>

      <div className="register-box">
        <h1>Devenir <span className="gold">Hôte</span></h1>
        <p style={{color: '#666'}}>Commencez votre expérience MajorMarc.</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label>Nom complet</label>
            <input type="text" placeholder="Jean Dupont" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Email professionnel</label>
            <input type="email" placeholder="jean@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Mot de passe</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <button type="submit" className="btn-register" disabled={loading}>
            {loading ? 'Création en cours...' : 'Créer mon espace prestige'}
          </button>
        </form>

        <p style={{marginTop: '20px', fontSize: '13px'}}>
          Déjà inscrit ? <Link href="/login" style={{color: '#1a2a6c', fontWeight: '700'}}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
