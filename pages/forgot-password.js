import { useState } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      setError("Erreur : " + error.message);
    } else {
      setMessage("Vérifiez votre boîte mail ! Un lien de réinitialisation vous a été envoyé.");
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <style jsx>{`
        .container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #1a2a6c; font-family: 'Montserrat', sans-serif; padding: 20px; }
        .box { background: white; width: 100%; max-width: 400px; padding: 50px 40px; border-radius: 30px; text-align: center; }
        h1 { color: #1a2a6c; font-size: 24px; margin-bottom: 20px; }
        p { color: #666; font-size: 14px; margin-bottom: 30px; line-height: 1.5; }
        input { width: 100%; padding: 15px; border: 1px solid #eee; border-radius: 12px; background: #f9f9f9; margin-bottom: 20px; box-sizing: border-box; outline: none; }
        .btn { background: #d4af37; color: #1a2a6c; border: none; padding: 18px; border-radius: 50px; width: 100%; font-weight: 700; cursor: pointer; transition: 0.3s; }
        .btn:disabled { opacity: 0.5; }
        .success { color: #059669; background: #ecfdf5; padding: 15px; border-radius: 10px; font-size: 13px; margin-bottom: 20px; }
        .error { color: #b91c1c; background: #fee2e2; padding: 15px; border-radius: 10px; font-size: 13px; margin-bottom: 20px; }
        .back { display: block; margin-top: 25px; color: #64748b; font-size: 13px; text-decoration: none; }
      `}</style>

      <div className="box">
        <h1>Réinitialisation</h1>
        <p>Entrez votre email pour recevoir un lien de réinitialisation sécurisé.</p>

        {message && <div className="success">{message}</div>}
        {error && <div className="error">{error}</div>}

        {!message && (
          <form onSubmit={handleResetRequest}>
            <input 
              type="email" 
              placeholder="votre@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Envoi...' : 'Envoyer le lien'}
            </button>
          </form>
        )}

        <Link href="/login" className="back">← Retour à la connexion</Link>
      </div>
    </div>
  );
}
