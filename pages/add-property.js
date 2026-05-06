import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

export default function AddPropertyWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [propertyId, setPropertyId] = useState(null);

  // Données du logement
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    wifi_name: '',
    wifi_password: '',
    checkin_instructions: '',
    key_code: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    // On utilise "upsert" : si le logement existe déjà (propertyId), on le met à jour.
    // Sinon, on le crée.
    const { data, error } = await supabase
      .from('properties')
      .upsert({
        id: propertyId, // sera null la première fois
        owner_id: user.id,
        ...formData
      }, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      alert("Erreur : " + error.message);
    } else {
      setPropertyId(data.id);
      if (step < 3) setStep(step + 1);
      else router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="wizard-container">
      <style jsx>{`
        .wizard-container { min-height: 100vh; background: #1a2a6c; display: flex; align-items: center; justify-content: center; font-family: 'Montserrat', sans-serif; padding: 20px; }
        .wizard-card { background: white; padding: 40px; border-radius: 30px; width: 100%; max-width: 600px; position: relative; }
        .progress-bar { height: 6px; background: #eee; border-radius: 10px; margin-bottom: 30px; overflow: hidden; }
        .progress-fill { height: 100%; background: #d4af37; transition: 0.5s; width: ${(step / 3) * 100}%; }
        h2 { font-family: 'Playfair Display', serif; color: #1a2a6c; margin-bottom: 10px; }
        .step-info { color: #d4af37; font-weight: 700; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
        .input-group { margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px; }
        input, textarea { padding: 15px; border: 1px solid #eee; border-radius: 12px; font-family: inherit; }
        .actions { display: flex; justify-content: space-between; align-items: center; margin-top: 30px; }
        .btn-next { background: #1a2a6c; color: white; padding: 15px 30px; border-radius: 50px; border: none; font-weight: 700; cursor: pointer; }
        .btn-later { color: #999; background: none; border: none; cursor: pointer; text-decoration: underline; }
      `}</style>

      <div className="wizard-card">
        <div className="progress-bar"><div className="progress-fill"></div></div>
        
        {step === 1 && (
          <div className="step">
            <div className="step-info">Étape 1 / 3 : Identité</div>
            <h2>Où se situe votre logement ?</h2>
            <div className="input-group">
              <label>Nom de la propriété</label>
              <input name="name" placeholder="Ex: Bel Appartement Vue Mer" value={formData.name} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Adresse exacte</label>
              <input name="address" placeholder="Ex: 45 Quai Richelieu, Bordeaux" value={formData.address} onChange={handleChange} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step">
            <div className="step-info">Étape 2 / 3 : Accès</div>
            <h2>Comment entrent les voyageurs ?</h2>
            <div className="input-group">
              <label>Code de la boîte à clés / Serrure</label>
              <input name="key_code" placeholder="Ex: 1234#" value={formData.key_code} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Instructions d'arrivée</label>
              <textarea name="checkin_instructions" rows="4" placeholder="Ex: 2ème étage, porte de droite..." value={formData.checkin_instructions} onChange={handleChange} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step">
            <div className="step-info">Étape 3 / 3 : Confort</div>
            <h2>Les infos indispensables</h2>
            <div className="input-group">
              <label>Nom du réseau Wifi</label>
              <input name="wifi_name" value={formData.wifi_name} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Mot de passe Wifi</label>
              <input name="wifi_password" value={formData.wifi_password} onChange={handleChange} />
            </div>
          </div>
        )}

        <div className="actions">
          <button className="btn-later" onClick={() => router.push('/dashboard')}>
            Enregistrer et continuer plus tard
          </button>
          <button className="btn-next" onClick={nextStep} disabled={loading}>
            {loading ? 'Patience...' : step === 3 ? 'Terminer' : 'Suivant'}
          </button>
        </div>
      </div>
    </div>
  );
}
