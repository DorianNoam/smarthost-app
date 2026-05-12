import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';

export default function Settings() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    active_licenses: 0,
    subscription_status: '',
    telegram_chat_id: null,
  });

  // Facturation stockée en localStorage (colonnes non existantes en BDD)
  const [billing, setBilling] = useState({
    address: '',
    zipcode: '',
    city: '',
  });

  const [telegramLinked, setTelegramLinked] = useState(false);
  const botName = "Alfred_Alerte_Bot";

  useEffect(() => {
    loadUserData();
  }, []);

  // Recharge les données quand on revient de Telegram (focus sur la fenêtre)
  useEffect(() => {
    const handleFocus = () => {
      if (user) loadUserData();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  const loadUserData = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) { router.push('/login'); return; }
    setUser(authUser);

    const { data } = await supabase
      .from('profiles')
      .select('full_name, email, active_licenses, subscription_status, telegram_chat_id')
      .eq('id', authUser.id)
      .single();

    if (data) {
      setProfile({
        full_name: data.full_name || '',
        email: authUser.email,
        active_licenses: data.active_licenses || 0,
        subscription_status: data.subscription_status || 'Inactif',
        telegram_chat_id: data.telegram_chat_id,
      });

      // ✅ CORRECTION : bonne colonne telegram_chat_id
      setTelegramLinked(!!data.telegram_chat_id);
    }

    // Billing depuis localStorage
    try {
      const saved = JSON.parse(localStorage.getItem('mm_billing') || '{}');
      setBilling({
        address: saved.address || '',
        zipcode: saved.zipcode || '',
        city: saved.city || '',
      });
    } catch (_) {}

    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // ✅ CORRECTION : on ne sauvegarde que les colonnes qui existent en BDD
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: profile.full_name })
        .eq('id', user.id);

      if (error) throw error;

      // Facturation en localStorage (pas de colonne BDD dédiée)
      localStorage.setItem('mm_billing', JSON.stringify(billing));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert("Erreur lors de la sauvegarde : " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStripePortal = async () => {
    try {
      const res = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert("Impossible d'accéder au portail.");
    } catch (err) {
      alert("Impossible d'accéder au portail de paiement.");
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif', color: '#64748b' }}>
      Chargement de vos réglages...
    </div>
  );

  return (
    <div className="dashboard-layout">
      <style jsx global>{`
        body { margin: 0; background: #f8fafc; font-family: 'Inter', sans-serif; }
        a { text-decoration: none !important; color: inherit; }
        * { box-sizing: border-box; }
      `}</style>

      <style jsx>{`
        .dashboard-layout { display: flex; min-height: 100vh; }
        nav { width: 260px; background: #1a2a6c; color: white; padding: 40px 20px; position: fixed; height: 100vh; z-index: 100; display: flex; flex-direction: column; }
        .logo { font-size: 22px; font-weight: 900; margin-bottom: 50px; text-align: center; }
        .nav-item { padding: 14px 18px; border-radius: 12px; display: flex; align-items: center; gap: 12px; font-weight: 600; opacity: 0.8; margin-bottom: 10px; cursor: pointer; color: white; transition: 0.2s; }
        .nav-item.active { background: rgba(255,255,255,0.15); color: #fbbf24; opacity: 1; }
        .nav-item:hover { opacity: 1; background: rgba(255,255,255,0.05); }

        main { flex: 1; margin-left: 260px; padding: 50px; display: flex; flex-direction: column; align-items: center; }
        .settings-container { width: 100%; max-width: 800px; }

        .header-area { margin-bottom: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; width: 100%; }
        h1 { margin: 0; color: #1e293b; font-size: 32px; font-weight: 800; }
        .subtitle { color: #64748b; margin: 5px 0 0 0; font-size: 15px; }

        .settings-card { background: white; border-radius: 24px; padding: 30px; margin-bottom: 30px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.02); width: 100%; }
        h2 { margin: 0 0 25px 0; color: #1a2a6c; font-size: 20px; font-weight: 800; display: flex; align-items: center; gap: 10px; }

        .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .input-group { display: flex; flex-direction: column; gap: 8px; }
        .input-group.full { grid-column: span 2; }
        label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        input { padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; font-size: 15px; color: #1e293b; outline: none; transition: 0.2s; width: 100%; }
        input:focus { border-color: #1a2a6c; background: white; }
        input[readonly] { opacity: 0.6; cursor: not-allowed; }

        /* Telegram */
        .telegram-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 15px; width: 100%; }
        .telegram-status { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .status-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; padding: 6px 14px; border-radius: 20px; white-space: nowrap; }
        .status-unlinked { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
        /* ✅ Badge vert quand connecté */
        .status-linked { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
        .btn-telegram { background: #0088cc; color: white !important; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px 20px; border-radius: 12px; font-weight: 800; font-size: 14px; width: 100%; text-align: center; transition: 0.2s; border: none; cursor: pointer; font-family: inherit; }
        .btn-telegram:hover { background: #0077b5; transform: translateY(-1px); }

        /* Boutons */
        .btn { padding: 12px 24px; border-radius: 12px; font-weight: 700; font-size: 14px; cursor: pointer; border: none; transition: 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-family: inherit; }
        .btn-primary { background: #1a2a6c; color: white; }
        .btn-primary:hover { background: #152259; }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-success { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
        .btn-outline { background: white; color: #1a2a6c; border: 1px solid #cbd5e1; }
        .btn-outline:hover { background: #f1f5f9; }

        /* Plan */
        .plan-box { border: 2px solid #1a2a6c; border-radius: 16px; padding: 20px; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; margin-bottom: 20px; }
        .plan-info h3 { margin: 0; color: #1a2a6c; font-size: 18px; font-weight: 800; }
        .plan-info p { margin: 5px 0 0; color: #64748b; font-size: 14px; }
        .badge-active { background: #ecfdf5; color: #059669; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 800; border: 1px solid #a7f3d0; }
        .badge-inactive { background: #f1f5f9; color: #64748b; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 800; }

        /* Toast */
        .toast-success { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; padding: 12px 20px; border-radius: 12px; font-size: 14px; font-weight: 600; margin-top: 12px; display: flex; align-items: center; gap: 8px; }

        @media (max-width: 900px) {
          nav { width: 100%; height: 75px; position: fixed; bottom: 0; left: 0; top: auto; flex-direction: row; padding: 0; justify-content: space-around; align-items: center; z-index: 1000; box-shadow: 0 -4px 15px rgba(0,0,0,0.1); padding-bottom: env(safe-area-inset-bottom, 10px); }
          .logo, .nav-text { display: none; }
          .nav-item { margin: 0; padding: 10px; flex: 1; justify-content: center; font-size: 26px; border-radius: 0; background: transparent !important; height: 100%; }
          main { margin-left: 0; padding: 25px 20px; padding-bottom: 110px; }
          .input-grid { grid-template-columns: 1fr; }
          .input-group.full { grid-column: span 1; }
          .plan-box { flex-direction: column; align-items: flex-start; gap: 12px; }
        }
      `}</style>

      {/* SIDEBAR */}
      <nav>
        <div className="logo">MajorMarc 🎩</div>
        <Link href="/dashboard" legacyBehavior>
          <a className="nav-item">🏠 <span className="nav-text">Logements</span></a>
        </Link>
        <Link href="/settings" legacyBehavior>
          <a className="nav-item active">⚙️ <span className="nav-text">Paramètres</span></a>
        </Link>
      </nav>

      <main>
        <div className="settings-container">
          <div className="header-area">
            <h1>Paramètres du compte</h1>
            <p className="subtitle">Gérez vos informations et vos alertes.</p>
          </div>

          {/* ── PROFIL ── */}
          <div className="settings-card">
            <h2>👤 Profil & Facturation</h2>
            <div className="input-grid">
              <div className="input-group">
                <label>Nom complet / Société</label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="Jean Dupont"
                />
              </div>
              <div className="input-group">
                <label>E-mail (Lecture seule)</label>
                <input type="email" value={profile.email} readOnly />
              </div>
              <div className="input-group full">
                <label>Adresse de facturation</label>
                <input
                  type="text"
                  value={billing.address}
                  onChange={e => setBilling({ ...billing, address: e.target.value })}
                  placeholder="12 Rue de la Paix"
                />
              </div>
              <div className="input-group">
                <label>Code Postal</label>
                <input
                  type="text"
                  value={billing.zipcode}
                  onChange={e => setBilling({ ...billing, zipcode: e.target.value })}
                  placeholder="75001"
                />
              </div>
              <div className="input-group">
                <label>Ville</label>
                <input
                  type="text"
                  value={billing.city}
                  onChange={e => setBilling({ ...billing, city: e.target.value })}
                  placeholder="Paris"
                />
              </div>
              <div className="input-group full">
                <button
                  className={`btn ${saveSuccess ? 'btn-success' : 'btn-primary'}`}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Enregistrement...' : saveSuccess ? '✅ Informations sauvegardées !' : '💾 Enregistrer les informations'}
                </button>
              </div>
            </div>
          </div>

          {/* ── TELEGRAM ── */}
          <div className="settings-card">
            <h2>🔔 Alertes & Urgences</h2>
            <div className="telegram-box">
              <div className="telegram-status">
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#0369a1', fontWeight: 800 }}>
                    Connexion Telegram
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                    {telegramLinked
                      ? 'Vos alertes urgences sont actives sur Telegram.'
                      : 'Liez Telegram pour recevoir vos alertes instantanément.'}
                  </p>
                </div>
                {/* ✅ Badge vert si connecté, rouge si non lié */}
                <div className={`status-badge ${telegramLinked ? 'status-linked' : 'status-unlinked'}`}>
                  {telegramLinked ? '✅ Connecté' : '❌ Non lié'}
                </div>
              </div>

              {/* ✅ Lien Telegram avec user.id pour le deep linking */}
              <a
                href={`https://t.me/${botName}?start=${user?.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-telegram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                {telegramLinked ? '🔄 Mettre à jour la connexion' : '📲 Lier mon compte Telegram'}
              </a>

              {telegramLinked && (
                <p style={{ margin: 0, fontSize: '12px', color: '#059669', textAlign: 'center', fontWeight: 600 }}>
                  ✓ Vous recevrez une alerte Telegram dès qu'une urgence est détectée
                </p>
              )}
            </div>
          </div>

          {/* ── ABONNEMENT ── */}
          <div className="settings-card">
            <h2>💳 Abonnement</h2>
            <div className="plan-box">
              <div className="plan-info">
                <h3>
                  {profile.active_licenses > 0
                    ? `${profile.active_licenses} Logement${profile.active_licenses > 1 ? 's' : ''} Actif${profile.active_licenses > 1 ? 's' : ''}`
                    : 'Aucun logement actif'}
                </h3>
                <p>
                  Statut : <b>{profile.subscription_status || 'Inactif'}</b>
                  {profile.active_licenses > 0 && (
                    <span> · {(profile.active_licenses * 19.9).toFixed(2)}€/mois</span>
                  )}
                </p>
              </div>
              {profile.active_licenses > 0
                ? <span className="badge-active">✓ Actif</span>
                : <span className="badge-inactive">Inactif</span>
              }
            </div>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              {profile.active_licenses > 0 ? (
                <button className="btn btn-outline" onClick={handleStripePortal}>
                  🔗 Gérer le paiement & Factures
                </button>
              ) : (
                <Link href="/pricing" legacyBehavior>
                  <a className="btn btn-primary">🎩 Activer un logement — 9,90€ le 1er mois</a>
                </Link>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
