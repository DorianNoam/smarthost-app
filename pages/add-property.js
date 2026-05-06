import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

export default function AddPropertyWizard() {
  const router = useRouter();
  const { id } = router.query;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [propertyId, setPropertyId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const [formData, setFormData] = useState({
    // 1. Identité & Localisation
    name: '', address: '', street_number: '', residence_name: '', building: '', floor: '', city: '',
    // 2. Accès
    check_in_hour: '15:00', check_out_hour: '11:00', self_checkin: false, entrance_type: 'Boîte à clés', key_code: '', checkin_instructions: '',
    // 3. Confort
    wifi_name: '', wifi_password: '', heating_cooling_info: '',
    // 4. Technique
    trash_instructions: '', breaker_box_location: '', water_shutoff_location: '',
    // 5. Guide
    recommendations: '', local_shops: '', transport_info: '',
    // 6. Checkout
    checkout_instructions: '', key_return_details: '', luggage_storage_info: '',
    // 7. Divertissement
    tv_manual: '', music_system: '', games_available: '',
    // 8. Inventaire
    consumables_location: '', pantry_basics: '',
    // 9. Quirks
    property_quirks: '', neighborhood_nuisances: '',
    // 10. Enfants & Règles
    baby_equipment: '', noise_rules: '', pet_policy: 'Non'
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
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const saveProgress = async (isFinal = false) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = { owner_id: user.id, ...formData };
      if (propertyId) payload.id = propertyId;

      const { data, error } = await supabase.from('properties').upsert(payload).select().single();
      if (error) throw error;
      setPropertyId(data.id);

      if (isFinal) router.push('/dashboard');
      else setStep(step + 1);
    } catch (error) {
      alert("Erreur de sauvegarde : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wizard-container">
      <style jsx>{`
        .wizard-container { min-height: 100vh; background: #0f172a; display: flex; align-items: center; justify-content: center; font-family: 'Inter', sans-serif; padding: 20px; }
        .wizard-card { background: white; padding: 40px; border-radius: 24px; width: 100%; max-width: 650px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
        .progress-bar { height: 8px; background: #e2e8f0; border-radius: 10px; margin-bottom: 32px; position: relative; }
        .progress-fill { height: 100%; background: #fbbf24; transition: 0.4s; width: ${(step / 10) * 100}%; border-radius: 10px; }
        h2 { color: #1e293b; font-size: 24px; margin-bottom: 8px; font-weight: 800; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .full { grid-column: span 2; }
        .input-group { margin-bottom: 20px; display: flex; flex-direction: column; gap: 6px; position: relative; }
        label { font-weight: 600; font-size: 13px; color: #475569; text-transform: uppercase; }
        input, textarea, select { padding: 12px; border: 1px solid #cbd5e1; border-radius: 12px; font-size: 15px; outline: none; }
        input:focus { border-color: #fbbf24; }
        .actions { display: flex; flex-direction: column; gap: 12px; margin-top: 32px; }
        .btn-next { background: #1e293b; color: white; padding: 16px; border-radius: 14px; border: none; font-weight: 700; cursor: pointer; font-size: 16px; }
        .btn-later { background: #f1f5f9; color: #475569; padding: 14px; border-radius: 14px; border: none; font-weight: 600; cursor: pointer; font-size: 14px; text-align: center; }
        .suggestion-list { position: absolute; top: 100%; left: 0; right: 0; z-index: 100; background: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); border: 1px solid #e2e8f0; list-style: none; padding: 0; margin-top: 8px; max-height: 200px; overflow-y: auto; }
        .suggestion-item { padding: 12px 16px; cursor: pointer; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #1e293b; }
        .suggestion-item:hover { background: #f8fafc; color: #fbbf24; }
      `}</style>

      <div className="wizard-card">
        <div className="progress-bar"><div className="progress-fill"></div></div>

        {step === 1 && (
          <div className="step">
            <h2>1. Identité du logement</h2>
            <div className="grid">
              <div className="input-group full"><label>Nom du logement</label><input name="name" value={formData.name} onChange={handleChange} placeholder="ex: Villa Cap Ferret" /></div>
              <div className="input-group"><label>N° de rue</label><input name="street_number" value={formData.street_number} onChange={handleChange} /></div>
              <div className="input-group"><label>Nom de la Résidence</label><input name="residence_name" value={formData.residence_name} onChange={handleChange} /></div>
              <div className="input-group"><label>Bâtiment</label><input name="building" value={formData.building} onChange={handleChange} /></div>
              <div className="input-group"><label>Étage</label><input name="floor" value={formData.floor} onChange={handleChange} /></div>
              <div className="input-group full">
                <label>Rue & Ville (Recherche auto)</label>
                <input name="address" autoComplete="off" value={formData.address} onChange={(e) => {
                    handleChange(e);
                    if (e.target.value.length > 3) {
                      fetch(`https://photon.komoot.io/api/?q=${e.target.value}&limit=5`).then(res => res.json()).then(data => setSuggestions(data.features));
                    }
                  }} 
                />
                {suggestions.length > 0 && (
                  <ul className="suggestion-list">
                    {suggestions.map((s, i) => (
                      <li key={i} className="suggestion-item" onClick={() => { 
                        setFormData({
                          ...formData, 
                          address: (s.properties.name || '') + (s.properties.street ? ' ' + s.properties.street : ''),
                          city: s.properties.city || '' 
                        }); 
                        setSuggestions([]); 
                      }}>
                        {s.properties.name} {s.properties.city}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step">
            <h2>2. Accès & Logistique</h2>
            <div className="grid">
              <div className="input-group"><label>Check-in dès</label><input type="time" name="check_in_hour" value={formData.check_in_hour} onChange={handleChange} /></div>
              <div className="input-group"><label>Check-out avant</label><input type="time" name="check_out_hour" value={formData.check_out_hour} onChange={handleChange} /></div>
              <div className="input-group full" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '15px', borderRadius: '12px' }}>
                <input type="checkbox" name="self_checkin" checked={formData.self_checkin} onChange={handleChange} style={{ width: '20px', height: '20px' }} />
                <label style={{ margin: 0 }}>Arrivée en autonomie autorisée</label>
              </div>
              <div className="input-group full"><label>Instructions d'entrée</label><textarea name="checkin_instructions" rows="4" value={formData.checkin_instructions} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step">
            <h2>3. Wifi & Confort</h2>
            <div className="grid">
              <div className="input-group"><label>Nom du Wifi</label><input name="wifi_name" value={formData.wifi_name} onChange={handleChange} /></div>
              <div className="input-group"><label>Mot de passe</label><input name="wifi_password" value={formData.wifi_password} onChange={handleChange} /></div>
              <div className="input-group full"><label>Chauffage / Clim</label><textarea name="heating_cooling_info" value={formData.heating_cooling_info} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="step">
            <h2>4. Entretien & Technique</h2>
            <div className="grid">
              <div className="input-group full"><label>Poubelles & Tri</label><textarea name="trash_instructions" value={formData.trash_instructions} onChange={handleChange} /></div>
              <div className="input-group"><label>Tableau électrique</label><input name="breaker_box_location" value={formData.breaker_box_location} onChange={handleChange} /></div>
              <div className="input-group"><label>Vanne d'eau</label><input name="water_shutoff_location" value={formData.water_shutoff_location} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="step">
            <h2>5. Guide Local</h2>
            <div className="grid">
              <div className="input-group full"><label>Recommendations</label><textarea name="recommendations" value={formData.recommendations} onChange={handleChange} /></div>
              <div className="input-group"><label>Transports</label><input name="transport_info" value={formData.transport_info} onChange={handleChange} /></div>
              <div className="input-group"><label>Commerces</label><input name="local_shops" value={formData.local_shops} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="step">
            <h2>6. Le Départ</h2>
            <div className="grid">
              <div className="input-group full"><label>Consignes de sortie</label><textarea name="checkout_instructions" value={formData.checkout_instructions} onChange={handleChange} /></div>
              <div className="input-group full"><label>Retour des clés</label><input name="key_return_details" value={formData.key_return_details} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="step">
            <h2>7. Divertissement</h2>
            <div className="grid">
              <div className="input-group full"><label>TV & Streaming</label><textarea name="tv_manual" value={formData.tv_manual} onChange={handleChange} /></div>
              <div className="input-group"><label>Audio</label><input name="music_system" value={formData.music_system} onChange={handleChange} /></div>
              <div className="input-group"><label>Jeux</label><input name="games_available" value={formData.games_available} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {step === 8 && (
          <div className="step">
            <h2>8. Inventaire</h2>
            <div className="grid">
              <div className="input-group full"><label>Emplacement recharges</label><textarea name="consumables_location" value={formData.consumables_location} onChange={handleChange} /></div>
              <div className="input-group full"><label>Produits de base</label><input name="pantry_basics" value={formData.pantry_basics} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {step === 9 && (
          <div className="step">
            <h2>9. Particularités (Quirks)</h2>
            <div className="grid">
              <div className="input-group full"><label>Détails spécifiques</label><textarea name="property_quirks" value={formData.property_quirks} onChange={handleChange} /></div>
              <div className="input-group full"><label>Nuisances sonores</label><input name="neighborhood_nuisances" value={formData.neighborhood_nuisances} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {step === 10 && (
          <div className="step">
            <h2>10. Familles & Règles</h2>
            <div className="grid">
              <div className="input-group full"><label>Équipements bébé</label><input name="baby_equipment" value={formData.baby_equipment} onChange={handleChange} /></div>
              <div className="input-group full"><label>Règles de vie</label><textarea name="noise_rules" value={formData.noise_rules} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        <div className="actions">
          <button className="btn-next" onClick={() => saveProgress(step === 10)}>
            {loading ? 'Sauvegarde...' : step === 10 ? 'Terminer & Publier' : 'Continuer'}
          </button>
          <button className="btn-later" onClick={() => router.push('/dashboard')}>
            Sauvegarder et quitter
          </button>
        </div>
      </div>
    </div>
  );
    }
    
