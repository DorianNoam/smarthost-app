import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Settings() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [profile, setProfile] = useState({ full_name: '', email: '', active_licenses: 0, subscription_status: '', telegram_chat_id: null });
  const [billing, setBilling] = useState({ address: '', zipcode: '', city: '' });
  const [telegramLinked, setTelegramLinked] = useState(false);
  const botName = "Alfred_Alerte_Bot";
  const [connectStatus, setConnectStatus] = useState(null);
  const [referralData, setReferralData] = useState({ code: null, credits: 0, count: 0 });
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectChecking, setConnectChecking] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState({ email: '', role: 'manager', property_ids: null });
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => { loadUserData(); }, []);
  useEffect(() => { if (router.query.connect === 'success') checkConnectStatus(); }, [router.query]);
  useEffect(() => { const h = () => { if (user) loadUserData(); }; window.addEventListener('focus', h); return () => window.removeEventListener('focus', h); }, [user]);

  const loadUserData = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) { router.push('/login'); return; }
    setUser(authUser);
    const { data } = await supabase.from('profiles').select('full_name, email, active_licenses, subscription_status, telegram_chat_id, stripe_account_id, stripe_connect_status, referral_code, referral_credits').eq('id', authUser.id).single();
    if (data) {
      setProfile({ full_name: data.full_name || '', email: authUser.email, active_licenses: data.active_licenses || 0, subscription_status: data.subscription_status || 'Inactif', telegram_chat_id: data.telegram_chat_id });
      setTelegramLinked(!!data.telegram_chat_id);
      setConnectStatus(data.stripe_account_id ? (data.stripe_connect_status || 'pending') : 'not_connected');
      const { count } = await supabase.from('referrals').select('*', { count: 'exact', head: true }).eq('referrer_id', authUser.id).eq('status', 'completed');
      setReferralData({ code: data.referral_code, credits: data.referral_credits || 0, count: count || 0 });
    }
    try { const saved = JSON.parse(localStorage.getItem('mm_billing') || '{}'); setBilling({ address: saved.address || '', zipcode: saved.zipcode || '', city: saved.city || '' }); } catch {}
    await loadTeam(authUser.id); await loadProperties(authUser.id); setLoading(false);
  };

  const loadTeam = async (ownerId) => { setTeamLoading(true); const { data } = await supabase.from('team_members').select('*').eq('account_owner_id', ownerId).order('created_at', { ascending: false }); setTeamMembers(data || []); setTeamLoading(false); };
  const loadProperties = async (ownerId) => { const { data } = await supabase.from('properties').select('id, name').eq('owner_id', ownerId).order('name'); setProperties(data || []); };

  const handleSave = async () => {
    setSaving(true);
    try { await supabase.from('profiles').update({ full_name: profile.full_name }).eq('id', user.id); localStorage.setItem('mm_billing', JSON.stringify(billing)); setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000); }
    catch (err) { alert("Erreur : " + err.message); }
    finally { setSaving(false); }
  };

  const handleStripePortal = async () => {
    try { const res = await fetch('/api/create-portal-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id }) }); const data = await res.json(); if (data.url) window.location.href = data.url; }
    catch { alert("Impossible d'accéder au portail."); }
  };

  const handleConnectStripe = async () => {
    setConnectLoading(true);
    try { const { data: { session } } = await supabase.auth.getSession(); const res = await fetch('/api/connect/onboard', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` } }); const data = await res.json(); if (data.url) window.location.href = data.url; else throw new Error(data.error || 'Erreur'); }
    catch (err) { alert("Erreur : " + err.message); setConnectLoading(false); }
  };

  const checkConnectStatus = async () => {
    setConnectChecking(true);
    try { const { data: { session } } = await supabase.auth.getSession(); const res = await fetch('/api/connect/status', { headers: { 'Authorization': `Bearer ${session.access_token}` } }); const data = await res.json(); setConnectStatus(data.status); }
    catch (err) { console.error(err); }
    finally { setConnectChecking(false); }
  };

  const handleInvite = async () => {
    if (!inviteData.email.trim()) return;
    setInviting(true);
    try {
      const res = await fetch('/api/invite-member', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ invited_email: inviteData.email.trim(), role: inviteData.role, property_ids: inviteData.property_ids, owner_id: user.id }) });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Erreur');
      setInviteSuccess(true); setInviteData({ email: '', role: 'manager', property_ids: null });
      setTimeout(() => { setInviteSuccess(false); setShowInviteForm(false); }, 3000);
      await loadTeam(user.id);
    } catch (err) { alert("Erreur : " + err.message); }
    finally { setInviting(false); }
  };

  const handleRemoveMember = async (memberId) => { if (!confirm("Retirer ce membre ?")) return; const { error } = await supabase.from('team_members').delete().eq('id', memberId); if (!error) await loadTeam(user.id); };
  const handleRoleChange = async (memberId, newRole) => { await supabase.from('team_members').update({ role: newRole }).eq('id', memberId); await loadTeam(user.id); };

  const getRoleBadge = (role, status) => {
    if (status === 'pending') return { label: '⏳ En attente', color: '#c9a227', bg: '#fffbeb', border: '#f5d58a' };
    if (role === 'manager') return { label: '🔧 Gestionnaire', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' };
    return { label: "🔔 Opérateur", color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' };
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, -apple-system, sans-serif', color: '#86868b', fontSize: '16px', background: '#f5f5f7' }}>
      Chargement...
    </div>
  );

  const connectConfig = {
    not_connected: { bg: '#f5f5f7', border: '#e8e8ed', badge: { label: '⚡ Non connecté', color: '#6e6e73', bg: '#f5f5f7', border: '#e8e8ed' }, btnLabel: 'Connecter mon compte Stripe' },
    pending:       { bg: '#fffbeb', border: '#f5d58a', badge: { label: '⏳ En vérification', color: '#c9a227', bg: '#fffbeb', border: '#f5d58a' }, btnLabel: 'Continuer la configuration' },
    active:        { bg: '#f0fdf4', border: '#bbf7d0', badge: { label: '✅ Compte actif', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' }, btnLabel: 'Gérer mon compte Stripe' },
  };
  const cc = connectConfig[connectStatus] || connectConfig.not_connected;

  const card = { background: '#fff', borderRadius: '18px', padding: '20px', marginBottom: '16px', border: '1px solid #e8e8ed', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' };
  const cardTitle = { margin: '0 0 20px', color: '#1d1d1f', fontSize: '17px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' };
  const inp = { padding: '14px', border: '1px solid #e8e8ed', borderRadius: '12px', background: '#f5f5f7', fontSize: '16px', color: '#1d1d1f', outline: 'none', width: '100%', fontFamily: 'inherit', fontWeight: '300', boxSizing: 'border-box', WebkitAppearance: 'none' };
  const lbl = { fontSize: '12px', fontWeight: '500', color: '#6e6e73', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '7px' };

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
        input:focus, select:focus { border-color: #1d1d1f !important; background: #fff !important; outline: none; }

        .sidebar {
          width: 220px; background: #1d1d1f; color: #fff;
          padding: 28px 16px; position: fixed; height: 100vh;
          z-index: 200; display: flex; flex-direction: column;
          transition: transform 0.3s ease;
        }
        .main-content { margin-left: 220px; padding: 40px; display: flex; flex-direction: column; align-items: center; }

        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); width: 280px; }
          .sidebar.open { transform: translateX(0); }
          .main-content { margin-left: 0; padding: 16px; padding-top: 72px; }
          .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 150; }
          .sidebar-overlay.open { display: block; }
          .mobile-topbar { display: flex !important; }
          .grid-2col { grid-template-columns: 1fr !important; }
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

      {/* ── OVERLAY ── */}
      <div className={`sidebar-overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} />

      {/* ── SIDEBAR ── */}
      <nav className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div style={{ fontSize: '17px', fontWeight: '600', marginBottom: '36px', textAlign: 'center', letterSpacing: '-0.3px' }}>
          Alfred<span style={{ color: '#c9a227' }}>Major</span> 🎩
        </div>
        {[
          { href: '/dashboard', label: 'Logements', icon: '🏠', active: false },
          { href: '/settings', label: 'Paramètres', icon: '⚙️', active: true },
        ].map(({ href, label, icon, active }) => (
          <Link key={href} href={href} onClick={() => setMenuOpen(false)} style={{ padding: '13px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: active ? '500' : '400', fontSize: '15px', opacity: active ? 1 : 0.6, marginBottom: '4px', color: active ? '#c9a227' : '#fff', background: active ? 'rgba(255,255,255,0.08)' : 'transparent', transition: '0.2s' }}>
            <span>{icon}</span> <span>{label}</span>
          </Link>
        ))}
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/'); }} style={{ width: '100%', padding: '11px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: '400', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>
            🚪 Déconnexion
          </button>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <main className="main-content">
        <div style={{ width: '100%', maxWidth: '680px' }}>

          {/* Header */}
          <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #e8e8ed' }}>
            <h1 style={{ fontSize: '26px', fontWeight: '600', color: '#1d1d1f', letterSpacing: '-0.6px', margin: '0 0 6px' }}>Paramètres</h1>
            <p style={{ color: '#86868b', fontSize: '15px', fontWeight: '300', margin: 0 }}>Gérez vos informations et vos alertes.</p>
          </div>

          {/* ── PROFIL ── */}
          <div style={card}>
            <h2 style={cardTitle}>👤 Profil & Facturation</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={lbl}>Nom complet</label>
                  <input style={inp} type="text" value={profile.full_name} onChange={e => setProfile({ ...profile, full_name: e.target.value })} placeholder="Jean Dupont" />
                </div>
                <div>
                  <label style={lbl}>E-mail</label>
                  <input style={{ ...inp, opacity: 0.6 }} type="email" value={profile.email} readOnly />
                </div>
              </div>
              <div>
                <label style={lbl}>Adresse de facturation</label>
                <input style={inp} type="text" value={billing.address} onChange={e => setBilling({ ...billing, address: e.target.value })} placeholder="12 Rue de la Paix" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={lbl}>Code Postal</label>
                  <input style={inp} type="text" value={billing.zipcode} onChange={e => setBilling({ ...billing, zipcode: e.target.value })} placeholder="75001" />
                </div>
                <div>
                  <label style={lbl}>Ville</label>
                  <input style={inp} type="text" value={billing.city} onChange={e => setBilling({ ...billing, city: e.target.value })} placeholder="Paris" />
                </div>
              </div>
              <button onClick={handleSave} disabled={saving} style={{ width: "100%", background: saveSuccess ? "#f0fdf4" : "#1d1d1f", color: saveSuccess ? "#15803d" : "#fff", border: saveSuccess ? "1px solid #bbf7d0" : "none", padding: "16px", borderRadius: "12px", fontWeight: "500", fontSize: "16px", cursor: "pointer", fontFamily: "inherit", transition: "0.2s" }}>
                {saving ? "Enregistrement..." : saveSuccess ? "✅ Sauvegardé !" : "💾 Enregistrer"}
              </button>
            </div>
          </div>

          {/* ── REVENUS & UPSELLS ── */}
          <div style={card}>
            <h2 style={cardTitle}>💰 Revenus & Upsells</h2>
            <p style={{ margin: '0 0 16px', fontSize: '15px', color: '#6e6e73', lineHeight: 1.65, fontWeight: '300' }}>
              Connectez Stripe pour encaisser les services additionnels. <strong style={{ color: '#1d1d1f', fontWeight: '500' }}>0% de commission.</strong>
            </p>

            <div style={{ background: cc.bg, border: `2px solid ${cc.border}`, borderRadius: '16px', padding: '18px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 3px', fontSize: '16px', fontWeight: '600', color: '#1d1d1f' }}>Stripe Connect</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6e6e73', fontWeight: '300' }}>
                    {connectStatus === 'active' ? 'Votre compte est prêt.' : connectStatus === 'pending' ? 'Finalisez votre inscription.' : 'Nécessaire pour les upsells.'}
                  </p>
                </div>
                <span style={{ background: cc.badge.bg, color: cc.badge.color, border: `1px solid ${cc.badge.border}`, padding: '5px 12px', borderRadius: '980px', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap' }}>{cc.badge.label}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={handleConnectStripe} disabled={connectLoading} style={{ flex: 1, background: connectStatus === 'active' ? '#f5f5f7' : '#1d1d1f', color: connectStatus === 'active' ? '#1d1d1f' : '#fff', border: connectStatus === 'active' ? '1px solid #e8e8ed' : 'none', padding: '14px 16px', borderRadius: '980px', fontWeight: '500', fontSize: '15px', cursor: connectLoading ? 'not-allowed' : 'pointer', opacity: connectLoading ? 0.6 : 1, fontFamily: 'inherit', WebkitAppearance: 'none' }}>
                  {connectLoading ? '⏳ Redirection...' : connectStatus === 'active' ? '⚙️ Gérer Stripe' : `💳 ${cc.btnLabel}`}
                </button>
                {connectStatus === 'pending' && (
                  <button onClick={checkConnectStatus} disabled={connectChecking} style={{ background: '#fff', color: '#6e6e73', border: '1px solid #e8e8ed', padding: '14px 16px', borderRadius: '980px', fontWeight: '500', fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit' }}>
                    {connectChecking ? '⏳' : '🔄'}
                  </button>
                )}
              </div>
            </div>

            {connectStatus === 'active' && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <p style={{ margin: 0, fontWeight: '500', color: '#15803d', fontSize: '14px' }}>✅ Upsells disponibles</p>
                <Link href="/dashboard" style={{ background: '#15803d', color: '#fff', padding: '10px 16px', borderRadius: '980px', fontWeight: '500', fontSize: '14px', whiteSpace: 'nowrap' }}>
                  Gérer →
                </Link>
              </div>
            )}
          </div>

          {/* ── TELEGRAM ── */}
          <div style={card}>
            <h2 style={cardTitle}>🔔 Alertes Urgences</h2>
            <div style={{ background: telegramLinked ? '#f0f8ff' : '#f5f5f7', border: `1px solid ${telegramLinked ? '#b3d9f7' : '#e8e8ed'}`, borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 3px', fontSize: '15px', color: '#1d1d1f', fontWeight: '600' }}>Telegram</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6e6e73', fontWeight: '300' }}>{telegramLinked ? 'Alertes urgences actives.' : 'Liez Telegram pour les alertes.'}</p>
                </div>
                <span style={{ background: telegramLinked ? '#f0fdf4' : '#fff2f2', color: telegramLinked ? '#15803d' : '#c00', border: `1px solid ${telegramLinked ? '#bbf7d0' : '#ffd0d0'}`, padding: '6px 12px', borderRadius: '980px', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                  {telegramLinked ? '✅ Connecté' : '❌ Non lié'}
                </span>
              </div>
              <a href={`https://t.me/${botName}?start=${user?.id}`} target="_blank" rel="noopener noreferrer" style={{ background: '#0088cc', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '15px', borderRadius: '12px', fontWeight: '500', fontSize: '15px', textAlign: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                {telegramLinked ? '🔄 Mettre à jour' : '📲 Lier Telegram'}
              </a>
            </div>
          </div>

          {/* ── ÉQUIPE ── */}
          <div style={card}>
            <h2 style={cardTitle}>👥 Mon équipe</h2>

            <div style={{ background: '#fffbeb', border: '1px solid #f5d58a', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#92400e', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>💡 Les rôles</p>
              <p style={{ fontSize: '13px', color: '#92400e', margin: '0 0 6px', fontWeight: '300' }}><strong style={{ fontWeight: '500' }}>🔧 Gestionnaire</strong> — accès dashboard, logements assignés</p>
              <p style={{ fontSize: '13px', color: '#92400e', margin: 0, fontWeight: '300' }}><strong style={{ fontWeight: '500' }}>🔔 Opérateur</strong> — alertes Telegram uniquement</p>
            </div>

            {teamLoading ? (
              <p style={{ color: '#86868b', fontSize: '15px', fontWeight: '300', padding: '10px 0' }}>Chargement...</p>
            ) : teamMembers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 16px', color: '#aeaeb2' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>👤</div>
                <p style={{ fontSize: '15px', fontWeight: '500', color: '#6e6e73', margin: '0 0 4px' }}>Aucun membre</p>
                <p style={{ fontSize: '13px', margin: 0, fontWeight: '300' }}>Invitez un gestionnaire ci-dessous.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                {teamMembers.map(member => {
                  const badge = getRoleBadge(member.role, member.status);
                  const scope = member.property_ids ? `${member.property_ids.length} logement${member.property_ids.length > 1 ? 's' : ''}` : 'Tous les logements';
                  return (
                    <div key={member.id} style={{ padding: '14px', border: '1px solid #e8e8ed', borderRadius: '14px', background: '#f5f5f7' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '8px' }}>
                        <p style={{ fontWeight: '500', fontSize: '15px', color: '#1d1d1f', margin: 0, wordBreak: 'break-all' }}>{member.invited_email}</p>
                        <button onClick={() => handleRemoveMember(member.id)} style={{ background: '#fff2f2', color: '#e11d48', border: 'none', padding: '6px 10px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>Retirer</button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '980px', color: badge.color, background: badge.bg, border: `1px solid ${badge.border}` }}>{badge.label}</span>
                        <span style={{ fontSize: '12px', color: '#aeaeb2', fontWeight: '300' }}>📍 {scope}</span>
                      </div>
                      {member.status === 'active' && (
                        <div style={{ marginTop: '10px' }}>
                          <select value={member.role} onChange={e => handleRoleChange(member.id, e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e8e8ed', borderRadius: '8px', fontSize: '14px', fontWeight: '400', color: '#1d1d1f', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', WebkitAppearance: 'none' }}>
                            <option value="manager">🔧 Gestionnaire</option>
                            <option value="operator">🔔 Opérateur d'urgence</option>
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {!showInviteForm ? (
              <button onClick={() => setShowInviteForm(true)} style={{ width: '100%', background: '#1d1d1f', color: '#fff', padding: '14px', borderRadius: '12px', fontWeight: '500', fontSize: '15px', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                ➕ Inviter un membre
              </button>
            ) : (
              <div style={{ background: '#f0f8ff', border: '1px solid #b3d9f7', borderRadius: '16px', padding: '18px' }}>
                <p style={{ fontSize: '15px', fontWeight: '600', color: '#0369a1', margin: '0 0 14px' }}>✉️ Nouvelle invitation</p>
                {inviteSuccess ? (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px', fontSize: '15px', color: '#15803d', fontWeight: '500', textAlign: 'center' }}>✅ Invitation envoyée !</div>
                ) : (
                  <>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ ...lbl, color: '#0369a1' }}>Email</label>
                      <input type="email" placeholder="gestionnaire@example.com" value={inviteData.email} onChange={e => setInviteData(p => ({ ...p, email: e.target.value }))} style={{ ...inp, border: '1px solid #b3d9f7', background: '#fff' }} />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ ...lbl, color: '#0369a1' }}>Rôle</label>
                      <select value={inviteData.role} onChange={e => setInviteData(p => ({ ...p, role: e.target.value }))} style={{ ...inp, border: '1px solid #b3d9f7', background: '#fff' }}>
                        <option value="manager">🔧 Gestionnaire</option>
                        <option value="operator">🔔 Opérateur d'urgence</option>
                      </select>
                    </div>
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ ...lbl, color: '#0369a1' }}>Accès</label>
                      <select value={inviteData.property_ids === null ? 'all' : 'select'} onChange={e => setInviteData(p => ({ ...p, property_ids: e.target.value === 'all' ? null : [] }))} style={{ ...inp, border: '1px solid #b3d9f7', background: '#fff' }}>
                        <option value="all">Tous les logements</option>
                        <option value="select">Sélectionner...</option>
                      </select>
                    </div>
                    {inviteData.property_ids !== null && properties.length > 0 && (
                      <div style={{ marginBottom: '14px' }}>
                        {properties.map(prop => (
                          <label key={prop.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '15px', color: '#1d1d1f', marginBottom: '10px', fontWeight: '300' }}>
                            <input type="checkbox" style={{ width: '18px', height: '18px', flexShrink: 0 }} checked={(inviteData.property_ids || []).includes(prop.id)} onChange={e => { const current = inviteData.property_ids || []; setInviteData(p => ({ ...p, property_ids: e.target.checked ? [...current, prop.id] : current.filter(id => id !== prop.id) })); }} />
                            {prop.name}
                          </label>
                        ))}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => { setShowInviteForm(false); setInviteData({ email: '', role: 'manager', property_ids: null }); }} style={{ flex: 1, padding: '14px', background: '#fff', border: '1px solid #e8e8ed', borderRadius: '10px', fontWeight: '500', fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit', color: '#6e6e73' }}>Annuler</button>
                      <button onClick={handleInvite} disabled={inviting || !inviteData.email.trim()} style={{ flex: 2, padding: '14px', background: !inviteData.email.trim() ? '#aeaeb2' : '#1d1d1f', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '500', fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit' }}>
                        {inviting ? 'Envoi...' : "✉️ Inviter"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* ── PARRAINAGE ── */}
          <div style={card}>
            <h2 style={cardTitle}>🎁 Parrainage</h2>
            <p style={{ margin: '0 0 16px', fontSize: '15px', color: '#6e6e73', lineHeight: 1.65, fontWeight: '300' }}>
              <strong style={{ color: '#1d1d1f', fontWeight: '500' }}>2 mois offerts</strong> pour vous · <strong style={{ color: '#1d1d1f', fontWeight: '500' }}>1 mois offert</strong> pour votre filleul à chaque activation.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
              {[{ label: 'Filleuls actifs', value: referralData.count, emoji: '👥' }, { label: 'Mois gagnés', value: referralData.credits, emoji: '🎁' }, { label: 'Économies', value: `${(referralData.credits * 9.9).toFixed(0)}€`, emoji: '💶' }].map((stat, i) => (
                <div key={i} style={{ background: '#f5f5f7', border: '1px solid #e8e8ed', borderRadius: '14px', padding: '14px', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '20px' }}>{stat.emoji}</p>
                  <p style={{ margin: '0 0 3px', fontSize: '22px', fontWeight: '600', color: '#1d1d1f', letterSpacing: '-0.5px' }}>{stat.value}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#86868b', fontWeight: '400' }}>{stat.label}</p>
                </div>
              ))}
            </div>

            {referralData.code ? (
              <div>
                <label style={lbl}>Votre lien de parrainage</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#f5f5f7', border: '1px solid #e8e8ed', borderRadius: '12px', padding: '14px', marginBottom: '10px' }}>
                  <p style={{ margin: 0, flex: 1, fontSize: '14px', color: '#1d1d1f', fontWeight: '400', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    alfredmajor.com/register?ref={referralData.code}
                  </p>
                  <button onClick={() => { navigator.clipboard.writeText(`https://www.alfredmajor.com/register?ref=${referralData.code}`); alert('Lien copié !'); }} style={{ background: '#1d1d1f', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '980px', fontWeight: '500', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit', flexShrink: 0 }}>
                    Copier
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: '#aeaeb2', fontWeight: '300' }}>
                  Code : <strong style={{ color: '#1d1d1f', fontWeight: '600', letterSpacing: '2px' }}>{referralData.code}</strong>
                </p>
              </div>
            ) : (
              <div style={{ background: '#fffbeb', border: '1px solid #f5d58a', borderRadius: '12px', padding: '14px', fontSize: '14px', color: '#92400e', fontWeight: '300' }}>
                ⏳ Votre code sera généré lors de votre première connexion.
              </div>
            )}
          </div>

          {/* ── ABONNEMENT ── */}
          <div style={card}>
            <h2 style={cardTitle}>💳 Abonnement</h2>
            <div style={{ border: `2px solid ${profile.active_licenses > 0 ? '#c9a227' : '#e8e8ed'}`, borderRadius: '16px', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: profile.active_licenses > 0 ? '#fffbeb' : '#f5f5f7', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: '600', color: '#1d1d1f' }}>{profile.active_licenses > 0 ? `${profile.active_licenses} Logement${profile.active_licenses > 1 ? 's' : ''} Actif${profile.active_licenses > 1 ? 's' : ''}` : 'Aucun logement actif'}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#6e6e73', fontWeight: '300' }}>Statut : <span style={{ fontWeight: '500', color: '#1d1d1f' }}>{profile.subscription_status || 'Inactif'}</span>{profile.active_licenses > 0 && <span> · {(profile.active_licenses * 9.9).toFixed(2)}€/mois</span>}</p>
              </div>
              <span style={{ background: profile.active_licenses > 0 ? '#f0fdf4' : '#f5f5f7', color: profile.active_licenses > 0 ? '#15803d' : '#86868b', padding: '6px 14px', borderRadius: '980px', fontSize: '14px', fontWeight: '600', border: profile.active_licenses > 0 ? '1px solid #bbf7d0' : '1px solid #e8e8ed' }}>
                {profile.active_licenses > 0 ? '✓ Actif' : 'Inactif'}
              </span>
            </div>
            {profile.active_licenses > 0 ? (
              <button onClick={handleStripePortal} style={{ width: '100%', background: '#f5f5f7', color: '#1d1d1f', border: '1px solid #e8e8ed', padding: '15px', borderRadius: '12px', fontWeight: '500', fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit' }}>
                🔗 Factures & Paiement
              </button>
            ) : (
              <Link href="/pricing" style={{ display: 'block', width: '100%', background: '#c9a227', color: '#1d1d1f', padding: '15px', borderRadius: '12px', fontWeight: '600', fontSize: '15px', textAlign: 'center' }}>
                🎩 Activer — 1er mois offert
              </Link>
            )}
          </div>

          <div style={{ paddingBottom: '40px' }} />
        </div>
      </main>
    </div>
  );
}
