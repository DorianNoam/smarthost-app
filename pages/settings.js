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
    if (status === 'pending') return { label: '⏳ Invitation en attente', color: '#c9a227', bg: '#fffbeb', border: '#f5d58a' };
    if (role === 'manager') return { label: '🔧 Gestionnaire', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' };
    return { label: "🔔 Opérateur d'urgence", color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' };
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, -apple-system, sans-serif', color: '#86868b', fontSize: '15px', background: '#f5f5f7' }}>
      Chargement...
    </div>
  );

  const connectConfig = {
    not_connected: { bg: '#f5f5f7', border: '#e8e8ed', badge: { label: '⚡ Non connecté', color: '#6e6e73', bg: '#f5f5f7', border: '#e8e8ed' }, btnLabel: 'Connecter mon compte Stripe' },
    pending:       { bg: '#fffbeb', border: '#f5d58a', badge: { label: '⏳ En cours de vérification', color: '#c9a227', bg: '#fffbeb', border: '#f5d58a' }, btnLabel: 'Continuer la configuration' },
    active:        { bg: '#f0fdf4', border: '#bbf7d0', badge: { label: '✅ Compte actif', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' }, btnLabel: 'Gérer mon compte Stripe' },
  };
  const cc = connectConfig[connectStatus] || connectConfig.not_connected;

  const card = { background: '#fff', borderRadius: '18px', padding: '28px', marginBottom: '20px', border: '1px solid #e8e8ed', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', width: '100%' };
  const cardTitle = { margin: '0 0 22px', color: '#1d1d1f', fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '-0.3px' };
  const inp = { padding: '13px 14px', border: '1px solid #e8e8ed', borderRadius: '12px', background: '#f5f5f7', fontSize: '15px', color: '#1d1d1f', outline: 'none', width: '100%', fontFamily: 'inherit', fontWeight: '300', transition: 'border-color 0.2s', boxSizing: 'border-box' };
  const lbl = { fontSize: '12px', fontWeight: '500', color: '#6e6e73', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '7px' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f7', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f5f5f7; -webkit-font-smoothing: antialiased; }
        a { text-decoration: none !important; color: inherit; }
        input:focus, select:focus { border-color: #1d1d1f !important; background: #fff !important; }
      `}</style>

      {/* ── SIDEBAR ── */}
      <nav style={{ width: '220px', background: '#1d1d1f', color: '#fff', padding: '28px 16px', position: 'fixed', height: '100vh', zIndex: 100, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: '17px', fontWeight: '600', marginBottom: '36px', textAlign: 'center', letterSpacing: '-0.3px' }}>
          Alfred<span style={{ color: '#c9a227' }}>Major</span> 🎩
        </div>
        {[
          { href: '/dashboard', label: 'Logements', icon: '🏠', active: false },
          { href: '/settings', label: 'Paramètres', icon: '⚙️', active: true },
        ].map(({ href, label, icon, active }) => (
          <Link key={href} href={href} style={{ padding: '11px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: active ? '500' : '400', fontSize: '14px', opacity: active ? 1 : 0.6, marginBottom: '4px', color: active ? '#c9a227' : '#fff', background: active ? 'rgba(255,255,255,0.08)' : 'transparent', letterSpacing: '-0.2px', transition: '0.2s' }}>
            <span>{icon}</span> <span>{label}</span>
          </Link>
        ))}
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/'); }} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: '400', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.1px' }}>
            🚪 Déconnexion
          </button>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <main style={{ flex: 1, marginLeft: '220px', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '780px' }}>

          {/* Header */}
          <div style={{ marginBottom: '36px', borderBottom: '1px solid #e8e8ed', paddingBottom: '20px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#1d1d1f', letterSpacing: '-0.8px', margin: '0 0 6px' }}>Paramètres du compte</h1>
            <p style={{ color: '#86868b', fontSize: '15px', fontWeight: '300', margin: 0, letterSpacing: '-0.1px' }}>Gérez vos informations et vos alertes.</p>
          </div>

          {/* ── PROFIL ── */}
          <div style={card}>
            <h2 style={cardTitle}>👤 Profil & Facturation</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={lbl}>Nom complet / Société</label>
                <input style={inp} type="text" value={profile.full_name} onChange={e => setProfile({ ...profile, full_name: e.target.value })} placeholder="Jean Dupont" />
              </div>
              <div>
                <label style={lbl}>E-mail (lecture seule)</label>
                <input style={{ ...inp, opacity: 0.6, cursor: 'not-allowed' }} type="email" value={profile.email} readOnly />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={lbl}>Adresse de facturation</label>
                <input style={inp} type="text" value={billing.address} onChange={e => setBilling({ ...billing, address: e.target.value })} placeholder="12 Rue de la Paix" />
              </div>
              <div>
                <label style={lbl}>Code Postal</label>
                <input style={inp} type="text" value={billing.zipcode} onChange={e => setBilling({ ...billing, zipcode: e.target.value })} placeholder="75001" />
              </div>
              <div>
                <label style={lbl}>Ville</label>
                <input style={inp} type="text" value={billing.city} onChange={e => setBilling({ ...billing, city: e.target.value })} placeholder="Paris" />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <button onClick={handleSave} disabled={saving} style={{ width: '100%', background: saveSuccess ? '#f0fdf4' : '#1d1d1f', color: saveSuccess ? '#15803d' : '#fff', border: saveSuccess ? '1px solid #bbf7d0' : 'none', padding: '14px', borderRadius: '12px', fontWeight: '500', fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.2px', transition: '0.2s' }}>
                  {saving ? 'Enregistrement...' : saveSuccess ? '✅ Informations sauvegardées !' : '💾 Enregistrer les informations'}
                </button>
              </div>
            </div>
          </div>

          {/* ── REVENUS & UPSELLS ── */}
          <div style={card}>
            <h2 style={cardTitle}>💰 Revenus & Upsells</h2>
            <p style={{ margin: '0 0 20px', fontSize: '15px', color: '#6e6e73', lineHeight: 1.65, fontWeight: '300', letterSpacing: '-0.1px' }}>
              Connectez votre compte Stripe pour encaisser directement les services additionnels. <strong style={{ color: '#1d1d1f', fontWeight: '500' }}>0% de commission Alfred Major.</strong>
            </p>

            <div style={{ background: cc.bg, border: `2px solid ${cc.border}`, borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '600', color: '#1d1d1f', letterSpacing: '-0.3px' }}>Compte Stripe Connect</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6e6e73', fontWeight: '300' }}>
                    {connectStatus === 'active' ? 'Votre compte est prêt à encaisser.' : connectStatus === 'pending' ? 'Finalisez votre inscription Stripe.' : 'Connectez Stripe pour activer les upsells.'}
                  </p>
                </div>
                <span style={{ background: cc.badge.bg, color: cc.badge.color, border: `1px solid ${cc.badge.border}`, padding: '5px 14px', borderRadius: '980px', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap' }}>{cc.badge.label}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={handleConnectStripe} disabled={connectLoading} style={{ background: connectStatus === 'active' ? '#f5f5f7' : '#1d1d1f', color: connectStatus === 'active' ? '#1d1d1f' : '#fff', border: connectStatus === 'active' ? '1px solid #e8e8ed' : 'none', padding: '12px 20px', borderRadius: '980px', fontWeight: '500', fontSize: '14px', cursor: connectLoading ? 'not-allowed' : 'pointer', opacity: connectLoading ? 0.6 : 1, fontFamily: 'inherit', letterSpacing: '-0.2px' }}>
                  {connectLoading ? '⏳ Redirection...' : connectStatus === 'active' ? '⚙️ Gérer mon compte Stripe' : `💳 ${cc.btnLabel}`}
                </button>
                {connectStatus === 'pending' && (
                  <button onClick={checkConnectStatus} disabled={connectChecking} style={{ background: '#fff', color: '#6e6e73', border: '1px solid #e8e8ed', padding: '12px 20px', borderRadius: '980px', fontWeight: '500', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.2px' }}>
                    {connectChecking ? '⏳ Vérification...' : '🔄 Actualiser'}
                  </button>
                )}
              </div>
            </div>

            {connectStatus !== 'active' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                {[{ emoji: '💶', title: 'Paiement direct', desc: "Argent sur votre compte Stripe" }, { emoji: '0️⃣', title: '0% commission', desc: 'Alfred ne prend rien' }, { emoji: '🔒', title: 'Sécurisé', desc: 'Stripe gère la sécurité' }, { emoji: '🌍', title: '30+ langues', desc: 'Page voyageur multilingue' }].map((item, i) => (
                  <div key={i} style={{ background: '#f5f5f7', border: '1px solid #e8e8ed', borderRadius: '12px', padding: '14px' }}>
                    <p style={{ margin: '0 0 6px', fontSize: '20px' }}>{item.emoji}</p>
                    <p style={{ margin: '0 0 3px', fontSize: '13px', fontWeight: '500', color: '#1d1d1f', letterSpacing: '-0.2px' }}>{item.title}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#86868b', fontWeight: '300' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {connectStatus === 'active' && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ margin: '0 0 3px', fontWeight: '600', color: '#15803d', fontSize: '14px', letterSpacing: '-0.2px' }}>✅ Compte actif — Upsells disponibles</p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6e6e73', fontWeight: '300' }}>Configurez vos services depuis chaque logement.</p>
                </div>
                <Link href="/dashboard" style={{ background: '#15803d', color: '#fff', padding: '10px 18px', borderRadius: '980px', fontWeight: '500', fontSize: '13px', whiteSpace: 'nowrap', letterSpacing: '-0.1px' }}>
                  Gérer mes upsells →
                </Link>
              </div>
            )}
          </div>

          {/* ── TELEGRAM ── */}
          <div style={card}>
            <h2 style={cardTitle}>🔔 Alertes & Urgences</h2>
            <div style={{ background: telegramLinked ? '#f0f8ff' : '#f5f5f7', border: `1px solid ${telegramLinked ? '#b3d9f7' : '#e8e8ed'}`, borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '15px', color: '#1d1d1f', fontWeight: '600', letterSpacing: '-0.2px' }}>Connexion Telegram</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6e6e73', fontWeight: '300' }}>{telegramLinked ? 'Vos alertes urgences sont actives.' : 'Liez Telegram pour recevoir vos alertes instantanément.'}</p>
                </div>
                <span style={{ background: telegramLinked ? '#f0fdf4' : '#fff2f2', color: telegramLinked ? '#15803d' : '#c00', border: `1px solid ${telegramLinked ? '#bbf7d0' : '#ffd0d0'}`, padding: '5px 12px', borderRadius: '980px', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                  {telegramLinked ? '✅ Connecté' : '❌ Non lié'}
                </span>
              </div>
              <a href={`https://t.me/${botName}?start=${user?.id}`} target="_blank" rel="noopener noreferrer" style={{ background: '#0088cc', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '13px 20px', borderRadius: '980px', fontWeight: '500', fontSize: '14px', textAlign: 'center', transition: '0.2s', letterSpacing: '-0.2px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                {telegramLinked ? '🔄 Mettre à jour la connexion' : '📲 Lier mon compte Telegram'}
              </a>
              {telegramLinked && <p style={{ margin: 0, fontSize: '12px', color: '#15803d', textAlign: 'center', fontWeight: '500' }}>✓ Alerte instantanée dès qu'une urgence est détectée</p>}
            </div>
          </div>

          {/* ── ÉQUIPE ── */}
          <div style={card}>
            <h2 style={cardTitle}>👥 Mon équipe</h2>

            {/* Rôles info */}
            <div style={{ background: '#fffbeb', border: '1px solid #f5d58a', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 10px' }}>💡 Les rôles disponibles</p>
              {[
                { role: '🔧 Gestionnaire', desc: 'Gère les logements assignés, consulte les conversations, modifie la configuration. Reçoit les alertes Telegram.' },
                { role: "🔔 Opérateur d'urgence", desc: 'Reçoit uniquement les alertes Telegram/push pour les logements assignés. Pas d\'accès au dashboard.' },
              ].map(({ role, desc }) => (
                <div key={role} style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#1d1d1f', minWidth: '140px', flexShrink: 0 }}>{role}</span>
                  <span style={{ fontSize: '12px', color: '#6e6e73', fontWeight: '300' }}>{desc}</span>
                </div>
              ))}
            </div>

            {teamLoading ? (
              <p style={{ color: '#86868b', fontSize: '14px', fontWeight: '300' }}>Chargement...</p>
            ) : teamMembers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 20px', color: '#aeaeb2' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>👤</div>
                <p style={{ fontSize: '15px', fontWeight: '500', color: '#6e6e73', margin: '0 0 4px', letterSpacing: '-0.2px' }}>Aucun membre dans votre équipe</p>
                <p style={{ fontSize: '13px', margin: 0, fontWeight: '300' }}>Invitez un gestionnaire ou un opérateur ci-dessous.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {teamMembers.map(member => {
                  const badge = getRoleBadge(member.role, member.status);
                  const scope = member.property_ids ? `${member.property_ids.length} logement${member.property_ids.length > 1 ? 's' : ''} assigné${member.property_ids.length > 1 ? 's' : ''}` : 'Tous les logements';
                  return (
                    <div key={member.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '14px 18px', border: '1px solid #e8e8ed', borderRadius: '14px', background: '#f5f5f7' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: '500', fontSize: '14px', color: '#1d1d1f', margin: '0 0 5px', letterSpacing: '-0.2px' }}>{member.invited_email}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '980px', color: badge.color, background: badge.bg, border: `1px solid ${badge.border}` }}>{badge.label}</span>
                          <span style={{ fontSize: '12px', color: '#aeaeb2', fontWeight: '300' }}>📍 {scope}</span>
                          {member.telegram_chat_id && <span style={{ fontSize: '12px', color: '#15803d', fontWeight: '400' }}>✅ Telegram</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {member.status === 'active' && (
                          <select value={member.role} onChange={e => handleRoleChange(member.id, e.target.value)} style={{ padding: '6px 10px', border: '1px solid #e8e8ed', borderRadius: '8px', fontSize: '12px', fontWeight: '500', color: '#1d1d1f', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
                            <option value="manager">Gestionnaire</option>
                            <option value="operator">Opérateur</option>
                          </select>
                        )}
                        <button onClick={() => handleRemoveMember(member.id)} style={{ background: '#fff2f2', color: '#e11d48', border: '1px solid #ffd0d0', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>Retirer</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!showInviteForm ? (
              <button onClick={() => setShowInviteForm(true)} style={{ background: '#1d1d1f', color: '#fff', padding: '12px 20px', borderRadius: '980px', fontWeight: '500', fontSize: '14px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'inherit', letterSpacing: '-0.2px', transition: '0.2s' }}>
                ➕ Inviter un membre
              </button>
            ) : (
              <div style={{ background: '#f0f8ff', border: '1px solid #b3d9f7', borderRadius: '16px', padding: '22px', marginTop: '8px' }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#0369a1', margin: '0 0 16px', letterSpacing: '-0.2px' }}>✉️ Nouvelle invitation</p>
                {inviteSuccess ? (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', color: '#15803d', fontWeight: '500' }}>✅ Invitation envoyée !</div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ ...lbl, color: '#0369a1' }}>Email du membre</label>
                        <input type="email" placeholder="gestionnaire@example.com" value={inviteData.email} onChange={e => setInviteData(p => ({ ...p, email: e.target.value }))} style={{ ...inp, border: '1px solid #b3d9f7', background: '#fff' }} />
                      </div>
                      <div>
                        <label style={{ ...lbl, color: '#0369a1' }}>Rôle</label>
                        <select value={inviteData.role} onChange={e => setInviteData(p => ({ ...p, role: e.target.value }))} style={{ ...inp, border: '1px solid #b3d9f7', background: '#fff' }}>
                          <option value="manager">🔧 Gestionnaire</option>
                          <option value="operator">🔔 Opérateur d'urgence</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ ...lbl, color: '#0369a1' }}>Accès</label>
                        <select value={inviteData.property_ids === null ? 'all' : 'select'} onChange={e => setInviteData(p => ({ ...p, property_ids: e.target.value === 'all' ? null : [] }))} style={{ ...inp, border: '1px solid #b3d9f7', background: '#fff' }}>
                          <option value="all">Tous les logements</option>
                          <option value="select">Sélectionner...</option>
                        </select>
                      </div>
                    </div>
                    {inviteData.property_ids !== null && properties.length > 0 && (
                      <div style={{ marginBottom: '14px' }}>
                        <p style={{ fontSize: '12px', color: '#0369a1', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Logements assignés</p>
                        {properties.map(prop => (
                          <label key={prop.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#1d1d1f', marginBottom: '8px', fontWeight: '300', letterSpacing: '-0.1px' }}>
                            <input type="checkbox" style={{ width: '16px', height: '16px' }} checked={(inviteData.property_ids || []).includes(prop.id)} onChange={e => { const current = inviteData.property_ids || []; setInviteData(p => ({ ...p, property_ids: e.target.checked ? [...current, prop.id] : current.filter(id => id !== prop.id) })); }} />
                            {prop.name}
                          </label>
                        ))}
                      </div>
                    )}
                    <p style={{ fontSize: '12px', color: '#0369a1', fontWeight: '400', marginBottom: '16px' }}>
                      {inviteData.role === 'operator' ? "🔔 Recevra uniquement les alertes pour les logements assignés." : "🔧 Pourra gérer les logements assignés."}
                    </p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => { setShowInviteForm(false); setInviteData({ email: '', role: 'manager', property_ids: null }); }} style={{ flex: 1, padding: '11px', background: '#fff', border: '1px solid #e8e8ed', borderRadius: '10px', fontWeight: '500', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', color: '#6e6e73' }}>Annuler</button>
                      <button onClick={handleInvite} disabled={inviting || !inviteData.email.trim()} style={{ flex: 2, padding: '11px', background: !inviteData.email.trim() ? '#aeaeb2' : '#1d1d1f', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '500', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', opacity: !inviteData.email.trim() ? 0.6 : 1, letterSpacing: '-0.1px' }}>
                        {inviting ? 'Envoi...' : "✉️ Envoyer l'invitation"}
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
            <p style={{ margin: '0 0 20px', fontSize: '15px', color: '#6e6e73', lineHeight: 1.65, fontWeight: '300', letterSpacing: '-0.1px' }}>
              Pour chaque hôte qui s'inscrit et active un logement : <strong style={{ color: '#1d1d1f', fontWeight: '500' }}>2 mois offerts pour vous</strong>, <strong style={{ color: '#1d1d1f', fontWeight: '500' }}>1 mois offert pour eux</strong>.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
              {[{ label: 'Filleuls actifs', value: referralData.count, emoji: '👥' }, { label: 'Mois offerts gagnés', value: referralData.credits, emoji: '🎁' }, { label: 'Économies', value: `${(referralData.credits * 9.9).toFixed(0)}€`, emoji: '💶' }].map((stat, i) => (
                <div key={i} style={{ background: '#f5f5f7', border: '1px solid #e8e8ed', borderRadius: '14px', padding: '16px', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 6px', fontSize: '22px' }}>{stat.emoji}</p>
                  <p style={{ margin: '0 0 3px', fontSize: '24px', fontWeight: '600', color: '#1d1d1f', letterSpacing: '-1px' }}>{stat.value}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#86868b', fontWeight: '400', letterSpacing: '0.2px' }}>{stat.label}</p>
                </div>
              ))}
            </div>

            {referralData.code ? (
              <div>
                <label style={lbl}>Votre lien de parrainage</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#f5f5f7', border: '1px solid #e8e8ed', borderRadius: '12px', padding: '13px 16px', marginBottom: '10px' }}>
                  <p style={{ margin: 0, flex: 1, fontSize: '14px', color: '#1d1d1f', fontWeight: '400', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.1px' }}>
                    alfredmajor.com/register?ref={referralData.code}
                  </p>
                  <button onClick={() => { navigator.clipboard.writeText(`https://www.alfredmajor.com/register?ref=${referralData.code}`); alert('Lien copié !'); }} style={{ background: '#1d1d1f', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '980px', fontWeight: '500', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit', letterSpacing: '-0.1px' }}>
                    Copier
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#aeaeb2', fontWeight: '300' }}>
                  Votre code : <strong style={{ color: '#1d1d1f', fontWeight: '600', letterSpacing: '2px' }}>{referralData.code}</strong>
                </p>
              </div>
            ) : (
              <div style={{ background: '#fffbeb', border: '1px solid #f5d58a', borderRadius: '12px', padding: '14px', fontSize: '13px', color: '#92400e', fontWeight: '300' }}>
                ⏳ Votre code de parrainage sera généré lors de votre première connexion.
              </div>
            )}
          </div>

          {/* ── ABONNEMENT ── */}
          <div style={card}>
            <h2 style={cardTitle}>💳 Abonnement</h2>
            <div style={{ border: `2px solid ${profile.active_licenses > 0 ? '#c9a227' : '#e8e8ed'}`, borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: profile.active_licenses > 0 ? '#fffbeb' : '#f5f5f7', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: '600', color: '#1d1d1f', letterSpacing: '-0.3px' }}>{profile.active_licenses > 0 ? `${profile.active_licenses} Logement${profile.active_licenses > 1 ? 's' : ''} Actif${profile.active_licenses > 1 ? 's' : ''}` : 'Aucun logement actif'}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#6e6e73', fontWeight: '300' }}>Statut : <span style={{ fontWeight: '500', color: '#1d1d1f' }}>{profile.subscription_status || 'Inactif'}</span>{profile.active_licenses > 0 && <span> · {(profile.active_licenses * 9.9).toFixed(2)}€/mois</span>}</p>
              </div>
              <span style={{ background: profile.active_licenses > 0 ? '#f0fdf4' : '#f5f5f7', color: profile.active_licenses > 0 ? '#15803d' : '#86868b', padding: '6px 14px', borderRadius: '980px', fontSize: '13px', fontWeight: '600', border: profile.active_licenses > 0 ? '1px solid #bbf7d0' : '1px solid #e8e8ed' }}>
                {profile.active_licenses > 0 ? '✓ Actif' : 'Inactif'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {profile.active_licenses > 0 ? (
                <button onClick={handleStripePortal} style={{ background: '#f5f5f7', color: '#1d1d1f', border: '1px solid #e8e8ed', padding: '12px 22px', borderRadius: '980px', fontWeight: '500', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.2px' }}>
                  🔗 Gérer le paiement & Factures
                </button>
              ) : (
                <Link href="/pricing" style={{ display: 'inline-block', background: '#c9a227', color: '#1d1d1f', padding: '12px 22px', borderRadius: '980px', fontWeight: '600', fontSize: '14px', letterSpacing: '-0.2px' }}>
                  🎩 Activer un logement — 1er mois offert
                </Link>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
