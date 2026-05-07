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
    name: '', address: '', street_number: '', residence_name: '', building: '', floor: '', city: '',
    check_in_hour: '15:00', check_out_hour: '11:00', self_checkin: false, entrance_type: 'Boîte à clés', key_code: '', checkin_instructions: '',
    wifi_name: '', wifi_password: '', heating_cooling_info: '',
    trash_instructions: '', breaker_box_location: '', water_shutoff_location: '',
    recommendations: '', local_shops: '', transport_info: '',
    checkout_instructions: '', key_return_details: '', luggage_storage_info: '',
    tv_manual: '', music_system: '', games_available: '',
    consumables_location: '', pantry_basics: '',
    property_quirks: '', neighborhood_nuisances: '',
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
      alert("Erreur : " + error.message);
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
        .input-group { display: flex; flex-direction: column; gap: 5px; position: relative; }
        label { font-weight: 700; font-size: 11px; color: #64748b; text-transform: uppercase; }
        input, textarea, select { padding: 12px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 15px; background: #f8fafc; width: 100%; box-sizing: border-box; }
        input:focus, textarea:focus { border-color: #fbbf24; outline: none; background: white; }
        .actions { display: flex; flex-direction: column; gap: 10px; margin-top: 30px; }
        .btn-next { background: #1e293b; color: white; padding: 16px; border-radius: 14px; border: none; font-weight: 700; cursor: pointer; font-size: 16px; }
        .btn-later { color: #64748b; padding: 10px; font-weight: 600; font-size: 13px; text-align: center; border: none; background: none; cursor: pointer; }
        .suggestion-list { position: absolute; top: 100%; left: 0; right: 0; z-index: 100; background: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); border: 1px solid #e2e8f0; list-style: none; padding: 0; margin-top: 5px; max-height: 180px; overflow-y: auto; }
        .suggestion-item { padding: 12px; cursor: pointer; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
        @media (max-width: 600px) {
          .wizard-container { padding: 10px; align-items: flex-start; }
          .wizard-card { padding: 20px; border-radius: 18px; }
          .grid { grid-template-columns: 1fr; }
          .full { grid-column: span 1; }
          h2 { font-size: 19px; }
        }
      `}</style>

      <div className="wizard-card">
        <div className="progress-bar"><div className="progress-fill"></div></div>

        {/* ÉTAPE 1 - MISE À JOUR ICI */}
        {step === 1 && (
          <div className="step">
            <h2>1. Identité du logement</h2>
            <div className="grid">
              <div className="input-group full"><label>Nom du logement</label><input name="name" value={formData.name} onChange={handleChange} placeholder="ex: Villa Cap Ferret" /></div>
              <div className="input-group"><label>N° de rue</label><input name="street_number" value={formData.street_number} onChange={handleChange} /></div>
              <div className="input-group"><label>Résidence</label><input name="residence_name" value={formData.residence_name} onChange={handleChange} /></div>
              <div className="input-group"><label>Bâtiment</label><input name="building" value={formData.building} onChange={handleChange} /></div>
              <div className="input-group"><label>Étage</label><input name="floor" value={formData.floor} onChange={handleChange} /></div>
              
              {/* CASE RUE AVEC AUTO-SUGGESTION */}
              <div className="input-group full">
                <label>Rue (Saisissez pour chercher)</label>
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
                      }}>{s.properties.name} {s.properties.city}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* CASE VILLE DÉDIÉE */}
              <div className="input-group full">
                <label>Ville</label>
                <input name="city" value={formData.city} onChange={handleChange} placeholder="ex: Bordeaux" />
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 */}
        {step === 2 && (
          <div className="step">
            <h2>2. Accès & Logistique</h2>
            <div className="grid">
              <div className="input-group"><label>Arrivée dès</label><input type="time" name="check_in_hour" value={formData.check_in_hour} onChange={handleChange} /></div>
              <div className="input-group"><label>Départ avant</label><input type="time" name="check_out_hour" value={formData.check_out_hour} onChange={handleChange} /></div>
              <div className="input-group full" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '12px' }}>
                <input type="checkbox" name="self_checkin" checked={formData.self_checkin} onChange={handleChange} style={{ width: '20px' }} />
                <label style={{ margin: 0, textTransform: 'none' }}>Arrivée en autonomie autorisée</label>
              </div>
              <div className="input-group full"><label>Instructions détaillées</label><textarea name="checkin_instructions" rows="4" value={formData.checkin_instructions} onChange={handleChange} placeholder="Où sont les clés, quel code..." /></div>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 */}
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

        {/* ÉTAPE 4 */}
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

        {/* ÉTAPE 5 */}
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

        {/* ÉTAPE 6 */}
        {step === 6 && (
          <div className="step">
            <h2>6. Le Départ (Check-out)</h2>
            <div className="grid">
              <div className="input-group full"><label>Consignes de sortie</label><textarea name="checkout_instructions" value={formData.checkout_instructions} onChange={handleChange} /></div>
              <div className="input-group full"><label>Retour des clés</label><input name="key_return_details" value={formData.key_return_details} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {/* ÉTAPE 7 */}
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

        {/* ÉTAPE 8 */}
        {step === 8 && (
          <div className="step">
            <h2>8. Inventaire</h2>
            <div className="grid">
              <div className="input-group full"><label>Emplacement recharges</label><textarea name="consumables_location" value={formData.consumables_location} onChange={handleChange} /></div>
              <div className="input-group full"><label>Produits de base</label><input name="pantry_basics" value={formData.pantry_basics} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {/* ÉTAPE 9 */}
        {step === 9 && (
          <div className="step">
            <h2>9. Particularités (Quirks)</h2>
            <div className="grid">
              <div className="input-group full"><label>Détails spécifiques</label><textarea name="property_quirks" value={formData.property_quirks} onChange={handleChange} /></div>
              <div className="input-group full"><label>Nuisances sonores</label><input name="neighborhood_nuisances" value={formData.neighborhood_nuisances} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {/* ÉTAPE 10 */}
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
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}
