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
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('properties')
        .insert([{ name, address, owner_id: user.id }]);

      if (error) throw error;
      router.push('/dashboard');
    } catch (error) {
      alert("Erreur : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Ajouter un logement</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="text" 
          placeholder="Nom (ex: Villa Jade)" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
          style={{ padding: '10px' }}
        />
        <input 
          type="text" 
          placeholder="Adresse" 
          value={address} 
          onChange={(e) => setAddress(e.target.value)} 
          required 
          style={{ padding: '10px' }}
        />
        <button type="submit" disabled={loading} style={{ background: '#d4af37', border: 'none', padding: '15px', cursor: 'pointer' }}>
          {loading ? 'Création...' : 'Enregistrer le logement'}
        </button>
        <Link href="/dashboard">Annuler</Link>
      </form>
    </div>
  );
}
