// pages/edit-property.js
// Page de modification d'un logement avec chargement/sauvegarde Supabase et sélecteur de pays

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import Head from 'next/head';
import { COUNTRIES, getAddressFormat } from '../lib/countries';

export default function EditProperty() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({ code: 'FR', flag: '🇫🇷', name: 'France' });
  const [propertyName, setPropertyName] = useState('');

  const [formData, setFormData] = useState({
    name: '', country: 'FR',
    street_number: '', address: '', floor: '', building: '',
    address_complement: '', city: '', postal_code: '', state: '',
    check_in_hour: '15:00', check_out_hour: '11:00',
    self_checkin: false, entrance_type: 'Boîte à clés', key_code: '',
    parking_info: '', gps_link: '', checkin_instructions: '',
    wifi_name: '', wifi_password: '', heating_cooling_info: '',
    trash_instructions: '', breaker_box_location: '', water_shutoff_location: '', health_emergency_info: '',
    recommendations: '', local_shops: '', transport_info: '',
    checkout_instructions: '', key_return_details: '', luggage_storage_info: '', review_link: '',
    tv_manual: '', music_system: '', games_available: '', appliances_instructions: '',
    consumables_location: '', pantry_basics: '', laundry_iron_info: '',
    property_quirks: '', neighborhood_nuisances: '',
    baby_equipment: '', noise_rules: '', pet_policy: 'Non', tourist_tax_info: ''
  });

  const addressFormat = getAddressFormat(selectedCountry.code);

  useEffect(() => {
    if (id) fetchProperty(id);
  }, [id]);

  const fetchProperty = async (propId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('properties').select('*').eq('id', propId).single();
      if (error) throw error;
      if (data) {
        setFormData(prev => ({ ...prev, ...data }));
        setPropertyName(data.name || 'Logement');
        if (data.country) {
          const found = COUNTRIES.find(c => c.code === data.country);
          if (found) setSelectedCountry(found);
        }
      }
    } catch (err) {
      alert('Erreur de chargement : ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const selectCountry = (country) => {
    setSelectedCountry(country);
    setFormData(prev => ({ ...prev, country: country.code }));
    setShowCountryPicker(false);
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('properties').update(formData).eq('id', id);
      if (error) throw error;
      router.push('/dashboard');
    } catch (err) {
      alert('Erreur de sauvegarde : ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f7f9', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ textAlign: 'center', color: '#1a2a6c' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🎩</div>
        <p>Chargement du logement...</p>
      </div>
    </div>
  );

  return (
    <div className="config-container">
      <Head>
        <title>Configurer {propertyName} — Alfred Major</title>
        <meta name="robots" content="noindex" />
      </Head>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@700;800;900&display=swap');
        :global(*) { box-sizing: border-box; }
        :global(body) { margin: 0; background: #f4f7f9; font-family: 'Inter', sans-serif; }

        .config-container { min-height: 100vh; background: #f4f7f9; padding: 0 0 60px; }
        .config-card { max-width: 900px; margin: 0 auto; }

        .config-header { background: #1a2a6c; color: white; padding: 30px 40px; }
        .header-back { color: rgba(255,255,255,0.6); text-decoration: none; font-size: 13px; display: block; margin-bottom: 10px; }
        .header-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 22px; font-weight: 800; margin: 0; }
        .header-sub { color: #fbbf24; font-size: 13px; margin-top: 4px; }

        .section-card { background: white; border-radius: 16px; padding: 28px; margin: 20px 40px 0; border: 1px solid #e2e8f0; }
        .section-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 16px; font-weight: 800; color: #1a2a6c; margin: 0 0 20px; padding-bottom: 12px; border-bottom: 1px solid #f1f5f9; }
        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .full { grid-column: span 2; }
        label { font-weight: 700; font-size: 11px; color: #64748b; text-transform: uppercase; margin-bottom: 6px; display: block; letter-spacing: 0.5px; }
        input, textarea, select { padding: 13px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; background: #f8fafc; width: 100%; outline: none; transition: 0.2s; font-family: inherit; color: #1e293b; }
        input:focus, textarea:focus, select:focus { border-color: #1a2a6c; background: white; box-shadow: 0 0 0 3px rgba(26,42,108,0.08); }
        textarea { height: 90px; resize: vertical; }
        .checkbox-row { display: flex; align-items: center; gap: 12px; background: #fffbeb; padding: 16px; border-radius: 12px; border: 1px solid #fef3c7; }
        .checkbox-row input { width: 20px; height: 20px; cursor: pointer; }
        .checkbox-row label { margin: 0; color: #92400e; text-transform: none; font-size: 14px; letter-spacing: 0; }

        /* Sélecteur de pays */
        .country-selector { padding: 13px 16px; border: 1px solid #e2e8f0; border-radius: 10px; background: #f8fafc; width: 100%; display: flex; justify-content: space-between; align-items: center; cursor: pointer; font-size: 15px; color: #1e293b; font-weight: 600; transition: 0.2s; font-family: inherit; }
        .country-selector:hover { border-color: #1a2a6c; background: white; }
        .country-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: flex-end; justify-content: center; }
        .country-modal { background: white; border-radius: 24px 24px 0 0; width: 100%; max-width: 700px; max-height: 70vh; overflow-y: auto; padding-bottom: 20px; }
        .country-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #f1f5f9; position: sticky; top: 0; background: white; z-index: 1; }
        .country-modal-title { font-weight: 800; color: #1a2a6c; font-size: 16px; }
        .country-modal-close { background: none; border: none; font-size: 20px; cursor: pointer; color: #94a3b8; }
        .country-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 24px; cursor: pointer; border-bottom: 1px solid #f8fafc; transition: 0.15s; }
        .country-item:hover { background: #f8fafc; }
        .country-item.selected { background: #eff6ff; }
        .country-item-text { font-size: 15px; color: #1e293b; }
        .country-item-check { color: #1a2a6c; font-weight: 800; }

        /* Footer */
        .footer-actions { position: sticky; bottom: 0; background: white; border-top: 1px solid #e2e8f0; padding: 16px 40px; display: flex; justify-content: space-between; align-items: center; gap: 16px; z-index: 100; }
        .btn-cancel { background: none; border: 1px solid #e2e8f0; color: #64748b; padding: 13px 24px; border-radius: 12px; cursor: pointer; font-weight: 700; font-family: inherit; font-size: 14px; }
        .btn-save { background: #1a2a6c; color: white; padding: 13px 32px; border-radius: 12px; font-weight: 800; border: none; cursor: pointer; transition: 0.3s; font-family: inherit; font-size: 15px; }
        .btn-save:hover:not(:disabled) { background: #fbbf24; color: #1a2a6c; }
        .btn-save:disabled { background: #94a3b8; cursor: not-allowed; }

        @media (max-width: 768px) {
          .config-header { padding: 24px 20px; }
          .section-card { margin: 16px 16px 0; padding: 20px; }
          .grid { grid-template-columns: 1fr; }
          .full { grid-column: span 1; }
          .footer-actions { padding: 16px 20px; flex-direction: column; }
          .btn-save, .btn-cancel { width: 100%; text-align: center; }
        }
      `}</style>

      <div className="config-card">
        <div className="config-header">
          <Link href="/dashboard" legacyBehavior><a className="header-back">← Retour au tableau de bord</a></Link>
          <h1 className="header-title">Configuration : {propertyName}</h1>
          <p className="header-sub">Les modifications sont sauvegardées à la validation</p>
        </div>

        {/* ── IDENTITÉ & ADRESSE ── */}
        <div className="section-card">
          <p className="section-title">📍 Identité & Localisation</p>
          <div className="grid">
            <div className="full">
              <label>Nom du logement</label>
              <input name="name" value={formData.name} onChange={handleChange} placeholder="ex: Villa Mimosa" />
            </div>

            <div className="full">
              <label>Pays</label>
              <button type="button" className="country-selector" onClick={() => setShowCountryPicker(true)}>
                <span>{selectedCountry.flag} {selectedCountry.name}</span>
                <span>▼</span>
              </button>
            </div>

            {addressFormat.fields.map(field => (
              <div key={field} className={['address', 'address_complement'].includes(field) ? 'full' : ''}>
                <label>{addressFormat.labels[field]}</label>
                <input name={field} value={formData[field] || ''} onChange={handleChange} placeholder={addressFormat.placeholders[field]} />
              </div>
            ))}

            <div><label>Étage</label><input name="floor" value={formData.floor} onChange={handleChange} placeholder="ex: 3ème étage" /></div>
            <div><label>Bâtiment</label><input name="building" value={formData.building} onChange={handleChange} placeholder="ex: Bâtiment B" /></div>
            <div className="full"><label>Lien GPS</label><input name="gps_link" value={formData.gps_link} onChange={handleChange} placeholder="Lien Google Maps" /></div>
          </div>
        </div>

        {/* ── ACCÈS ── */}
        <div className="section-card">
          <p className="section-title">🔑 Accès & Arrivée</p>
          <div className="grid">
            <div><label>Check-in dès</label><input type="time" name="check_in_hour" value={formData.check_in_hour} onChange={handleChange} /></div>
            <div><label>Check-out avant</label><input type="time" name="check_out_hour" value={formData.check_out_hour} onChange={handleChange} /></div>
            <div className="full">
              <div className="checkbox-row">
                <input type="checkbox" id="self_checkin" name="self_checkin" checked={!!formData.self_checkin} onChange={handleChange} />
                <label htmlFor="self_checkin">Arrivée autonome activée</label>
              </div>
            </div>
            {formData.self_checkin && (
              <>
                <div>
                  <label>Type de dispositif</label>
                  <select name="entrance_type" value={formData.entrance_type} onChange={handleChange}>
                    <option>Boîte à clés</option>
                    <option>Serrure Connectée</option>
                    <option>Digicode</option>
                  </select>
                </div>
                <div><label>Code d'accès</label><input name="key_code" value={formData.key_code} onChange={handleChange} placeholder="ex: 1234" /></div>
              </>
            )}
            <div className="full"><label>Instructions d'accès</label><textarea name="checkin_instructions" value={formData.checkin_instructions} onChange={handleChange} /></div>
            <div className="full"><label>Parking</label><textarea name="parking_info" value={formData.parking_info} onChange={handleChange} /></div>
          </div>
        </div>

        {/* ── WIFI & CONFORT ── */}
        <div className="section-card">
          <p className="section-title">📡 WiFi & Confort</p>
          <div className="grid">
            <div><label>Nom du réseau (SSID)</label><input name="wifi_name" value={formData.wifi_name} onChange={handleChange} /></div>
            <div><label>Mot de passe WiFi</label><input name="wifi_password" value={formData.wifi_password} onChange={handleChange} /></div>
            <div className="full"><label>Chauffage / Climatisation</label><textarea name="heating_cooling_info" value={formData.heating_cooling_info} onChange={handleChange} /></div>
          </div>
        </div>

        {/* ── TECHNIQUE ── */}
        <div className="section-card">
          <p className="section-title">🛠️ Technique & Entretien</p>
          <div className="grid">
            <div className="full"><label>Tableau électrique</label><textarea name="breaker_box_location" value={formData.breaker_box_location} onChange={handleChange} /></div>
            <div><label>Vanne d'eau</label><input name="water_shutoff_location" value={formData.water_shutoff_location} onChange={handleChange} /></div>
            <div className="full"><label>Poubelles & Tri sélectif</label><textarea name="trash_instructions" value={formData.trash_instructions} onChange={handleChange} /></div>
            <div className="full"><label>Urgences & Santé</label><textarea name="health_emergency_info" value={formData.health_emergency_info} onChange={handleChange} /></div>
          </div>
        </div>

        {/* ── GUIDE LOCAL ── */}
        <div className="section-card">
          <p className="section-title">🧭 Guide Local & Recommandations</p>
          <div className="grid">
            <div className="full"><label>Recommandations du propriétaire</label><textarea name="recommendations" value={formData.recommendations} onChange={handleChange} /></div>
            <div><label>Commerces proches</label><input name="local_shops" value={formData.local_shops} onChange={handleChange} /></div>
            <div><label>Transports</label><input name="transport_info" value={formData.transport_info} onChange={handleChange} /></div>
          </div>
        </div>

        {/* ── DÉPART ── */}
        <div className="section-card">
          <p className="section-title">👋 Départ & Avis</p>
          <div className="grid">
            <div className="full"><label>Consignes de sortie</label><textarea name="checkout_instructions" value={formData.checkout_instructions} onChange={handleChange} /></div>
            <div><label>Retour des clés</label><input name="key_return_details" value={formData.key_return_details} onChange={handleChange} /></div>
            <div className="full"><label>Lien Airbnb pour avis</label><input name="review_link" value={formData.review_link} onChange={handleChange} /></div>
          </div>
        </div>

        {/* ── DIVERTISSEMENT ── */}
        <div className="section-card">
          <p className="section-title">📺 Divertissement & Appareils</p>
          <div className="grid">
            <div className="full"><label>TV & Streaming</label><textarea name="tv_manual" value={formData.tv_manual} onChange={handleChange} /></div>
            <div className="full"><label>Électroménager</label><textarea name="appliances_instructions" value={formData.appliances_instructions} onChange={handleChange} /></div>
            <div><label>Audio</label><input name="music_system" value={formData.music_system} onChange={handleChange} /></div>
            <div><label>Jeux</label><input name="games_available" value={formData.games_available} onChange={handleChange} /></div>
          </div>
        </div>

        {/* ── INVENTAIRE ── */}
        <div className="section-card">
          <p className="section-title">🧺 Inventaire & Linge</p>
          <div className="grid">
            <div><label>Produits de base</label><input name="pantry_basics" value={formData.pantry_basics} onChange={handleChange} /></div>
            <div><label>Recharges (savon, papier…)</label><input name="consumables_location" value={formData.consumables_location} onChange={handleChange} /></div>
            <div className="full"><label>Lave-linge & Fer à repasser</label><input name="laundry_iron_info" value={formData.laundry_iron_info} onChange={handleChange} /></div>
          </div>
        </div>

        {/* ── PARTICULARITÉS ── */}
        <div className="section-card">
          <p className="section-title">⚠️ Particularités & Nuisances</p>
          <div className="grid">
            <div className="full"><label>Spécificités du logement</label><textarea name="property_quirks" value={formData.property_quirks} onChange={handleChange} /></div>
            <div className="full"><label>Nuisances de quartier</label><textarea name="neighborhood_nuisances" value={formData.neighborhood_nuisances} onChange={handleChange} /></div>
          </div>
        </div>

        {/* ── RÈGLES ── */}
        <div className="section-card">
          <p className="section-title">📜 Familles, Règles & Taxes</p>
          <div className="grid">
            <div><label>Équipements bébé</label><input name="baby_equipment" value={formData.baby_equipment} onChange={handleChange} /></div>
            <div><label>Taxe de séjour</label><input name="tourist_tax_info" value={formData.tourist_tax_info} onChange={handleChange} /></div>
            <div className="full"><label>Règles de vie & Bruit</label><textarea name="noise_rules" value={formData.noise_rules} onChange={handleChange} /></div>
          </div>
        </div>

        {/* ── FOOTER STICKY ── */}
        <div className="footer-actions">
          <Link href="/dashboard" legacyBehavior><a><button className="btn-cancel">Annuler</button></a></Link>
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Sauvegarde...' : '✅ Sauvegarder les modifications'}
          </button>
        </div>
      </div>

      {/* ── MODAL SÉLECTEUR DE PAYS ── */}
      {showCountryPicker && (
        <div className="country-modal-overlay" onClick={() => setShowCountryPicker(false)}>
          <div className="country-modal" onClick={e => e.stopPropagation()}>
            <div className="country-modal-header">
              <span className="country-modal-title">Choisir le pays</span>
              <button className="country-modal-close" onClick={() => setShowCountryPicker(false)}>✕</button>
            </div>
            {COUNTRIES.map(country => (
              <div
                key={country.code}
                className={`country-item${selectedCountry.code === country.code ? ' selected' : ''}`}
                onClick={() => selectCountry(country)}
              >
                <span className="country-item-text">{country.flag} {country.name}</span>
                {selectedCountry.code === country.code && <span className="country-item-check">✓</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
