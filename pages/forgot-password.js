import { useState } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Un lien de réinitialisation a été envoyé sur votre boîte mail !' });
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
        .success { color: #059669; font-size: 14px; margin-bottom: 15px; }
        .error { color: #dc2626; font-size: 14px; margin-bottom: 15px; }
      `}</style>

      <div className="card">
        <h1>Mot de passe oublié</h1>
        {message && <div className={message.type}>{message.text}</div>}
        
        <form onSubmit={handleReset}>
          <input 
            type="email" 
            placeholder="Votre adresse email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Envoi en cours...' : 'Recevoir le lien'}
          </button>
        </form>
        
        <Link href="/login" style={{marginTop: '20px', display: 'block', color: '#999', fontSize: '13px'}}>
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
