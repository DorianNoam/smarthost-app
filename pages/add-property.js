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
    // Étape 1 : Identité
    name: '', address: '', street_number: '', residence_name: '', building: '', floor: '', city: '',
    // Étape 2 : Accès & Parking
    check_in_hour: '15:00', check_out_hour: '11:00', self_checkin: false, 
    entrance_type: 'Boîte à clés', key_code: '', parking_info: '', gps_link: '', checkin_instructions: '',
    // Étape 3 : Confort
    wifi_name: '', wifi_password: '', heating_cooling_info: '',
    // Étape 4 : Technique & Santé
    trash_instructions: '', breaker_box_location: '', water_shutoff_location: '', health_emergency_info: '',
    // Étape 5 : Guide Local
    recommendations: '', local_shops: '', transport_info: '',
    // Étape 6 : Départ & Avis
    checkout_instructions: '', key_return_details: '', luggage_storage_info: '', review_link: '',
    // Étape 7 : Divertissement & Appareils
    tv_manual: '', music_system: '', games_available: '', appliances_instructions: '',
    // Étape 8 : Inventaire & Linge
    consumables_location: '', pantry_basics: '', laundry_iron_info: '',
    // Étape 9 : Particularités
    property_quirks: '', neighborhood_nuisances: '',
    // Étape 10 : Familles, Règles & Taxes
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
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const saveProgress = async (isFinal = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      // On ajoute is_active: false pour bloquer l'activation tant que ce n'est pas payé
      const payload = { owner_id: user.id, ...formData, is_active: false };
      if (propertyId) payload.id = propertyId;

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
        .input-group { display: flex; flex-direction: column; gap: 5px; position: relative; }
        label { font-weight: 700; font-size: 11px; color: #64748b; text-transform: uppercase; }
        input, textarea, select { padding: 12px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 15px; background: #f8fafc; width: 100%; box-sizing: border-box; }
        input:focus, textarea:focus { border-color: #fbbf24; outline: none; background: white; }
        .actions { display: flex; flex-direction: column; gap: 10px; margin-top: 30px; }
        .btn-next { background: #1e293b; color: white; padding: 16px; border-radius: 14px; border: none; font-weight: 700; cursor: pointer; font-size: 16px; transition: 0.2s; }
        .btn-next:hover { background: #334155; }
        .btn-later { display: block; text-align: center; color: #64748b; padding: 10px; font-weight: 600; font-size: 13px; text-decoration: none; cursor: pointer; }
      `}</style>

      <div className="wizard-card">
        <div className="progress-bar"><div className="progress-fill"></div></div>

        {/* ÉTAPE 1 : Identité */}
        {step === 1 && (
          <div className="step">
            <h2>1. Identité du logement</h2>
            <div className="grid">
              <div className="input-group full"><label>Nom du logement</label><input name="name" value={formData.name} onChange={handleChange} placeholder="ex: Villa Noam" /></div>
              <div className="input-group"><label>N° de rue</label><input name="street_number" value={formData.street_number} onChange={handleChange} /></div>
              <div className="input-group"><label>Résidence</label><input name="residence_name" value={formData.residence_name} onChange={handleChange} /></div>
              <div className="input-group"><label>Bâtiment</label><input name="building" value={formData.building} onChange={handleChange} /></div>
              <div className="input-group"><label>Étage</label><input name="floor" value={formData.floor} onChange={handleChange} /></div>
              <div className="input-group full"><label>Rue</label><input name="address" value={formData.address} onChange={handleChange} placeholder="ex: Avenue Jean Jaurès" /></div>
              <div className="input-group full"><label>Ville</label><input name="city" value={formData.city} onChange={handleChange} placeholder="ex: Floirac" /></div>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 : Accès & Stationnement */}
        {step === 2 && (
          <div className="step">
            <h2>2. Accès & Stationnement</h2>
            <div className="grid">
              <div className="input-group"><label>Arrivée dès</label><input type="time" name="check_in_hour" value={formData.check_in_hour} onChange={handleChange} /></div>
              <div className="input-group"><label>Départ avant</label><input type="time" name="check_out_hour" value={formData.check_out_hour} onChange={handleChange} /></div>
              <div className="input-group full"><label>Stationnement / Parking</label><textarea name="parking_info" value={formData.parking_info} onChange={handleChange} placeholder="Places dans la rue, parking privé..." /></div>
              <div className="input-group full"><label>Lien GPS précis (Google Maps)</label><input name="gps_link" value={formData.gps_link} onChange={handleChange} placeholder="Lien vers l'entrée exacte" /></div>
              <div className="input-group full"><label>Instructions d'accès</label><textarea name="checkin_instructions" rows="3" value={formData.checkin_instructions} onChange={handleChange} placeholder="Où est la boîte à clés..." /></div>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 : Wifi & Confort */}
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

        {/* ÉTAPE 4 : Entretien & Santé */}
        {step === 4 && (
          <div className="step">
            <h2>4. Entretien & Santé</h2>
            <div className="grid">
              <div className="input-group full"><label>Poubelles & Tri</label><textarea name="trash_instructions" value={formData.trash_instructions} onChange={handleChange} /></div>
              <div className="input-group"><label>Tableau électrique</label><input name="breaker_box_location" value={formData.breaker_box_location} onChange={handleChange} /></div>
              <div className="input-group"><label>Vanne d'eau</label><input name="water_shutoff_location" value={formData.water_shutoff_location} onChange={handleChange} /></div>
              <div className="input-group full"><label>Urgence Santé (Médecin, Pharmacie)</label><textarea name="health_emergency_info" value={formData.health_emergency_info} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {/* ÉTAPE 5 : Guide Local */}
        {step === 5 && (
          <div className="step">
            <h2>5. Guide Local</h2>
            <div className="grid">
              <div className="input-group full"><label>Recommendations (Restos, Parcs)</label><textarea name="recommendations" value={formData.recommendations} onChange={handleChange} /></div>
              <div className="input-group"><label>Transports</label><input name="transport_info" value={formData.transport_info} onChange={handleChange} /></div>
              <div className="input-group"><label>Commerces</label><input name="local_shops" value={formData.local_shops} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {/* ÉTAPE 6 : Départ & Avis */}
        {step === 6 && (
          <div className="step">
            <h2>6. Départ & Avis</h2>
            <div className="grid">
              <div className="input-group full"><label>Consignes de sortie</label><textarea name="checkout_instructions" value={formData.checkout_instructions} onChange={handleChange} /></div>
              <div className="input-group"><label>Retour des clés</label><input name="key_return_details" value={formData.key_return_details} onChange={handleChange} /></div>
              <div className="input-group full"><label>Lien pour laisser un avis</label><input name="review_link" value={formData.review_link} onChange={handleChange} placeholder="Lien Airbnb/Booking..." /></div>
            </div>
          </div>
        )}

        {/* ÉTAPE 7 : Divertissement & Appareils */}
        {step === 7 && (
          <div className="step">
            <h2>7. Divertissement & Appareils</h2>
            <div className="grid">
              <div className="input-group full"><label>TV & Streaming</label><textarea name="tv_manual" value={formData.tv_manual} onChange={handleChange} /></div>
              <div className="input-group full"><label>Mode d'emploi (Four, Plaque)</label><textarea name="appliances_instructions" value={formData.appliances_instructions} onChange={handleChange} /></div>
              <div className="input-group"><label>Audio</label><input name="music_system" value={formData.music_system} onChange={handleChange} /></div>
              <div className="input-group"><label>Jeux</label><input name="games_available" value={formData.games_available} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {/* ÉTAPE 8 : Inventaire & Linge */}
        {step === 8 && (
          <div className="step">
            <h2>8. Inventaire & Linge</h2>
            <div className="grid">
              <div className="input-group full"><label>Emplacement recharges</label><textarea name="consumables_location" value={formData.consumables_location} onChange={handleChange} /></div>
              <div className="input-group"><label>Produits de base</label><input name="pantry_basics" value={formData.pantry_basics} onChange={handleChange} /></div>
              <div className="input-group"><label>Lave-linge & Fer</label><input name="laundry_iron_info" value={formData.laundry_iron_info} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {/* ÉTAPE 9 : Particularités */}
        {step === 9 && (
          <div className="step">
            <h2>9. Particularités (Quirks)</h2>
            <div className="grid">
              <div className="input-group full"><label>Détails spécifiques (Parquet, Bruits)</label><textarea name="property_quirks" value={formData.property_quirks} onChange={handleChange} /></div>
              <div className="input-group full"><label>Nuisances de quartier</label><input name="neighborhood_nuisances" value={formData.neighborhood_nuisances} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {/* ÉTAPE 10 : Familles & Règles */}
        {step === 10 && (
          <div className="step">
            <h2>10. Familles, Règles & Taxes</h2>
            <div className="grid">
              <div className="input-group full"><label>Équipements bébé</label><input name="baby_equipment" value={formData.baby_equipment} onChange={handleChange} /></div>
              <div className="input-group full"><label>Règles de vie (Bruit, Fêtes)</label><textarea name="noise_rules" value={formData.noise_rules} onChange={handleChange} /></div>
              <div className="input-group full"><label>Taxe de séjour (Montant, Paiement)</label><input name="tourist_tax_info" value={formData.tourist_tax_info} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        <div className="actions">
          <button className="btn-next" onClick={() => saveProgress(step === 10)}>
            {loading ? 'Sauvegarde...' : step === 10 ? 'Terminer & Publier' : 'Continuer'}
          </button>
          <Link href="/dashboard" className="btn-later">
            Plus tard
          </Link>
