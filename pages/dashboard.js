import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);

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
      loading && setLoading(false);
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

        /* BANNIÈRES */
        .banner { border-radius: 16px; padding: 16px 20px; margin-bottom: 20px; display: flex; align-items: center; gap: 14px; }
        .banner.warning { background: #fff7ed; border: 1px solid #f97316; }
        .banner.success { background: #f0fdf4; border: 1px solid #10b981; }
        .banner-icon { font-size: 24px; flex-shrink: 0; }
        .banner-text { flex: 1; }
        .banner-text h4 { margin: 0 0 3px; font-weight: 800; font-size: 14px; color: #c2410c; }
        .banner-text p { margin: 0; font-size: 12px; color: #64748b; line-height: 1.4; }
        .btn-tg { background: #0088cc; color: white; padding: 10px 16px; border-radius: 10px; font-weight: 700; font-size: 13px; border: none; cursor: pointer; white-space: nowrap; }
        .banner-success-text { font-size: 14px; color: #059669; font-weight: 600; }

        /* GRID */
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 18px; }
        .empty-state { background: white; padding: 50px 24px; border-radius: 24px; text-align: center; border: 2px dashed #e2e8f0; grid-column: 1 / -1; }

        /* CARD */
        .card { background: white; border-radius: 20px; padding: 18px; border: 1px solid #e2e8f0; position: relative; box-shadow: 0 2px 8px rgba(0,0,0,0.04); transition: border-color 0.3s; }
        
        /* AJOUT : Style si le logement a une urgence active */
        .card.emergency-active { border: 2px solid #ef4444 !important; box-shadow: 0 0 12px rgba(239, 68, 68, 0.15); }
        .emergency-badge { position: absolute; top: 14px; right: 40px; background: #e11d48; color: white; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 800; animation: blinker 1.5s linear infinite; }
        
        @keyframes blinker {
          50% { opacity: 0.4; }
        }

        .card-header { padding-right: 32px; }
        h3 { margin: 0 0 4px; color: #1a2a6c; font-size: 16px; font-weight: 800; line-height: 1.3; word-break: break-word; }
        .address { color: #64748b; font-size: 12px; margin-bottom: 14px; }
        .btn-delete { position: absolute; top: 14px; right: 12px; border: none; background: none; cursor: pointer; color: #cbd5e1; font-size: 15px; padding: 4px; }
        .btn-delete:hover { color: #e11d48; }
        .btn-stack { display: flex; flex-direction: column; gap: 8px; }
        .action-btn { padding: 11px; border-radius: 10px; font-weight: 700; font-size: 13px; text-align: center; border: none; cursor: pointer; display: block; width: 100%; }
        .btn-primary { background: #1a2a6c; color: white; }
        .btn-welcome { background: #ecfdf5; color: #059669; border: 1px solid #10b981; }
        .btn-history { background: #fdf2f8; color: #be185d; }
        .activation-zone { background: #fffbeb; padding: 14px; border-radius: 12px; border: 1px solid #fef3c7; text-align: center; margin-top: 10px; }
        .btn-activate { background: #fbbf24; border: none; padding: 12px; width: 100%; border-radius: 10px; font-weight: 800; color: #1a2a6c; cursor: pointer; font-size: 14px; }

        /* ABONNEMENT */
        .subscription-card { margin-top: 36px; padding: 22px; background: white; border-radius: 20px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
        .btn-portal { background: #1a2a6c; color: white; padding: 11px 20px; border-radius: 12px; font-weight: 700; font-size: 14px; cursor: pointer; border: none; white-space: nowrap; }

        /* MODALS */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15,23,42,0.85); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .modal-card { background: white; border-radius: 28px; padding: 32px 24px; max-width: 420px; width: 100%; text-align: center; }
        .btn-close-modal { background: #fbbf24; border: none; padding: 13px; width: 100%; border-radius: 12px; font-weight: 800; color: #1a2a6c; cursor: pointer; margin-top: 18px; font-size: 15px; }
        .info-box { background: #f1f5f9; padding: 13px; border-radius: 12px; margin-bottom: 18px; font-size: 13px; color: #475569; border-left: 4px solid #fbbf24; text-align: left; }
        .modal-actions { display: flex; gap: 10px; margin-top: 16px; }
        .btn-abort { flex: 1; padding: 12px; border-radius: 10px; border: 1px solid #e2e8
