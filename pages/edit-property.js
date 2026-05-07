import { useState } from 'react';
import Link from 'next/link';

export default function EditProperty() {
  const [tab, setTab] = useState('obligatoire');

  return (
    <div className="config-container">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@300;400;600;700&display=swap');

        .config-container { min-height: 100vh; background: #f4f7f9; font-family: 'Montserrat', sans-serif; padding: 40px 5%; }
        .config-card { max-width: 1000px; margin: 0 auto; background: white; border-radius: 30px; box-shadow: 0 20px 50px rgba(0,0,0,0.05); overflow: hidden; }

        /* Header avec Barre de Progression */
        .config-header { background: #1a2a6c; color: white; padding: 30px 40px; }
        .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .header-top h1 { font-family: 'Playfair Display', serif; margin: 0; font-size: 22px; }
        .score-box { text-align: right; }
        .progress-container { width: 100%; background: rgba(255,255,255,0.1); height: 8px; border-radius: 10px; position: relative; }
        .progress-bar { height: 100%; background: #d4af37; border-radius: 10px; transition: 0.5s; width: 35%; }
        .progress-label { font-size: 11px; margin-top: 8px; display: block; color: #d4af37; font-weight: 700; text-transform: uppercase; }

        /* Tabs avec scroll latéral sur mobile */
        .tabs { display: flex; background: #fdfbf7; border-bottom: 1px solid #eee; overflow-x: auto; white-space: nowrap; }
        .tab-btn { padding: 20px 25px; border: none; background: none; cursor: pointer; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; }
        .tab-btn.active { color: #1a2a6c; border-bottom: 3px solid #d4af37; background: white; }

        .form-content { padding: 40px; }
        .section-title { font-family: 'Playfair Display', serif; font-size: 20px; color: #1a2a6c; margin-bottom: 25px; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px; }
        
        .grid-inputs { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px; margin-bottom: 40px; }
        .input-group { display: flex; flex-direction: column; }
        label { font-weight: 700; font-size: 13px; color: #1a2a6c; margin-bottom: 8px; }
        input, textarea, select { width: 100%; padding: 14px; border: 1px solid #eee; border-radius: 10px; background: #f9f9f9; font-family: 'Montserrat', sans-serif; font-size: 14px; box-sizing: border-box; }
        textarea { height: 100px; }
        .helper { font-size: 11px; color: #999; margin-top: 5px; }

        .actions { padding: 30px 40px; background: #f9f9f9; display: flex; justify-content: space-between; align-items: center; }
        .btn-later { background: none; border: 1px solid #ccc; color: #777; padding: 12px 25px; border-radius: 50px; cursor: pointer; font-weight: 600; font-size: 13px; }
        .btn-save { background: #1a2a6c; color: white; padding: 15px 40px; border-radius: 50px; font-weight: 700; border: none; cursor: pointer; transition: 0.3s; }
        .btn-save:hover { background: #d4af37; color: #1a2a6c; }
      `}</style>

      <div className="config-card">
        <header className="config-header">
          <div className="header-top">
            <div>
              <Link href="/dashboard" style={{color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '12px'}}>← Quitter sans enregistrer</Link>
              <h1>Configuration : Villa Bella</h1>
            </div>
            <div className="score-box">
               <span className="progress-label">Score de Sérénité : 35%</span>
            </div>
          </div>
          <div className="progress-container">
            <div className="progress-bar"></div>
          </div>
        </header>

        <nav className="tabs">
          <button className={`tab-btn ${tab === 'obligatoire' ? 'active' : ''}`} onClick={() => setTab('obligatoire')}>📍 Vital</button>
          <button className={`tab-btn ${tab === 'logistique' ? 'active' : ''}`} onClick={() => setTab('logistique')}>🔑 Logistique</button>
          <button className={`tab-btn ${tab === 'vie' ? 'active' : ''}`} onClick={() => setTab('vie')}>🍳 Vie Intérieure</button>
          <button className={`tab-btn ${tab === 'quartier' ? 'active' : ''}`} onClick={() => setTab('quartier')}>🌍 Quartier</button>
          <button className={`tab-btn ${tab === 'regles' ? 'active' : ''}`} onClick={() => setTab('regles')}>📜 Règles & Urgence</button>
        </nav>

        <div className="form-content">
          {tab === 'obligatoire' && (
            <div className="tab-pane">
              <h2 className="section-title">Le strict minimum pour lancer Marc</h2>
              <div className="grid-inputs">
                <div className="input-group">
                  <label>Nom du réseau Wi-Fi</label>
                  <input type="text" placeholder="ex: Villa_Bella_Guest" />
                </div>
                <div className="input-group">
                  <label>Mot de passe Wi-Fi</label>
                  <input type="text" placeholder="ex: Holiday2026!" />
                </div>
                <div className="input-group" style={{gridColumn: '1 / -1'}}>
                  <label>Accès : Comment entrer dans le logement ?</label>
                  <textarea placeholder="Expliquez ici l'emplacement de la boîte à clés, les codes d'immeuble et l'étage..."></textarea>
                  <p className="helper">Soyez le plus précis possible pour éviter les appels à l'arrivée.</p>
                </div>
              </div>
            </div>
          )}

          {tab === 'logistique' && (
            <div className="tab-pane">
              <h2 className="section-title">Parking & Transports</h2>
              <div className="grid-inputs">
                <div className="input-group">
                  <label>Parking Privé</label>
                  <input type="text" placeholder="Place n°12, Bip dans le tiroir de l'entrée..." />
                </div>
                <div className="input-group">
                  <label>Stationnement dans la rue</label>
                  <input type="text" placeholder="Gratuit, payant (appli PayByPhone)..." />
                </div>
              </div>
              <h2 className="section-title">Poubelles & Tri</h2>
              <div className="grid-inputs">
                <div className="input-group">
                  <label>Emplacement & Codes</label>
                  <textarea placeholder="Local au fond de la cour, code 45B..."></textarea>
                </div>
                <div className="input-group">
                  <label>Calendrier de ramassage</label>
                  <input type="text" placeholder="Bac jaune le mardi matin..." />
                </div>
              </div>
            </div>
          )}

          {tab === 'vie' && (
            <div className="tab-pane">
              <h2 className="section-title">Cuisine & Équipements</h2>
              <div className="grid-inputs">
                <div className="input-group">
                  <label>Machine à Café</label>
                  <select>
                    <option>Nespresso</option>
                    <option>Senseo</option>
                    <option>Filtre</option>
                    <option>Piston / Italienne</option>
                  </select>
                  <p className="helper">Marc saura quelles capsules conseiller.</p>
                </div>
                <div className="input-group">
                  <label>Outils spécifiques</label>
                  <input type="text" placeholder="Appareil à raclette, Mixeur, Tire-bouchon..." />
                </div>
                <div className="input-group">
                  <label>Équipements Bébé</label>
                  <input type="text" placeholder="Lit parapluie (placard chambre 1), Chaise haute..." />
                </div>
              </div>
              <h2 className="section-title">Climatisation & Chauffage</h2>
              <div className="input-group">
                <label>Mode d'emploi rapide</label>
                <textarea placeholder="La télécommande est sur le mur du salon. Ne pas descendre sous 20°C..."></textarea>
              </div>
            </div>
          )}

          {tab === 'quartier' && (
            <div className="tab-pane">
              <h2 className="section-title">Vos meilleures adresses</h2>
              <div className="grid-inputs">
                <div className="input-group">
                  <label>La Boulangerie de quartier</label>
                  <input type="text" placeholder="Boulangerie 'Le Bon Pain' à 200m..." />
                </div>
                <div className="input-group">
                  <label>Le Restaurant 'Coup de Cœur'</label>
                  <input type="text" placeholder="L'Assiette Bleue (Poisson frais)..." />
                </div>
                <div className="input-group">
                  <label>Courses d'urgence</label>
                  <input type="text" placeholder="Carrefour City ouvert jusqu'à 22h..." />
                </div>
              </div>
            </div>
          )}

          {tab === 'regles' && (
            <div className="tab-pane">
              <h2 className="section-title">Règles & Sécurité</h2>
              <div className="grid-inputs">
                <div className="input-group">
                  <label>Heures de silence</label>
                  <input type="text" placeholder="Pas de bruit après 22h..." />
                </div>
                <div className="input-group">
                  <label>Vanne d'arrêt d'eau (URGENCE)</label>
                  <input type="text" placeholder="Sous l'évier de la cuisine..." />
                  <p className="helper">Marc ne donnera cette info qu'en cas d'alerte fuite.</p>
                </div>
                <div className="input-group">
                  <label>Tableau électrique</label>
                  <input type="text" placeholder="Dans le placard de l'entrée..." />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="actions">
          <button className="btn-later">Finir la configuration plus tard</button>
          <button className="btn-save">Valider les informations</button>
        </div>
      </div>
    </div>
  );
}
