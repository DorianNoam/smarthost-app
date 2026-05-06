import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

export default function PropertyRecap() {
  const router = useRouter();
  const { id } = router.query;
  const [prop, setProp] = useState(null);

  useEffect(() => {
    if (id) fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    const { data, error } = await supabase.from('properties').select('*').eq('id', id).single();
    if (!error) setProp(data);
  };

  if (!prop) return <div className="loading">Chargement des données...</div>;

  return (
    <div className="container">
      <style jsx global>{`
        /* On tue les liens bleus/violets une bonne fois pour toutes */
        a { text-decoration: none !important; color: inherit !important; }
      `}</style>

      <style jsx>{`
        .container { min-height: 100vh; background: #f8fafc; color: #1e293b; font-family: 'Inter', sans-serif; padding: 40px 20px; }
        .header { max-width: 1000px; margin: 0 auto 40px; display: flex; justify-content: space-between; align-items: center; }
        
        .back-link { color: #64748b !important; font-size: 14px; font-weight: 600; transition: 0.2s; }
        .back-link:hover { color: #1e293b !important; }
        
        .btn-edit { background: #1e293b; color: white !important; padding: 12px 24px; border-radius: 12px; font-weight: 700; transition: 0.2s; }
        .btn-edit:hover { background: #0f172a; transform: translateY(-2px); }
        
        .main-title { font-size: 32px; font-weight: 800; color: #0f172a; }
        .grid { max-width: 1000px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); gap: 24px; }
        
        .card { background: white; border: 1px solid #e2e8f0; border-radius: 24px; padding: 30px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px; }
        .card-header span { font-size: 20px; }
        .card-header h3 { margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #fbbf24; font-weight: 800; }
        
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .info-item label { display: block; font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin-bottom: 6px; }
        .info-item p { margin: 0; font-size: 15px; color: #334155; font-weight: 500; line-height: 1.5; }
        .full-width { grid-column: span 2; }
        
        .badge { display: inline-block; background: #f1f5f9; padding: 4px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; color: #1e40af; }
        .loading { height: 100vh; display: flex; align-items: center; justify-content: center; font-family: 'Inter'; color: #64748b; }
      `}</style>

      <div className="header">
        <Link href="/dashboard" className="back-link">
          ← Retour au Dashboard
        </Link>
        <h1 className="main-title">{prop.name}</h1>
        <Link href={`/add-property?id=${prop.id}`} className="btn-edit">
          Modifier
        </Link>
      </div>

      <div className="grid">
        {/* SECTION 1 : LOCALISATION */}
        <div className="card">
          <div className="card-header"><span>📍</span><h3>Localisation & Identité</h3></div>
          <div className="info-grid">
            <div className="info-item full-width"><label>Adresse principale</label><p>{prop.address}</p></div>
            <div className="info-item"><label>N° Rue</label><p>{prop.street_number || 'Non renseigné'}</p></div>
            <div className="info-item"><label>Résidence</label><p>{prop.residence || 'Non renseigné'}</p></div>
            <div className="info-item"><label>Bâtiment</label><p>{prop.building || 'Non renseigné'}</p></div>
            <div className="info-item"><label>Étage</label><p>{prop.floor || 'Non renseigné'}</p></div>
          </div>
        </div>

        {/* SECTION 2 : ACCÈS */}
        <div className="card">
          <div className="card-header"><span>🔑</span><h3>Accès & Horaires</h3></div>
          <div className="info-grid">
            <div className="info-item"><label>Arrivée (Check-in)</label><p>{prop.check_in_hour}</p></div>
            <div className="info-item"><label>Départ (Check-out)</label><p>{prop.check_out_hour}</p></div>
            <div className="info-item"><label>Mode Autonome</label><p><span className="badge">{prop.self_checkin ? 'Activé' : 'Désactivé'}</span></p></div>
            <div className="info-item full-width"><label>Instructions d'entrée</label><p>{prop.checkin_instructions || 'Aucune instruction spécifique'}</p></div>
          </div>
        </div>

        {/* SECTION 3 : WIFI & CONFORT */}
        <div className="card">
          <div className="card-header"><span>📶</span><h3>Wifi & Confort</h3></div>
          <div className="info-grid">
            <div className="info-item"><label>Nom du réseau</label><p>{prop.wifi_name || 'Non configuré'}</p></div>
            <div className="info-item"><label>Mot de passe</label><p>{prop.wifi_password || 'Non configuré'}</p></div>
            <div className="info-item full-width"><label>Chauffage / Clim</label><p>{prop.heating_cooling_info || 'Non renseigné'}</p></div>
          </div>
        </div>

        {/* SECTION 4 : DÉPART */}
        <div className="card">
          <div className="card-header"><span>🧹</span><h3>Consignes de départ</h3></div>
          <div className="info-grid">
            <div className="info-item full-width"><label>Procédure de sortie</label><p>{prop.checkout_instructions || 'Laisser le logement en l\'état'}</p></div>
            <div className="info-item full-width"><label>Gestion des clés</label><p>{prop.key_return_details || 'À préciser'}</p></div>
          </div>
        </div>

        {/* SECTION 5 : RÈGLES */}
        <div className="card">
          <div className="card-header"><span>🚫</span><h3>Règles de vie</h3></div>
          <div className="info-grid">
            <div className="info-item full-width"><label>Règlement intérieur</label><p>{prop.noise_rules || 'Pas de bruit après 22h, interdiction de fumer'}</p></div>
            <div className="info-item"><label>Animaux</label><p>{prop.pet_policy}</p></div>
            <div className="info-item"><label>Équipement bébé</label><p>{prop.baby_equipment || 'Aucun'}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
