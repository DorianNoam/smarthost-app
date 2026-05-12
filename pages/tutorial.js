import Link from 'next/link';

export default function Tutorial() {
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

        .grid-mini { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 20px; 
          margin: 25px 0;
        }

        .feature-list { list-style: none; padding: 0; margin: 0; }
        .feature-list li { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; font-size: 15px; color: #334155; }
        .icon { font-size: 18px; }

        .tip-box { background: #fff7ed; border-left: 4px solid #f97316; padding: 20px; border-radius: 12px; font-size: 14px; color: #9a3412; margin-top: 20px; }
        
        /* Styles Telegram Spécifiques */
        .telegram-alert { border: 2px solid #0088cc; background: #f0f9ff; }
        .telegram-header { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
        .download-buttons { display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap; }
        .btn-dl { 
          padding: 12px 20px; 
          border-radius: 10px; 
          font-size: 13px; 
          font-weight: 700; 
          text-decoration: none; 
          display: flex; 
          align-items: center; 
          gap: 8px;
          transition: 0.2s;
        }
        .btn-apple { background: #000; color: white; }
        .btn-google { background: #34a853; color: white; }
        .btn-link-bot { background: #0088cc; color: white; width: 100%; justify-content: center; margin-top: 20px; font-size: 16px; padding: 18px; border: none; cursor: pointer; }
        .btn-link-bot:hover { background: #0077b5; }

        .cta-footer { text-align: center; margin-top: 60px; padding: 40px; background: #1a2a6c; border-radius: 24px; color: white; }
        .btn-start { background: #fbbf24; color: #1a2a6c; padding: 16px 32px; border-radius: 12px; font-weight: 800; border: none; cursor: pointer; font-size: 18px; margin-top: 20px; transition: 0.2s; }
        .btn-start:hover { transform: scale(1.05); }

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

      <h1>Comment fonctionne MajorMarc ?</h1>
      <p className="subtitle">Suivez ces 4 étapes pour automatiser la gestion de vos voyageurs.</p>

      {/* ÉTAPE 1 */}
      <div className="step-card">
        <div className="step-number">1</div>
        <div className="step-content">
          <span className="badge">Démarrage</span>
          <h2>Créez votre logement</h2>
          <p>Ajoutez votre propriété en quelques clics pour activer son intelligence locale.</p>
          <ul className="feature-list">
            <li><span className="icon">🏠</span> <strong>Nom :</strong> Identifiez votre villa (ex: Villa 08).</li>
            <li><span className="icon">📍</span> <strong>Adresse :</strong> Indispensable pour que Marc localise les transports et commerces autour du logement.</li>
          </ul>
        </div>
      </div>

      {/* ÉTAPE 2 */}
      <div className="step-card">
        <div className="step-number">2</div>
        <div className="step-content">
          <span className="badge">Performance & Sérénité</span>
          <h2>Dressez votre Majordome (Les 10 Piliers)</h2>
          <p>
            Major Marc est intelligent, mais il a besoin de vos consignes pour être parfait. 
            <strong> Remplissez un maximum d'informations pour ne plus jamais être dérangé par un voyageur :</strong>
          </p>
          
          <div className="grid-mini">
            <ul className="feature-list">
              <li><span className="icon">🔑</span> <strong>Arrivée :</strong> Accès, codes et horaires.</li>
              <li><span className="icon">📶</span> <strong>Wifi :</strong> Emplacement et mots de passe.</li>
              <li><span className="icon">🗑️</span> <strong>Poubelles :</strong> Jours de sortie et tri.</li>
              <li><span className="icon">☕</span> <strong>Équipements :</strong> Cafetière, Clim, TV.</li>
              <li><span className="icon">📜</span> <strong>Règlement :</strong> Tabac, animaux, bruit.</li>
            </ul>
            <ul className="feature-list">
              <li><span className="icon">🚌</span> <strong>Transports :</strong> Vos lignes préférées.</li>
              <li><span className="icon">🍕</span> <strong>Quartier :</strong> Vos restos favoris.</li>
              <li><span className="icon">🚒</span> <strong>Urgences :</strong> Kit secours, disjoncteur.</li>
              <li><span className="icon">💡</span> <strong>Énergie :</strong> Eau, gaz, électricité.</li>
              <li><span className="icon">✨</span> <strong>Extra :</strong> Vos petites attentions.</li>
            </ul>
          </div>

          <div className="tip-box">
            <strong>💡 La Règle d'Or :</strong> Un Majordome bien informé, c'est un hôte qui n'est jamais sollicité inutilement. Plus vous détaillez, plus vous gagnez en liberté.
          </div>
        </div>
      </div>

      {/* ÉTAPE 3 */}
      <div className="step-card">
        <div className="step-number">3</div>
        <div className="step-content">
          <span className="badge">Mise en service</span>
          <h2>Partagez l'accès voyageur</h2>
          <p>Une fois activé, Marc devient le point de contact privilégié de vos locataires.</p>
          <ul className="feature-list">
            <li><span className="icon">🔗</span> Utilisez le bouton <strong>"Lien d'Accès Voyageur"</strong> sur votre tableau de bord.</li>
            <li><span className="icon">📲</span> Copiez le message et collez-le dans vos instructions Airbnb ou Booking.</li>
          </ul>
        </div>
      </div>

      {/* ÉTAPE 4 */}
      <div className="step-card telegram-alert">
        <div className="step-content">
          <div className="telegram-header">
            <span style={{fontSize: '40px'}}>🚨</span>
            <h2>Indispensable : Ne ratez aucun message !</h2>
          </div>
          
          <p>
            La réactivité est la clé d'un commentaire 5 étoiles. Liez votre compte <strong>Telegram</strong> pour être alerté instantanément sur votre téléphone dès qu'un voyageur pose une question.
          </p>
          
          <div className="download-area">
            <p style={{fontSize: '14px', fontWeight: '800', marginBottom: '10px'}}>1. Installez l'application Telegram :</p>
            <div className="download-buttons">
              <a href="https://apps.apple.com/app/telegram-messenger/id686449807" target="_blank" className="btn-dl btn-apple">
                🍎 iPhone / App Store
              </a>
              <a href="https://play.google.com/store/apps/details?id=org.telegram.messenger" target="_blank" className="btn-dl btn-google">
                🤖 Android / Play Store
              </a>
            </div>
          </div>

          <div className="link-area" style={{marginTop: '30px'}}>
            <p style={{fontSize: '14px', fontWeight: '800', marginBottom: '10px'}}>2. Activez les notifications MajorMarc :</p>
            <p style={{fontSize: '13px'}}>Cliquez ci-dessous puis appuyez sur le bouton <strong>"DÉMARRER"</strong> dans Telegram.</p>
            <a href="https://t.me/MonMajordomeIARobot" target="_blank" className="btn-dl btn-link-bot" style={{textDecoration:'none'}}>
              ✈️ Lier mon compte Telegram maintenant
            </a>
          </div>
        </div>
      </div>

      <div className="cta-footer">
        <h2>Prêt à automatiser votre gestion ?</h2>
        <p>Votre majordome n'attend plus que vos instructions.</p>
        <Link href="/add-property" legacyBehavior>
          <button className="btn-start">Ajouter mon logement</button>
        </Link>
      </div>
    </div>
  );
}
