import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase'; // Ajuste le chemin si besoin (ex: '../lib/supabase')
import Link from 'next/link';

export default function PropertySpecs() {
  const router = useRouter();
  const { id } = router.query;
  const [property, setProperty] = useState(null);

  useEffect(() => {
    if (id) fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    const { data } = await supabase.from('properties').select('*').eq('id', id).single();
    setProperty(data);
  };

  if (!property) return null;

  // Petit composant pour afficher proprement les données (gère les cases vides)
  const DataItem = ({ label, value, fullWidth }) => (
    <div className="data-item" style={{ gridColumn: fullWidth ? 'span 2' : 'auto' }}>
      <label>{label}</label>
      <p>{value ? value : <span style={{color: '#cbd5e1', fontStyle: 'italic'}}>Non renseigné</span>}</p>
    </div>
  );

  return (
    <div className="specs-container">
      <style jsx global>{`
        body { margin: 0; background: #f8fafc; font-family: 'Inter', sans-serif; }
        a { text-decoration: none; }
      `}</style>
      <style jsx>{`
        .specs-container { min-height: 100vh; }
        
        /* HEADER AVEC LIEN CORRIGÉ */
        nav { background: #1a2a6c; color: white; padding: 15px 30px; display: flex; align-items: center; gap: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .back-link { color: white !important; font-size: 14px; opacity: 0.8; transition: 0.2s; font-weight: 600; }
        .back-link:hover { opacity: 1; text-decoration: underline; }
        h1 { font-size: 20px; margin: 0; font-weight: 800; border-left: 2px solid rgba(255,255,255,0.2); padding-left: 20px; }
        
        /* MISE EN PAGE */
        main { max-width: 1100px; margin: 40px auto; padding: 0 20px; display: grid; grid-template-columns: 2fr 1fr; gap: 30px; align-items: start; }
        
        /* SECTIONS DE DONNÉES */
        .left-col { display: flex; flex-direction: column; gap: 25px; }
        .section { background: white; padding: 30px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
        h2 { font-size: 18px; color: #1a2a6c; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-top: 0; margin-bottom: 20px; font-weight: 800; display: flex; align-items: center; gap: 10px; }
        
        .data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        
        /* COMPOSANT DONNÉE */
        .data-item label { display: block; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        .data-item p { margin: 6px 0 0; font-size: 15px; color: #1e293b; font-weight: 500; line-height: 1.5; white-space: pre-wrap; }
        
        /* STATISTIQUES (COLONNE DROITE) */
        .right-col { display: flex; flex-direction: column; gap: 20px; position: sticky; top: 40px; }
        .stat-card { background: #1a2a6c; color: white; padding: 30px; border-radius: 24px; text-align: center; box-shadow: 0 10px 15px -3px rgba(26,42,108,0.3); }
        .stat-value { font-size: 36px; font-weight: 900; display: block; color: #fbbf24; margin: 10px 0; }
        .stat-label { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9; }

        .btn-edit { background: #fbbf24; color: #1a2a6c !important; padding: 16px; border-radius: 16px; font-weight: 800; font-size: 15px; text-align: center; display: block; box-shadow: 0 4px 6px rgba(251,191,36,0.3); transition: 0.2s; }
        .btn-edit:hover { transform: translateY(-3px); box-shadow: 0 10px 15px rgba(251,191,36,0.4); }

        @media (max-width: 900px) { 
          main { grid-template-columns: 1fr; } 
          .right-col { position: static; }
          .data-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <nav>
        <Link href="/dashboard" passHref legacyBehavior>
          <a className="back-link">← Retour Dashboard</a>
        </Link>
        <h1>{property.name}</h1>
      </nav>

      <main>
        <div className="left-col">
          
          <div className="section">
            <h2>📍 Identité & Localisation</h2>
            <div className="data-grid">
              <DataItem label="Lien simplifié (Slug)" value={property.slug ? `/m/${property.slug}` : null} fullWidth />
              <DataItem label="Adresse" value={`${property.street_number || ''} ${property.address || ''}`} fullWidth />
              <DataItem label="Complément" value={property.address_complement} fullWidth />
              <DataItem label="Ville" value={property.city} />
              <DataItem label="Bâtiment / Étage" value={`${property.building || ''} ${property.floor ? `- Étage ${property.floor}` : ''}`} />
            </div>
          </div>

          <div className="section">
            <h2>🔑 Accès & Arrivée</h2>
            <div className="data-grid">
              <DataItem label="Check-in" value={`Dès ${property.check_in_hour}`} />
              <DataItem label="Check-out" value={`Avant ${property.check_out_hour}`} />
              <DataItem label="Arrivée autonome" value={property.self_checkin ? "✅ Oui" : "❌ Non"} />
              
              {property.self_checkin && (
                <>
                  <DataItem label="Type de dispositif" value={property.entrance_type} />
                  <DataItem label="Code d'accès" value={property.key_code} />
                </>
              )}
              
              <DataItem label="Parking" value={property.parking_info} fullWidth />
              <DataItem label="Lien GPS" value={property.gps_link} fullWidth />
              <DataItem label="Instructions d'entrée" value={property.checkin_instructions} fullWidth />
            </div>
          </div>

          <div className="section">
            <h2>📡 Wifi & Confort</h2>
            <div className="data-grid">
              <DataItem label="Nom du réseau (SSID)" value={property.wifi_name} />
              <DataItem label="Mot de passe" value={property.wifi_password} />
              <DataItem label="Chauffage / Climatisation" value={property.heating_cooling_info} fullWidth />
            </div>
          </div>

          <div className="section">
            <h2>🛠️ Technique & Entretien</h2>
            <div className="data-grid">
              <DataItem label="Tableau électrique" value={property.breaker_box_location} />
              <DataItem label="Vanne d'eau" value={property.water_shutoff_location} />
              <DataItem label="Gestion des poubelles" value={property.trash_instructions} fullWidth />
              <DataItem label="Urgences & Santé" value={property.health_emergency_info} fullWidth />
            </div>
          </div>

          <div className="section">
            <h2>🧭 Guide Local & Recommandations</h2>
            <div className="data-grid">
              <DataItem label="Commerces proches" value={property.local_shops} />
              <DataItem label="Transports" value={property.transport_info} />
              <DataItem label="Recommandations du propriétaire" value={property.recommendations} fullWidth />
            </div>
          </div>

          <div className="section">
            <h2>👋 Départ & Avis</h2>
            <div className="data-grid">
              <DataItem label="Consignes de sortie" value={property.checkout_instructions} fullWidth />
              <DataItem label="Retour des clés" value={property.key_return_details} />
              <DataItem label="Lien Airbnb pour avis" value={property.review_link} />
            </div>
          </div>

          <div className="section">
            <h2>📺 Divertissement & Appareils</h2>
            <div className="data-grid">
              <DataItem label="TV & Streaming" value={property.tv_manual} fullWidth />
              <DataItem label="Électroménager" value={property.appliances_instructions} fullWidth />
              <DataItem label="Audio" value={property.music_system} />
              <DataItem label="Jeux" value={property.games_available} />
            </div>
          </div>

          <div className="section">
            <h2>🧺 Inventaire & Linge</h2>
            <div className="data-grid">
              <DataItem label="Produits de base (Sel, poivre...)" value={property.pantry_basics} fullWidth />
              <DataItem label="Emplacement recharges (Papier, savon...)" value={property.consumables_location} fullWidth />
              <DataItem label="Lave-linge & Fer" value={property.laundry_iron_info} fullWidth />
            </div>
          </div>

          <div className="section">
            <h2>⚠️ Particularités & Nuisances</h2>
            <div className="data-grid">
              <DataItem label="Détails spécifiques au logement" value={property.property_quirks} fullWidth />
              <DataItem label="Nuisances de quartier" value={property.neighborhood_nuisances} fullWidth />
            </div>
          </div>

          <div className="section">
            <h2>📜 Familles, Règles & Taxes</h2>
            <div className="data-grid">
              <DataItem label="Équipements bébé" value={property.baby_equipment} fullWidth />
              <DataItem label="Règles de vie & Bruit" value={property.noise_rules} fullWidth />
              <DataItem label="Taxe de séjour" value={property.tourist_tax_info} fullWidth />
            </div>
          </div>

        </div>

        <div className="right-col">
          {/* STATISTIQUES RÉELLES (A 0 pour le moment) */}
          <div className="stat-card">
            <span className="stat-label">Temps gagné</span>
            <span className="stat-value">0h 00</span>
            <p style={{fontSize:'12px', margin:0, opacity:0.8}}>En attente des premiers messages...</p>
          </div>

          <div className="stat-card" style={{background: 'white', color: '#1a2a6c', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)'}}>
            <span className="stat-label" style={{color:'#64748b'}}>Échanges Clients</span>
            <span className="stat-value" style={{color:'#1a2a6c'}}>0</span>
          </div>

          <Link href={`/add-property?id=${property.id}`} passHref legacyBehavior>
            <a className="btn-edit">⚙️ Modifier les infos</a>
          </Link>
        </div>
      </main>
    </div>
  );
}
