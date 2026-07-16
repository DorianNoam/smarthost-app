// pages/owner/register.js
// Page de creation de compte proprietaire via invitation.

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabase';

export default function OwnerRegister() {
  const router = useRouter();
  const { token, email } = router.query;

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState(null);
  const [ownerName, setOwnerName] = useState('');
  const [valid, setValid] = useState(false);

  useEffect(() => {
    if (token && email) validateToken();
  }, [token, email]);

  const validateToken = async () => {
    setValidating(true);
    try {
      const res = await fetch('/api/owner/validate-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email: decodeURIComponent(email) }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        if (data.reason === 'already_accepted') { router.push('/owner/login'); return; }
        setError("Lien d'invitation invalide ou expire.");
        setValid(false);
      } else {
        setOwnerName(data.ownerName || '');
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
    if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caracteres.'); return; }
    if (password !== passwordConfirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/owner/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email: decodeURIComponent(email), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la creation du compte');

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: decodeURIComponent(email),
        password,
      });
      if (loginError) throw loginError;
      router.push('/owner/dashboard');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>Creer mon compte proprietaire — Alfred Major</title>
        <meta name="robots" content="noindex" />
      </Head>
      <style jsx>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #0f172a; font-family: 'Inter', sans-serif; }
        .container { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; background: #0f172a; }
        .header { text-align: center; margin-bottom: 36px; }
        .logo { font-size: 56px; display: block; margin-bottom: 14px; }
        .brand { font-size: 28px; font-weight: 900; color: white; }
        .gold { color: #d4af37; }
        .card { background: white; border-radius: 24px; padding: 36px 32px; width: 100%; max-width: 420px; }
        .card-title { font-size: 22px; font-weight: 800; color: #1a2a6c; margin-bottom: 6px; }
        .card-sub { font-size: 14px; color: #64748b; margin-bottom: 28px; }
        label { display: block; font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 6px; }
        input { width: 100%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; font-size: 15px; color: #1e293b; margin-bottom: 18px; font-family: inherit; outline: none; }
        input:focus { border-color: #1a2a6c; }
        .error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 12px; border-radius: 10px; font-size: 13px; margin-bottom: 16px; }
        .btn { width: 100%; background: #1a2a6c; color: white; border: none; border-radius: 14px; padding: 16px; font-size: 16px; font-weight: 800; cursor: pointer; font-family: inherit; }
        .btn:disabled { background: #94a3b8; cursor: not-allowed; }
      `}</style>
      <div className="header">
        <span className="logo">🎩</span>
        <div className="brand">Alfred<span className="gold">Major</span></div>
      </div>
      <div className="card">
        {validating ? (
          <p style={{ textAlign: 'center', color: '#64748b' }}>Validation du lien...</p>
        ) : !valid ? (
          <>
            <div className="card-title">Lien invalide</div>
            <div className="error">{error || "Ce lien d'invitation est invalide ou a expire."}</div>
          </>
        ) : (
          <>
            <div className="card-title">Bonjour {ownerName} 👋</div>
            <div className="card-sub">Definissez votre mot de passe pour acceder a votre espace proprietaire.</div>
            {error && <div className="error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <label>Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="8 caracteres minimum" autoComplete="new-password" />
              <label>Confirmer le mot de passe</label>
              <input type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} placeholder="Repetez votre mot de passe" autoComplete="new-password" />
              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Creation du compte...' : 'Creer mon compte →'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
