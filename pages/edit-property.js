
import { useState } from 'react';
import Link from 'next/link';

export default function EditProperty() {
  const [tab, setTab] = useState('essentiels');

  return (
    <div className="config-container">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@300;400;600;700&display=swap');

        .config-container {
          min-height: 100vh;
          background: #f4f7f9;
          font-family: 'Montserrat', sans-serif;
          padding: 40px 5%;
        }

        .config-card {
          max-width: 900px;
          margin: 0 auto;
          background: white;
          border-radius: 30px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.05);
          overflow: hidden;
        }

        .config-header {
          background: #1a2a6c;
          color: white;
          padding: 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .config-header h1 { font-family: 'Playfair Display', serif; margin: 0; font-size: 24px; }
        .btn-back { color: white; opacity: 0.7; text-decoration: none; font-size: 14px; }

        /* Tabs Navigation */
        .tabs {
          display: flex;
          background: #fdfbf7;
          border-bottom: 1px solid #eee;
        }

        .tab-btn {
          flex: 1;
          padding: 20px;
          border: none;
          background: none;
          cursor: pointer;
          font-weight: 700;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #999;
          transition: 0.3s;
        }

        .tab-btn.active {
          color: #1a2a6c;
          border-bottom: 3px solid #d4af37;
          background: white;
        }

        /* Form Content */
        .form-content { padding: 40px; }

        .input-group { margin-bottom: 30px; }
        label { display: block; font-weight: 700; font-size: 14px; color: #1a2a6c; margin-bottom: 10px; }
        input, textarea, select {
          width: 100%;
          padding: 15px;
          border: 1px solid #eee;
          border-radius: 12px;
          background: #f9f9f9;
          font-family: 'Montserrat', sans-serif;
          font-size: 14px;
          box-sizing: border-box;
        }
        textarea { height: 120px; resize: none; }
        input:focus, textarea:focus { outline: none; border-color: #d4af37; background: white; }

        .helper-text { font-size: 12px; color: #999; margin-top: 8px; line-height: 1.4; }

        .actions {
          padding: 30px 40px;
          background: #f9f9f9;
          display: flex;
          justify-content: flex-end;
          gap: 20px;
        }

        .btn-save {
          background: #d4af37;
          color: #1a2a6c;
          padding: 15px 40px;
          border-radius: 50px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: 0.3s;
        }

        .btn-save:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(212, 175, 55, 0.3); }
      `}</style>

      <div className="config-card">
        <header className="config-header">
          <div>
            <Link href="/dashboard" className="btn-back">← Retour au tableau de bord</Link>
            <h1>Configuration : Villa Bella</h1>
          </div>
          <div style={{textAlign: 'right'}}>
            <span style={{fontSize: '11px', textTransform: 'uppercase', opacity: 0.7}}>Majordome</span><br/>
            <b style={{color: '#d4af37'}}>ACTIF</b>
          </div>
        </header>

        <nav className="tabs">
          <button className={`tab-btn ${tab === 'essentiels' ? 'active' : ''}`} onClick={() => setTab('essentiels')}>🏠 Essentiels</button>
          <button className={`tab-btn ${tab === 'vie' ? 'active' : ''}`} onClick={() => setTab('vie')}>✨ Vie Quotidienne</button>
          <button className={`tab-btn ${tab === 'alertes' ? 'active' : ''}`} onClick={() => setTab('alertes')}>🚨 Alertes</button>
        </nav>

        <div className="form-content">
          {tab === 'essentiels' && (
            <div className="tab-pane">
              <div className="input-group">
                <label>Nom du logement pour les voyageurs</label>
                <input type="text" placeholder="ex: La Villa Bella - Vue Mer" />
              </div>
              <div className="input-group">
                <label>Code Wi-Fi</label>
                <input type="text" placeholder="ex: Nom du réseau + Mot de passe" />
                <p className="helper-text">Marc donnera ces informations dès qu'un voyageur les demandera.</p>
              </div>
              <div className="input-group">
                <label>Instructions d'Arrivée (Check-in)</label>
                <textarea placeholder="ex: Le boîtier à clés se trouve à droite de la porte noire. Le code est 1234..."></textarea>
                <p className="helper-text">Soyez précis sur l'emplacement des clés ou le fonctionnement du digicode.</p>
              </div>
            </div>
          )}

          {tab === 'vie' && (
            <div className="tab-pane">
              <div className="input-group">
                <label>Gestion des déchets</label>
                <textarea placeholder="ex: Les poubelles se situent au bout de l'impasse. Les bacs jaunes sont ramassés le mardi..."></textarea>
              </div>
              <div className="input-group">
                <label>Vos recommandations locales</label>
                <textarea placeholder="ex: Le restaurant 'L'Assiette Bleue' est excellent pour le poisson. La boulangerie du coin ouvre à 7h..."></textarea>
                <p className="helper-text">Marc utilisera ces adresses pour conseiller vos voyageurs.</p>
              </div>
              <div className="input-group">
                <label>Ton du Majordome</label>
                <select>
                  <option>Très Formel & Distingué</option>
                  <option>Chaleureux & Amical</option>
                  <option>Efficace & Direct</option>
                </select>
              </div>
            </div>
          )}

          {tab === 'alertes' && (
            <div className="tab-pane">
              <div className="input-group">
                <label>Votre identifiant Telegram</label>
                <input type="text" placeholder="ex: @votre_pseudo" />
                <p className="helper-text">C'est ici que Marc vous enverra les alertes en cas de fuite d'eau ou de problème grave.</p>
              </div>
              <div className="input-group">
                <label>Numéro d'urgence propriétaire</label>
                <input type="text" placeholder="ex: +33 6 00 00 00 00" />
                <p className="helper-text">Ce numéro ne sera jamais donné au voyageur, sauf si Marc juge la situation critique.</p>
              </div>
            </div>
          )}
        </div>

        <div className="actions">
          <button className="btn-save">Enregistrer la configuration</button>
        </div>
      </div>
    </div>
  );
}
