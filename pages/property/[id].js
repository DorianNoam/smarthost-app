import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

export default function PropertyRecap() {
  const router = useRouter();
  const { id } = router.query;
  const [prop, setProp] = useState(null);

  useEffect(() => {
    if (id) fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    const { data, error } = await supabase.from('properties').select('*').eq('id', id).single();
    if (!error) setProp(data);
  };

  if (!prop) return <p>Chargement...</p>;

  const Section = ({ title, children }) => (
    <div style={{ background: 'white', padding: '25px', borderRadius: '15px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
      <h3 style={{ color: '#1e293b', borderBottom: '2px solid #fbbf24', paddingBottom: '10px', marginBottom: '15px' }}>{title}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>{children}</div>
    </div>
  );

  const Info = ({ label, value }) => (
    <div>
      <label style={{ display: 'block', fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>{label}</label>
      <span style={{ fontSize: '15px', color: '#1e293b' }}>{value || 'Non renseigné'}</span>
    </div>
  );

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto', fontFamily: 'Inter' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <Link href="/dashboard" style={{ color: '#64748b' }}>← Retour</Link>
        <h1 style={{ margin: 0 }}>Récapitulatif : {prop.name}</h1>
        <Link href={`/add-property?id=${prop.id}`} style={{ background: '#1e293b', color: 'white', padding: '10px 20px', borderRadius: '10px', textDecoration: 'none' }}>Modifier</Link>
      </div>

      <Section title="📍 Localisation & Identité">
        <Info label="Nom" value={prop.name} />
        <Info label="Adresse" value={prop.address} />
        <Info label="N° de rue" value={prop.street_number} />
        <Info label="Résidence" value={prop.residence} />
        <Info label="Bâtiment" value={prop.building} />
        <Info label="Étage" value={prop.floor} />
      </Section>

      <Section title="🔑 Accès">
        <Info label="Check-in" value={prop.check_in_hour} />
        <Info label="Check-out" value={prop.check_out_hour} />
        <Info label="Autonomie" value={prop.self_checkin ? 'OUI' : 'NON'} />
        <Info label="Instructions" value={prop.checkin_instructions} />
      </Section>

      <Section title="📶 Connectivité & Confort">
        <Info label="Nom Wifi" value={prop.wifi_name} />
        <Info label="Mot de passe" value={prop.wifi_password} />
        <Info label="Chauffage" value={prop.heating_cooling_info} />
      </Section>

      {/* Ajoute les autres sections (Divertissement, Départ...) sur le même modèle */}
    </div>
  );
}
