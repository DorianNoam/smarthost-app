import Link from 'next/link';

export default function Tutorial() {
  return (
    <div className="tutorial-container">
      <style jsx global>{`
        body { margin: 0; background: #f8fafc; font-family: 'Inter', sans-serif; color: #1e293b; }
      `}</style>
      <style jsx>{`
        .tutorial-container { max-width: 900px; margin: 0 auto; padding: 60px 20px; }
        .back-link { color: #1a2a6c; font-weight: 700; display: flex; align-items: center; gap: 8px; margin-bottom: 40px; cursor: pointer; }
        
        h1 { font-size: 36px; font-weight: 900; color: #1a2a6c; margin-bottom: 10px; }
        .subtitle { color: #64748b; font-size: 18px; margin-bottom: 50px; }

        .step-card { background: white; border-radius: 24px; padding: 40px; border: 1px solid #e2e8f0; margin-bottom: 30px; position: relative; overflow: hidden; }
        .step-number { position: absolute; top: -10px; right: 20px; font-size: 120px; font-weight: 900; color: #f1f5f9; z-index: 1; }
        .step-content { position: relative; z-index: 2; }
        
        .badge { background: #fbbf24; color: #1a2a6c; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 15px; display: inline-block; }
        h2 { font-size: 24px; font-weight: 800; color: #1a2a6c; margin: 0 0 15px 0; }
        p { line-height: 1.6; color: #475569; margin-bottom: 20px; }

        .feature-list { list-style: none; padding: 0; margin: 0; }
        .feature-list li { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; font-size: 15px; }
        .icon { font-size: 18px; }

        .tip-box { background: #f0f7ff; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 8px; font-size: 14px; color: #1e40af; }
        
        .cta-footer { text-align: center; margin-top: 60px; padding: 40px; background: #1a2a6c; border-radius: 24px; color: white; }
        .btn-start { background: #fbbf24; color: #1a2a6c; padding: 16px 32px; border-radius: 12px; font-weight: 800; border: none; cursor: pointer; font-size: 18px; margin-top: 20px; }

        @media (max-width: 600px) {
          h1 { font-size: 28px; }
          .step-card { padding: 30px 20px; }
          .step-number { font-size: 80px; }
        }
      `}</style>

      <Link href="/dashboard" legacyBehavior>
        <a className="back-link">← Retour au tableau de bord</a>
      </Link>

      <h1>Comment fonctionne MajorMarc ?</h1>
      <p className="subtitle">Suivez ce guide pour configurer votre majordome en moins de 5 minutes.</p>

      {/* ÉTAPE 1 */}
      <div className="step-card">
        <div className="step-number">1</div>
        <div className="step-content">
          <span className="badge">Initialisation</span>
          <h2>Créez votre logement</h2>
          <p>Tout commence par l'ajout de votre propriété. Cliquez sur le bouton <strong>"+ Ajouter"</strong> depuis votre tableau de bord.</p>
          <ul className="feature-list">
            <li><span className="icon">🏠</span> Donnez un nom reconnaissable (ex: Villa 08).</li>
            <li><span className="icon">📍</span> Renseignez l'adresse exacte pour activer les recommandations Google Maps.</li>
          </ul>
        </div>
      </div>

      {/* ÉTAPE 2 */}
      <div className="step-card">
        <div className="step-number">2</div>
        <div className="step-content">
          <span className="badge">Personnalisation</span>
          <h2>Apprenez-lui ses fonctions</h2>
          <p>Le majordome est intelligent, mais il a besoin de vos consignes spécifiques pour être parfait.</p>
          <ul className="feature-list">
            <li><span className="icon">🔑</span> <strong>Accès :</strong> Code WiFi, boîte à clés, instructions d'arrivée.</li>
            <li><span className="icon">🚌</span> <strong>Transports :</strong> Vos lignes préférées (elles priment sur Google).</li>
            <li><span className="icon">🍕</span> <strong>Recommandations :</strong> Vos adresses coup de cœur dans le quartier.</li>
          </ul>
          <div className="tip-box">
            <strong>Conseil :</strong> Plus vous remplissez la "Base de connaissances", plus le majordome sera précis et évitera de déranger l'hôte.
          </div>
        </div>
      </div>

      {/* ÉTAPE 3 */}
      <div className="step-card">
        <div className="step-number">3</div>
        <div className="step-content">
          <span className="badge">Mise en service</span>
          <h2>Partagez l'accès voyageur</h2>
          <p>Une fois configuré et activé, il est temps de présenter Marc à vos locataires.</p>
          <ul className="feature-list">
            <li><span className="icon">🔗</span> Utilisez le bouton <strong>"Lien d'Accès Voyageur"</strong> sur votre dashboard.</li>
            <li><span className="icon">📲</span> Copiez le message pré-rempli et collez-le dans vos échanges Airbnb ou Booking.</li>
          </ul>
        </div>
      </div>

      {/* ÉTAPE 4 */}
      <div className="step-card">
        <div className="step-number">4</div>
        <div className="step-content">
          <span className="badge">Suivi & Sécurité</span>
          <h2>Historique et Notifications</h2>
          <p>Gardez toujours un œil sur ce qui se passe dans votre logement sans lever le petit doigt.</p>
          <ul className="feature-list">
            <li><span className="icon">📜</span> <strong>Historique :</strong> Consultez tous les échanges entre les voyageurs et l'IA.</li>
            <li><span className="icon">✈️</span> <strong>Telegram :</strong> Liez votre compte dans les paramètres pour recevoir une alerte immédiate dès qu'un voyageur pose une question.</li>
          </ul>
        </div>
      </div>

      <div className="cta-footer">
        <h2>Prêt à automatiser votre gestion ?</h2>
        <p>Votre majordome n'attend plus que vos instructions.</p>
        <Link href="/add-property" legacyBehavior>
          <button className="btn-start">Ajouter un logement</button>
        </Link>
      </div>
    </div>
  );
}
