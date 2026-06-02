import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import Head from 'next/head';
import { useTranslation } from '../lib/useTranslation';

export default function Login() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const l = t.login;
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

  const switchLocale = (loc) => {
    if (loc === 'fr') router.push('/login');
    else router.push(`/${loc}/login`);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) { setError(l.errorMsg); setLoading(false); return; }
    if (inviteId && authData.user) {
      await supabase.from('team_members').update({ member_user_id: authData.user.id, status: 'active', updated_at: new Date().toISOString() }).eq('id', inviteId).eq('invited_email', email.toLowerCase());
    }
    router.push('/dashboard');
  };

  return (
    <>
      <Head>
        <title>{l.metaTitle}</title>
        <meta name="description" content={l.metaDesc} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://www.alfredmajor.com${locale === 'fr' ? '/login' : `/${locale}/login`}`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-font-smoothing: antialiased; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #f5f5f7; min-height: 100vh; }
        a { text-decoration: none; color: inherit; }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>

        {/* Lang switcher */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '28px' }}>
          {[['fr','🇫🇷'], ['en','🇬🇧'], ['es','🇪🇸']].map(([loc, flag]) => (
            <button key={loc} onClick={() => switchLocale(loc)} style={{ background: locale === loc ? '#fff' : 'transparent', border: `1px solid ${locale === loc ? '#e8e8ed' : '#d2d2d7'}`, color: '#1d1d1f', padding: '6px 12px', borderRadius: '980px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', fontWeight: locale === loc ? '600' : '400', transition: '0.2s', boxShadow: locale === loc ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
              {flag} {loc.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Brand */}
        <Link href="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '36px', gap: '10px' }}>
          <span style={{ fontSize: '52px', lineHeight: 1 }}>🎩</span>
          <span style={{ fontSize: '22px', fontWeight: '600', color: '#1d1d1f', letterSpacing: '-0.4px' }}>
            Alfred<span style={{ color: '#c9a227' }}>Major</span>
          </span>
        </Link>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: '20px', padding: '40px 36px', width: '100%', maxWidth: '420px', boxShadow: '0 2px 20px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)' }}>

          <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#1d1d1f', letterSpacing: '-0.5px', marginBottom: '6px' }}>
            {inviteId ? "Rejoindre l'équipe" : l.title}
          </h1>
          <p style={{ fontSize: '15px', color: '#86868b', fontWeight: '300', marginBottom: '28px', letterSpacing: '-0.1px' }}>
            {inviteId ? 'Connectez-vous pour accepter l\'invitation.' : l.subtitle}
          </p>

          {inviteId && (
            <div style={{ background: '#f0f8ff', border: '1px solid #b3d9f7', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#0369a1', margin: '0 0 3px' }}>✉️ Invitation en attente</p>
              <p style={{ fontSize: '12px', color: '#0369a1', margin: 0, fontWeight: '300', opacity: 0.8 }}>Connectez-vous pour accéder au dashboard de votre équipe.</p>
            </div>
          )}

          {error && (
            <div style={{ background: '#fff2f2', border: '1px solid #ffd0d0', borderRadius: '12px', padding: '12px 14px', marginBottom: '20px', fontSize: '14px', color: '#c00', fontWeight: '400' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#6e6e73', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{l.labelEmail}</label>
              <input type="email" value={email} onChange={e => !inviteId && setEmail(e.target.value)} placeholder={l.placeholderEmail} readOnly={!!inviteId} autoCapitalize="none"
                style={{ width: '100%', background: '#f5f5f7', border: '1px solid #e8e8ed', borderRadius: '12px', padding: '14px 16px', fontSize: '15px', color: '#1d1d1f', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s', opacity: inviteId ? 0.6 : 1 }} />
            </div>

            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#6e6e73', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{l.labelPassword}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={l.placeholderPassword}
                style={{ width: '100%', background: '#f5f5f7', border: '1px solid #e8e8ed', borderRadius: '12px', padding: '14px 16px', fontSize: '15px', color: '#1d1d1f', outline: 'none', fontFamily: 'inherit' }} />
            </div>

            <div style={{ textAlign: 'right', marginBottom: '24px' }}>
              <Link href="/forgot-password" style={{ fontSize: '13px', color: '#6e6e73', fontWeight: '400' }}>{l.forgot}</Link>
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? '#aeaeb2' : '#1d1d1f', color: '#fff', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '16px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', letterSpacing: '-0.2px', transition: 'background 0.2s' }}>
              {loading ? 'Connexion...' : inviteId ? '✅ Se connecter & Rejoindre' : l.cta}
            </button>
          </form>

          <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#86868b', fontWeight: '300' }}>
            {l.noAccount}{' '}
            <Link href={inviteId ? `/register?invite=${inviteId}&email=${encodeURIComponent(email)}` : '/register'} style={{ color: '#c9a227', fontWeight: '500' }}>{l.register}</Link>
          </p>
        </div>

        <p style={{ marginTop: '28px', fontSize: '12px', color: '#aeaeb2', fontWeight: '300' }}>
          © 2026 Alfred Major
        </p>
      </div>
    </>
  );
}
