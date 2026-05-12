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
    full_name: '', address: '', zipcode: '', city: '', email: ''
  });

  const [telegramLinked, setTelegramLinked] = useState(false);
  const botName = "Marc_Alerte_Bot"; 

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        // --- LOG DE DEBUG ---
        console.log("DEBUG SETTINGS - Données profil reçues:", data);
        console.log("DEBUG SETTINGS - Valeur telegram_id:", data.telegram_id);
        // --------------------

        setProfile({
          full_name: data.full_name || '',
          email: user.email,
          address: data.address || '',
          zipcode: data.zipcode || '',
          city: data.city || ''
        });
        
        if (data.telegram_id && data.telegram_id !== "") {
          setTelegramLinked(true);
        }
      }
    }
    setLoading(false);
  };

  const handleTelegramSmartLink = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const appLink = `tg://resolve?domain=${botName}&start=${user?.id}`;
    const playStore = "https://play.google.com/store/apps/details?id=org.telegram.messenger";
    const appStore = "https://apps.apple.com/app/telegram-messenger/id686449807";

    if (isIOS || isAndroid) {
      window.location.href = appLink;
      setTimeout(() => { window.location.href = isIOS ? appStore : playStore; }, 2500);
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
        nav { width: 260px; background: #1a2a6c; color: white; padding: 40px 20px; position: fixed; height: 100vh; }
        main { flex: 1; margin-left: 260px; padding: 50px; display: flex; flex-direction: column; align-items: center; }
        .card { background: white; border-radius: 20px; padding: 30px; width: 100%; max-width: 600px; border: 1px solid #e2e8f0; margin-bottom: 20px; }
        input { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #e2e8f0; border-radius: 10px; box-sizing: border-box; }
        .btn-primary { background: #1a2a6c; color: white; border: none; padding: 15px; border-radius: 10px; cursor: pointer; font-weight: 700; width: 100%; }
        .btn-telegram { background: #0088cc; color: white; border: none; padding: 15px; border-radius: 10px; cursor: pointer; font-weight: 700; width: 100%; margin-top: 10px; }
        @media (max-width: 900px) { nav { display: none; } main { margin-left: 0; padding: 20px; } }
      `}</style>

      <nav>
        <div style={{fontSize:'22px', fontWeight:900, marginBottom:'40px'}}>MajorMarc 🎩</div>
        <Link href="/dashboard" legacyBehavior><a style={{color:'white', display:'block', marginBottom:'20px'}}>🏠 Logements</a></Link>
        <Link href="/settings" legacyBehavior><a style={{color:'#fbbf24', display:'block', fontWeight:700}}>⚙️ Paramètres</a></Link>
      </nav>

      <main>
        <div className="card">
          <h2>👤 Mon Profil</h2>
          <label>Nom complet</label>
          <input value={profile.full_name} onChange={e => setProfile({...profile, full_name: e.target.value})} />
          <label>Adresse de facturation</label>
          <input value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} />
          <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Sauvegarde...' : 'Enregistrer'}</button>
        </div>

        <div className="card" style={{border: '2px solid #0088cc', background:'#f0f9ff'}}>
          <h2 style={{color:'#0088cc'}}>🔔 Liaison Telegram</h2>
          <div style={{marginBottom:'15px', fontWeight:700, color: telegramLinked ? '#059669' : '#b91c1c'}}>
            Statut : {telegramLinked ? '✅ Connecté' : '❌ Non lié'}
          </div>
          <button className="btn-telegram" onClick={handleTelegramSmartLink}>
            {telegramLinked ? '🔄 Reconnecter mon Telegram' : '✈️ Lier mon compte Telegram'}
          </button>
        </div>
      </main>
    </div>
  );
}
