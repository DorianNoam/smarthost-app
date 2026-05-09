import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';

export default function AddProperty() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // État complet avec TOUS les champs d'origine de Major Marc
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    residence: '',
    street_number: '',
    check_in_time: '15:00',
    check_out_time: '11:00',
    wifi_name: '',
    wifi_password: '',
    arrival_instructions: '',
    trash_instructions: '',
    parking_instructions: '',
    other_info: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();

    // On insère TOUTES les données techniques + la sécurité is_active
    const { error } = await supabase.from('properties').insert([{
      owner_id: user.id,
      ...formData,
      is_active: false // Reste inactif jusqu'au paiement
    }]);

    if (!error) {
      // Une fois enregistré, on l'envoie sur le dashboard pour l'activation
      router.push('/dashboard');
    } else {
      console.error(error);
      alert("Erreur lors de l'enregistrement. Vérifiez que la colonne is_active existe dans Supabase.");
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <style jsx>{`
        .container { padding: 40px 20px; max-width: 800px; margin: 0 auto; font-family: 'Inter', sans-serif; background: #fdfbf7; }
        h1 { color: #1a2a6c; font-weight: 800; font-size: 28px; margin-bottom: 30px; text-align: center; }
        .card { background: white; padding: 35px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .section-title { color: #d4af37; font-weight: 700; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; margin: 25px 0 15px 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .full-width { grid-column: span 2; }
        label { display: block; font-weight: 600; color: #1a2a6c; margin-bottom: 8px; font-size: 14px; }
        input, textarea { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 15px; box-sizing: border-box; background: #f8fafc; }
        textarea { height: 100px; resize: none; }
        .btn-submit { background: #1a2a6c; color: white; padding: 18px; border: none; border-radius: 14px; width: 100%; font-weight: 800; font-size: 16px; cursor: pointer; margin-top: 30px; transition: 0.3s; }
        .btn-submit:hover { background: #d4af37; transform: translateY(-2px); }
        @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } .full-width { grid-column: span 1; } }
      `}</style>
      
      <h1>Configuration de votre Villa 🎩</h1>
      
      <div className="card">
        <form onSubmit={handleSave}>
          
          <div className="section-title">Informations Générales</div>
          <div className="form-grid">
            <div className="full-width">
              <label>Nom de la Villa (ex: Villa Noam)</label>
              <input name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div>
              <label>Numéro de rue</label>
              <input name="street_number" value={formData.street_number} onChange={handleChange} required />
            </div>
            <div>
              <label>Nom de la rue / Ville</label>
              <input name="address" value={formData.address} onChange={handleChange} required />
            </div>
            <div className="full-width">
              <label>Résidence (Optionnel)</label>
              <input name="residence" value={formData.residence} onChange={handleChange} />
            </div>
          </div>

          <div className="section-title">Séjour & Accès</div>
          <div className="form-grid">
            <div>
              <label>Heure Arrivée (Check-in)</label>
              <input type="time" name="check_in_time" value={formData.check_in_time} onChange={handleChange} />
            </div>
            <div>
              <label>Heure Départ (Check-out)</label>
              <input type="time" name="check_out_time" value={formData.check_out_time} onChange={handleChange} />
            </div>
            <div className="full-width">
              <label>Instructions d'accès (Codes, clés...)</label>
              <textarea name="arrival_instructions" value={formData.arrival_instructions} onChange={handleChange} placeholder="Où se trouvent les clés ? Quel est le code du portail ?" />
            </div>
          </div>

          <div className="section-title">Connectivité & Logistique</div>
          <div className="form-grid">
            <div>
              <label>Nom du WiFi</label>
              <input name="wifi_name" value={formData.wifi_name} onChange={handleChange} />
            </div>
            <div>
              <label>Code WiFi</label>
              <input name="wifi_password" value={formData.wifi_password} onChange={handleChange} />
            </div>
            <div className="full-width">
              <label>Gestion des poubelles</label>
              <textarea name="trash_instructions" value={formData.trash_instructions} onChange={handleChange} placeholder="Quels jours sortent les poubelles ?" />
            </div>
            <div className="full-width">
              <label>Parking & autres infos</label>
              <textarea name="parking_instructions" value={formData.parking_instructions} onChange={handleChange} />
            </div>
          </div>

          <button className="btn-submit" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer et Activer Marc'}
          </button>
        </form>
      </div>
    </div>
  );
}
