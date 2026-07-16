// pages/owner/login.js
// Page de connexion proprietaire.

import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function OwnerLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      // Verifier le role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profile?.role !== 'owner') {
        await supabase.auth.signOut();
        throw new Error('Ce compte n\'est pas un compte proprietaire.');
      }

      router.push('/owner/dashboard');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>Espace Proprietaire — Alfred Major</title>
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
        .card-sub { font-size: 14px; color: #64748b; margin-bottom: 28px; }
        label { display: block; font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 6px; }
        input { width: 100%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; font-size: 15px; color: #1e293b; margin-bottom: 18px; font-family: inherit; outline: none; }
        input:focus { border-color: #1a2a6c; }
        .error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 12px; border-radius: 10px; font-size: 13px; margin-bottom: 16px; }
        .btn { width: 100%; background: #1a2a6c; color: white; border: none; border-radius: 14px; padding: 16px; font-size: 16px; font-weight: 800; cursor: pointer; font-family: inherit; }
        .btn:disabled { background: #94a3b8; cursor: not-allowed; }
        .badge { display: inline-block; background: #eff6ff; color: #1d4ed8; padding: 6px 12px; border-radius: 980px; font-size: 12px; font-weight: 700; margin-bottom: 20px; }
      `}</style>
      <div className="header">
        <span className="logo">🎩</span>
        <div className="brand">Alfred<span className="gold">Major</span></div>
      </div>
      <div className="card">
        <span className="badge">🏠 Espace Proprietaire</span>
        <div className="card-title">Connexion</div>
        <div className="card-sub">Accedez a votre espace proprietaire pour suivre vos biens.</div>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          <label>Mot de passe</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter →'}
          </button>
        </form>
        <p style={{ marginTop: '16px', fontSize: '13px', color: '#64748b', textAlign: 'center' }}>
          Vous n'avez pas encore de compte ? Contactez votre conciergerie.
        </p>
      </div>
    </div>
  );
}
