import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function UpdatePassword() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // Mise à jour du mot de passe dans Supabase
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setError("Erreur : " + error.message);
      setLoading(false);
    } else {
      setMessage("Mot de passe mis à jour avec succès ! Redirection...");
      // On redirige vers le dashboard après 2 secondes
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>Nouveau mot de passe | alfred major</title>
      </Head>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@400;600;700&display=swap');
        
        .container { 
          min-height: 100vh; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          background: #1a2a6c; 
          font-family: 'Montserrat', sans-serif; 
          padding: 20px; 
        }
        
        .box { 
          background: white; 
          width: 100%; 
          max-width: 400px; 
          padding: 50px 40px; 
          border-radius: 30px; 
          box-shadow: 0 25px 50px rgba(0,0,0,0.2); 
          text-align: center; 
        }
        
        h1 { 
          font-family: 'Playfair Display', serif; 
          color: #1a2a6c; 
          font-size: 26px; 
          margin-bottom: 10px; 
        }
        
        p { 
          color: #64748b; 
          font-size: 14px; 
          margin-bottom: 30px; 
          line-height: 1.5; 
        }
        
        form { 
          display: flex; 
          flex-direction: column; 
          gap: 20px; 
        }
        
        .input-group { text-align: left; }
        
        label { 
          font-size: 11px; 
          font-weight: 700; 
          text-transform: uppercase; 
          color: #94a3b8; 
          margin-bottom: 8px; 
          display: block; 
          letter-spacing: 1px;
        }
        
        input { 
          width: 100%; 
          padding: 15px; 
          border: 1px solid #e2e8f0; 
          border-radius: 12px; 
          background: #f8fafc; 
          font-size: 15px; 
          outline: none; 
          box-sizing: border-box; 
          transition: 0.2s;
        }
        
        input:focus { border-color: #d4af37; background: white; }
        
        .btn-update { 
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
        }
        
        .btn-update:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .success-msg { 
          background: #ecfdf5; 
          color: #059669; 
          padding: 12px; 
          border-radius: 10px; 
          font-size: 13px; 
          font-weight: 600;
          margin-bottom: 20px; 
        }
        
        .error-msg { 
          background: #fee2e2; 
          color: #b91c1c; 
          padding: 12px; 
          border-radius: 10px; 
          font-size: 13px; 
          margin-bottom: 20px; 
        }
      `}</style>

      <div className="box">
        <h1>Sécurisez votre compte</h1>
        <p>Veuillez choisir un nouveau mot de passe robuste pour votre accès alfred major.</p>

        {message && <div className="success-msg">{message}</div>}
        {error && <div className="error-msg">{error}</div>}

        {!message && (
          <form onSubmit={handlePasswordUpdate}>
            <div className="input-group">
              <label>Nouveau mot de passe</label>
              <input 
                type="password" 
                placeholder="Minimum 6 caractères" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required 
                minLength={6}
              />
            </div>

            <button type="submit" className="btn-update" disabled={loading}>
              {loading ? 'Mise à jour...' : 'Enregistrer le mot de passe'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
