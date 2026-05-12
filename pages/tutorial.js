import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function Tutorial() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleTelegramSmartLink = () => {
    // NOM DU ROBOT CRÉÉ SUR TELEGRAM
    const botName = "Marc_Alerte_Bot"; 
    const userId = user?.id;
    
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isMobile = isIOS || isAndroid;

    const appLink = `tg://resolve?domain=${botName}&start=${userId}`;
    const webLink = `https://t.me/${botName}?start=${userId}`;
    const playStore = "https://play.google.com/store/apps/details?id=org.telegram.messenger";
    const appStore = "https://apps.apple.com/app/telegram-messenger/id686449807";

    if (isMobile) {
      window.location.href = appLink;
      const start = Date.now();
      setTimeout(() => {
        if (Date.now() - start < 3500) {
          window.location.href = isIOS ? appStore : playStore;
        }
      }, 2500);
    } else {
      window.open(webLink, '_blank');
    }
  };

  return (
    <div className="tutorial-container">
      <style jsx global>{`
        body { margin: 0; background: #f8fafc; font-family: 'Inter', sans-serif; color: #1e293b; }
      `}</style>
      <style jsx>{`
        .tutorial-container { max-width: 900px; margin: 0 auto; padding: 60px 20px; }
        .back-link { color: #1a2a6c; font-weight: 700; display: flex; align-items: center; gap: 8px; margin-bottom: 40px; cursor: pointer; text-decoration: none; }
        
        h1 { font-size: 36px; font-weight: 900; color: #1a2a6c; margin-bottom: 10px; }
        .subtitle { color: #64748b; font-size: 18px; margin-bottom: 50px; }

        .step-card { background: white; border-radius: 24px; padding: 40px; border: 1px solid #e2e8f0; margin-bottom: 30px; position: relative; overflow: hidden; }
        .step-number { position: absolute; top: -10px; right: 20px; font-size: 120px; font-weight: 900; color: #f1f5f9; z-index: 1; }
        .step-content { position: relative; z-index: 2; }
        
        .badge { background: #fbbf24; color: #1a2a6c; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 15px; display: inline-block; }
        h2 { font-size: 24px; font-weight: 800; color: #1a2a6c; margin: 0 0 15px 0; }
        p { line-height: 1.6; color: #475569; margin-bottom: 20px; }

        .grid-mini { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0; }
        .feature-list { list-style: none; padding: 0; margin: 0; }
        .feature-list li { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; font-size: 15px; color: #334155; }
        .icon { font-size: 18px; }

        /* Styles Telegram Spécifiques & Responsive */
        .telegram-alert { border: 2px solid #0088cc; background: #f0f9ff; }
        .telegram-header { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; }
        
        .download-area { background: rgba(255,255,255,0.6); padding: 20px; border-radius: 16px; margin: 25px 0; }
        .download-buttons { display: flex; gap: 12px; margin-top: 15px; }
        
        .btn-dl { flex: 1; padding: 14px; border-radius: 10px; font-size: 14px; font-weight: 700; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; }
        .btn-apple { background: #000; color: white; }
        .btn-google { background: #34a853; color: white; }
        
        .link-area { text-align: center; margin-top: 30px; }
        .btn-link-bot { background: #0088cc; color: white; width: 100%; max-width: 400px; justify-content: center; font-size: 16px; padding: 18px; border: none; cursor: pointer; border-radius: 15px; font-weight: 800; box-shadow: 0 4px 12px rgba(0,136,204,0.2); }

        .cta-footer { text-align: center; margin-top: 60px; padding: 40px; background: #1a2a6c; border-radius: 24px; color: white; }
        .btn-start { background: #fbbf24; color: #1a2a6c; padding: 16px 32px; border-radius: 12px; font-weight: 800; border: none; cursor: pointer; font-size: 18px; margin-top: 20px; }

        @media (max-width: 700px) {
          h1 { font-size: 28px; }
          .tutorial-container { padding: 40px 15px; }
          .step-card { padding: 30px 20px; }
          .grid-mini { grid-template-columns: 1fr; }
          .telegram-header { flex-direction: column; text-align: center; }
          .download-buttons { flex-direction: column; }
          .btn-dl { width: 100%; }
        }
      `}</style>

      <Link href="/dashboard" legacyBehavior>
        <a className="back-link">← Retour au tableau de bord</a>
      </Link>

      <h1>Guide de mise en route</h1>
      <p className="subtitle">Suivez ces 4 étapes pour automatiser votre gestion.</p>

      {/* ÉTAPES 1, 2, 3 Identiques à vos besoins... */}
      <div className="step-card">
        <div className="step-number">1</div>
        <div className="step-content">
          <span className="badge">Démarrage</span>
          <h2>Créez votre logement</h2>
          <p>Ajoutez votre propriété pour lui donner une identité et une localisation précise.</p>
        </div>
      </div>

      <div className="step-card">
        <div className="step-number">2</div>
        <div className="step-content">
          <span className="badge">Sérénité</span>
          <h2>Dressez votre Majordome (Les 10 Piliers)</h2>
          <div className="grid-mini">
            <ul className="feature-list">
              <li><span className="icon">🔑</span> Arrivée & Boîte à clés</li>
              <li><span className="icon">📶</span> Wifi & Box</li>
              <li><span className="icon">🗑️</span> Poubelles & Tri</li>
              <li><span className="icon">☕</span> Équipements</li>
              <li><span className="icon">📜</span> Règlement</li>
            </ul>
            <ul className="feature-list">
              <li><span className="icon">🚌</span> Transports</li>
              <li><span className="icon">🍕</span> Bonnes adresses</li>
              <li><span className="icon">🚒</span> Urgences</li>
              <li><span className="icon">💡</span> Énergie</li>
              <li><span className="icon">✨</span> Services Plus</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="step-card">
        <div className="step-number">3</div>
        <div className="step-content">
          <span className="badge">Mise en service</span>
          <h2>Partagez l'accès voyageur</h2>
          <p>Copiez votre lien et collez-le dans vos messages Airbnb ou Booking.</p>
        </div>
      </div>

      {/* ÉTAPE 4 - TELEGRAM RESPONSIVE */}
      <div id="step-4" className="step-card telegram-alert">
        <div className="step-content">
          <div className="telegram-header">
            <span style={{fontSize: '48px'}}>🚨</span>
            <h2>Urgence & Alerte : Votre filet de sécurité</h2>
          </div>
          <p>
            En cas d'urgence ou si l'IA ne connaît pas la réponse, le système vous contacte immédiatement via <strong>Telegram</strong>.
          </p>
          
          <div className="download-area">
            <p style={{fontSize: '14px', fontWeight: '800', textAlign: 'center', marginBottom: '10px'}}>1. Téléchargez l'application Telegram :</p>
            <div className="download-buttons">
              <a href="https://apps.apple.com/app/telegram-messenger/id686449807" target="_blank" className="btn-dl btn-apple">🍎 iPhone</a>
              <a href="https://play.google.com/store/apps/details?id=org.telegram.messenger" target="_blank" className="btn-dl btn-google">🤖 Android</a>
            </div>
          </div>

          <div className="link-area">
            <p style={{fontSize: '14px', fontWeight: '800', marginBottom: '15px'}}>2. Activez les notifications :</p>
            <button onClick={handleTelegramSmartLink} className="btn-link-bot">
              ✈️ Lier mon compte Telegram maintenant
            </button>
            <p style={{fontSize: '12px', color: '#64748b', marginTop: '15px'}}>
              <b>Important :</b> Une fois dans l'application, appuyez sur <b>"DÉMARRER"</b>.
            </p>
          </div>
        </div>
      </div>

      <div className="cta-footer">
        <h2>Prêt à gagner en liberté ?</h2>
        <Link href="/add-property" legacyBehavior>
          <button className="btn-start">Ajouter mon logement</button>
        </Link>
      </div>
    </div>
  );
}
