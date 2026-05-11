import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

export default function AddPropertyWizard() {
  const router = useRouter();
  const { id } = router.query;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [propertyId, setPropertyId] = useState(null);

  const [formData, setFormData] = useState({
    name: '', street_number: '', address: '', floor: '', building: '', address_complement: '', city: '',
    check_in_hour: '15:00', check_out_hour: '11:00', 
    self_checkin: false, // Arrivée autonome ?
    entrance_type: 'Boîte à clés', 
    key_code: '', 
    parking_info: '', gps_link: '', checkin_instructions: '',
    wifi_name: '', wifi_password: '', heating_cooling_info: '',
    trash_instructions: '', breaker_box_location: '', water_shutoff_location: '', health_emergency_info: '',
    recommendations: '', local_shops: '', transport_info: '',
    checkout_instructions: '', key_return_details: '', luggage_storage_info: '', review_link: '',
    tv_manual: '', music_system: '', games_available: '', appliances_instructions: '',
    consumables_location: '', pantry_basics: '', laundry_iron_info: '',
    property_quirks: '', neighborhood_nuisances: '',
    baby_equipment: '', noise_rules: '', pet_policy: 'Non', tourist_tax_info: ''
  });

  useEffect(() => {
    if (id) {
      setPropertyId(id);
      fetchPropertyData(id);
    }
  }, [id]);

  const fetchPropertyData = async (propId) => {
    const { data, error } = await supabase.from('properties').select('*').eq('id', propId).single();
    if (!error && data) setFormData(data);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;

    // Blocage des lettres pour le numéro de rue et le code clé
    if (name === 'street_number' || name === 'key_code') {
      finalValue = value.replace(/\D/g, ''); 
    }

    setFormData({ ...formData, [name]: finalValue });
  };

  const nextStep = () => {
    saveProgress(false);
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  const saveProgress = async (isFinal = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = { owner_id: user.id, ...formData };
      
      if (propertyId) {
        payload.id = propertyId;
      } else {
        payload.is_active = false;
      }

      const { data, error } = await supabase.from('properties').upsert(payload).select().single();
      if (error) throw error;
      setPropertyId(data.id);

      if (isFinal) {
        router.push('/dashboard');
      } else {
        setStep(step + 1);
        window.scrollTo(0, 0);
      }
    } catch (error) {
      alert("Erreur de sauvegarde : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wizard-container">
      <style jsx>{`
        .wizard-container { min-height: 100vh; background: #0f172a; display: flex; align-items: center; justify-content: center; font-family: 'Inter', sans-serif; padding: 15px; }
        .wizard-card { background: white; padding: 30px; border-radius: 24px; width: 100%; max-width: 700px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
        .progress-bar { height: 6px; background: #e2e8f0; border-radius: 10px; margin-bottom: 25px; }
        .progress-fill { height: 100%; background: #fbbf24; transition: 0.5s; width: ${(step / 10) * 100}%; border-radius: 10px; }
        h2 { color: #1e293b; font-size: 22px; margin-bottom: 20px; font-weight: 800; }
        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
        .full { grid-column: span 2; }
        label { font-weight: 700; font-size: 11px; color: #64748b; text-transform: uppercase; margin-bottom: 5px; display: block; }
        input, textarea, select { padding: 12px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 15px; background: #f8fafc; width: 100%; box-sizing: border-box; outline: none; transition: 0.2s; }
        input:focus, select:focus, textarea:focus { border-color: #fbbf24; background: white; }
        
        /* Boutons de navigation */
        .actions { display: flex; gap: 10px; margin-top: 30px; }
        .btn-next { flex: 2; background: #1e293b; color: white; padding: 16px; border-radius: 14px; border: none; font-weight: 700; cursor: pointer; font-size: 16px; transition: 0.2s; }
        .btn-next:hover { background: #fbbf24; color: #1e293b; }
        .btn-prev { flex: 1; background: #f1f5f9; color: #64748b; padding: 16px; border-radius: 14px; border: none; font-weight: 700; cursor: pointer; font-size: 16px; transition: 0.2s; }
        .btn-prev:hover { background: #e2e8f0; color: #1e293b; }
        
        .btn-later { display: block; text-align: center; color: #64748b; padding: 15px; font-weight: 600; font-size: 13px; text-decoration: none; cursor: pointer; width: 100%; margin-top: 10px;}
        
        .checkbox-group { display: flex; align-items: center; gap: 10px; background: #fffbeb; padding: 15px; border-radius: 12px; border: 1px solid #fef3c7; }
        .checkbox-group input { width: auto; }
      `}</style>

      <div className="wizard-card">
        <div className="progress-bar"><div className="progress-fill"></div></div>

        {/* --- ÉTAPE 1 : IDENTITÉ --- */}
        {step === 1 && (
          <div className="step">
            <h2>1. Identité du logement</h2>
            <div className="grid">
              <div className="input-group full">
                <label>Nom du projet (ex: Villa Noam)</label>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Le nom que verra Marc" />
              </div>
              <div className="input-group">
                <label>Numéro de rue</label>
                <input name="street_number" value={formData.street_number} onChange={handleChange} inputMode="numeric" />
              </div>
              <div className="input-group">
                <label>Nom de la voie</label>
                <input name="address" value={formData.address} onChange={handleChange} placeholder="Avenue, Rue..." />
              </div>
              <div className="input-group full">
                <label>Ville</label>
                <input name="city" value={formData.city} onChange={handleChange} />
              </div>
            </div>
          </div>
        )}

        {/* --- ÉTAPE 2 : ACCÈS (MODIFIÉE) --- */}
        {step === 2 && (
          <div className="step">
            <h2>2. Accès & Arrivée Autonome</h2>
            <div className="grid">
              <div className="input-group"><label>Arrivée dès</label><input type="time" name="check_in_hour" value={formData.check_in_hour} onChange={handleChange} /></div>
              <div className="input-group"><label>Départ avant</label><input type="time" name="check_out_hour" value={formData.check_out_hour} onChange={handleChange} /></div>
              
              <div className="input-group full">
                <div className="checkbox-group">
                  <input type="checkbox" name="self_checkin" id="self_checkin" checked={formData.self_checkin} onChange={handleChange} />
                  <label htmlFor="self_checkin" style={{margin:0}}>Les voyageurs peuvent arriver en autonomie</label>
                </div>
              </div>

              {formData.self_checkin && (
                <>
                  <div className="input-group">
                    <label>Type d'accès autonome</label>
                    <select name="entrance_type" value={formData.entrance_type} onChange={handleChange}>
                      <option value="Boîte à clés">Boîte à clés</option>
                      <option value="Serrure Connectée">Serrure Connectée</option>
                      <option value="Digicode Porte">Digicode Porte</option>
                      <option value="Gardien / Relais">Gardien / Relais</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Code d'accès (chiffres uniquement)</label>
                    <input name="key_code" value={formData.key_code} onChange={handleChange} inputMode="numeric" placeholder="Ex: 1234" />
                  </div>
                </>
              )}

              <div className="input-group full"><label>Parking & Stationnement</label><textarea name="parking_info" value={formData.parking_info} onChange={handleChange} placeholder="Où se garer gratuitement ou payant ?" /></div>
              <div className="input-group full"><label>Instructions précises d'accès</label><textarea name="checkin_instructions" value={formData.checkin_instructions} onChange={handleChange} placeholder="Ex: La boîte se trouve derrière le pot de fleur à gauche..." /></div>
            </div>
          </div>
        )}

        {/* ... Étapes 3 à 10 (Restent inchangées) ... */}
        {step >= 3 && step <= 10 && (
          <div className="step">
            {/* Ici se trouve le contenu des autres étapes que nous avons déjà vu ensemble */}
            {/* Je ne les réécris pas toutes pour la lisibilité, mais garde ton code actuel */}
            <h2>{step}. {step === 3 ? "Wifi & Confort" : step === 4 ? "Entretien & Sécurité" : "Détails du logement"}</h2>
            <p style={{color: '#64748b'}}>Étape en cours de configuration...</p>
          </div>
        )}

        <div className="actions">
          {step > 1 && (
            <button className="btn-prev" onClick={prevStep}>Retour</button>
          )}
          <button className="btn-next" onClick={() => saveProgress(step === 10)}>
            {loading ? 'Sauvegarde...' : step === 10 ? 'Terminer & Publier' : 'Continuer'}
          </button>
        </div>
        
        <Link href="/dashboard" legacyBehavior><a className="btn-later">Enregistrer et quitter</a></Link>
      </div>
    </div>
  );
}
