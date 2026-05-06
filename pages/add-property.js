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
        .wizard-container { 
          min-height: 100vh; 
          background: #0f172a; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-family: 'Inter', sans-serif; 
          padding: 15px; 
        }
        
        .wizard-card { 
          background: white; 
          padding: 30px; 
          border-radius: 24px; 
          width: 100%; 
          max-width: 700px; 
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); 
        }

        .progress-bar { height: 6px; background: #e2e8f0; border-radius: 10px; margin-bottom: 25px; }
        .progress-fill { 
          height: 100%; 
          background: #fbbf24; 
          transition: 0.5s cubic-bezier(0.4, 0, 0.2, 1); 
          width: ${(step / 10) * 100}%; 
          border-radius: 10px; 
        }

        h2 { color: #1e293b; font-size: 22px; margin-bottom: 20px; font-weight: 800; }
        
        /* Grille Responsive */
        .grid { 
          display: grid; 
          grid-template-columns: repeat(2, 1fr); 
          gap: 15px; 
        }
        
        .full { grid-column: span 2; }

        .input-group { display: flex; flex-direction: column; gap: 5px; position: relative; }
        label { font-weight: 700; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        input, textarea, select { 
          padding: 12px; 
          border: 1px solid #e2e8f0; 
          border-radius: 12px; 
          font-size: 15px; 
          background: #f8fafc;
          width: 100%;
          box-sizing: border-box;
        }
        input:focus { border-color: #fbbf24; outline: none; background: white; }

        .actions { display: flex; flex-direction: column; gap: 10px; margin-top: 30px; }
        .btn-next { background: #1e293b; color: white; padding: 16px; border-radius: 14px; border: none; font-weight: 700; cursor: pointer; font-size: 16px; }
        .btn-later { color: #64748b; padding: 10px; font-weight: 600; font-size: 13px; text-align: center; border: none; background: none; cursor: pointer; }

        .suggestion-list { position: absolute; top: 100%; left: 0; right: 0; z-index: 100; background: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); border: 1px solid #e2e8f0; list-style: none; padding: 0; margin-top: 5px; max-height: 180px; overflow-y: auto; }
        .suggestion-item { padding: 12px; cursor: pointer; border-bottom: 1px solid #f1f5f9; font-size: 14px; }

        /* --- MEDIA QUERIES MOBILE --- */
        @media (max-width: 600px) {
          .wizard-container { padding: 10px; align-items: flex-start; }
          .wizard-card { padding: 20px; border-radius: 18px; }
          .grid { grid-template-columns: 1fr; } /* On passe à une seule colonne */
          .full { grid-column: span 1; }
          h2 { font-size: 19px; }
          .btn-next { padding: 14px; font-size: 15px; }
        }
      `}</style>

      <div className="wizard-card">
        <div className="progress-bar"><div className="progress-fill"></div></div>

        {step === 1 && (
          <div className="step">
            <h2>1. Identité & Adresse</h2>
            <div className="grid">
              <div className="input-group full"><label>Nom du logement</label><input name="name" value={formData.name} onChange={handleChange} placeholder="ex: Villa Dodo" /></div>
              <div className="input-group"><label>N° de rue</label><input name="street_number" value={formData.street_number} onChange={handleChange} /></div>
              <div className="input-group"><label>Résidence</label><input name="residence_name" value={formData.residence_name} onChange={handleChange} /></div>
              <div className="input-group"><label>Bâtiment</label><input name="building" value={formData.building} onChange={handleChange} /></div>
              <div className="input-group"><label>Étage</label><input name="floor" value={formData.floor} onChange={handleChange} /></div>
              <div className="input-group full">
                <label>Rue & Ville</label>
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
                        setFormData({ ...formData, address: s.properties.name || '', city: s.properties.city || '' }); 
                        setSuggestions([]); 
                      }}>{s.properties.name} {s.properties.city}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ... (Garde les autres étapes step === 2 à 10 identiques à ton code précédent) ... */}
        
        {step > 1 && step <= 10 && (
          <div className="step">
            <h2>Étape {step} de 10</h2>
            <p style={{color: '#64748b', fontSize: '14px', marginBottom: '20px'}}>
               Utilisez les champs ci-dessous pour enrichir les connaissances de Marc.
            </p>
            {/* Ici tu peux remettre tes champs pour chaque étape comme dans ton code précédent */}
            <div className="input-group full">
               <label>Information complémentaire</label>
               <textarea rows="4" placeholder="Saisissez les détails ici..." />
            </div>
          </div>
        )}

        <div className="actions">
          <button className="btn-next" onClick={() => saveProgress(step === 10)}>
            {loading ? 'Chargement...' : step === 10 ? 'Publier le logement' : 'Suivant'}
          </button>
          <button className="btn-later" onClick={() => router.push('/dashboard')}>
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
         }
         
