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

  // ── MÉNAGE ──
  const [activeTab, setActiveTab] = useState({}); // { [propId]: 'actions' | 'menage' }
  const [cleaningData, setCleaningData] = useState({}); // { [propId]: { config, status, providerName, providerTelegram, checklist, newItem, saving } }

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

      let { data: props } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (!props || props.length === 0) {
        const { data: teamEntry } = await supabase
          .from('team_members')
          .select('property_ids, account_owner_id')
          .eq('invited_email', user.email.toLowerCase())
          .eq('status', 'active')
          .maybeSingle();

        if (teamEntry) {
          if (teamEntry.property_ids === null) {
            const { data: allProps } = await supabase
              .from('properties')
              .select('*')
              .eq('owner_id', teamEntry.account_owner_id)
              .order('created_at', { ascending: false });
            props = allProps;
          } else {
            const { data: restrictedProps } = await supabase
              .from('properties')
              .select('*')
              .in('id', teamEntry.property_ids)
              .order('created_at', { ascending: false });
            props = restrictedProps;
          }
        }
      }

      const { data: prof } = await supabase.from('profiles').select('*, telegram_chat_id').eq('id', user.id).single();

      if (props) setProperties(props);
      if (prof) setProfile(prof);

      // Initialiser les tabs
      const tabs = {};
      const cleaning = {};
      props?.forEach(p => {
        tabs[p.id] = 'actions';
        cleaning[p.id] = { config: null, status: null, providerName: '', providerTelegram: '', checklist: [], newItem: '', saving: false };
      });
      setActiveTab(tabs);
      setCleaningData(cleaning);

    } catch (err) {
      console.error("Erreur chargement:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Charger les données ménage pour un logement ──
const loadCleaningData = async (propId) => {
  const { data: config } = await supabase
    .from('property_cleaning')
    .select('*, cleaning_providers(*)')
    .eq('property_id', propId)
    .maybeSingle();

  const res = await fetch(`/api/cleaning/status?propertyId=${propId}`);
  const statusData = await res.json();

  setCleaningData(prev => ({
    ...prev,
    [propId]: {
      ...prev[propId],
      config: config || false,
      status: statusData,
      providerName: config?.cleaning_providers?.name || '',
      providerTelegram: config?.cleaning_providers?.telegram_chat_id || '',
      checklist: config?.checklist || [],
    }
  }));
};

const switchTab = (propId, tab) => {
  setActiveTab(prev => ({ ...prev, [propId]: tab }));
  if (tab === 'menage') loadCleaningData(propId);
};

  const updateCleaning = (propId, key, value) => {
    setCleaningData(prev => ({ ...prev, [propId]: { ...prev[propId], [key]: value } }));
  };

  const addChecklistItem = (propId) => {
    const item = cleaningData[propId]?.newItem?.trim();
    if (!item) return;
    setCleaningData(prev => ({
      ...prev,
      [propId]: { ...prev[propId], checklist: [...(prev[propId].checklist || []), item], newItem: '' }
    }));
  };

  const removeChecklistItem = (propId, index) => {
    setCleaningData(prev => ({
      ...prev,
      [propId]: { ...prev[propId], checklist: prev[propId].checklist.filter((_, i) => i !== index) }
    }));
  };

  const saveCleaning = async (propId) => {
    updateCleaning(propId, 'saving', true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const d = cleaningData[propId];
      let providerId = d.config?.provider_id;

      if (providerId) {
        await supabase.from('cleaning_providers').update({
          name: d.providerName,
          telegram_chat_id: d.providerTelegram,
        }).eq('id', providerId);
      } else {
        const { data: newProvider } = await supabase
          .from('cleaning_providers')
          .insert({ owner_id: user.id, name: d.providerName, telegram_chat_id: d.providerTelegram })
          .select().single();
        providerId = newProvider.id;
      }

      await supabase.from('property_cleaning').upsert({
        property_id: propId,
        provider_id: providerId,
        checklist: d.checklist,
      }, { onConflict: 'property_id' });

      // Recharger la config
      const { data: newConfig } = await supabase
        .from('property_cleaning')
        .select('*, cleaning_providers(*)')
        .eq('property_id', propId)
        .maybeSingle();

      setCleaningData(prev => ({ ...prev, [propId]: { ...prev[propId], config: newConfig, saving: false } }));
      alert('✅ Configuration ménage sauvegardée !');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la sauvegarde.');
      updateCleaning(propId, 'saving', false);
    }
  };

  const triggerCleaning = async (propId) => {
    const d = cleaningData[propId];
    if (!d?.config) { alert('Configurez d\'abord un prestataire.'); return; }
    try {
      await fetch('/api/cleaning/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: propId }),
      });
      alert('✅ Prestataire notifié !');
      // Recharger le statut
      const res = await fetch(`/api/cleaning/status?propertyId=${propId}`);
      const statusData = await res.json();
      updateCleaning(propId, 'status', statusData);
    } catch (err) {
      alert('Erreur lors de la notification.');
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

  const resolveEmergency = async (prop) => {
    if (!window.confirm(`Confirmer que l'urgence sur "${prop.name}" est réglée ?`)) return;
    const { error } = await supabase.from('properties').update({ has_emergency: false }).eq('id', prop.id);
    if (!error) {
      setProperties(properties.map(p => p.id === prop.id ? { ...p, has_emergency: false } : p));
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

  const statusColors = {
    pending:     { bg: '#fff7ed', border: '#f97316', color: '#c2410c', label: '🔴 En attente' },
    in_progress: { bg: '#eff6ff', border: '#3b82f6', color: '#1d4ed8', label: '🟡 En cours' },
    completed:   { bg: '#f0fdf4', border: '#22c55e', color: '#15803d', label: '🟢 Terminé' },
  };

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

        .banner { border-radius: 16px; padding: 16px 20px; margin-bottom: 20px; display: flex; align-items: center; gap: 14px; }
        .banner.warning { background: #fff7ed; border: 1px solid #f97316; }
        .banner.success { background: #f0fdf4; border: 1px solid #10b981; }
        .banner-icon { font-size: 24px; flex-shrink: 0; }
        .banner-text { flex: 1; }
        .banner-text h4 { margin: 0 0 3px; font-weight: 800; font-size: 14px; color: #c2410c; }
        .banner-text p { margin: 0; font-size: 12px; color: #64748b; line-height: 1.4; }
        .btn-tg { background: #0088cc; color: white; padding: 10px 16px; border-radius: 10px; font-weight: 700; font-size: 13px; border: none; cursor: pointer; white-space: nowrap; }
        .banner-success-text { font-size: 14px; color: #059669; font-weight: 600; }

        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 18px; }
        .empty-state { background: white; padding: 50px 24px; border-radius: 24px; text-align: center; border: 2px dashed #e2e8f0; grid-column: 1 / -1; }

        .card { background: white; border-radius: 20px; border: 1px solid #e2e8f0; position: relative; box-shadow: 0 2px 8px rgba(0,0,0,0.04); transition: border-color 0.3s; overflow: hidden; }
        .card.emergency-active { border: 2px solid #ef4444 !important; box-shadow: 0 0 12px rgba(239, 68, 68, 0.15); }
        .card-top { padding: 18px 18px 0; }
        .emergency-badge { display: inline-block; background: #e11d48; color: white; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 800; animation: blinker 1.5s linear infinite; margin-bottom: 8px; }
        @keyframes blinker { 50% { opacity: 0.4; } }

        h3 { margin: 0 0 4px; color: #1a2a6c; font-size: 16px; font-weight: 800; line-height: 1.3; word-break: break-word; padding-right: 32px; }
        .address { color: #64748b; font-size: 12px; margin-bottom: 0; }
        .btn-delete { position: absolute; top: 14px; right: 12px; border: none; background: none; cursor: pointer; color: #cbd5e1; font-size: 15px; padding: 4px; z-index: 2; }
        .btn-delete:hover { color: #e11d48; }

        /* TABS */
        .card-tabs { display: flex; border-top: 1px solid #f1f5f9; margin-top: 14px; }
        .tab-btn { flex: 1; padding: 10px 8px; font-size: 12px; font-weight: 700; border: none; background: none; cursor: pointer; color: #94a3b8; border-bottom: 2px solid transparent; transition: 0.2s; font-family: inherit; }
        .tab-btn.active { color: #1a2a6c; border-bottom-color: #1a2a6c; background: #f8fafc; }
        .tab-btn:hover:not(.active) { color: #64748b; background: #fafafa; }

        /* TAB CONTENT */
        .tab-content { padding: 14px 18px 18px; }

        .btn-stack { display: flex; flex-direction: column; gap: 8px; }
        .action-btn { padding: 11px; border-radius: 10px; font-weight: 700; font-size: 13px; text-align: center; border: none; cursor: pointer; display: block; width: 100%; font-family: inherit; }
        .btn-primary { background: #1a2a6c; color: white; }
        .btn-welcome { background: #ecfdf5; color: #059669; border: 1px solid #10b981; }
        .btn-resolve { background: #f0fdf4; color: #15803d; border: 2px solid #22c55e; font-weight: 800; font-size: 13px; animation: pulse-green 2s ease-in-out infinite; }
        @keyframes pulse-green { 0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); } 50% { box-shadow: 0 0 0 6px rgba(34,197,94,0); } }
        .btn-history { background: #fdf2f8; color: #be185d; }
        .btn-cleaning { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }

        .activation-zone { background: #fffbeb; padding: 14px; border-radius: 12px; border: 1px solid #fef3c7; text-align: center; }
        .btn-activate { background: #fbbf24; border: none; padding: 12px; width: 100%; border-radius: 10px; font-weight: 800; color: #1a2a6c; cursor: pointer; font-size: 14px; font-family: inherit; }

        /* MÉNAGE */
        .cleaning-status { border-radius: 10px; padding: 10px 14px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; }
        .cleaning-input { width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13px; font-family: inherit; background: #f8fafc; margin-bottom: 8px; }
        .cleaning-input:focus { outline: none; border-color: #1a2a6c; }
        .cleaning-label { display: block; font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; margin-top: 10px; }
        .checklist-item { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
        .checklist-item span { flex: 1; padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; color: #1e293b; }
        .btn-remove { padding: 6px 10px; background: #fee2e2; border: none; border-radius: 6px; cursor: pointer; color: #e11d48; font-weight: 700; font-size: 12px; }
        .add-item-row { display: flex; gap: 6px; margin-top: 6px; }
        .btn-add-item { padding: 8px 12px; background: #1a2a6c; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 12px; white-space: nowrap; font-family: inherit; }
        .cleaning-actions { display: flex; gap: 8px; margin-top: 14px; }
        .btn-save-cleaning { flex: 1; padding: 10px; background: #fbbf24; color: #1a2a6c; border: none; border-radius: 10px; font-weight: 800; cursor: pointer; font-size: 13px; font-family: inherit; }
        .btn-notify-cleaning { flex: 1; padding: 10px; background: #f0fdf4; color: #15803d; border: 2px solid #22c55e; border-radius: 10px; font-weight: 800; cursor: pointer; font-size: 13px; font-family: inherit; }

        .subscription-card { margin-top: 36px; padding: 22px; background: white; border-radius: 20px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
        .btn-portal { background: #1a2a6c; color: white; padding: 11px 20px; border-radius: 12px; font-weight: 700; font-size: 14px; cursor: pointer; border: none; white-space: nowrap; }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15,23,42,0.85); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .modal-card { background: white; border-radius: 28px; padding: 32px 24px; max-width: 420px; width: 100%; text-align: center; }
        .btn-close-modal { background: #fbbf24; border: none; padding: 13px; width: 100%; border-radius: 12px; font-weight: 800; color: #1a2a6c; cursor: pointer; margin-top: 18px; font-size: 15px; font-family: inherit; }
        .info-box { background: #f1f5f9; padding: 13px; border-radius: 12px; margin-bottom: 18px; font-size: 13px; color: #475569; border-left: 4px solid #fbbf24; text-align: left; }
        .modal-actions { display: flex; gap: 10px; margin-top: 16px; }
        .btn-abort { flex: 1; padding: 12px; border-radius: 10px; border: 1px solid #e2e8f0; background: white; color: #64748b; font-weight: 700; cursor: pointer; font-family: inherit; }
        .btn-confirm-delete { flex: 1; padding: 12px; border-radius: 10px; border: none; background: #e11d48; color: white; font-weight: 700; cursor: pointer; font-family: inherit; }

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
          .grid { grid-template-columns: 1fr; gap: 12px; }
          .banner { flex-wrap: wrap; }
          .btn-tg { width: 100%; text-align: center; }
          .subscription-card { flex-direction: column; align-items: stretch; padding: 18px; text-align: center; }
          .btn-portal { width: 100%; }
          .modal-card { padding: 24px 18px; }
          .modal-actions { flex-direction: column; }
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

        {!telegramLinked && (
          <div className="banner warning">
            <div className="banner-icon">🚨</div>
            <div className="banner-text">
              <h4>Activez vos alertes urgences</h4>
              <p>Liez votre compte Telegram pour être alerté instantanément en cas d'urgence dans vos logements.</p>
            </div>
            <Link href="/settings" legacyBehavior>
              <a><button className="btn-tg">Lier Telegram →</button></a>
            </Link>
          </div>
        )}

        {telegramLinked && (
          <div className="banner success">
            <span style={{ fontSize: '20px' }}>✅</span>
            <span className="banner-success-text">Telegram connecté — alertes urgences actives</span>
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
            properties.map((prop) => {
              const tab = activeTab[prop.id] || 'actions';
              const cd = cleaningData[prop.id] || {};
              const currentStatus = cd.status?.status ? statusColors[cd.status.status] : null;

              return (
                <div key={prop.id} className={`card ${prop.has_emergency ? 'emergency-active' : ''}`}>
                  <button className="btn-delete" onClick={(e) => triggerDeleteRequest(e, prop)}>🗑️</button>

                  <div className="card-top">
                    {prop.has_emergency && <div className="emergency-badge">⚠️ URGENCE</div>}
                    <h3>{prop.name}</h3>
                    <p className="address">📍 {prop.street_number} {prop.address}{prop.city ? `, ${prop.city}` : ''}</p>
                  </div>

                  {!prop.is_active ? (
                    <div className="tab-content">
                      <div className="activation-zone">
                        <p style={{ fontSize: '13px', color: '#92400e', margin: '0 0 12px', fontWeight: 600 }}>Prêt à entrer en service.</p>
                        <button onClick={handlePayment} className="btn-activate">
                          {paymentLoading ? 'Connexion...' : 'Activer ce logement'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* TABS */}
                      <div className="card-tabs">
                        <button
                          className={`tab-btn ${tab === 'actions' ? 'active' : ''}`}
                          onClick={() => switchTab(prop.id, 'actions')}
                        >
                          🏠 Actions
                        </button>
                        <button
                          className={`tab-btn ${tab === 'menage' ? 'active' : ''}`}
                          onClick={() => switchTab(prop.id, 'menage')}
                        >
                          🧹 Ménage {currentStatus ? (currentStatus.label.split(' ')[0]) : ''}
                        </button>
                      </div>

                      {/* TAB ACTIONS */}
                      {tab === 'actions' && (
                        <div className="tab-content">
                          <div className="btn-stack">
                            {prop.has_emergency && (
                              <button onClick={() => resolveEmergency(prop)} className="action-btn btn-resolve">
                                ✅ Marquer comme résolu
                              </button>
                            )}
                            <Link href={`/property/${prop.id}`} legacyBehavior>
                              <a className="action-btn btn-primary">📊 Configurer le logement</a>
                            </Link>
                            <button onClick={() => copyWelcomeMessage(prop)} className="action-btn btn-welcome">
                              ✨ Lien Voyageur (Copier)
                            </button>
                            <Link href={`/history/${prop.id}`} legacyBehavior>
                              <a className="action-btn btn-history">📜 Historique des échanges</a>
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* TAB MÉNAGE */}
                      {tab === 'menage' && (
                        <div className="tab-content">

                          {/* STATUT */}
                          {currentStatus && (
                            <div className="cleaning-status" style={{ background: currentStatus.bg, border: `1px solid ${currentStatus.border}` }}>
                              <div>
                                <p style={{ margin: '0 0 2px', fontWeight: 800, color: currentStatus.color, fontSize: '13px' }}>{currentStatus.label}</p>
                                {cd.status?.providerName && (
                                  <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
                                    {cd.status.providerName}
                                    {cd.status.confirmedAt && ` — ${new Date(cd.status.confirmedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                                  </p>
                                )}
                              </div>
                              {cd.status?.photos?.length > 0 && (
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  {cd.status.photos.slice(0, 2).map((url, i) => (
                                    <img key={i} src={url} alt="" style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '6px' }} />
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* PRESTATAIRE */}
                          <label className="cleaning-label">Prestataire</label>
                          <input
                            className="cleaning-input"
                            placeholder="Nom du prestataire"
                            value={cd.providerName || ''}
                            onChange={e => updateCleaning(prop.id, 'providerName', e.target.value)}
                          />
                          <input
                            className="cleaning-input"
                            placeholder="Telegram Chat ID"
                            value={cd.providerTelegram || ''}
                            onChange={e => updateCleaning(prop.id, 'providerTelegram', e.target.value)}
                          />
                          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#94a3b8' }}>
                            Le prestataire doit démarrer @AlfredMajorBot sur Telegram.
                          </p>

                          {/* CHECKLIST */}
                          <label className="cleaning-label">Checklist ({(cd.checklist || []).length} éléments)</label>
                          {(cd.checklist || []).map((item, i) => (
                            <div key={i} className="checklist-item">
                              <span>✓ {item}</span>
                              <button className="btn-remove" onClick={() => removeChecklistItem(prop.id, i)}>✕</button>
                            </div>
                          ))}
                          <div className="add-item-row">
                            <input
                              className="cleaning-input"
                              style={{ margin: 0 }}
                              placeholder="ex: Changer les draps..."
                              value={cd.newItem || ''}
                              onChange={e => updateCleaning(prop.id, 'newItem', e.target.value)}
                              onKeyPress={e => e.key === 'Enter' && addChecklistItem(prop.id)}
                            />
                            <button className="btn-add-item" onClick={() => addChecklistItem(prop.id)}>+ Ajouter</button>
                          </div>

                          {/* BOUTONS */}
                          <div className="cleaning-actions">
                            <button
                              className="btn-save-cleaning"
                              onClick={() => saveCleaning(prop.id)}
                              disabled={cd.saving}
                            >
                              {cd.saving ? '⏳' : '💾 Sauvegarder'}
                            </button>
                            {cd.config && (
                              <button
                                className="btn-notify-cleaning"
                                onClick={() => triggerCleaning(prop.id)}
                              >
                                🧹 Notifier
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })
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

      {/* MODAL LIMITE */}
      {showLimitModal && (
        <div className="modal-overlay" onClick={() => setShowLimitModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <span style={{ fontSize: '46px', margin: '0 0 14px', display: 'block' }}>🎩</span>
            <h2 style={{ color: '#1a2a6c', margin: '0 0 10px', fontSize: '20px' }}>Activation requise</h2>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 20px' }}>Veuillez activer votre logement actuel avant d'en ajouter un nouveau.</p>
            <button className="btn-close-modal" onClick={() => setShowLimitModal(false)}>D'accord</button>
          </div>
        </div>
      )}

      {/* MODAL SUPPRESSION */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <span style={{ fontSize: '42px', margin: '0 0 14px', display: 'block' }}>⚠️</span>
            <h2 style={{ color: '#1a2a6c', margin: '0 0 10px', fontSize: '20px' }}>Supprimer {propertyToDelete?.name} ?</h2>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 16px' }}>Êtes-vous sûr ? Toute la configuration sera effacée.</p>
            <div className="info-box">
              <strong>📌 Note :</strong> Votre licence reste active jusqu'à la fin du mois.
            </div>
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
