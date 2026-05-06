import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const router = useRouter();

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Mot de passe mis à jour ! Redirection...' });
      setTimeout(() => router.push('/login'), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <style jsx>{`
        .container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #1a2a6c; font-family: 'Montserrat', sans-serif; }
        .card { background: white; padding: 40px; border-radius: 25px; width: 100%; max-width: 400px; text-align: center; }
        h1 { font-family: 'Playfair Display', serif; color: #1a2a6c; margin-bottom: 20px; }
        form { display: flex; flex-direction: column; gap: 15px; }
        input { padding: 15px; border: 1px solid #eee; border-radius: 12px; outline: none; }
        .btn { background: #d4af37; color: #1a2a6c; padding: 15px; border-radius: 50px; border: none; font-weight: 700; cursor: pointer; }
      `}</style>

      <div className="card">
        <h1>Nouveau mot de passe</h1>
        {message && <div style={{color: message.type === 'error' ? 'red' : 'green', marginBottom: '15px'}}>{message.text}</div>}
        <form onSubmit={handleUpdatePassword}>
          <input 
            type="password" 
            placeholder="Nouveau mot de passe" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Mise à jour...' : 'Valider le changement'}
          </button>
        </form>
      </div>
    </div>
  );
}
