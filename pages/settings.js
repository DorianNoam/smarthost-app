import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Settings() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profile, setProfile] = useState({ 
    full_name: '', email: '', address: '', zipcode: '', city: '', active_licenses: 0, subscription_status: ''
  });

  const [telegramLinked, setTelegramLinked] = useState(false);
  const botName = "Marc_Alerte_Bot"; 

  useEffect(() => {
    loadUserData();

    // ⚡ MÉTHODE 100% : Écoute en temps réel de la base de données
    const profileSubscription = supabase
      .channel('public:profiles')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload) => {
        if (payload.new.telegram_id) {
          setTelegramLinked(true);
          setProfile(prev => ({ ...prev, ...payload.new }));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(profileSubscription); };
  }, []);

  const loadUserData = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      setUser(authUser);
      const { data } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
      if (data) {
        setProfile({
          full_name: data.full_name || '',
          email: authUser.email,
          address: data.address || '',
          zipcode: data.zipcode || '',
          city: data.city || '',
          active_licenses: data.active_licenses || 0,
          subscription_status: data.subscription_status || 'Inactif'
        });
        if (data.telegram_id) setTelegramLinked(true);
      }
    }
    setLoading(false);
  };

  const handleTelegramSmartLink = () => {
    const isMobile = /iPad|iPhone|iPod|Android/.test(navigator.userAgent);
    const appLink = `tg://resolve?domain=${botName}&start=${user?.id}`;
    if (isMobile) {
      window.location.href = appLink;
      setTimeout(() => { if (document.hasFocus()) window.location.href = "https://t.me/" + botName; }, 2500);
    } else {
      window.open(`https://t.me/${botName}?start=${user?.id}`, '_blank');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await supabase.from('profiles').update({
      full_name: profile.full_name,
      address: profile.address,
      zipcode: profile.zipcode,
      city: profile.city
    }).eq('id', user.id);
    alert("Profil mis à jour !");
    setSaving(false);
  };

  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>Chargement...</div>;

  return (
    <div className="dashboard-layout">
      <style jsx global>{` body { margin: 0; background: #f8fafc; font-family: 'Inter', sans-serif; } `}</style>
      <style jsx>{`
        .dashboard-layout { display: flex; min-height: 100vh; }
        nav { width: 260px; background: #1a2a6c; color: white; padding: 40px 20px; position: fixed; height: 100vh; z-index: 100; }
        .logo { font-size: 22px; font-weight: 900; margin-bottom: 50px; }
        .nav-item { padding: 14px; border-radius: 12px; display: flex; gap: 12px; color: white; cursor: pointer; margin-bottom: 10px; opacity: 0.8; }
        .nav-item.active { background: rgba(255,255,255,0.15); color: #fbbf24; opacity: 1; }
        main { flex: 1; margin-left: 260px; padding: 50px; display: flex; flex-direction: column; align-items: center; width: 100%; }
        .settings-card { background: white; border-radius: 24px; padding: 30px; width: 100%; max-width: 800px; border: 1px solid #e2e8f0; margin-bottom: 30px; box-sizing: border-box; }
        .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .full { grid-column: span 2; }
        label { font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; }
        input { padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; margin-top: 5px; }
        .btn-primary { background: #1a2a6c; color: white; border: none; padding: 16px; border-radius: 12px; font-weight: 700; cursor: pointer; width: 100%; margin-top: 20px; }
        .telegram-box { background: #f0f9ff; border: 1px solid #0088cc; border-radius: 16px; padding: 20px; }
        .status-badge { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 800; }
        .status-unlinked { background: #fee2e2; color: #b91c1c; }
        .status-linked { background: #ecfdf5; color: #059669; }
        @media (max-width: 900px) { nav { display: none; } main { margin-left: 0; padding: 20px; } .input-grid { grid-template-columns: 1fr; } }
      `}</style>

      <nav>
        <div className="logo">MajorMarc 🎩</div>
        <Link href="/dashboard" legacyBehavior><a className="nav-item">🏠 Logements</a></Link>
        <Link href="/settings" legacyBehavior><a className="nav-item active">⚙️ Paramètres</a></Link>
      </nav>

      <main>
        <div className="settings-card">
          <h2>👤 Profil & Facturation</h2>
          <div className="input-grid">
            <div className="input-group"><label>Nom Complet</label><input value={profile.full_name} onChange={e => setProfile({...profile, full_name: e.target.value})} /></div>
            <div className="input-group"><label>Email</label><input value={profile.email} readOnly style={{opacity: 0.6}} /></div>
            <div className="input-group full"><label>Adresse</label><input value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} /></div>
            <div className="input-group"><label>Code Postal</label><input value={profile.zipcode} onChange={e => setProfile({...profile, zipcode: e.target.value})} /></div>
            <div className="input-group"><label>Ville</label><input value={profile.city} onChange={e => setProfile({...profile, city: e.target.value})} /></div>
          </div>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Enregistrement...' : 'Sauvegarder'}</button>
        </div>

        <div className="settings-card">
          <h2>🔔 Alertes Telegram</h2>
          <div className="telegram-box">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div><h3 style={{margin:0, color:'#0088cc'}}>Liaison Directe</h3><p style={{margin:0, fontSize:'13px'}}>Statut : <span className={telegramLinked ? 'status-linked' : 'status-unlinked'}>{telegramLinked ? '✅ Connecté' : '❌ Non lié'}</span></p></div>
              <button onClick={handleTelegramSmartLink} style={{background:'#0088cc', color:'white', border:'none', padding:'12px 20px', borderRadius:'10px', fontWeight:700, cursor:'pointer'}}>
                {telegramLinked ? '🔄 Reconnecter' : '✈️ Lier mon compte'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
