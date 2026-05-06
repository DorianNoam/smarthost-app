import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

export default function AddProperty() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. On récupère l'ID de l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert("Vous devez être connecté !");
        router.push('/login');
        return;
      }

      // 2. On insère le logement dans la table 'properties'
      const { error } = await supabase
        .from('properties')
        .insert([
          { 
            name: name, 
            address: address, 
            owner_id: user.id 
          }
        ]);

      if (error) throw error;

      // 3. Succès : retour au dashboard
      router.push('/dashboard');

    } catch (error) {
      console.error("Erreur insertion:", error.message);
      alert("Erreur lors de l'ajout : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <style jsx>{`
        .container { min-height: 100vh; background: #f8f9fa; display: flex; align-items: center; justify-content: center; font-family: 'Montserrat', sans-serif; }
        .card { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); width: 100%; max-width: 500px; }
        h1 { font-family: 'Playfair Display', serif; color: #1a2a6c; margin-bottom: 10px; }
        p { color: #666; margin-bottom: 30px; font-size: 14px; }
        form { display: flex; flex-direction: column; gap: 20px; }
        .input-group { display: flex; flex-direction: column; gap: 8px; }
        label { font-weight: 600; color: #1a2a6c; font-size: 13px; }
        input { padding: 15px; border: 1px solid #eee; border-radius: 10px; outline: none; transition: 0.3s; }
        input:focus { border-color: #d4af37; }
        .btn-save { background: #d4af37; color: #1a2a6c; border: none; padding: 15px; border-radius: 50px; font-weight: 700; cursor: pointer; transition: 0.3s; margin-top: 10px; }
        .btn-save:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3); }
        .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
        .back-link { text-align: center; display: block; margin-top: 20px; color: #999; text-decoration: none; font-size: 14px; }
      `}</style>

      <div className="card">
        <h1>Nouveau Logement</h1>
        <p>Commencez par donner un nom et une adresse à votre propriété pour que Marc puisse s'y retrouver.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Nom du logement</label>
            <input 
              type="text" 
              placeholder="Ex: Villa Blue Coast" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>

          <div className="input-group">
            <label>Adresse complète</label>
            <input 
              type="text" 
              placeholder="Ex: 12 rue du Port, 33000 Bordeaux" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="btn-save" disabled={loading}>
            {loading ? 'Enregistrement en cours...' : 'Créer le logement'}
          </button>

          <Link href="/dashboard" className="back-link">
            Retour au tableau de bord
          </Link>
        </form>
      </div>
    </div>
  );
}
