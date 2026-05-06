import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

export default function AddPropertyWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [propertyId, setPropertyId] = useState(null);

  const [formData, setFormData] = useState({
    name: '', address: '', // Étape 1
    entrance_type: '', key_code: '', checkin_instructions: '', parking_info: '', // Étape 2
    wifi_name: '', wifi_password: '', trash_instructions: '', heating_cooling_info: '', // Étape 3
    breaker_box_location: '', water_shutoff_location: '', noise_rules: '', pet_policy: '', // Étape 4
    local_shops: '', transport_info: '', recommendations: '' // Étape 5
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const saveProgress = async (isFinal = false) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('properties')
        .upsert({
          id: propertyId, // Null au début, puis utilisé pour les mises à jour
          owner_id: user.id,
          ...formData
        })
        .select()
        .single();

      if (error) throw error;
      
      setPropertyId(data.id);
      if (isFinal) {
        router.push('/dashboard');
      } else if (step < 5) {
        setStep(step + 1);
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
        .wizard-container { min-height: 100vh; background: #1a2a6c; display: flex; align-items: center; justify-content: center; font-family: 'Montserrat', sans-serif; padding: 20px; }
        .wizard-card { background: white; padding: 40px; border-radius: 30px; width: 100%; max-width: 700px; box-shadow: 0 20px 50px rgba(0,0,0,0.2); }
        .progress-bar { height: 6px; background: #eee; border-radius: 10px; margin-bottom: 30px; overflow: hidden; }
        .progress-fill { height: 100%; background: #d4af37; transition: 0.5s; width: ${(step / 5) * 100}%; }
        h2 { font-family: 'Playfair Display', serif; color: #1a2a6c; margin-bottom: 20px; font-size: 28px; }
        .step-label { color: #d4af37; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .full { grid-column: span 2; }
        .input-group { margin-bottom: 15px; display: flex; flex-direction: column; gap: 5px; }
        label { font-weight: 600; font-size: 13px; color: #444; }
        input, textarea, select { padding: 12px; border: 1px solid #ddd; border-radius: 10px; font-family: inherit; font-size: 14px; }
        .actions { display: flex; justify-content: space-between; align-items: center; margin-top: 40px; border-top: 1px solid #eee; pt: 20px; }
        .btn-next { background: #1a2a6c; color: white; padding: 15px 35px; border-radius: 50px; border: none; font-weight: 700; cursor: pointer; transition: 0.3s; }
        .btn-next:hover { background: #d4af37; color: #1a2a6c; }
        .btn-later { color: #999; background: none; border: none; cursor: pointer; text-decoration: underline; font-size: 14px; }
      `}</style>

      <div className="wizard-card">
        <div className="step-label">Étape {step} sur 5</div>
        <div className="progress-bar"><div className="progress-fill"></div></div>

        {/* ÉTAPE 1 : IDENTITÉ */}
        {step === 1 && (
          <div className="step">
            <h2>Présentons votre logement</h2>
            <div className="grid">
              <div className="input-group full">
                <label>Nom de la propriété (pour vous et Marc)</label>
                <input name="name" placeholder="Ex: Loft Industriel Chartrons" value={formData.name} onChange={handleChange} />
              </div>
              <div className="input-group full">
                <label>Adresse exacte</label>
                <input name="address" placeholder="Ex: 15 rue des Bahutiers, Bordeaux" value={formData.address} onChange={handleChange} />
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 : ACCÈS ET LOGISTIQUE */}
        {step === 2 && (
          <div className="step">
            <h2>Logistique & Accès</h2>
            <div className="grid">
              <div className="input-group">
                <label>Type d'entrée</label>
                <select name="entrance_type" value={formData.entrance_type} onChange={handleChange}>
                  <option value="">Sélectionner...</option>
                  <option value="Boîte à clés">Boîte à clés</option>
                  <option value="Serrure connectée">Serrure connectée</option>
                  <option value="Accueil physique">Accueil physique</option>
                </select>
              </div>
              <div className="input-group">
                <label>Code d'accès (si applicable)</label>
                <input name="key_code" placeholder="Ex: 1234#" value={formData.key_code} onChange={handleChange} />
              </div>
              <div className="input-group full">
                <label>Instructions précises d'arrivée</label>
                <textarea name="checkin_instructions" rows="3" placeholder="Étage, fond du couloir, porte B..." value={formData.checkin_instructions} onChange={handleChange} />
              </div>
              <div className="input-group full">
                <label>Infos Parking</label>
                <input name="parking_info" placeholder="Place n°4 ou parking public 'Cité du Vin' à 200m" value={formData.parking_info} onChange={handleChange} />
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 : VIE QUOTIDIENNE */}
        {step === 3 && (
          <div className="step">
            <h2>Le Manuel de la Maison</h2>
            <div className="grid">
              <div className="input-group">
                <label>Nom du Wifi</label>
                <input name="wifi_name" value={formData.wifi_name} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>Mot de passe Wifi</label>
                <input name="wifi_password" value={formData.wifi_password} onChange={handleChange} />
              </div>
              <div className="input-group full">
                <label>Gestion des poubelles</label>
                <input name="trash_instructions" placeholder="Local poubelle au RDC, bacs verts le mardi" value={formData.trash_instructions} onChange={handleChange} />
              </div>
              <div className="input-group full">
                <label>Chauffage / Clim</label>
                <input name="heating_cooling_info" placeholder="Thermostat dans le salon, limité à 21°C" value={formData.heating_cooling_info} onChange={handleChange} />
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 4 : SÉCURITÉ & RÈGLES */}
        {step === 4 && (
          <div className="step">
            <h2>Sécurité & Savoir-vivre</h2>
            <div className="grid">
              <div className="input-group">
                <label>Tableau électrique</label>
                <input name="breaker_box_location" placeholder="Dans le placard de l'entrée" value={formData.breaker_box_location} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>Vanne d'arrêt d'eau</label>
                <input name="water_shutoff_location" placeholder="Sous l'évier de la cuisine" value={formData.water_shutoff_location} onChange={handleChange} />
              </div>
              <div className="input-group full">
                <label>Règles sur le bruit</label>
                <input name="noise_rules" placeholder="Pas de musique forte après 22h" value={formData.noise_rules} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>Animaux autorisés ?</label>
                <select name="pet_policy" value={formData.pet_policy} onChange={handleChange}>
                  <option value="Non">Non</option>
                  <option value="Oui">Oui</option>
                  <option value="Sur demande">Sur demande</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 5 : GUIDE LOCAL */}
        {step === 5 && (
          <div className="step">
            <h2>Les conseils de Marc</h2>
            <div className="grid">
              <div className="input-group full">
                <label>Commerces de proximité</label>
                <input name="local_shops" placeholder="Boulangerie 'Le Pain Fou' à 2min" value={formData.local_shops} onChange={handleChange} />
              </div>
              <div className="input-group full">
                <label>Transports</label>
                <input name="transport_info" placeholder="Tram B arrêt 'Victoire' à 5min" value={formData.transport_info} onChange={handleChange} />
              </div>
              <div className="input-group full">
                <label>Vos pépites (Restos, bars...)</label>
                <textarea name="recommendations" rows="4" placeholder="Le meilleur brunch est chez..." value={formData.recommendations} onChange={handleChange} />
              </div>
            </div>
          </div>
        )}

        <div className="actions">
          <button className="btn-later" onClick={() => router.push('/dashboard')}>
            Finir plus tard
          </button>
          <button className="btn-next" onClick={() => saveProgress(step === 5)} disabled={loading}>
            {loading ? 'Sauvegarde...' : step === 5 ? 'Terminer & Voir mon Dashboard' : 'Suivant'}
          </button>
        </div>
      </div>
    </div>
  );
}
