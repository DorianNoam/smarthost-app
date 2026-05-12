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
    const botName = "MonMajordomeIARobot";
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

        .tip-box { background: #fff7ed; border-left: 4px solid #f97316; padding: 20px; border-radius: 12px; font-size: 14px; color: #9a3412; margin-top: 20px; }
        
        .telegram-alert { border: 2px solid #0088cc; background: #f0f9ff; }
        .telegram-header { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
        .download-buttons { display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap; }
        .btn-dl { padding: 12px 20px; border-radius: 10px; font-size: 13px; font-weight: 700; text-decoration: none; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
        .btn-apple { background: #000; color: white; }
        .btn-google { background: #34a853; color: white; }
        .btn-link-bot { background: #0088cc; color: white; width: 100%; justify-content: center; margin-top: 20px; font-size: 16px; padding: 18px; border: none; cursor: pointer; border-radius: 12px; font-weight: 800; }

        .cta-footer { text-align: center; margin-top: 60px; padding: 40px; background: #1a2a6c; border-radius: 24px; color: white; }
        .btn-start { background: #fbbf24; color: #1a2a6c; padding: 16px 32px; border-radius: 12px; font-weight: 800; border: none; cursor: pointer; font-size: 18px; margin-top: 20px; transition: 0.2s; }

        @media (max-width: 600px) {
          h1 { font-size: 28px; }
          .step-card { padding: 30px 20px; }
          .step-number { font-size: 80px; }
          .grid-mini { grid-template-columns: 1fr; }
        }
      `}</style>

      <Link href="/dashboard" legacyBehavior>
        <a className="back-link">← Retour au tableau de bord</a>
      </Link>

      <h1>Guide de mise en route</h1>
      <p className="subtitle">Configurez MajorMarc en 4 étapes clés.</p>

      {/* ÉTAPE 1 */}
      <div className="step-card">
        <div className="step-number">1</div>
        <div className="step-content">
          <span className="badge">Démarrage</span>
          <h2>Créez votre logement</h2>
          <p>Ajoutez votre propriété pour lui donner une identité et une localisation précise.</p>
          <ul className="feature-list">
            <li><span className="icon">🏠</span> <strong>Nom :</strong> Indiquez le nom de votre villa.</li>
            <li><span className="icon">📍</span> <strong>Adresse :</strong> Indispensable pour la localisation Google Maps.</li>
          </ul>
        </div>
      </div>

      {/* ÉTAPE 2 */}
      <div className="step-card">
        <div className="step-number">2</div>
        <div className="step-content">
          <span className="badge">Sérénité</span>
          <h2>Dressez votre Majordome (Les 10 Piliers)</h2>
          <p>Remplissez un maximum d'informations pour que Marc réponde à tout sans vous déranger :</p>
          <div className="grid-mini">
            <ul className="feature-list">
              <li><span className="icon">🔑</span> Arrivée & Boîte à clés.</li>
              <li><span className="icon">📶</span> Wifi & Box.</li>
              <li><span className="icon">🗑️</span> Poubelles & Tri.</li>
              <li><span className="icon">☕</span> Équipements & Cuisine.</li>
              <li><span className="icon">📜</span> Règlement intérieur.</li>
            </ul>
            <ul className="feature-list">
              <li><span className="icon">🚌</span> Transports favoris.</li>
              <li><span className="icon">🍕</span> Vos bonnes adresses.</li>
              <li><span className="icon">🚒</span> Urgences & Sécurité.</li>
              <li><span className="icon">💡</span> Compteurs & Énergie.</li>
              <li><span className="icon">✨</span> Services Plus.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ÉTAPE 3 */}
      <div className="step-card">
        <div className="step-number">3</div>
        <div className="step-content">
          <span className="badge">Mise en service</span>
          <h2>Partagez l'accès voyageur</h2>
          <p>Copiez votre lien personnalisé et collez-le dans vos messages de bienvenue Airbnb ou Booking.</p>
        </div>
      </div>

      {/* ÉTAPE 4 - TELEGRAM / URGENCE */}
      <div id="step-4" className="step-card telegram-alert">
        <div className="step-content">
          <div className="telegram-header">
            <span style={{fontSize: '40px'}}>🚨</span>
            <h2>Urgence & Alerte : Votre filet de sécurité</h2>
          </div>
          <p>
            En cas d'urgence ou si l'IA ne connaît pas la réponse, le système vous contacte immédiatement via <strong>Telegram</strong>.
          </p>
          <blockquote style={{borderLeft: '4px solid #0088cc', paddingLeft: '15px', color: '#006699', fontWeight: '600', marginBottom: '25px'}}>
            "Lier Telegram est indispensable pour être informé à la seconde près dès qu'une intervention humaine est nécessaire."
          </blockquote>

          <div className="download-area">
            <p style={{fontSize: '14px', fontWeight: '800', marginBottom: '10px'}}>1. Téléchargez l'application Telegram :</p>
            <div className="download-buttons">
              <a href="https://apps.apple.com/app/telegram-messenger/id686449807" target="_blank" className="btn-dl btn-apple">🍎 iPhone</a>
              <a href="https://play.google.com/store/apps/details?id=org.telegram.messenger" target="_blank" className="btn-dl btn-google">🤖 Android</a>
            </div>
          </div>

          <div className="link-area" style={{marginTop: '30px'}}>
            <p style={{fontSize: '14px', fontWeight: '800', marginBottom: '10px'}}>2. Activez les notifications :</p>
            <button onClick={handleTelegramSmartLink} className="btn-link-bot">
              ✈️ Lier mon compte Telegram maintenant
            </button>
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
