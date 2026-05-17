import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';

function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);
    if (supported) checkExistingSubscription();
  }, []);

  const checkExistingSubscription = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(!!sub);
    } catch (err) {}
  };

  const subscribe = async () => {
    setIsLoading(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') { setIsLoading(false); return { success: false }; }
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      const padding = '='.repeat((4 - (vapidPublicKey.length % 4)) % 4);
      const base64 = (vapidPublicKey + padding).replace(/-/g, '+').replace(/_/g, '/');
      const rawData = window.atob(base64);
      const convertedKey = Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: convertedKey });
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
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return { isSupported, isSubscribed, isLoading, subscribe, unsubscribe };
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
      const { data: props } = await supabase.from('properties').select('*').eq('owner_id', user.id).order('created_at', { ascending: false });
      const { data: prof } = await supabase.from('profiles').select('*, telegram_chat_id').eq('id', user.id).single();
      if (props) setProperties(props);
      if (prof) setProfile(prof);
    } catch (err) {
      console.error("Erreur chargement:", err);
    } finally {
      setLoading(false);
    }
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
        * { box-sizing: border-box; }
        body { margin: 0; background: #f8fafc; font-family: 'Inter', -apple-system, sans-serif; overflow-x: hidden; }
        a { text-decoration: none !important; }
      `}</style>
      <style jsx>{`
        .dashboard-layout { display: flex; min-height: 100vh; max-width: 100vw; overflow-x: hidden; }

        nav { width: 240px; background: #1a2a6c; color: white; padding: 32px 16px; position: fixed; height: 100vh; z-index: 100; display: flex; flex-direction: column; flex-shrink: 0; }
        .logo { font-size: 20px; font-weight: 900; margin-bottom: 40px; text-align: center; }
        .nav-item { padding: 12px 16px; border-radius: 12px; display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 14px; opacity: 0.8; margin-bottom: 8px; cursor: pointer; color: white; transition: 0.2s; }
        .nav-item:hover { opacity: 1; background: rgba(255,255,255,0.05); }
        .nav-item.active { background: rgba(255,255,255,0.15); color: #fbbf24; opacity: 1; }
        .nav-footer { margin-top: auto; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); }
        .tutorial-box { background: #fbbf24; color: #1a2a6c; padding: 12px; border-radius: 10px; font-size: 13px; font-weight: 700; text-align: center; cursor: pointer; display: block; margin-top: 8px; }
        .btn-logout { width: 100%; margin-top: 8px; padding: 11px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; color: rgba(255,255,255,0.7); font-weight: 700; font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; font-family: inherit; }
        .btn-logout:hover { background: rgba(255,255,255,0.15); }

        main { flex: 1; margin-left: 240px; padding: 40px; min-width: 0; }
        .header-area { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 16px; }
        h1 { margin: 0; color: #1e293b; font-size: 28px; font-weight: 800; }
        .btn-add { background: #fbbf24; color: #1a2a6c; padding: 11px 22px; border-radius: 12px; font-weight: 800; font-size: 14px; cursor: pointer; border: none; white-space: nowrap; flex-shrink: 0; }

        .alert-banner { border-radius: 16px; padding: 16px; margin-bottom: 20px; }
        .alert-banner.warning { background: #fff7ed; border: 1px solid #f97316; }
        .alert-banner.success { background: #f0fdf4; border: 1px solid #10b981; }
        .alert-top-row { display: flex; align-items: flex-start; gap: 12px; }
        .alert-icon { font-size: 22px; flex-shrink: 0; margin-top: 1px; }
        .alert-text h4 { margin: 0 0 3px 0; font-weight: 800; font-size: 14px; color: #c2410c; }
        .alert-text p { margin: 0; font-size: 12px; color: #64748b; line-height: 1.4; }
        .alert-btns { display: flex; gap: 8px; margin-top: 12px; }
        .btn-push { background: #1a2a6c; color: white; padding: 10px 14px; border-radius: 10px; font-weight: 700; font-size: 13px; border: none; cursor: pointer; flex: 1; }
        .btn-push:disabled { opacity: 0.6; }
        .btn-tg { background: #0088cc; color: white; padding: 10px 14px; border-radius: 10px; font-weight: 700; font-size: 13px; border: none; cursor: pointer; flex: 1; text-align: center; display: block; }
        .alert-success-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .alert-success-text { flex: 1; font-size: 13px; color: #059669; font-weight: 600; min-width: 0; }
        .btn-unsub { background: none; border: 1px solid #10b981; color: #059669; padding: 7px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap; }
        .btn-push-also { background: #1a2a6c; color: white; padding: 7px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; border: none; cursor: pointer; white-space: nowrap; }

        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 18px; }
        .empty-state { background: white; padding: 50px 24px; border-radius: 24px; text-align: center; border: 2px dashed #e2e8f0; grid-column: 1 / -1; }

        .card { background: white; border-radius: 20px; padding: 18px; border: 1px solid #e2e8f0; position: relative; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .card-header { padding-right: 32px; }
        h3 { margin: 0 0 4px 0; color: #1a2a6c; font-size: 16px; font-weight: 800; line-height: 1.3; word-break: break-word; }
        .address { color: #64748b; font-size: 12px; margin-bottom: 14px; }
        .btn-delete { position: absolute; top: 14px; right: 12px; border: none; background: none; cursor: pointer; color: #cbd5e1; font-size: 15px; padding: 4px; line-height: 1; }
        .btn-delete:hover { color: #e11d48; }
        .btn-stack { display: flex; flex-direction: column; gap: 8px; }
        .action-btn { padding: 11px; border-radius: 10px; font-weight: 700; font-size: 13px; text-align: center; border: none; cursor: pointer; display: block; width: 100%; }
        .btn-primary { background: #1a2a6c; color: white; }
        .btn-welcome { background: #ecfdf5; color: #059669; border: 1px solid #10b981; }
        .btn-history { background: #fdf2f8; color: #be185d; }
        .activation-zone { background: #fffbeb; padding: 14px; border-radius: 12px; border: 1px solid #fef3c7; text-align: center; margin-top: 10px; }
        .btn-activate { background: #fbbf24; border: none; padding: 12px; width: 100%; border-radius: 10px; font-weight: 800; color: #1a2a6c; cursor: pointer; font-size: 14px; }

        .subscription-card { margin-top: 36px; padding: 22px; background: white; border-radius: 20px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
        .btn-portal { background: #1a2a6c; color: white; padding: 11px 20px; border-radius: 12px; font-weight: 700; font-size: 14px; cursor: pointer; border: none; white-space: nowrap; }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15,23,42,0.85); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .modal-card { background: white; border-radius: 28px; padding: 32px 24px; max-width: 420px; width: 100%; text-align: center; }
        .btn-close-modal { background: #fbbf24; border: none; padding: 13px; width: 100%; border-radius: 12px; font-weight: 800; color: #1a2a6c; cursor: pointer; margin-top: 18px; font-size: 15px; }
        .info-box { background: #f1f5f9; padding: 13px; border-radius: 12px; margin-bottom: 18px; font-size: 13px; color: #475569; border-left: 4px solid #fbbf24; text-align: left; }
        .modal-actions { display: flex; gap: 10px; margin-top: 16px; }
        .btn-abort { flex: 1; padding: 12px; border-radius: 10px; border: 1px solid #e2e8f0; background: white; color: #64748b; font-weight: 700; cursor: pointer; }
        .btn-confirm-delete { flex: 1; padding: 12px; border-radius: 10px; border: none; background: #e11d48; color: white; font-weight: 700; cursor: pointer; }

        @media (max-width: 768px) {
          nav { width: 100%; height: 60px; position: fixed; bottom: 0; left: 0; top: auto; flex-direction: row; padding: 0 0 env(safe-area-inset-bottom, 0px) 0; justify-content: space-around; align-items: center; box-shadow: 0 -2px 12px rgba(0,0,0,0.1); }
          .logo { display: none; }
          .nav-text { display: none; }
          .nav-item { margin: 0; padding: 0; flex: 1; justify-content: center; font-size: 22px; border-radius: 0; background: transparent !important; height: 100%; opacity: 1; }
          .nav-item.active { background: transparent !important; color: #fbbf24; }
          .nav-footer { border-top: none; padding: 0; margin: 0; flex: 1; display: flex; height: 100%; align-items: center; justify-content: center; }
          .tutorial-box { background: transparent; color: white; margin: 0; padding: 0; font-size: 22px; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; border-radius: 0; }
          .btn-logout { display: none; }
          main { margin-left: 0; padding: 20px 16px 90px; }
          h1 { font-size: 22px; }
          .btn-add { padding: 12px 18px; font-size: 14px; }
          .grid { grid-template-columns: 1fr; gap: 12px; }
          .subscription-card { flex-direction: column; align-items: stretch; padding: 18px; text-align: center; }
          .btn-portal { width: 100%; }
          .modal-card { padding: 24px 18px; }
          .modal-actions { flex-direction: column; }
          .alert-btns { flex-direction: column; }
          .btn-push, .btn-tg { text-align: center; }
        }
      `}</style>

      <nav>
        <div className="logo">Alfred Major 🎩</div>
        <Link href="/dashboard" legacyBehavior><a className="nav-item active">🏠 <span className="nav-text">Mes Logements</span></a></Link>
        <Link href="/settings" legacyBehavior><a className="nav-item">⚙️ <span className="nav-text">Paramètres</span></a></Link>
        <div className="nav-footer">
          <Link href="/tutorial" legacyBehavior><a className="tutorial-box">❓ <span className="nav-text">Comment ça marche ?</span></a></Link>
          <button className="btn-logout" onClick={async () => { await supabase.auth.signOut(); router.push('/'); }}>
            🚪 <span className="nav-text">Déconnexion</span>
          </button>
        </div>
      </nav>

      <main>
        <div className="header-area">
          <h1>Mes Logements</h1>
          <button onClick={handleAddClick} className="btn-add">+ Ajouter</button>
        </div>

        {!alertsActive && (
          <div className="alert-banner warning">
            <div className="alert-top-row">
              <div className="alert-icon">🚨</div>
              <div className="alert-text">
                <h4>Activez vos alertes urgences</h4>
                <p>Recevez une notification sur votre téléphone dès qu'Alfred détecte une urgence dans l'un de vos logements.</p>
              </div>
            </div>
            <div className="alert-btns">
              {push.isSupported && (
                <button className="btn-push" onClick={push.subscribe} disabled={push.isLoading}>
                  {push.isLoading ? 'Activation...' : "🔔 Notifications de l'application"}
                </button>
              )}
              {!telegramLinked && (
                <Link href="/settings" legacyBehavior>
                  <a className="btn-tg">📲 Via Telegram</a>
                </Link>
              )}
            </div>
          </div>
        )}

        {push.isSubscribed && (
          <div className="alert-banner success">
            <div className="alert-success-row">
              <span style={{ fontSize: '18px' }}>✅</span>
              <span className="alert-success-text">Notifications de l'application activées — Alfred vous alerte directement sur ce téléphone</span>
              <button className="btn-unsub" onClick={push.unsubscribe} disabled={push.isLoading}>
                {push.isLoading ? '...' : 'Désactiver'}
              </button>
            </div>
          </div>
        )}

        {!push.isSubscribed && telegramLinked && (
          <div className="alert-banner success">
            <div className="alert-success-row">
              <span style={{ fontSize: '18px' }}>✅</span>
              <span className="alert-success-text">Telegram connecté — alertes urgences actives</span>
              {push.isSupported && (
                <button className="btn-push-also" onClick={push.subscribe} disabled={push.isLoading}>
                  {push.isLoading ? '...' : '+ Notif. application'}
                </button>
              )}
            </div>
          </div>
        )}

        <div className="grid">
          {properties.length === 0 ? (
            <div className="empty-state">
              <span style={{ fontSize: '48px' }}>✨</span>
              <h2 style={{ color: '#1a2a6c', fontWeight: 800, margin: '14px 0 8px' }}>Bienvenue sur Alfred Major !</h2>
              <p style={{ color: '#64748b', maxWidth: '340px', margin: '0 auto 22px', fontSize: '14px' }}>Ajoutez votre premier logement pour configurer votre majordome.</p>
              <button onClick={handleAddClick} className="btn-add">Créer mon premier logement</button>
            </div>
          ) : (
            properties.map((prop) => (
              <div key={prop.id} className="card">
                <button className="btn-delete" onClick={(e) => triggerDeleteRequest(e, prop)}>🗑️</button>
                <div className="card-header">
                  <h3>{prop.name}</h3>
                </div>
                <div className="address">📍 {prop.street_number} {prop.address}{prop.city ? `, ${prop.city}` : ''}</div>
                {!prop.is_active ? (
                  <div className="activation-zone">
                    <p style={{ fontSize: '13px', color: '#92400e', margin: '0 0 12px', fontWeight: 600 }}>Prêt à entrer en service.</p>
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
          <div>
            <h3 style={{ margin: '0 0 4px', color: '#1a2a6c', fontSize: '16px' }}>Gestion des abonnements</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Gérez vos factures et moyens de paiement.</p>
          </div>
          <button onClick={handleManageSubscription} className="btn-portal">Accéder au portail</button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '28px', paddingBottom: '16px' }}>
          <button onClick={handleDeleteAccount} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', textDecoration: 'underline', fontSize: '12px' }}>
            Supprimer mon compte
          </button>
        </div>
      </main>

      {showLimitModal && (
        <div className="modal-overlay" onClick={() => setShowLimitModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <span style={{ fontSize: '46px', marginBottom: '14px', display: 'block' }}>🎩</span>
            <h2 style={{ color: '#1a2a6c', fontWeight: 800, margin: '0 0 8px' }}>Activation requise</h2>
            <p style={{ color: '#64748b', margin: 0 }}>Veuillez activer votre logement actuel avant d'en ajouter un nouveau.</p>
            <button className="btn-close-modal" onClick={() => setShowLimitModal(false)}>D'accord</button>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <span style={{ fontSize: '42px', marginBottom: '12px', display: 'block' }}>⚠️</span>
            <h2 style={{ color: '#1a2a6c', fontWeight: 800, margin: '0 0 8px' }}>Supprimer {propertyToDelete?.name} ?</h2>
            <p style={{ color: '#64748b', margin: '0 0 16px' }}>Êtes-vous sûr ? Toute la configuration sera effacée.</p>
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
