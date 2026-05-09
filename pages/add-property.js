import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';

export default function AddProperty() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('properties').insert([{
      owner_id: user.id, // On utilise owner_id comme dans tes fichiers
      name: name,
      address: address,
      is_active: false // Créé mais pas encore activé par le paiement
    }]);

    if (!error) {
      router.push('/dashboard');
    } else {
      alert("Erreur lors de l'enregistrement.");
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <style jsx>{`
        .container { padding: 50px; max-width: 600px; margin: 0 auto; font-family: 'Inter', sans-serif; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; }
        h1 { color: #1a2a6c; font-weight: 800; font-size: 32px; margin-bottom: 10px; }
        p { color: #64748b; margin-bottom: 30px; }
        .card { background: white; padding: 40px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        label { display: block; font-weight: 700; color: #1a2a6c; margin-bottom: 8px; }
        input { width: 100%; padding: 14px; margin-bottom: 25px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 16px; box-sizing: border-box; }
        button { background: #fbbf24; color: #1a2a6c; padding: 16px; border: none; border-radius: 12px; width: 100%; font-weight: 800; font-size: 16px; cursor: pointer; transition: 0.3s; }
        button:hover { transform: translateY(-2px); box-shadow: 0 10px 15px rgba(251, 191, 36, 0.2); }
      `}</style>
      
      <h1>Configurez votre Villa</h1>
      <p>Marc a besoin de ces informations pour accueillir vos voyageurs.</p>
      
      <div className="card">
        <form onSubmit={handleSave}>
          <label>Nom de la propriété (ex: Villa Noam)</label>
          <input placeholder="Villa Noam" value={name} onChange={(e) => setName(e.target.value)} required />
          
          <label>Adresse complète</label>
          <input placeholder="44 avenue Jean Jaurès, Floirac" value={address} onChange={(e) => setAddress(e.target.value)} required />
          
          <button disabled={loading}>{loading ? 'Enregistrement...' : 'Enregistrer et continuer'}</button>
        </form>
      </div>
    </div>
  );
}
