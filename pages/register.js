import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import { useTranslation } from '../lib/useTranslation';

function generateReferralCode() {
  return Math.random().toString(36).substring(2,6).toUpperCase() + Math.random().toString(36).substring(2,6).toUpperCase();
}

export default function Register() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const r = t.register;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [referralCode, setReferralCode] = useState('');
  const [referralValid, setReferralValid] = useState(null);

  const switchLocale = (l) => { if (l === 'fr') router.push('/register'); else router.push(`/${l}/register`); };

  useEffect(() => {
    const ref = router.query.ref;
    if (ref) { setReferralCode(ref.toUpperCase()); validateReferralCode(ref.toUpperCase()); }
  }, [router.query]);

  const validateReferralCode = async (code) => {
    if (!code || code.length < 4) { setReferralValid(false); return; }
    const { data } = await supabase.from('profiles').select('id').eq('referral_code', code).maybeSingle();
    setReferralValid(!!data);
  };

  const handleReferralChange = async (val) => {
    const code = val.toUpperCase();
    setReferralCode(code);
    if (code.length >= 6) await validateReferralCode(code);
    else setReferralValid(null);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !password || !firstName) { setError('Veuillez remplir tous les champs.'); return; }
    setLoading(true);
    setError(null);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password, options: { data: { first_name: firstName } } });
      if (authError) throw authError;
      if (authData.user) {
        const newReferralCode = generateReferralCode();
        let referrerId = null;
        if (referralCode && referralValid) {
          const { data: referrer } = await supabase.from('profiles').select('id').eq('referral_code', referralCode).maybeSingle();
          referrerId = referrer?.id || null;
        }
        await supabase.from('profiles').upsert([{ id: authData.user.id, full_name: firstName, email, active_licenses: 0, referral_code: newReferralCode, referred_by: referrerId, referral_credits: referralValid && referrerId ? 1 : 0 }], { onConflict: 'email' });
        if (referrerId) {
          await supabase.from('referrals').insert({ referrer_id: referrerId, referee_id: authData.user.id, status: 'pending', referrer_months: 2, referee_months: 1 });
        }
        router.push('/add-property?first=true');
      }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <>
      <Head>
        <title>{r.metaTitle}</title>
        <meta name="description" content={r.metaDesc} />
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

          {/* Badge offre */}
          <div style={{ background: '#faf6e8', border: '1px solid #e8d88a', borderRadius: '980px', padding: '7px 14px', fontSize: '13px', fontWeight: '500', color: '#92710a', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
            🎁 1er mois 100% offert
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#1d1d1f', letterSpacing: '-0.5px', marginBottom: '6px' }}>{r.title}</h1>
          <p style={{ fontSize: '15px', color: '#86868b', fontWeight: '300', marginBottom: '28px', letterSpacing: '-0.1px' }}>{r.subtitle}</p>

          {/* Bannière parrainage */}
          {referralValid && referralCode && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '24px' }}>🎁</span>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#15803d', margin: '0 0 2px' }}>1 mois offert !</p>
                <p style={{ fontSize: '12px', color: '#15803d', margin: 0, fontWeight: '300', opacity: 0.8 }}>Code parrainage appliqué — votre premier mois est gratuit.</p>
              </div>
            </div>
          )}

          {error && (
            <div style={{ background: '#fff2f2', border: '1px solid #ffd0d0', borderRadius: '12px', padding: '12px 14px', marginBottom: '20px', fontSize: '14px', color: '#c00' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister}>
            {[
              { label: r.labelName, type: 'text', val: firstName, set: setFirstName, ph: r.placeholderName, cap: 'words' },
              { label: r.labelEmail, type: 'email', val: email, set: setEmail, ph: r.placeholderEmail, cap: 'none' },
              { label: r.labelPassword, type: 'password', val: password, set: setPassword, ph: r.placeholderPassword },
            ].map(({ label, type, val, set, ph, cap }) => (
              <div key={label} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#6e6e73', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
                <input type={type} value={val} onChange={e => set(e.target.value)} placeholder={ph} autoCapitalize={cap}
                  style={{ width: '100%', background: '#f5f5f7', border: '1px solid #e8e8ed', borderRadius: '12px', padding: '14px 16px', fontSize: '15px', color: '#1d1d1f', outline: 'none', fontFamily: 'inherit' }} />
              </div>
            ))}

            {/* Divider parrainage */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0 16px' }}>
              <div style={{ flex: 1, height: '1px', background: '#e8e8ed' }} />
              <span style={{ fontSize: '12px', color: '#aeaeb2', fontWeight: '400', whiteSpace: 'nowrap' }}>Code parrainage (optionnel)</span>
              <div style={{ flex: 1, height: '1px', background: '#e8e8ed' }} />
            </div>

            <div style={{ position: 'relative', marginBottom: '24px' }}>
              <input type="text" value={referralCode} onChange={e => handleReferralChange(e.target.value)} placeholder="ex: ABC12345" maxLength={8}
                style={{ width: '100%', background: '#f5f5f7', border: `1px solid ${referralValid === true ? '#bbf7d0' : referralValid === false ? '#ffd0d0' : '#e8e8ed'}`, borderRadius: '12px', padding: '14px 44px 14px 16px', fontSize: '15px', color: '#1d1d1f', outline: 'none', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '3px', fontWeight: '500' }} />
              {referralCode.length >= 6 && (
                <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>
                  {referralValid === null ? '⏳' : referralValid ? '✅' : '❌'}
                </span>
              )}
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? '#aeaeb2' : '#1d1d1f', color: '#fff', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '16px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', letterSpacing: '-0.2px', transition: 'background 0.2s' }}>
              {loading ? r.loading : r.cta}
            </button>
          </form>

          <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#86868b', fontWeight: '300' }}>
            {r.alreadyAccount}{' '}
            <Link href="/login" style={{ color: '#c9a227', fontWeight: '500' }}>{r.login}</Link>
          </p>
        </div>

        <p style={{ marginTop: '28px', fontSize: '12px', color: '#aeaeb2', fontWeight: '300' }}>
          © 2026 Alfred Major · Sans engagement · Résiliable à tout moment
        </p>
      </div>
    </>
  );
}
