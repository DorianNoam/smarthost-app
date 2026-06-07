import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import Head from 'next/head';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [inviteId, setInviteId] = useState(null);

  useEffect(() => {
    if (!router.isReady) return;
    const { invite, email: inviteEmail } = router.query;
    if (invite) {
      setInviteId(invite);
      if (inviteEmail) setEmail(decodeURIComponent(inviteEmail));
    }
  }, [router.isReady, router.query]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError('Credenziali non valide o account non confermato.');
      setLoading(false);
      return;
    }

    if (inviteId && authData.user) {
      await supabase
        .from('team_members')
        .update({
          member_user_id: authData.user.id,
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', inviteId)
        .eq('invited_email', email.toLowerCase());
    }

    router.push('/dashboard');
  };

  return (
    <div className="container">
      <Head>
        <title>Accedi — Alfred Major | Dashboard Host</title>
        <meta name="description" content="Accedi alla tua dashboard host Alfred Major per gestire le tue proprietà e il maggiordomo IA." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.alfredmajor.com/it/login" />
        <link rel="alternate" hrefLang="fr" href="https://www.alfredmajor.com/login" />
        <link rel="alternate" hrefLang="en" href="https://www.alfredmajor.com/en/login" />
        <link rel="alternate" hrefLang="es" href="https://www.alfredmajor.com/es/login" />
        <link rel="alternate" hrefLang="it" href="https://www.alfredmajor.com/it/login" />
        <meta property="og:title" content="Accedi — Alfred Major" />
        <meta property="og:image" content="https://www.alfredmajor.com/og-image.jpg" />
        <meta property="og:locale" content="it_IT" />
      </Head>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@700;800;900&display=swap');
        :global(*) { box-sizing: border-box; }
        :global(body) { margin: 0; background: #0f172a; font-family: 'Inter', sans-serif; }
        .container { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; }
        .lang-switcher { display: flex; gap: 6px; margin-bottom: 24px; }
        .lang-btn { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: white; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 14px; font-family: inherit; transition: 0.2s; }
        .lang-btn.active { background: rgba(212,175,55,0.2); border-color: #d4af37; }
        .header { text-align: center; margin-bottom: 36px; }
        .logo { font-size: 56px; display: block; margin-bottom: 14px; }
        .brand { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 28px; font-weight: 900; color: white; letter-spacing: -0.5px; }
        .gold { color: #d4af37; }
        .card { background: white; border-radius: 24px; padding: 36px 32px; width: 100%; max-width: 420px; }
        .card-title { font-size: 22px; font-weight: 800; color: #1a2a6c; margin-bottom: 6px; }
        .card-sub { font-size: 14px; color: #64748b; margin-bottom: 28px; }
        label { display: block; font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 6px; }
        input { width: 100%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; font-size: 15px; color: #1e293b; margin-bottom: 18px; font-family: inherit; outline: none; transition: 0.2s; }
        input:focus { border-color: #1a2a6c; box-shadow: 0 0 0 3px rgba(26,42,108,0.1); }
        input[readonly] { opacity: 0.7; cursor: not-allowed; }
        .forgot { display: block; text-align: right; font-size: 13px; color: #64748b; text-decoration: underline; margin-top: -12px; margin-bottom: 20px; cursor: pointer; }
        .error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 12px; border-radius: 10px; font-size: 13px; margin-bottom: 16px; }
        .btn { width: 100%; background: #1a2a6c; color: white; border: none; border-radius: 14px; padding: 16px; font-size: 16px; font-weight: 800; cursor: pointer; font-family: inherit; transition: 0.3s; }
        .btn:hover:not(:disabled) { background: #1e3280; transform: translateY(-1px); }
        .btn:disabled { background: #94a3b8; cursor: not-allowed; }
        .footer-link { margin-top: 22px; text-align: center; font-size: 14px; color: #64748b; }
        .footer-link a { color: #1a2a6c; font-weight: 700; text-decoration: none; }
        .invite-banner { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 12px 16px; margin-bottom: 20px; text-align: left; }
        .invite-banner-title { font-size: 13px; font-weight: 800; color: #1e40af; margin-bottom: 3px; }
        .invite-banner-sub { font-size: 12px; color: #3b82f6; }
      `}</style>

      <div className="lang-switcher">
        <button className="lang-btn" onClick={() => router.push('/login')}>🇫🇷 FR</button>
        <button className="lang-btn" onClick={() => router.push('/en/login')}>🇬🇧 EN</button>
        <button className="lang-btn" onClick={() => router.push('/es/login')}>🇪🇸 ES</button>
        <button className="lang-btn active">🇮🇹 IT</button>
      </div>

      <div className="header">
        <span className="logo">🎩</span>
        <div className="brand">Alfred<span className="gold">Major</span></div>
      </div>

      <div className="card">
        <div className="card-title">{inviteId ? 'Unisciti al team' : 'Accedi'}</div>
        <div className="card-sub">{inviteId ? 'Accedi per accettare l\'invito.' : 'Bentornato.'}</div>

        {inviteId && (
          <div className="invite-banner">
            <div className="invite-banner-title">✉️ Invito in sospeso</div>
            <div className="invite-banner-sub">Accedi per entrare nella dashboard del team.</div>
          </div>
        )}

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input type="email" value={email} onChange={e => !inviteId && setEmail(e.target.value)} placeholder="la.tua@email.com" autoCapitalize="none" readOnly={!!inviteId} />
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          <Link href="/forgot-password" className="forgot">Password dimenticata?</Link>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Accesso in corso...' : inviteId ? '✅ Accedi & Unisciti' : 'Accedi'}
          </button>
        </form>

        <div className="footer-link">
          Non hai ancora un account? <Link href={inviteId ? `/it/register?invite=${inviteId}&email=${encodeURIComponent(email)}` : '/it/register'}>Registrati</Link>
        </div>
      </div>
    </div>
  );
}