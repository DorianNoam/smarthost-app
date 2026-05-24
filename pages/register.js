import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import { useTranslation } from '../lib/useTranslation';

export default function Register() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const r = t.register;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Gestion de l'invitation ──────────────────────────────
  const [inviteId, setInviteId] = useState(null);
  const [inviteReady, setInviteReady] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const { invite, email: inviteEmail } = router.query;
    if (invite) {
      setInviteId(invite);
      if (inviteEmail) setEmail(decodeURIComponent(inviteEmail));
    }
    setInviteReady(true);
  }, [router.isReady, router.query]);

  const switchLocale = (l) => router.push(router.pathname, router.asPath, { locale: l });

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !password || !firstName) { setError('Veuillez remplir tous les champs.'); return; }
    setLoading(true);
    setError(null);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { first_name: firstName } }
      });
      if (authError) throw authError;

      if (authData.user) {
        // Créer le profil
        await supabase.from('profiles').upsert(
          [{ id: authData.user.id, full_name: firstName, email, active_licenses: 0 }],
          { onConflict: 'email' }
        );

        // ── Si invitation : lier le membre à son équipe ──
        if (inviteId) {
          await supabase
            .from('team_members')
            .update({
              member_user_id: authData.user.id,
              status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('id', inviteId)
            .eq('invited_email', email.toLowerCase());

          // Redirection vers le dashboard (pas add-property)
          router.push('/dashboard');
        } else {
          // Parcours normal : création du premier logement
          router.push('/add-property?first=true');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>{r.metaTitle}</title>
        <meta name="description" content={r.metaDesc} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://www.alfredmajor.com${locale === 'fr' ? '/register' : `/${locale}/register`}`} />
        <link rel="alternate" hrefLang="fr" href="https://www.alfredmajor.com/register" />
        <link rel="alternate" hrefLang="en" href="https://www.alfredmajor.com/en/register" />
        <link rel="alternate" hrefLang="es" href="https://www.alfredmajor.com/es/register" />
        <meta property="og:title" content={r.metaTitle} />
        <meta property="og:image" content="https://www.alfredmajor.com/og-image.jpg" />
        <meta property="og:locale" content={t.meta.ogLocale} />
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

        /* Bandeau invitation */
        .invite-banner { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 14px; padding: 14px 16px; margin-bottom: 24px; display: flex; align-items: flex-start; gap: 10px; }
        .invite-banner-icon { font-size: 20px; flex-shrink: 0; }
        .invite-banner-text { font-size: 13px; color: #1e40af; line-height: 1.5; }
        .invite-banner-title { font-weight: 800; margin-bottom: 2px; }

        label { display: block; font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 6px; }
        input { width: 100%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; font-size: 15px; color: #1e293b; margin-bottom: 18px; font-family: inherit; outline: none; transition: 0.2s; }
        input:focus { border-color: #1a2a6c; box-shadow: 0 0 0 3px rgba(26,42,108,0.1); }
        input[readonly] { opacity: 0.7; cursor: not-allowed; }
        .error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 12px; border-radius: 10px; font-size: 13px; margin-bottom: 16px; }
        .btn { width: 100%; background: #1a2a6c; color: white; border: none; border-radius: 14px; padding: 16px; font-size: 16px; font-weight: 800; cursor: pointer; font-family: inherit; transition: 0.3s; }
        .btn:hover:not(:disabled) { background: #1e3280; transform: translateY(-1px); }
        .btn:disabled { background: #94a3b8; cursor: not-allowed; }
        .footer-link { margin-top: 22px; text-align: center; font-size: 14px; color: #64748b; }
        .footer-link a { color: #1a2a6c; font-weight: 700; text-decoration: none; }
      `}</style>

      <div className="lang-switcher">
        <button className={`lang-btn${locale === 'fr' ? ' active' : ''}`} onClick={() => switchLocale('fr')}>🇫🇷 FR</button>
        <button className={`lang-btn${locale === 'en' ? ' active' : ''}`} onClick={() => switchLocale('en')}>🇬🇧 EN</button>
        <button className={`lang-btn${locale === 'es' ? ' active' : ''}`} onClick={() => switchLocale('es')}>🇪🇸 ES</button>
      </div>

      <div className="header">
        <span className="logo">🎩</span>
        <div className="brand">Alfred<span className="gold">Major</span></div>
      </div>

      <div className="card">
        <div className="card-title">
          {inviteId ? 'Rejoindre l\'équipe' : r.title}
        </div>
        <div className="card-sub">
          {inviteId ? 'Créez votre compte pour accepter l\'invitation.' : r.subtitle}
        </div>

        {/* Bandeau invitation */}
        {inviteId && inviteReady && (
          <div className="invite-banner">
            <span className="invite-banner-icon">✉️</span>
            <div className="invite-banner-text">
              <div className="invite-banner-title">Invitation Alfred Major</div>
              Vous avez été invité à rejoindre une équipe. Créez votre compte ci-dessous pour accepter.
            </div>
          </div>
        )}

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleRegister}>
          <label>{r.labelName}</label>
          <input
            type="text"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            placeholder={r.placeholderName}
            autoCapitalize="words"
          />
          <label>{r.labelEmail}</label>
          <input
            type="email"
            value={email}
            onChange={e => !inviteId && setEmail(e.target.value)}
            placeholder={r.placeholderEmail}
            autoCapitalize="none"
            readOnly={!!inviteId}
          />
          <label>{r.labelPassword}</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={r.placeholderPassword}
          />
          <button type="submit" className="btn" disabled={loading}>
            {loading ? r.loading : inviteId ? '✅ Créer mon compte & Rejoindre' : r.cta}
          </button>
        </form>

        <div className="footer-link">
          {r.alreadyAccount} <Link href={`/login${inviteId ? `?invite=${inviteId}&email=${encodeURIComponent(email)}` : ''}`} locale={locale}>{r.login}</Link>
        </div>
      </div>
    </div>
  );
}
