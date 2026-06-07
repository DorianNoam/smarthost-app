import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

function AddUpsellForm({ propId, onAdded, supabase }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', emoji: '✨', category: 'flexibility', description: '' });
  const PRESETS = [
    { name: 'Late check-out', emoji: '🕐', category: 'flexibility', price: '30', description: "Départ jusqu'à 14h" },
    { name: 'Early check-in', emoji: '🌅', category: 'flexibility', price: '25', description: "Arrivée dès 10h" },
    { name: 'Pack romantique', emoji: '🥂', category: 'experience', price: '45', description: 'Champagne, fleurs' },
    { name: 'Ménage mi-séjour', emoji: '🧹', category: 'comfort', price: '35', description: 'Nettoyage pendant le séjour' },
    { name: 'Transfert aéroport', emoji: '🚗', category: 'practical', price: '50', description: 'Navette privée' },
    { name: 'Pack bébé', emoji: '👶', category: 'comfort', price: '20', description: 'Lit parapluie + chaise haute' },
  ];
  const handleSave = async () => {
    if (!form.name || !form.price) return;
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/upsells/manage', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` }, body: JSON.stringify({ propertyId: propId, ...form, price: parseFloat(form.price) }) });
      if (res.ok) { setForm({ name: '', price: '', emoji: '✨', category: 'flexibility', description: '' }); setOpen(false); onAdded(); }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };
  const inp = { background: '#fff', border: '1px solid #e8e8ed', borderRadius: '10px', padding: '12px', fontSize: '15px', fontFamily: 'inherit', outline: 'none', color: '#1d1d1f', width: '100%', boxSizing: 'border-box' };
  if (!open) return (
    <button onClick={() => setOpen(true)} style={{ width: '100%', padding: '14px', background: '#f5f5f7', border: '2px dashed #d2d2d7', borderRadius: '12px', color: '#86868b', fontWeight: '500', fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit' }}>
      + Ajouter un upsell
    </button>
  );
  return (
    <div style={{ background: '#f5f5f7', border: '1px solid #e8e8ed', borderRadius: '14px', padding: '16px', marginTop: '4px' }}>
      <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '600', color: '#1d1d1f', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Preset ou personnalisé</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
        {PRESETS.map(p => (
          <button key={p.name} onClick={() => setForm({ name: p.name, price: p.price, emoji: p.emoji, category: p.category, description: p.description })}
            style={{ background: form.name === p.name ? '#1d1d1f' : '#fff', color: form.name === p.name ? '#fff' : '#1d1d1f', border: '1px solid #e8e8ed', padding: '8px 12px', borderRadius: '980px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
            {p.emoji} {p.name}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Nom du service" style={inp} />
        <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="€" style={{ ...inp, width: '70px', flexShrink: 0 }} />
        <input value={form.emoji} onChange={e => setForm(p => ({ ...p, emoji: e.target.value }))} style={{ ...inp, width: '52px', flexShrink: 0, textAlign: 'center', fontSize: '18px' }} />
      </div>
      <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description courte (optionnel)" style={{ ...inp, marginBottom: '12px' }} />
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => setOpen(false)} style={{ flex: 1, padding: '12px', background: '#fff', border: '1px solid #e8e8ed', borderRadius: '10px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', color: '#6e6e73' }}>Annuler</button>
        <button onClick={handleSave} disabled={saving || !form.name || !form.price} style={{ flex: 2, padding: '12px', background: !form.name || !form.price ? '#aeaeb2' : '#1d1d1f', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
          {saving ? '⏳' : '✅ Ajouter'}
        </button>
      </div>
    </div>
  );
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
  const [activeTab, setActiveTab] = useState({});
  const [cleaningData, setCleaningData] = useState({});
  const [reservationsData, setReservationsData] = useState({});
  const [upsellsData, setUpsellsData] = useState({});
  const [connectStatus, setConnectStatus] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const runIcalSync = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      await fetch('/api/ical-sync-manual', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` } });
    } catch {}
  };

  useEffect(() => {
    fetchData(); runIcalSync();
    if (router.query.success) { const t = setTimeout(() => fetchData(), 1500); return () => clearTimeout(t); }
  }, [router.query]);

  useEffect(() => {
    const h = () => { if (document.visibilityState === 'visible') runIcalSync(); };
    document.addEventListener('visibilitychange', h);
    return () => document.removeEventListener('visibilitychange', h);
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      let { data: props } = await supabase.from('properties').select('*').eq('owner_id', user.id).order('created_at', { ascending: false });
      if (!props || props.length === 0) {
        const { data: teamEntry } = await supabase.from('team_members').select('property_ids, account_owner_id').eq('invited_email', user.email.toLowerCase()).eq('status', 'active').maybeSingle();
        if (teamEntry) {
          if (teamEntry.property_ids === null) { const { data: all } = await supabase.from('properties').select('*').eq('owner_id', teamEntry.account_owner_id).order('created_at', { ascending: false }); props = all; }
          else { const { data: restricted } = await supabase.from('properties').select('*').in('id', teamEntry.property_ids).order('created_at', { ascending: false }); props = restricted; }
        }
      }
      const { data: prof } = await supabase.from('profiles').select('*, telegram_chat_id').eq('id', user.id).single();
      if (props) setProperties(props);
      if (prof) setProfile(prof);
      const tabs = {}; const cleaning = {};
      props?.forEach(p => { tabs[p.id] = 'actions'; cleaning[p.id] = { config: null, status: null, providerName: '', providerTelegram: '', checklist: [], newItem: '', saving: false, inviteName: '', inviteEmail: '', inviting: false }; });
      setActiveTab(tabs); setCleaningData(cleaning);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) { const csRes = await fetch('/api/connect/status', { headers: { 'Authorization': `Bearer ${session.access_token}` } }); const csData = await csRes.json(); setConnectStatus(csData.status); }
      } catch {}
      if (props) {
        const today = new Date().toISOString().split('T')[0]; const resMap = {};
        await Promise.all(props.filter(p => p.is_active).map(async (prop) => { const { data } = await supabase.from('reservations').select('*').eq('property_id', prop.id).eq('status', 'confirmed').gte('check_out', today).order('check_in', { ascending: true }).limit(10); resMap[prop.id] = data || []; }));
        setReservationsData(resMap);
      }
      if (props) {
        for (const prop of props) {
          const { data: config } = await supabase.from('property_cleaning').select('*, cleaning_providers(*)').eq('property_id', prop.id).maybeSingle();
          if (config) setCleaningData(prev => ({ ...prev, [prop.id]: { ...prev[prop.id], config, providerName: config?.cleaning_providers?.name || '', providerTelegram: config?.cleaning_providers?.telegram_chat_id || '', checklist: config?.checklist || [] } }));
        }
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadUpsells = async (propId) => {
    setUpsellsData(prev => ({ ...prev, [propId]: { ...prev[propId], loading: true } }));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const [upsellsRes, ordersRes] = await Promise.all([
        fetch(`/api/upsells/manage?propertyId=${propId}`, { headers: { 'Authorization': `Bearer ${session.access_token}` } }),
        supabase.from('upsell_orders').select('*').eq('property_id', propId).eq('status', 'paid').order('paid_at', { ascending: false }).limit(20),
      ]);
      const upsellsJson = await upsellsRes.json();
      setUpsellsData(prev => ({ ...prev, [propId]: { upsells: upsellsJson.upsells || [], orders: ordersRes.data || [], loading: false } }));
    } catch { setUpsellsData(prev => ({ ...prev, [propId]: { upsells: [], orders: [], loading: false } })); }
  };

  const loadReservations = async (propId) => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase.from('reservations').select('*').eq('property_id', propId).eq('status', 'confirmed').gte('check_out', today).order('check_in', { ascending: true }).limit(10);
    setReservationsData(prev => ({ ...prev, [propId]: data || [] }));
  };

  const loadCleaningData = async (propId) => {
    const { data: config } = await supabase.from('property_cleaning').select('*, cleaning_providers(*)').eq('property_id', propId).maybeSingle();
    const res = await fetch(`/api/cleaning/status?propertyId=${propId}`);
    const statusData = await res.json();
    setCleaningData(prev => ({ ...prev, [propId]: { ...prev[propId], config: config || false, status: statusData, providerName: config?.cleaning_providers?.name || '', providerTelegram: config?.cleaning_providers?.telegram_chat_id || '', checklist: config?.checklist || [] } }));
  };

  const switchTab = (propId, tab) => {
    setActiveTab(prev => ({ ...prev, [propId]: tab }));
    if (tab === 'menage') loadCleaningData(propId);
    if (tab === 'reservations') loadReservations(propId);
    if (tab === 'upsells') loadUpsells(propId);
  };

  const updateCleaning = (propId, key, value) => setCleaningData(prev => ({ ...prev, [propId]: { ...prev[propId], [key]: value } }));
  const addChecklistItem = (propId) => { const item = cleaningData[propId]?.newItem?.trim(); if (!item) return; setCleaningData(prev => ({ ...prev, [propId]: { ...prev[propId], checklist: [...(prev[propId].checklist || []), item], newItem: '' } })); };
  const removeChecklistItem = (propId, index) => setCleaningData(prev => ({ ...prev, [propId]: { ...prev[propId], checklist: prev[propId].checklist.filter((_, i) => i !== index) } }));

  const saveCleaning = async (propId) => {
    updateCleaning(propId, 'saving', true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const d = cleaningData[propId]; let providerId = d.config?.provider_id;
      if (providerId) { await supabase.from('cleaning_providers').update({ name: d.providerName, telegram_chat_id: d.providerTelegram }).eq('id', providerId); }
      else { const { data: newProvider } = await supabase.from('cleaning_providers').insert({ owner_id: user.id, name: d.providerName, telegram_chat_id: d.providerTelegram }).select().single(); providerId = newProvider?.id; }
      await supabase.from('property_cleaning').upsert({ property_id: propId, provider_id: providerId, checklist: d.checklist }, { onConflict: 'property_id' });
      await loadCleaningData(propId); alert('✅ Configuration ménage sauvegardée !');
    } catch (err) { console.error(err); alert('Erreur lors de la sauvegarde.'); updateCleaning(propId, 'saving', false); }
  };

  const triggerCleaning = async (propId) => {
    const d = cleaningData[propId];
    if (!d?.config) { alert("Configurez d'abord un prestataire."); return; }
    try {
      await fetch('/api/cleaning/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ propertyId: propId }) });
      alert('✅ Prestataire notifié !');
      const res = await fetch(`/api/cleaning/status?propertyId=${propId}`); const statusData = await res.json(); updateCleaning(propId, 'status', statusData);
    } catch { alert('Erreur lors de la notification.'); }
  };

  const inviteCleaner = async (propId) => {
    const d = cleaningData[propId];
    if (!d?.inviteName?.trim() || !d?.inviteEmail?.trim()) { alert("Veuillez renseigner le nom et l'email du prestataire."); return; }
    updateCleaning(propId, 'inviting', true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/cleaning/invite-cleaner', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` }, body: JSON.stringify({ cleanerName: d.inviteName.trim(), cleanerEmail: d.inviteEmail.trim(), propertyId: propId }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'invitation");
      alert(`✅ Invitation envoyée à ${d.inviteEmail} !`); await loadCleaningData(propId);
    } catch (err) { alert('Erreur : ' + err.message); }
    finally { updateCleaning(propId, 'inviting', false); }
  };

  const removeCleaner = async (propId) => {
    const d = cleaningData[propId]; const name = d?.config?.cleaning_providers?.name || 'ce prestataire';
    if (!window.confirm(`Retirer ${name} de ce logement ?`)) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/cleaning/remove-cleaner', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` }, body: JSON.stringify({ propertyId: propId, deleteProvider: false }) });
      if (!res.ok) throw new Error("Erreur lors de la suppression"); await loadCleaningData(propId);
    } catch (err) { alert('Erreur : ' + err.message); }
  };

  const copyWelcomeMessage = (prop) => {
    const identifier = prop.slug || prop.id;
    const guestLink = `${window.location.origin}/m/${identifier}`;
    const message = `Bonjour ! 👋\nPour toute question pendant votre séjour — WiFi, équipements, bonnes adresses — vous pouvez contacter mon assistant disponible 24h/24 :\n👉 ${guestLink}\n\nBon séjour ! 🎩`;
    navigator.clipboard.writeText(message); alert(`Lien Voyageur copié pour "${prop.name}" !`);
  };

  const handleAddClick = (e) => { e.preventDefault(); const hasInactive = properties.some(p => !p.is_active); if (hasInactive) setShowLimitModal(true); else router.push('/add-property'); };
  const handlePayment = async (e) => {
    e.preventDefault(); setPaymentLoading(true);
    try { const { data: { user } } = await supabase.auth.getUser(); const res = await fetch('/api/create-checkout-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, userEmail: user.email }) }); const data = await res.json(); if (data.url) window.location.href = data.url; }
    catch { alert("Erreur de connexion à Stripe."); }
    finally { setPaymentLoading(false); }
  };
  const handleManageSubscription = async () => {
    try { const res = await fetch('/api/create-portal-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: profile?.id }) }); const data = await res.json(); if (data.url) window.location.href = data.url; }
    catch (err) { console.error(err); }
  };
  const triggerDeleteRequest = (e, prop) => { e.stopPropagation(); setPropertyToDelete(prop); setShowDeleteModal(true); };
  const confirmDelete = async () => {
    if (!propertyToDelete) return;
    const { error } = await supabase.from('properties').delete().eq('id', propertyToDelete.id);
    if (!error) { setProperties(properties.filter(p => p.id !== propertyToDelete.id)); setShowDeleteModal(false); setPropertyToDelete(null); }
  };
  const resolveEmergency = async (prop) => {
    if (!window.confirm(`Confirmer que l'urgence sur "${prop.name}" est réglée ?`)) return;
    const { error } = await supabase.from('properties').update({ has_emergency: false }).eq('id', prop.id);
    if (!error) setProperties(properties.map(p => p.id === prop.id ? { ...p, has_emergency: false } : p));
  };
  const handleDeleteAccount = async () => {
    if (window.confirm("Supprimer votre compte ?") && window.prompt("Tapez 'SUPPRIMER' :") === "SUPPRIMER") {
      await supabase.from('profiles').delete().eq('id', profile.id); await supabase.auth.signOut(); router.push('/');
    }
  };

  const statusColors = {
    pending:     { bg: '#fff7ed', border: '#f97316', color: '#c2410c', label: '🔴 En attente' },
    in_progress: { bg: '#eff6ff', border: '#3b82f6', color: '#1d4ed8', label: '🟡 En cours' },
    completed:   { bg: '#f0fdf4', border: '#22c55e', color: '#15803d', label: '🟢 Terminé' },
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, -apple-system, sans-serif', color: '#86868b', fontSize: '16px', background: '#f5f5f7' }}>
      Chargement...
    </div>
  );

  const telegramLinked = !!profile?.telegram_chat_id;

  const tabBtn = (active) => ({
    flex: 1, padding: '12px 4px', fontSize: '12px', fontWeight: active ? '600' : '400',
    border: 'none', background: active ? '#fff' : 'transparent', cursor: 'pointer',
    color: active ? '#1d1d1f' : '#86868b',
    borderBottom: active ? '2px solid #1d1d1f' : '2px solid transparent',
    transition: '0.2s', fontFamily: 'inherit',
  });
  const actionBtn = (bg, color, border) => ({
    padding: '14px', borderRadius: '12px', fontWeight: '500', fontSize: '15px',
    textAlign: 'center', border: border || 'none', cursor: 'pointer',
    display: 'block', width: '100%', fontFamily: 'inherit',
    background: bg, color, transition: '0.15s',
  });
  const cleanInput = { width: '100%', padding: '12px 14px', border: '1px solid #e8e8ed', borderRadius: '10px', fontSize: '15px', fontFamily: 'inherit', background: '#f5f5f7', outline: 'none', marginBottom: '10px', color: '#1d1d1f', boxSizing: 'border-box' };
  const cleanLabel = { display: 'block', fontSize: '11px', fontWeight: '600', color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', marginTop: '12px' };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f5f5f7; -webkit-font-smoothing: antialiased; }
        a { text-decoration: none !important; color: inherit; }

        /* ── SIDEBAR desktop ── */
        .sidebar {
          width: 220px; background: #1d1d1f; color: #fff;
          padding: 28px 16px; position: fixed; height: 100vh;
          z-index: 200; display: flex; flex-direction: column;
          transition: transform 0.3s ease;
        }
        .main-content { margin-left: 220px; padding: 40px; }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
            width: 280px;
          }
          .sidebar.open { transform: translateX(0); }
          .main-content { margin-left: 0; padding: 16px; padding-top: 72px; }
          .sidebar-overlay {
            display: none; position: fixed; inset: 0;
            background: rgba(0,0,0,0.5); z-index: 150;
          }
          .sidebar-overlay.open { display: block; }
          .mobile-topbar { display: flex !important; }
          .desktop-only { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobile-topbar { display: none !important; }
          .sidebar-overlay { display: none !important; }
        }
      `}</style>

      {/* ── MOBILE TOP BAR ── */}
      <div className="mobile-topbar" style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '60px', background: '#1d1d1f', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 100 }}>
        <span style={{ fontSize: '17px', fontWeight: '600', color: '#fff', letterSpacing: '-0.3px' }}>
          Alfred<span style={{ color: '#c9a227' }}>Major</span> 🎩
        </span>
        <button onClick={() => setMenuOpen(true)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '8px 10px', cursor: 'pointer', fontSize: '18px', color: '#fff' }}>
          ☰
        </button>
      </div>

      {/* ── SIDEBAR OVERLAY (mobile) ── */}
      <div className={`sidebar-overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} />

      {/* ── SIDEBAR ── */}
      <nav className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div style={{ fontSize: '17px', fontWeight: '600', marginBottom: '36px', textAlign: 'center', letterSpacing: '-0.3px' }}>
          Alfred<span style={{ color: '#c9a227' }}>Major</span> 🎩
        </div>
        {[
          { href: '/dashboard', label: 'Logements', icon: '🏠', active: true },
          { href: '/settings', label: 'Paramètres', icon: '⚙️', active: false },
        ].map(({ href, label, icon, active }) => (
          <Link key={href} href={href} onClick={() => setMenuOpen(false)} style={{ padding: '13px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: active ? '500' : '400', fontSize: '15px', opacity: active ? 1 : 0.6, marginBottom: '4px', color: active ? '#c9a227' : '#fff', background: active ? 'rgba(255,255,255,0.08)' : 'transparent', transition: '0.2s' }}>
            <span>{icon}</span> <span>{label}</span>
          </Link>
        ))}
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link href="/tutorial" onClick={() => setMenuOpen(false)} style={{ display: 'block', background: '#c9a227', color: '#1d1d1f', padding: '11px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>
            ❓ Comment ça marche ?
          </Link>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/'); }} style={{ width: '100%', padding: '11px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: '400', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>
            🚪 Déconnexion
          </button>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <main className="main-content">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '600', color: '#1d1d1f', letterSpacing: '-0.6px' }}>Mes Logements</h1>
          <button onClick={handleAddClick} style={{ background: '#c9a227', color: '#1d1d1f', padding: '12px 20px', borderRadius: '980px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', border: 'none', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            + Ajouter
          </button>
        </div>

        {/* Telegram banner */}
        {!telegramLinked && (
          <div style={{ background: '#fff7ed', border: '1px solid #f5d58a', borderRadius: '14px', padding: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '22px' }}>🚨</span>
            <div style={{ flex: 1, minWidth: '160px' }}>
              <p style={{ fontWeight: '600', fontSize: '15px', color: '#92400e', margin: '0 0 3px' }}>Activez vos alertes urgences</p>
              <p style={{ fontSize: '13px', color: '#a16207', margin: 0, fontWeight: '300' }}>Liez Telegram pour être alerté instantanément.</p>
            </div>
            <Link href="/settings" style={{ background: '#0088cc', color: '#fff', padding: '10px 16px', borderRadius: '980px', fontSize: '14px', fontWeight: '500', whiteSpace: 'nowrap' }}>
              Lier →
            </Link>
          </div>
        )}
        {telegramLinked && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '14px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>✅</span>
            <span style={{ fontSize: '14px', color: '#15803d', fontWeight: '500' }}>Telegram connecté — alertes urgences actives</span>
          </div>
        )}

        {/* Properties grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: '16px' }}>
          {properties.length === 0 ? (
            <div style={{ background: '#fff', padding: '48px 24px', borderRadius: '20px', textAlign: 'center', border: '2px dashed #e8e8ed', gridColumn: '1 / -1' }}>
              <span style={{ fontSize: '44px', display: 'block', marginBottom: '16px' }}>✨</span>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1d1d1f', margin: '0 0 10px' }}>Bienvenue sur Alfred Major !</h2>
              <p style={{ color: '#86868b', maxWidth: '300px', margin: '0 auto 24px', fontSize: '15px', fontWeight: '300' }}>Ajoutez votre premier logement pour configurer votre majordome.</p>
              <button onClick={handleAddClick} style={{ background: '#c9a227', color: '#1d1d1f', padding: '14px 28px', borderRadius: '980px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}>
                Créer mon premier logement
              </button>
            </div>
          ) : properties.map((prop) => {
            const tab = activeTab[prop.id] || 'actions';
            const cd = cleaningData[prop.id] || {};
            const currentStatus = cd.status?.status ? statusColors[cd.status.status] : null;

            return (
              <div key={prop.id} style={{ background: '#fff', borderRadius: '18px', border: prop.has_emergency ? '2px solid #ef4444' : '1px solid #e8e8ed', boxShadow: prop.has_emergency ? '0 0 20px rgba(239,68,68,0.12)' : '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden', position: 'relative' }}>

                <button onClick={(e) => triggerDeleteRequest(e, prop)} style={{ position: 'absolute', top: '14px', right: '12px', border: 'none', background: 'none', cursor: 'pointer', color: '#d2d2d7', fontSize: '16px', padding: '4px', zIndex: 2 }}>🗑️</button>

                <div style={{ padding: '18px 18px 0' }}>
                  {prop.has_emergency && (
                    <div style={{ display: 'inline-block', background: '#ef4444', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>⚠️ URGENCE</div>
                  )}
                  <h3 style={{ margin: '0 0 4px', color: '#1d1d1f', fontSize: '17px', fontWeight: '600', letterSpacing: '-0.3px', paddingRight: '32px' }}>{prop.name}</h3>
                  <p style={{ color: '#86868b', fontSize: '14px', margin: '0', fontWeight: '300' }}>📍 {prop.street_number} {prop.address}{prop.city ? `, ${prop.city}` : ''}</p>
                </div>

                {!prop.is_active ? (
                  <div style={{ padding: '16px' }}>
                    <div style={{ background: '#fff8e8', padding: '16px', borderRadius: '12px', border: '1px solid #f5d58a', textAlign: 'center' }}>
                      <p style={{ fontSize: '14px', color: '#92400e', margin: '0 0 12px', fontWeight: '500' }}>Prêt à entrer en service.</p>
                      <button onClick={handlePayment} style={{ background: '#c9a227', border: 'none', padding: '14px', width: '100%', borderRadius: '980px', fontWeight: '600', color: '#1d1d1f', cursor: 'pointer', fontSize: '15px', fontFamily: 'inherit' }}>
                        {paymentLoading ? 'Connexion...' : 'Activer ce logement'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Tabs */}
                    <div style={{ display: 'flex', borderTop: '1px solid #f5f5f7', marginTop: '14px', background: '#f5f5f7' }}>
                      {[['actions','🏠 Actions'], ['menage','🧹 Ménage'], ['reservations','📅 Calendrier'], ['upsells','💰 Upsells']].map(([id, label]) => (
                        <button key={id} onClick={() => switchTab(prop.id, id)} style={tabBtn(tab === id)}>{label}</button>
                      ))}
                    </div>

                    <div style={{ padding: '16px' }}>

                      {/* ── ACTIONS TAB ── */}
                      {tab === 'actions' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {prop.has_emergency && (
                            <button onClick={() => resolveEmergency(prop)} style={actionBtn('#f0fdf4', '#15803d', '2px solid #22c55e')}>✅ Marquer comme résolu</button>
                          )}
                          <Link href={`/add-property?id=${prop.id}`} style={actionBtn('#1d1d1f', '#fff')}>📊 Configurer le logement</Link>
                          <button onClick={() => copyWelcomeMessage(prop)} style={actionBtn('#f0fdf4', '#15803d', '1px solid #bbf7d0')}>✨ Lien Voyageur (Copier)</button>
                          <Link href={`/history/${prop.id}`} style={actionBtn('#f5f0fa', '#7e22ce', '1px solid #e9d5ff')}>📜 Historique des échanges</Link>
                        </div>
                      )}

                      {/* ── MÉNAGE TAB ── */}
                      {tab === 'menage' && (
                        <div>
                          {currentStatus && (
                            <div style={{ background: currentStatus.bg, border: `1px solid ${currentStatus.border}`, borderRadius: '10px', padding: '12px 14px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <p style={{ margin: '0 0 2px', fontWeight: '600', color: currentStatus.color, fontSize: '14px' }}>{currentStatus.label}</p>
                                {cd.status?.providerName && <p style={{ margin: 0, fontSize: '12px', color: '#6e6e73' }}>{cd.status.providerName}</p>}
                              </div>
                              {cd.status?.photos?.length > 0 && (
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  {cd.status.photos.slice(0, 2).map((url, i) => <img key={i} src={url} alt="" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px' }} />)}
                                </div>
                              )}
                            </div>
                          )}

                          {cd.config?.cleaning_providers ? (
                            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '14px', marginBottom: '14px' }}>
                              <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '600', color: '#6e6e73', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Prestataire assigné</p>
                              <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#15803d', fontSize: '16px' }}>🧹 {cd.config.cleaning_providers.name}</p>
                              <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#6e6e73', fontWeight: '300' }}>{cd.config.cleaning_providers.email}</p>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => triggerCleaning(prop.id)} style={{ flex: 1, padding: '11px', background: '#1d1d1f', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '500', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>🧹 Notifier</button>
                                <button onClick={() => removeCleaner(prop.id)} style={{ padding: '11px 14px', background: '#fff2f2', color: '#e11d48', border: 'none', borderRadius: '10px', fontWeight: '500', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>🗑️</button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ marginBottom: '14px' }}>
                              <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#6e6e73', fontWeight: '300', lineHeight: 1.6 }}>Invitez votre prestataire de ménage. Il recevra un email pour créer son compte.</p>
                              <span style={cleanLabel}>Prénom et nom</span>
                              <input placeholder="ex: Marie Dupont" value={cd.inviteName || ''} onChange={e => updateCleaning(prop.id, 'inviteName', e.target.value)} style={cleanInput} />
                              <span style={cleanLabel}>Email du prestataire</span>
                              <input type="email" placeholder="ex: marie@menage.fr" value={cd.inviteEmail || ''} onChange={e => updateCleaning(prop.id, 'inviteEmail', e.target.value)} style={cleanInput} />
                              <button onClick={() => inviteCleaner(prop.id)} disabled={cd.inviting} style={{ width: '100%', padding: '13px', background: '#c9a227', color: '#1d1d1f', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '15px', fontFamily: 'inherit', marginTop: '4px' }}>
                                {cd.inviting ? '⏳ Envoi...' : "✉️ Envoyer l'invitation"}
                              </button>
                            </div>
                          )}

                          <span style={cleanLabel}>Checklist ({(cd.checklist || []).length} éléments)</span>
                          {(cd.checklist || []).map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                              <span style={{ flex: 1, padding: '10px 12px', background: '#f5f5f7', border: '1px solid #e8e8ed', borderRadius: '8px', fontSize: '14px', color: '#1d1d1f', fontWeight: '300' }}>✓ {item}</span>
                              <button onClick={() => removeChecklistItem(prop.id, i)} style={{ padding: '8px 12px', background: '#fff2f2', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#e11d48', fontWeight: '600', fontSize: '14px' }}>✕</button>
                            </div>
                          ))}
                          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <input placeholder="ex: Changer les draps..." value={cd.newItem || ''} onChange={e => updateCleaning(prop.id, 'newItem', e.target.value)} onKeyPress={e => e.key === 'Enter' && addChecklistItem(prop.id)} style={{ ...cleanInput, margin: 0, flex: 1 }} />
                            <button onClick={() => addChecklistItem(prop.id)} style={{ padding: '10px 14px', background: '#1d1d1f', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>+ Add</button>
                          </div>
                          <button onClick={() => saveCleaning(prop.id)} disabled={cd.saving} style={{ width: '100%', marginTop: '12px', padding: '13px', background: '#c9a227', color: '#1d1d1f', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '15px', fontFamily: 'inherit' }}>
                            {cd.saving ? '⏳' : '💾 Sauvegarder la checklist'}
                          </button>
                        </div>
                      )}

                      {/* ── UPSELLS TAB ── */}
                      {tab === 'upsells' && (() => {
                        const ud = upsellsData[prop.id];
                        if (connectStatus !== 'active') return (
                          <div style={{ textAlign: 'center', padding: '24px 0' }}>
                            <p style={{ fontSize: '36px', margin: '0 0 10px' }}>💳</p>
                            <p style={{ fontSize: '15px', fontWeight: '600', color: '#1d1d1f', margin: '0 0 6px' }}>Connectez votre compte Stripe</p>
                            <p style={{ fontSize: '14px', color: '#86868b', margin: '0 0 16px', fontWeight: '300' }}>{connectStatus === 'pending' ? 'Votre compte est en cours de vérification.' : 'Nécessaire pour encaisser les upsells.'}</p>
                            <Link href="/settings" style={{ display: 'inline-block', background: '#1d1d1f', color: '#fff', padding: '12px 20px', borderRadius: '980px', fontSize: '14px', fontWeight: '500' }}>
                              Configurer →
                            </Link>
                          </div>
                        );
                        if (!ud || ud.loading) return <p style={{ color: '#86868b', fontSize: '14px', textAlign: 'center', padding: '20px 0', fontWeight: '300' }}>Chargement...</p>;
                        const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.alfredmajor.com';
                        const upsellsUrl = `${siteUrl}/upsells/${prop.slug || prop.id}`;
                        return (
                          <div>
                            {ud.orders.length > 0 && (
                              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '14px', marginBottom: '14px' }}>
                                <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '600', color: '#6e6e73', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Revenus upsells</p>
                                <p style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: '600', color: '#15803d', letterSpacing: '-0.5px' }}>{ud.orders.reduce((sum, o) => sum + (o.amount || 0), 0).toFixed(2)} €</p>
                                {ud.orders.slice(0, 3).map(order => (
                                  <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6e6e73', fontWeight: '300' }}>
                                    <span>{order.guest_name || 'Voyageur'}</span>
                                    <span style={{ fontWeight: '600', color: '#15803d' }}>{order.amount?.toFixed(2)} €</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div style={{ background: '#f5f5f7', border: '1px solid #e8e8ed', borderRadius: '10px', padding: '12px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                              <p style={{ margin: 0, fontSize: '12px', color: '#86868b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, fontWeight: '300' }}>{upsellsUrl}</p>
                              <button onClick={() => { navigator.clipboard.writeText(upsellsUrl); alert('Lien copié !'); }} style={{ background: '#1d1d1f', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>Copier</button>
                            </div>
                            {ud.upsells.length === 0 ? (
                              <p style={{ fontSize: '14px', color: '#aeaeb2', textAlign: 'center', padding: '10px 0', fontWeight: '300' }}>Aucun upsell configuré.</p>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                                {ud.upsells.map(upsell => (
                                  <div key={upsell.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 12px', background: upsell.is_active ? '#f5f5f7' : '#fff2f2', border: `1px solid ${upsell.is_active ? '#e8e8ed' : '#ffd0d0'}`, borderRadius: '10px' }}>
                                    <span style={{ fontSize: '20px' }}>{upsell.emoji}</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#1d1d1f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{upsell.name}</p>
                                      <p style={{ margin: 0, fontSize: '12px', color: '#86868b', fontWeight: '300' }}>{upsell.price} €</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                      <button onClick={async () => { const { data: { session } } = await supabase.auth.getSession(); await fetch('/api/upsells/manage', { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` }, body: JSON.stringify({ upsellId: upsell.id, is_active: !upsell.is_active }) }); loadUpsells(prop.id); }} style={{ background: upsell.is_active ? '#f0fdf4' : '#f5f5f7', color: upsell.is_active ? '#15803d' : '#aeaeb2', border: `1px solid ${upsell.is_active ? '#bbf7d0' : '#e8e8ed'}`, padding: '6px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>{upsell.is_active ? '✓' : '○'}</button>
                                      <button onClick={async () => { if (!confirm('Supprimer ?')) return; const { data: { session } } = await supabase.auth.getSession(); await fetch('/api/upsells/manage', { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` }, body: JSON.stringify({ upsellId: upsell.id }) }); loadUpsells(prop.id); }} style={{ background: '#fff2f2', color: '#e11d48', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>🗑️</button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            <AddUpsellForm propId={prop.id} onAdded={() => loadUpsells(prop.id)} supabase={supabase} />
                          </div>
                        );
                      })()}

                      {/* ── RÉSERVATIONS TAB ── */}
                      {tab === 'reservations' && (() => {
                        const reservations = reservationsData[prop.id] || [];
                        if (reservations.length === 0) return (
                          <div style={{ textAlign: 'center', padding: '24px 0' }}>
                            <p style={{ fontSize: '36px', margin: '0 0 10px' }}>📅</p>
                            <p style={{ fontSize: '14px', color: '#86868b', margin: '0 0 12px', fontWeight: '300' }}>{prop.ical_url ? 'Aucune réservation à venir.' : 'Ajoutez votre lien iCal dans la configuration.'}</p>
                            {!prop.ical_url && <Link href={`/edit-property?id=${prop.id}`} style={{ display: 'inline-block', background: '#1d1d1f', color: '#fff', padding: '10px 18px', borderRadius: '980px', fontSize: '13px', fontWeight: '500' }}>Configurer iCal →</Link>}
                          </div>
                        );
                        const pc = { airbnb: { bg: '#fff1f0', color: '#e11d48', label: 'Airbnb' }, booking: { bg: '#eff6ff', color: '#1d4ed8', label: 'Booking' }, vrbo: { bg: '#fefce8', color: '#ca8a04', label: 'Vrbo' }, unknown: { bg: '#f5f5f7', color: '#6e6e73', label: 'Autre' } };
                        const fmtDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
                        const today = new Date(); today.setHours(0,0,0,0);
                        return reservations.map((res) => {
                          const checkIn = new Date(res.check_in); const checkOut = new Date(res.check_out);
                          const nights = Math.round((checkOut - checkIn) / 86400000);
                          const isActive = checkOut >= today && checkIn <= today;
                          const pcc = pc[res.platform] || pc.unknown;
                          return (
                            <div key={res.id} style={{ border: `1px solid ${isActive ? '#c9a227' : '#e8e8ed'}`, borderRadius: '12px', padding: '14px', marginBottom: '10px', background: isActive ? '#fffbeb' : '#fff' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                <div>
                                  {isActive && <span style={{ fontSize: '10px', fontWeight: '600', color: '#c9a227', textTransform: 'uppercase' }}>● EN COURS · </span>}
                                  <span style={{ fontSize: '15px', fontWeight: '600', color: '#1d1d1f' }}>{res.guest_name || 'Voyageur'}</span>
                                </div>
                                <span style={{ background: pcc.bg, color: pcc.color, padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>{pcc.label}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
                                <div style={{ textAlign: 'center', minWidth: '56px' }}>
                                  <p style={{ margin: 0, fontSize: '10px', color: '#86868b', fontWeight: '300' }}>Arrivée</p>
                                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#15803d' }}>{fmtDate(res.check_in)}</p>
                                </div>
                                <div style={{ flex: 1, height: '1px', background: '#e8e8ed', margin: '0 8px', position: 'relative' }}>
                                  <span style={{ position: 'absolute', top: '-9px', left: '50%', transform: 'translateX(-50%)', fontSize: '14px' }}>🌙</span>
                                </div>
                                <div style={{ textAlign: 'center', minWidth: '56px' }}>
                                  <p style={{ margin: 0, fontSize: '10px', color: '#86868b', fontWeight: '300' }}>Départ</p>
                                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#c2410c' }}>{fmtDate(res.check_out)}</p>
                                </div>
                              </div>
                              <span style={{ background: '#f5f5f7', border: '1px solid #e8e8ed', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', color: '#6e6e73', fontWeight: '300' }}>{nights} nuit{nights > 1 ? 's' : ''}</span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Subscription card */}
        <div style={{ marginTop: '24px', padding: '20px', background: '#fff', borderRadius: '16px', border: '1px solid #e8e8ed', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <h3 style={{ margin: '0 0 4px', color: '#1d1d1f', fontSize: '16px', fontWeight: '600' }}>Gestion des abonnements</h3>
            <p style={{ margin: 0, color: '#86868b', fontSize: '14px', fontWeight: '300' }}>Factures et moyens de paiement.</p>
          </div>
          <button onClick={handleManageSubscription} style={{ background: '#1d1d1f', color: '#fff', padding: '13px', borderRadius: '980px', fontWeight: '500', fontSize: '15px', cursor: 'pointer', border: 'none', fontFamily: 'inherit', width: '100%' }}>
            Accéder au portail
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px', paddingBottom: '32px' }}>
          <button onClick={handleDeleteAccount} style={{ background: 'none', border: 'none', color: '#aeaeb2', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px', fontFamily: 'inherit', fontWeight: '300' }}>
            Supprimer mon compte
          </button>
        </div>
      </main>

      {/* Modal limite */}
      {showLimitModal && (
        <div onClick={() => setShowLimitModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '24px 24px 20px 20px', padding: '32px 24px', width: '100%', maxWidth: '480px', textAlign: 'center' }}>
            <span style={{ fontSize: '44px', display: 'block', marginBottom: '14px' }}>🎩</span>
            <h2 style={{ color: '#1d1d1f', margin: '0 0 10px', fontSize: '20px', fontWeight: '600' }}>Activation requise</h2>
            <p style={{ color: '#86868b', fontSize: '15px', margin: '0 0 24px', fontWeight: '300' }}>Veuillez activer votre logement actuel avant d'en ajouter un nouveau.</p>
            <button onClick={() => setShowLimitModal(false)} style={{ background: '#c9a227', border: 'none', padding: '15px', width: '100%', borderRadius: '12px', fontWeight: '600', color: '#1d1d1f', cursor: 'pointer', fontSize: '16px', fontFamily: 'inherit' }}>D'accord</button>
          </div>
        </div>
      )}

      {/* Modal suppression */}
      {showDeleteModal && (
        <div onClick={() => setShowDeleteModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '24px 24px 20px 20px', padding: '32px 24px', width: '100%', maxWidth: '480px', textAlign: 'center' }}>
            <span style={{ fontSize: '40px', display: 'block', marginBottom: '14px' }}>⚠️</span>
            <h2 style={{ color: '#1d1d1f', margin: '0 0 10px', fontSize: '20px', fontWeight: '600' }}>Supprimer {propertyToDelete?.name} ?</h2>
            <p style={{ color: '#86868b', fontSize: '15px', margin: '0 0 16px', fontWeight: '300' }}>Toute la configuration sera effacée.</p>
            <div style={{ background: '#f5f5f7', padding: '12px 14px', borderRadius: '10px', borderLeft: '4px solid #c9a227', marginBottom: '20px', textAlign: 'left' }}>
              <p style={{ fontSize: '13px', color: '#6e6e73', margin: 0, fontWeight: '300' }}><strong style={{ fontWeight: '500', color: '#1d1d1f' }}>📌 Note :</strong> Votre licence reste active jusqu'à la fin du mois.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #e8e8ed', background: '#fff', color: '#6e6e73', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', fontSize: '15px' }}>Annuler</button>
              <button onClick={confirmDelete} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', fontSize: '15px' }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
