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

  if (!prop) return <div className="loading">Chargement du manoir...</div>;

  return (
    <div className="container">
      <style jsx>{`
        .container { min-height: 100vh; background: #0f172a; color: white; font-family: 'Inter', sans-serif; padding: 40px 20px; }
        .header { max-width: 1000px; margin: 0 auto 40px; display: flex; justify-content: space-between; align-items: center; }
        .back-link { color: #94a3b8; text-decoration: none; font-size: 14px; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
        .back-link:hover { color: white; }
        .btn-edit { background: #fbbf24; color: #0f172a; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 700; transition: 0.2s; }
        .btn-edit:hover { transform: scale(1.05); background: white; }
        
        .main-title { font-size: 32px; font-weight: 800; margin: 0; }
        .grid { max-width: 1000px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); gap: 20px; }
        
        .card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 24px; backdrop-filter: blur(10px); }
        .card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 12px; }
        .card-header span { font-size: 20px; }
        .card-header h3 { margin: 0; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; color: #fbbf24; }
        
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .info-item label { display: block; font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; }
        .info-item p { margin: 0; font-size: 15px; color: #f1f5f9; line-height: 1.5; }
        .full-width { grid-column: span 2; }
        
        .badge { background: #1e293b; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; }
        .loading { height: 100vh; display: flex; align-items: center; justify-content: center; background: #0f172a; color: white; }
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
          <div className="card-header"><span>📍</span><h3>Localisation</h3></div>
          <div className="info-grid">
            <div className="info-item full-width"><label>Adresse</label><p>{prop.address}</p></div>
            <div className="info-item"><label>N° Rue</label><p>{prop.street_number || '-'}</p></div>
            <div className="info-item"><label>Résidence</label><p>{prop.residence || '-'}</p></div>
            <div className="info-item"><label>Bâtiment</label><p>{prop.building || '-'}</p></div>
            <div className="info-item"><label>Étage</label><p>{prop.floor || '-'}</p></div>
          </div>
        </div>

        {/* SECTION 2 : ACCÈS */}
        <div className="card">
          <div className="card-header"><span>🔑</span><h3>Accès & Logistique</h3></div>
          <div className="info-grid">
            <div className="info-item"><label>Arrivée</label><p>{prop.check_in_hour}</p></div>
            <div className="info-item"><label>Départ</label><p>{prop.check_out_hour}</p></div>
            <div className="info-item"><label>Autonomie</label><p className="badge">{prop.self_checkin ? '✅ Oui' : '❌ Non'}</p></div>
            <div className="info-item full-width"><label>Instructions</label><p>{prop.checkin_instructions}</p></div>
          </div>
        </div>

        {/* SECTION 3 : WIFI & CONFORT */}
        <div className="card">
          <div className="card-header"><span>📶</span><h3>Wifi & Confort</h3></div>
          <div className="info-grid">
            <div className="info-item"><label>Nom Wifi</label><p>{prop.wifi_name}</p></div>
            <div className="info-item"><label>Mot de passe</label><p>{prop.wifi_password}</p></div>
            <div className="info-item full-width"><label>Chauffage / Clim</label><p>{prop.heating_cooling_info}</p></div>
          </div>
        </div>

        {/* SECTION 4 : DÉPART (CHECK-OUT) */}
        <div className="card">
          <div className="card-header"><span>🧹</span><h3>Départ</h3></div>
          <div className="info-grid">
            <div className="info-item full-width"><label>Consignes de sortie</label><p>{prop.checkout_instructions || 'Aucune consigne particulière'}</p></div>
            <div className="info-item"><label>Retour des clés</label><p>{prop.key_return_details}</p></div>
          </div>
        </div>

        {/* SECTION 5 : RÈGLES & ENFANTS */}
        <div className="card">
          <div className="card-header"><span>🚫</span><h3>Règles & Famille</h3></div>
          <div className="info-grid">
            <div className="info-item full-width"><label>Règles de vie</label><p>{prop.noise_rules}</p></div>
            <div className="info-item"><label>Équipement Bébé</label><p>{prop.baby_equipment || 'Aucun'}</p></div>
            <div className="info-item"><label>Animaux</label><p>{prop.pet_policy}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
