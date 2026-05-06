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
    entrance_type: '', key_code: '', checkin_instructions: '', parking_info: '',
    wifi_name: '', wifi_password: '', heating_cooling_info: '', // Confort
    trash_instructions: '', breaker_box_location: '', water_shutoff_location: '', // Entretien
    noise_rules: '', pet_policy: 'Non', local_shops: '', transport_info: '', recommendations: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const saveProgress = async (isFinal = false) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = { owner_id: user.id, ...formData };
      if (propertyId) payload.id = propertyId;

      const { data, error } = await supabase
        .from('properties')
        .upsert(payload)
        .select()
        .single();

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
        .wizard-container { min-height: 100vh; background: #1a2a6c; display: flex; align-items: center; justify-content: center; font-family: 'Montserrat', sans-serif; padding: 20px; }
        .wizard-card { background: white; padding: 40px; border-radius: 30px; width: 100%; max-width: 700px; box-shadow: 0 20px 50px rgba(0,0,0,0.2); }
        .progress-bar { height: 6px; background: #eee; border-radius: 10px; margin-bottom: 30px; overflow: hidden; }
        .progress-fill { height: 100%; background: #d4af37; transition: 0.5s; width: ${(step / 5) * 100}%; }
        h2 { font-family: 'Playfair Display', serif; color: #1a2a6c; margin-bottom: 20px; font-size: 28px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .full { grid-column: span 2; }
        .input-group { margin-bottom: 15px; display: flex; flex-direction: column; gap: 5px; }
        label { font-weight: 600; font-size: 13px; color: #444; }
        input, textarea, select { padding: 12px; border: 1px solid #ddd; border-radius: 10px; font-family: inherit; }
        .actions { display: flex; justify-content: space-between; align-items: center; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; }
        .btn-next { background: #1a2a6c; color: white; padding: 15px 35px; border-radius: 50px; border: none; font-weight: 700; cursor: pointer; }
      `}</style>

      <div className="wizard-card">
        <div className="progress-bar"><div className="progress-fill"></div></div>

        {step === 1 && (
          <div className="step">
            <h2>Identité du logement</h2>
            <div className="grid">
              <div className="input-group full"><label>Nom du logement</label><input name="name" value={formData.name} onChange={handleChange} /></div>
              <div className="input-group full"><label>Adresse</label><input name="address" value={formData.address} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step">
            <h2>Accès & Logistique</h2>
            <div className="grid">
              <div className="input-group"><label>Arrivée</label><select name="entrance_type" value={formData.entrance_type} onChange={handleChange}><option>Boîte à clés</option><option>Serrure connectée</option></select></div>
              <div className="input-group"><label>Code</label><input name="key_code" value={formData.key_code} onChange={handleChange} /></div>
              <div className="input-group full"><label>Instructions</label><textarea name="checkin_instructions" value={formData.checkin_instructions} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step">
            <h2>Connectivité & Confort</h2>
            <div className="grid">
              <div className="input-group"><label>Nom Wifi</label><input name="wifi_name" value={formData.wifi_name} onChange={handleChange} /></div>
              <div className="input-group"><label>Mot de passe Wifi</label><input name="wifi_password" value={formData.wifi_password} onChange={handleChange} /></div>
              <div className="input-group full"><label>Chauffage / Clim (Instructions)</label><textarea name="heating_cooling_info" rows="2" value={formData.heating_cooling_info} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="step">
            <h2>Entretien & Technique</h2>
            <div className="grid">
              <div className="input-group full"><label>Gestion des poubelles (Jours, tris, local...)</label><textarea name="trash_instructions" rows="2" value={formData.trash_instructions} onChange={handleChange} /></div>
              <div className="input-group"><label>Tableau électrique</label><input name="breaker_box_location" value={formData.breaker_box_location} onChange={handleChange} /></div>
              <div className="input-group"><label>Vanne d'arrêt d'eau</label><input name="water_shutoff_location" value={formData.water_shutoff_location} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="step">
            <h2>Le Guide de Marc</h2>
            <div className="grid">
              <div className="input-group full"><label>Vos bonnes adresses</label><textarea name="recommendations" rows="3" value={formData.recommendations} onChange={handleChange} /></div>
              <div className="input-group"><label>Commerces</label><input name="local_shops" value={formData.local_shops} onChange={handleChange} /></div>
              <div className="input-group"><label>Transports</label><input name="transport_info" value={formData.transport_info} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        <div className="actions">
          <button className="btn-later" onClick={() => router.push('/dashboard')}>Plus tard</button>
          <button className="btn-next" onClick={() => saveProgress(step === 5)}>
            {loading ? '...' : step === 5 ? 'Terminer' : 'Suivant'}
          </button>
        </div>
      </div>
    </div>
  );
}
