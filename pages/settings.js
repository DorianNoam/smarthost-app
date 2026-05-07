import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ 
    name: 'Jean Dupont', 
    email: 'jean.dupont@email.com',
    address: '12 Rue de la Paix',
    zipcode: '75000',
    city: 'Paris',
  });

  const [telegramLinked, setTelegramLinked] = useState(false);
  
  // ⚠️ Remplace par le VRAI nom de ton bot (sans le @)
  const botName = "Marc_Alerte_Bot";

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    // 1. On récupère l'utilisateur actuellement connecté
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      setUser(user);
      
      // 2. On récupère ses infos dans la table profiles
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (data) {
        // On met à jour l'affichage avec les vraies données
        setProfile(prev => ({ ...prev, ...data }));
        
        // Si on trouve un telegram_chat_id en base, on passe la pastille au vert
        if (data.telegram_chat_id) {
          setTelegramLinked(true);
        }
      }
    }
  };

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
        .nav-item { padding: 14px 18px; border-radius: 12px; display: flex; align-items: center; gap: 12px; font-weight: 600; opacity: 0.8; margin-bottom: 10px; cursor: pointer; color: white;}
        .nav-item.active { background: rgba(255,255,255,0.15); color: #fbbf24; opacity: 1; }

        main { flex: 1; margin-left: 260px; padding: 50px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; }
        .settings-container { width: 100%; max-width: 800px; }
        
        .header-area { margin-bottom: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
        h1 { margin: 0; color: #1e293b; font-size: 32px; font-weight: 800; }
        p.subtitle { color: #64748b; margin: 5px 0 0 0; font-size: 15px; }

        .settings-card { background: white; border-radius: 20px; padding: 30px; margin-bottom: 30px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
        h2 { margin: 0 0 25px 0; color: #1a2a6c; font-size: 20px; font-weight: 800; display: flex; align-items: center; gap: 10px; }
        
        .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .input-group { display: flex; flex-direction: column; gap: 8px; }
        .input-group.full { grid-column: span 2; }
        label { font-size: 12px; font-weight: 700; color: #64748b
