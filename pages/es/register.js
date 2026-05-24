import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !password || !firstName) { setError('Por favor, rellena todos los campos.'); return; }
    setLoading(true);
    setError(null);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password, options: { data: { first_name: firstName } } });
      if (authError) throw authError;
      if (authData.user) {
        await supabase.from('profiles').upsert([{ id: authData.user.id, full_name: firstName, email, active_licenses: 0 }], { onConflict: 'email' });
        if (inviteId) {
          await supabase.from('team_members').update({
            member_user_id: authData.user.id,
            status: 'active',
            updated_at: new Date().toISOString(),
          }).eq('id', inviteId).eq('invited_email', email.toLowerCase());
          router.push('/dashboard');
        } else {
          router.push('/add-property?first=true');
        }
      }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="container">
      <Head>
        <title>Crear una cuenta — Alfred Major | Mayordomo IA para Alquileres</title>
        <meta name="description" content="Crea tu cuenta de Alfred Major gratis. Configura tu mayordomo IA en 5 minutos. Primer mes gratis, sin compromiso." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.alfredmajor.com/es/register" />
        <link rel="alternate" hrefLang="fr" href="https://www.alfredmajor.com/register" />
        <link rel="alternate" hrefLang="en" href="https://www.alfredmajor.com/en/register" />
        <link rel="alternate" hrefLang="es" href="https://www.alfredmajor.com/es/register" />
        <meta property="og:title" content="Crear una cuenta — Alfred Major" />
        <meta property="og:image" content="https://www.alfredmajor.com/og-image.jpg" />
        <meta property="og:locale" content="es_ES" />
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
        <button className="lang-btn" onClick={() => router.push('/register')}>🇫🇷 FR</button>
        <button className="lang-btn" onClick={() => router.push('/en/register')}>🇬🇧 EN</button>
        <button className="lang-btn active">🇪🇸 ES</button>
      </div>

      <div className="header">
        <span className="logo">🎩</span>
        <div className="brand">Alfred<span className="gold">Major</span></div>
      </div>

      <div className="card">
        <div className="card-title">{inviteId ? 'Unirse al equipo' : 'Crear una cuenta'}</div>
        <div className="card-sub">{inviteId ? 'Crea tu cuenta para aceptar la invitación.' : 'Únete a los anfitriones que confían en Alfred.'}</div>

        {inviteId && inviteReady && (
          <div className="invite-banner">
            <div className="invite-banner-title">✉️ Invitación Alfred Major</div>
            <div className="invite-banner-sub">Crea tu cuenta a continuación para aceptar.</div>
          </div>
        )}

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleRegister}>
          <label>Nombre</label>
          <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Tu nombre" autoCapitalize="words" />
          <label>Email</label>
          <input type="email" value={email} onChange={e => !inviteId && setEmail(e.target.value)} placeholder="tu@email.com" autoCapitalize="none" readOnly={!!inviteId} />
          <label>Contraseña</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" />
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Creando...' : inviteId ? '✅ Crear cuenta y unirse' : 'Crear mi cuenta'}
          </button>
        </form>

        <div className="footer-link">
          ¿Ya tienes cuenta? <Link href={inviteId ? `/es/login?invite=${inviteId}&email=${encodeURIComponent(email)}` : '/es/login'}>Iniciar sesión</Link>
        </div>
      </div>
    </div>
  );
}
