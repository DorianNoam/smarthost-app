import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

export default function AddPropertyWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [propertyId, setPropertyId] = useState(null);

  const [formData, setFormData] = useState({
    name: '', address: '', 
    check_in_hour: '15:00', check_out_hour: '11:00', self_checkin: false,
    entrance_type: 'Boîte à clés', key_code: '', checkin_instructions: '',
    wifi_name: '', wifi_password: '', heating_cooling_info: '',
    trash_instructions: '', breaker_box_location: '', water_shutoff_location: '',
    recommendations: '', local_shops: '', transport_info: ''
  });

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
        .wizard-container { min-height: 100vh; background: #0f172a; display: flex; align-items: center; justify-content: center; font-family: 'Inter', sans-serif; padding: 20px; }
        .wizard-card { background: white; padding: 40px; border-radius: 24px; width: 100%; max-width: 650px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
        .progress-bar { height: 8px; background: #e2e8f0; border-radius: 10px; margin-bottom: 32px; }
        .progress-fill { height: 100%; background: #fbbf24; transition: 0.4s; width: ${(step / 5) * 100}%; border-radius: 10px; }
        h2 { color: #1e293b; font-size: 24px; margin-bottom: 24px; font-weight: 800; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .full { grid-column: span 2; }
        .input-group { margin-bottom: 20px; display: flex; flex-direction: column; gap: 6px; }
        label { font-weight: 600; font-size: 14px; color: #475569; }
        input, textarea, select { padding: 12px; border: 1px solid #cbd5e1; border-radius: 12px; font-size: 15px; }
        .checkbox-group { flex-direction: row; align-items: center; gap: 10px; cursor: pointer; }
        .actions { display: flex; flex-direction: column; gap: 12px; margin-top: 32px; }
        .btn-next { background: #1e293b; color: white; padding: 16px; border-radius: 12px; border: none; font-weight: 700; cursor: pointer; font-size: 16px; }
        .btn-later { background: #f1f5f9; color: #475569; padding: 12px; border-radius: 12px; border: none; font-weight: 600; cursor: pointer; font-size: 14px; text-align: center; }
      `}</style>

      <div className="wizard-card">
        <div className="progress-bar"><div className="progress-fill"></div></div>

        {step === 1 && (
          <div className="step">
            <h2>Identité du logement</h2>
            <div className="grid">
              <div className="input-group full"><label>Nom de la propriété</label><input name="name" value={formData.name} onChange={handleChange} placeholder="ex: Villa Cap Ferret" /></div>
              <div className="input-group full"><label>Adresse (Tapez pour rechercher...)</label><input name="address" value={formData.address} onChange={handleChange} placeholder="12 rue de la paix, Paris..." /></div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step">
            <h2>Accès & Horaires</h2>
            <div className="grid">
              <div className="input-group"><label>Arrivée dès</label><input type="time" name="check_in_hour" value={formData.check_in_hour} onChange={handleChange} /></div>
              <div className="input-group"><label>Départ avant</label><input type="time" name="check_out_hour" value={formData.check_out_hour} onChange={handleChange} /></div>
              <label className="input-group full checkbox-group">
                <input type="checkbox" name="self_checkin" checked={formData.self_checkin} onChange={handleChange} />
                <span>Ce logement permet l'arrivée en autonomie</span>
              </label>
              <div className="input-group full"><label>Instructions d'accès</label><textarea name="checkin_instructions" value={formData.checkin_instructions} onChange={handleChange} placeholder="Le code est..." /></div>
            </div>
          </div>
        )}

        {/* ... Étapes 3, 4 et 5 simplifiées pour le gain de place ... */}
        {step === 3 && (
            <div className="step">
                <h2>Connectivité</h2>
                <div className="grid">
                    <div className="input-group"><label>Nom Wifi</label><input name="wifi_name" value={formData.wifi_name} onChange={handleChange} /></div>
                    <div className="input-group"><label>Mot de passe</label><input name="wifi_password" value={formData.wifi_password} onChange={handleChange} /></div>
                </div>
            </div>
        )}

        <div className="actions">
          <button className="btn-next" onClick={() => saveProgress(step === 5)}>
            {loading ? 'Sauvegarde...' : step === 5 ? 'Terminer la configuration' : 'Continuer'}
          </button>
          <button className="btn-later" onClick={() => router.push('/dashboard')}>
            Sauvegarder et continuer plus tard
          </button>
        </div>
      </div>
    </div>
  );
}
