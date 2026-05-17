import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';

// ── Hook notifications push ──
function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);
    if (supported) {
      setPermission(Notification.permission);
      checkExistingSubscription();
    }
  }, []);

  const checkExistingSubscription = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(!!sub);
    } catch (err) {
      console.error('Erreur vérification abonnement:', err);
    }
  };

  const subscribe = async () => {
    setIsLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') { setIsLoading(false); return { success: false }; }

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      const padding = '='.repeat((4 - (vapidPublicKey.length % 4)) % 4);
      const base64 = (vapidPublicKey + padding).replace(/-/g, '+').replace(/_/g, '/');
      const rawData = window.atob(base64);
      const convertedKey = Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));

      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non connecté');

      const response = await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, subscription: subscription.toJSON() }),
      });

      if (!response.ok) throw new Error('Erreur enregistrement');
      setIsSubscribed(true);
      return { success: true };
    } catch (err) {
      console.error('Erreur abonnement push:', err);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await fetch('/api/push-subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });
      }
      setIsSubscribed(false);
      return { success: true };
    } catch (err) {
      console.error('Erreur désabonnement:', err);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return { isSupported, isSubscribed, isLoading, permission, subscribe, unsubscribe };
}

export default function Dashboard() {
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [pushSuccess, setPushSuccess] = useState(false);

  const push = usePushNotifications();

  useEffect(() => {
    fetchData();
    if (router.query.success) {
      const timer = setTimeout(() => fetchData(), 1500);
      return () => clearTimeout(timer);
    }
  }, [router.query]);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: props } = await supabase
        .from('properties').select('*').eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      const { data: prof } = await supabase
        .from('profiles').select('*, telegram_chat_id').eq('id', user.id).single();

      if (props) setProperties(props);
      if (prof) setProfile(prof);
    } catch (err) {
      console.error("Erreur chargement:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePushSubscribe = async () => {
    const result = await push.subscribe();
    if (result.success) setPushSuccess(true);
  };

  const copyWelcomeMessage = (prop) => {
    const identifier = prop.slug || prop.id;
    const guestLink = `${window.location.origin}/m/${identifier}`;
    const message = `Bonjour ! 👋\nPour toute question pendant votre séjour — que ce soit le WiFi, les équipements, ou une bonne adresse dans le quartier — vous pouvez contacter mon assistant disponible 24h/24 via ce lien :\n👉 ${guestLink}\n\nBon séjour ! 🎩`;
    navigator.clipboard.writeText(message);
    alert(`Lien Voyageur copié pour "${prop.name}" !`);
  };

  const handleAddClick = (e) => {
    e.preventDefault();
    const hasInactive = properties.some(prop => !prop.is_active);
    if (hasInactive) { setShowLimitModal(true); } else { router.push('/add-property'); }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, userEmail: user.email }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      alert("Erreur de connexion à Stripe.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const res = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile?.id }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) { console.error(err); }
  };

  const triggerDeleteRequest = (e, prop) => {
    e.stopPropagation();
    setPropertyToDelete(prop);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!propertyToDelete) return;
    const { error } = await supabase.from('properties').delete().eq('id', propertyToDelete.id);
    if (!error) {
      setProperties(properties.filter(p => p.id !== propertyToDelete.id));
      setShowDeleteModal(false);
      setPropertyToDelete(null);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Supprimer votre compte ?") && window.prompt("Tapez 'SUPPRIMER' :") === "SUPPRIMER") {
      await supabase.from('profiles').delete().eq('id', profile.id);
      await supabase.auth.signOut();
      router.push('/');
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Chargement...</div>;

  const telegramLinked = !!profile?.telegram_chat_id;
  const alertsActive = push.isSubscribed || telegramLinked;

  return (
    <div className="dashboard-layout">
      <style jsx global>{`
        body { margin: 0; background: #f8fafc; font-family: 'Inter', sans-serif; }
        a { text-decoration: none !important; }
      `}</style>
      <style jsx>{`
        .dashboard-layout { display: flex; min-height: 100vh; }
        nav { width: 260px; background: #1a2a6c; color: white; padding: 40px 20px; position: fixed; height: 100vh; z-index: 100; box-sizing: border-box; display: flex; flex-direction: column; }
        .logo { font-size: 22px; font-weight: 900; margin-bottom: 50px; text-align: center; }
        .nav-item { padding: 14px 18px; border-radius: 12px; display: flex; align-items: center; gap: 12px; font-weight: 600; opacity: 0.8; margin-bottom: 10px; cursor: pointer; color: white; transition: 0.2s;}
        .nav-item:hover { opacity: 1; background: rgba(255,255,255,0.05); }
        .nav-item.active { background: rgba(255,255,255,0.15); color: #fbbf24; opacity: 1; }
        .nav-footer { margin-top: auto; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); }
        .tutorial-box { background: #fbbf24; color: #1a2a6c; padding: 15px; border-radius: 12px; font-size: 13px; font-weight: 700; text-align: center; cursor: pointer; display: block; margin-top: 10px;}

        main { flex: 1; margin-left: 260px; padding: 50px; box-sizing: border-box; }
        .header-area { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        h1 { margin: 0; color: #1e293b; font-size: 32px; font-weight: 800; }

        /* ── BANNIÈRE ALERTES ── */
        .alert-banner { border-radius: 20px; padding: 20px; margin-bottom: 40px; display: flex; align-items: center; gap: 20px; }
        .alert-banner.warning { background: #fff7ed; border: 1px solid #f97316; box-shadow: 0 4px 12px rgba(249,115,22,0.1); }
        .alert-banner.success { background: #f0fdf4; border: 1px solid #10b981; }
        .alert-icon { font-size: 32px; }
        .alert-text h4 { margin: 0 0 5px 0; font-weight: 800; }
        .alert-text p { margin: 0; font-size: 13px; color: #475569; line-height: 1.4; }
        .alert-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-left: auto; }
        .btn-push { background: #1a2a6c; color: white; padding: 10px 20px; border-radius: 10px; font-weight: 700; font-size: 13px; border: none; cursor: pointer; white-space: nowrap; transition: 0.2s; }
        .btn-push:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-push:hover:not(:disabled) { background: #0f1a4a; }
        .btn-tg { background: #0088cc; color: white; padding: 10px 20px; border-radius: 10px; font-weight: 700; font-size: 13px; border: none; cursor: pointer; white-space: nowrap; }
        .btn-unsub { background: none; border: 1px solid #10b981; color: #059669; padding: 8px 16px; border-radius: 10px; font-size: 12px; font-weight: 700; cursor: pointer; }

        .empty-state { background: white; padding: 60px; border-radius: 32px; text-align: center; border: 2px dashed #e2e8f0; grid-column: 1 / -1; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 25px; }
        .card { background: white; border-radius: 24px; padding: 25px; border: 1px solid #e2e8f0; position: relative; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .btn-delete { position: absolute; top: 15px; right: 15px; border: none; background: none; cursor: pointer; color: #94a3b8; font-size: 18px; transition: 0.2s; }
        .btn-delete:hover { color: #e11d48; }
        h3 { margin: 0 0 5px 0; color: #1a2a6c; font-size: 20px; font-weight: 800; }
        .address { color: #64748b; font-size: 13px; margin-bottom: 20px; }
        .btn-stack { display: flex; flex-direction: column; gap: 10px; }
        .action-btn { padding: 12px; border-radius: 10px; font-weight: 700; font-size: 13px; text-align: center; border: none; cursor: pointer; transition: 0.2s; }
        .btn-primary { background: #1a2a6c; color: white; }
        .btn-welcome { background: #ecfdf5; color: #059669; border: 1px solid #10b981; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-welcome:hover { background: #d1fae5; }
        .btn-history { background: #fdf2f8; color: #be185d; }
        .btn-light { background: #f1f5f9; color: #475569; }
        .btn-add { background: #fbbf24; color: #1a2a6c; padding: 12px 24px; border-radius: 12px; font-weight: 800; cursor: pointer; border: none; transition: 0.2s; }
        .activation-zone { background: #fffbeb; padding: 20px; border-radius: 16px; border: 1px solid #fef3c7; text-align: center; margin-top: 15px; }
        .btn-activate { background: #fbbf24; border: none; padding: 14px; width: 100%; border-radius: 12px; font-weight: 800; color: #1a2a6c; cursor: pointer; transition: 0.2s; }
        .subscription-card { margin-top: 60px; padding: 30px; background: white; border-radius: 24px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
        .btn-portal { background: #1a2a6c; color: white; padding: 14px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; border: none; }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .modal-card { background: white; border-radius: 32px; padding: 40px; max-width: 480px; width: 100%; box-sizing: border-box; text-align: center; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
        .btn-close-modal { background: #fbbf24; border: none; padding: 15px; width: 100%; border-radius: 14px; font-weight: 800; color: #1a2a6c; cursor: pointer; margin-top: 25px; }
        .info-box { background: #f1f5f9; padding: 15px; border-radius: 15px; margin-bottom: 25px; font-size: 13px; color: #475569; border-left: 4px solid #fbbf24; text-align: left; }
        .modal-actions { display: flex; gap: 12px; margin-top: 20px; }
        .btn-abort { flex: 1; padding: 14px; border-radius: 12px; border: 1px solid #e2e8f0; background: white; color: #64748b; font-weight: 700; cursor: pointer; }
        .btn-confirm-delete { flex: 1; padding: 14px; border-radius: 12px; border: none; background: #e11d48; color: white; font-weight: 700; cursor: pointer; }

        @media (max-width: 900px) {
          nav { width: 100%; height: 75px; position: fixed; bottom: 0; left: 0; top: auto; flex-direction: row; padding: 0; justify-content: space-around; align-items: center; z-index: 1000; box-shadow: 0 -4px 15px rgba(0,0,0,0.1); padding-bottom: env(safe-area-inset-bottom, 10px); }
          .logo, .nav-text { display: none; }
          .nav-item { margin: 0; padding: 10px; flex: 1; justify-content: center; font-size: 26px; border-radius: 0; background: transparent !important; height: 100%; }
          .nav-footer { border-top: none; padding: 0; margin: 0; flex: 1; display: flex; height: 100%; }
          .tutorial-box { background: transparent; color: white; margin: 0; padding: 0; font-size: 26px; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; border-radius: 0; }
          main { margin-left: 0; padding: 30px 20px; padding-bottom: 120px; }
          .header-area { flex-direction: column; align-items: stretch; gap: 20px; margin-bottom: 30px; }
          .btn-add { width: 100%; text-align: center; }
          .grid { grid-template-columns: 1fr; }
          .subscription-card { flex-direction: column; align-items: stretch; gap: 20px; padding: 25px 20px; text-align: center; margin-top: 40px; }
          .btn-portal { width: 100%; }
          .modal-card { padding: 30px 20px; }
          .modal-actions { flex-direction: column; }
          .alert-banner { flex-direction: column; text-align: center; padding: 25px; gap: 15px; }
          .alert-actions { margin-left: 0; justify-content: center; }
        }
      `}</style>

      {/* SIDEBAR */}
      <nav>
        <div className="logo">Alfred Major 🎩</div>
        <Link href="/dashboard" legacyBehavior><a className="nav-item active">🏠 <span className="nav-text">Mes Logements</span></a></Link>
        <Link href="/settings" legacyBehavior><a className="nav-item">⚙️ <span className="nav-text">Paramètres</span></a></Link>
        <div className="nav-footer">
          <Link href="/tutorial" legacyBehavior><a className="tutorial-box">❓ <span className="nav-text">Comment ça marche ?</span></a></Link>
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/'); }}
            style={{ width: '100%', marginTop: '10px', padding: '12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s', fontFamily: 'inherit' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          >
            🚪 <span className="nav-text">Déconnexion</span>
          </button>
        </div>
      </nav>

      <main>
        <div className="header-area">
          <h1>Mes Logements</h1>
          <button onClick={handleAddClick} className="btn-add">+ Ajouter</button>
        </div>

        {/* ── BANNIÈRE ALERTES ── */}
        {!alertsActive && (
          <div className="alert-banner warning">
            <div className="alert-icon">🚨</div>
            <div className="alert-text">
              <h4 style={{ color: '#c2410c' }}>Action requise : activez vos alertes urgences</h4>
              <p>Recevez une notification instantanée sur votre téléphone en cas d'urgence détectée par Alfred.</p>
            </div>
            <div className="alert-actions">
              {push.isSupported && (
                <button className="btn-push" onClick={handlePushSubscribe} disabled={push.isLoading}>
                  {push.isLoading ? 'Activation...' : '🔔 Activer les notifications'}
                </button>
              )}
              {!telegramLinked && (
                <Link href="/settings" legacyBehavior>
                  <a><button className="btn-tg">Telegram →</button></a>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* BANNIÈRE VERTE — notifications push actives */}
        {push.isSubscribed && (
          <div className="alert-banner success">
            <span style={{ fontSize: '20px' }}>✅</span>
            <span style={{ fontSize: '14px', color: '#059669', fontWeight: 600, flex: 1 }}>
              Notifications actives — Alfred vous alertera directement sur ce téléphone
            </span>
            <button className="btn-unsub" onClick={push.unsubscribe} disabled={push.isLoading}>
              {push.isLoading ? '...' : 'Désactiver'}
            </button>
          </div>
        )}

        {/* BANNIÈRE VERTE — Telegram actif (si pas de push) */}
        {!push.isSubscribed && telegramLinked && (
          <div className="alert-banner success">
            <span style={{ fontSize: '20px' }}>✅</span>
            <span style={{ fontSize: '14px', color: '#059669', fontWeight: 600 }}>
              Telegram connecté — vous recevrez une alerte en cas d'urgence
            </span>
            {push.isSupported && (
              <button className="btn-push" style={{ marginLeft: 'auto', fontSize: '12px', padding: '8px 14px' }} onClick={handlePushSubscribe} disabled={push.isLoading}>
                {push.isLoading ? '...' : '+ Activer aussi les notifications'}
              </button>
            )}
          </div>
        )}

        <div className="grid">
          {properties.length === 0 ? (
            <div className="empty-state">
              <span style={{ fontSize: '60px' }}>✨</span>
              <h2 style={{ color: '#1a2a6c', fontWeight: 800 }}>Bienvenue sur Alfred Major !</h2>
              <p style={{ color: '#64748b', maxWidth: '400px', margin: '15px auto 30px' }}>Ajoutez votre premier logement pour configurer votre majordome.</p>
              <button onClick={handleAddClick} className="btn-add">Créer mon premier logement</button>
            </div>
          ) : (
            properties.map((prop) => (
              <div key={prop.id} className="card">
                <button className="btn-delete" onClick={(e) => triggerDeleteRequest(e, prop)}>🗑️</button>
                <h3>{prop.name}</h3>
                <div className="address">📍 {prop.street_number} {prop.address}{prop.city ? `, ${prop.city}` : ''}</div>

                {!prop.is_active ? (
                  <div className="activation-zone">
                    <p style={{ fontSize: '13px', color: '#92400e', marginBottom: '15px', fontWeight: 600 }}>Prêt à entrer en service.</p>
                    <button onClick={handlePayment} className="btn-activate">
                      {paymentLoading ? 'Connexion...' : 'Activer ce logement'}
                    </button>
                  </div>
                ) : (
                  <div className="btn-stack">
                    <Link href={`/property/${prop.id}`} legacyBehavior><a className="action-btn btn-primary">📊 Configurer le logement</a></Link>
                    <button onClick={() => copyWelcomeMessage(prop)} className="action-btn btn-welcome">✨ Lien Voyageur (Copier)</button>
                    <Link href={`/history/${prop.id}`} legacyBehavior><a className="action-btn btn-history">📜 Historique des échanges</a></Link>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="subscription-card">
          <div className="sub-info">
            <h3 style={{ margin: '0 0 5px 0', color: '#1a2a6c' }}>Gestion des abonnements</h3>
            <p style={{ margin: 0, color: '#64748b' }}>Gérez vos factures et moyens de paiement.</p>
          </div>
          <button onClick={handleManageSubscription} className="btn-portal">Accéder au portail</button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button onClick={handleDeleteAccount} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textDecoration: 'underline' }}>
            Supprimer mon compte
          </button>
        </div>
      </main>

      {/* MODAL LIMITE */}
      {showLimitModal && (
        <div className="modal-overlay" onClick={() => setShowLimitModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <span style={{ fontSize: '54px', marginBottom: '20px', display: 'block' }}>🎩</span>
            <h2 style={{ color: '#1a2a6c', fontWeight: 800 }}>Activation requise</h2>
            <p style={{ color: '#64748b' }}>Veuillez activer votre logement actuel avant d'en ajouter un nouveau.</p>
            <button className="btn-close-modal" onClick={() => setShowLimitModal(false)}>D'accord</button>
          </div>
        </div>
      )}

      {/* MODAL SUPPRESSION */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <span style={{ fontSize: '50px', marginBottom: '15px', display: 'block' }}>⚠️</span>
            <h2 style={{ color: '#1a2a6c', fontWeight: 800 }}>Supprimer {propertyToDelete?.name} ?</h2>
            <p style={{ color: '#64748b' }}>Êtes-vous sûr ? Toute la configuration sera effacée.</p>
            <div className="info-box"><strong>📌 Note :</strong> Votre licence reste active jusqu'à la fin du mois.</div>
            <div className="modal-actions">
              <button className="btn-abort" onClick={() => setShowDeleteModal(false)}>Annuler</button>
              <button className="btn-confirm-delete" onClick={confirmDelete}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
