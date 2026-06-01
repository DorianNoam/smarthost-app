// pages/cleaner/login.js
// Page de connexion dédiée aux prestataires de ménage.

import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabase';

export default function CleanerLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Veuillez remplir tous les champs.'); return; }

    setLoading(true);
    setError(null);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) throw loginError;

      // Vérifier que c'est bien un cleaner
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profile?.role !== 'cleaner') {
        await supabase.auth.signOut();
        throw new Error('Ce compte n\'est pas un compte prestataire. Rendez-vous sur alfredmajor.com/login');
      }

      router.push('/cleaner/dashboard');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>Espace Prestataire — Alfred Major</title>
        <meta name="robots" content="noindex" />
      </Head>

      <style jsx>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Inter', sans-serif; }
        .container { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; background: #0f172a; }
        .header { text-align: center; margin-bottom: 36px; }
        .logo { font-size: 56px; display: block; margin-bottom: 14px; }
        .brand { font-size: 28px; font-weight: 900; color: white; }
        .gold { color: #d4af37; }
        .subtitle { font-size: 14px; color: #94a3b8; margin-top: 8px; }
        .card { background: white; border-radius: 24px; padding: 36px 32px; width: 100%; max-width: 420px; }
        .card-title { font-size: 22px; font-weight: 800; color: #1a2a6c; margin-bottom: 6px; }
        .card-sub { font-size: 14px; color: #64748b; margin-bottom: 28px; }
        label { display: block; font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 6px; }
        input { width: 100%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; font-size: 15px; color: #1e293b; margin-bottom: 18px; font-family: inherit; outline: none; transition: 0.2s; }
        input:focus { border-color: #1a2a6c; box-shadow: 0 0 0 3px rgba(26,42,108,0.1); }
        .error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 12px; border-radius: 10px; font-size: 13px; margin-bottom: 16px; }
        .btn { width: 100%; background: #1a2a6c; color: white; border: none; border-radius: 14px; padding: 16px; font-size: 16px; font-weight: 800; cursor: pointer; font-family: inherit; transition: 0.3s; }
        .btn:hover:not(:disabled) { background: #1e3280; }
        .btn:disabled { background: #94a3b8; cursor: not-allowed; }
        .badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(251,191,36,0.15); border: 1px solid rgba(251,191,36,0.3); color: #fbbf24; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 32px; }
      `}</style>

      <div className="header">
        <span className="logo">🎩</span>
        <div className="brand">Alfred<span className="gold">Major</span></div>
        <div className="subtitle">Espace Prestataire</div>
      </div>

      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span className="badge">🧹 Espace prestataire de ménage</span>
        </div>
        <div className="card-title">Connexion</div>
        <div className="card-sub">Accédez à votre planning de ménages.</div>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="votre@email.com"
            autoCapitalize="none"
          />
          <label>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter →'}
          </button>
        </form>
      </div>
    </div>
  );
}
