// pages/cleaner/register.js
// Page de création de compte pour les prestataires de ménage.
// Accessible uniquement via le lien d'invitation envoyé par email.
// CORRECTIF : validation du token via API server-side (RLS bloque la lecture anon).

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabase';

export default function CleanerRegister() {
  const router = useRouter();
  const { token, email } = router.query;

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState(null);
  const [cleanerName, setCleanerName] = useState('');
  const [valid, setValid] = useState(false);

  useEffect(() => {
    if (token && email) validateToken();
  }, [token, email]);

  const validateToken = async () => {
    setValidating(true);
    try {
      const res = await fetch('/api/cleaning/validate-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          email: decodeURIComponent(email),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.valid) {
        if (data.reason === 'already_accepted') {
          router.push('/cleaner/login');
          return;
        }
        setError("Lien d'invitation invalide ou expiré.");
        setValid(false);
      } else {
        setCleanerName(data.cleanerName || '');
        setValid(true);
      }
    } catch (err) {
      setError('Erreur lors de la validation du lien.');
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return; }
    if (password !== passwordConfirm) { setError('Les mots de passe ne correspondent pas.'); return; }

    setLoading(true);
    setError(null);

    try {
      // 1. Définir le mot de passe via l'API server-side
      const res = await fetch('/api/cleaning/set-cleaner-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          email: decodeURIComponent(email),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la création du compte');

      // 2. Se connecter avec le nouveau mot de passe
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: decodeURIComponent(email),
        password,
      });

      if (loginError) throw loginError;

      // 3. Rediriger vers le dashboard prestataire
      router.push('/cleaner/dashboard');

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>Créer mon compte — Alfred Major</title>
        <meta name="robots" content="noindex" />
      </Head>

      <style jsx>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #0f172a; font-family: 'Inter', sans-serif; }
        .container { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; background: #0f172a; }
        .header { text-align: center; margin-bottom: 36px; }
        .logo { font-size: 56px; display: block; margin-bottom: 14px; }
        .brand { font-size: 28px; font-weight: 900; color: white; letter-spacing: -0.5px; }
        .gold { color: #d4af37; }
        .card { background: white; border-radius: 24px; padding: 36px 32px; width: 100%; max-width: 420px; }
        .card-title { font-size: 22px; font-weight: 800; color: #1a2a6c; margin-bottom: 6px; }
        .card-sub { font-size: 14px; color: #64748b; margin-bottom: 28px; line-height: 1.5; }
        label { display: block; font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 6px; }
        input { width: 100%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; font-size: 15px; color: #1e293b; margin-bottom: 18px; font-family: inherit; outline: none; transition: 0.2s; }
        input:focus { border-color: #1a2a6c; box-shadow: 0 0 0 3px rgba(26,42,108,0.1); }
        .error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 12px; border-radius: 10px; font-size: 13px; margin-bottom: 16px; }
        .btn { width: 100%; background: #1a2a6c; color: white; border: none; border-radius: 14px; padding: 16px; font-size: 16px; font-weight: 800; cursor: pointer; font-family: inherit; transition: 0.3s; }
        .btn:hover:not(:disabled) { background: #1e3280; }
        .btn:disabled { background: #94a3b8; cursor: not-allowed; }
        .loading-text { text-align: center; color: #64748b; font-size: 14px; }
      `}</style>

      <div className="header">
        <span className="logo">🎩</span>
        <div className="brand">Alfred<span className="gold">Major</span></div>
      </div>

      <div className="card">
        {validating ? (
          <p className="loading-text">Validation du lien...</p>
        ) : !valid ? (
          <>
            <div className="card-title">Lien invalide</div>
            <div className="error">{error || "Ce lien d'invitation est invalide ou a expiré."}</div>
          </>
        ) : (
          <>
            <div className="card-title">Bonjour {cleanerName} 👋</div>
            <div className="card-sub">Définissez votre mot de passe pour accéder à votre espace prestataire Alfred Major.</div>

            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <label>Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="8 caractères minimum"
                autoComplete="new-password"
              />
              <label>Confirmer le mot de passe</label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={e => setPasswordConfirm(e.target.value)}
                placeholder="Répétez votre mot de passe"
                autoComplete="new-password"
              />
              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Création du compte...' : 'Créer mon compte →'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
