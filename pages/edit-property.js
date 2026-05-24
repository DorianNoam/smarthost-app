// pages/edit-property.js
// Page de modification d'un logement avec chargement/sauvegarde Supabase et sélecteur de pays

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import Head from 'next/head';
import { COUNTRIES, getAddressFormat } from '../lib/countries';

const PROPERTY_TYPES = [
  { value: 'apartment',    emoji: '🏠', label: 'Appartement / Maison entière' },
  { value: 'private_room', emoji: '🛏️', label: 'Chambre privée' },
  { value: 'gite',         emoji: '🏡', label: 'Gîte / Villa' },
  { value: 'riad',         emoji: '🕌', label: 'Riad / Maison d\'hôtes' },
  { value: 'bnb',          emoji: '☕', label: 'B&B / Chambre d\'hôtes' },
];

export default function EditProperty() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({ code: 'FR', flag: '🇫🇷', name: 'France' });
  const [propertyName, setPropertyName] = useState('');

  const [formData, setFormData] = useState({
    // ── Champs existants ──
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
    baby_equipment: '', noise_rules: '', pet_policy: 'Non', tourist_tax_info: '',
    // ── Nouveaux champs Phase 1 ──
    property_type: 'apartment',
    room_name: '', room_floor: '', room_bed_config: '', room_view: '',
    host_on_site: false, host_name_onsite: '', host_contact_onsite: '',
    host_availability_hours: '', other_guests_info: '', shared_spaces: '',
    shared_spaces_rules: '', shared_kitchen_rules: '', bathroom_type: '',
    towels_provided: '', guests_policy: '', shoes_policy: '',
    breakfast_included: false, breakfast_hours: '', breakfast_location: '',
    breakfast_details: '', breakfast_reservation_required: false,
    breakfast_dietary_info: '', breakfast_in_room: '',
    dinner_available: false, dinner_details: '',
    alcohol_available: true, room_service_available: false, dietary_options: '',
    housekeeping_frequency: '', housekeeping_time: '', towel_change_frequency: '',
    linen_change_frequency: '', laundry_service: '', ironing_service: '',
    has_reception: false, reception_hours: '', late_checkin_procedure: '',
    staff_name: '', staff_languages: '',
    pool_info: '', jacuzzi_info: '', hammam_info: '', spa_info: '',
    rooftop_info: '', patio_info: '', common_lounge_info: '', gym_info: '',
    garden_info: '', outdoor_games: '', common_areas_rules: '',
    airport_transfer: '', bike_rental: '', bikes_info: '', excursions_info: '',
    local_guide_info: '', trusted_taxi: '', external_laundry: '', safe_info: '',
    gate_code: '', septic_tank_rules: '', water_tank_info: '', shutters_info: '',
    doorbell_info: '', bbq_info: '', nearest_supermarket: '', nearest_bakery: '',
    nearest_gas_station: '', nearest_recycling: '', local_market_info: '',
    nature_activities: '', hiking_info: '', fire_rules: '', neighbor_emergency_contact: '',
    medina_directions: '', taxi_meeting_point: '', dress_code_info: '',
    souk_hours: '', safety_tips: '', mosque_info: '', generator_info: '',
    water_reserve_info: '', local_emergency_contacts: '', pharmacy_on_call: '',
  });

  const addressFormat = getAddressFormat(selectedCountry.code);
  const pt = formData.property_type;

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
        .subsection-title { font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin: 20px 0 12px; padding-left: 10px; border-left: 3px solid #1a2a6c; }
        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .full { grid-column: span 2; }
        label { font-weight: 700; font-size: 11px; color: #64748b; text-transform: uppercase; margin-bottom: 6px; display: block; letter-spacing: 0.5px; }
        input, textarea, select { padding: 13px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; background: #f8fafc; width: 100%; outline: none; transition: 0.2s; font-family: inherit; color: #1e293b; }
        input:focus, textarea:focus, select:focus { border-color: #1a2a6c; background: white; box-shadow: 0 0 0 3px rgba(26,42,108,0.08); }
        textarea { height: 90px; resize: vertical; }
        .checkbox-row { display: flex; align-items: center; gap: 12px; background: #fffbeb; padding: 16px; border-radius: 12px; border: 1px solid #fef3c7; }
        .checkbox-row input { width: 20px; height: 20px; cursor: pointer; }
        .checkbox-row label { margin: 0; color: #92400e; text-transform: none; font-size: 14px; letter-spacing: 0; }

        /* Sélecteur de type */
        .type-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 24px; }
        .type-card { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 12px; cursor: pointer; transition: 0.2s; background: #f8fafc; }
        .type-card:hover { border-color: #1a2a6c; background: #eff6ff; }
        .type-card.selected { border-color: #1a2a6c; background: #eff6ff; }
        .type-card-label { font-size: 13px; font-weight: 700; color: #1e293b; }

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
          .type-grid { grid-template-columns: 1fr; }
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

        {/* ── TYPE D'HÉBERGEMENT ── */}
        <div className="section-card">
          <p className="section-title">🏷️ Type d'hébergement</p>
          <div className="type-grid">
            {PROPERTY_TYPES.map(type => (
              <div
                key={type.value}
                className={`type-card ${pt === type.value ? 'selected' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, property_type: type.value }))}
              >
                <span style={{fontSize:'20px'}}>{type.emoji}</span>
                <span className="type-card-label">{type.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── IDENTITÉ & ADRESSE ── */}
        <div className="section-card">
          <p className="section-title">📍 Identité & Localisation</p>
          <div className="grid">
            <div className="full">
              <label>Nom du logement</label>
              <input name="name" value={formData.name} onChange={handleChange} placeholder="ex: Villa Mimosa" />
            </div>

            {/* Champs chambre si applicable */}
            {['riad','bnb','private_room'].includes(pt) && (
              <>
                <div className="full"><p className="subsection-title">🛏️ Identité de la chambre</p></div>
                <div className="full">
                  <label>Nom de la chambre</label>
                  <input name="room_name" value={formData.room_name || ''} onChange={handleChange} placeholder="ex: Suite Atlas, Chambre Jasmin" />
                </div>
                <div>
                  <label>Étage / Localisation dans l'établissement</label>
                  <input name="room_floor" value={formData.room_floor || ''} onChange={handleChange} placeholder="ex: 1er étage, aile gauche" />
                </div>
                <div>
                  <label>Configuration du lit</label>
                  <select name="room_bed_config" value={formData.room_bed_config || ''} onChange={handleChange}>
                    <option value="">Choisir...</option>
                    <option value="Lit double (Queen)">Lit double (Queen)</option>
                    <option value="Lit double (King)">Lit double (King)</option>
                    <option value="2 lits simples (Twin)">2 lits simples (Twin)</option>
                    <option value="Lit simple">Lit simple</option>
                    <option value="Suite avec salon">Suite avec salon</option>
                  </select>
                </div>
                <div className="full">
                  <label>Vue depuis la chambre</label>
                  <input name="room_view" value={formData.room_view || ''} onChange={handleChange} placeholder="ex: Vue sur le patio, Vue sur jardin" />
                </div>
              </>
            )}

            <div className="full"><p className="subsection-title">📍 Adresse</p></div>
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

        {/* ── RÉCEPTION — riad, bnb ── */}
        {['riad','bnb'].includes(pt) && (
          <div className="section-card">
            <p className="section-title">🛎️ Réception & Équipe</p>
            <div className="grid">
              <div className="full">
                <div className="checkbox-row">
                  <input type="checkbox" id="has_reception" name="has_reception" checked={!!formData.has_reception} onChange={handleChange} />
                  <label htmlFor="has_reception">L'établissement dispose d'une réception physique</label>
                </div>
              </div>
              {formData.has_reception && (
                <div className="full"><label>Horaires de la réception</label><input name="reception_hours" value={formData.reception_hours || ''} onChange={handleChange} placeholder="ex: 7h — 22h tous les jours" /></div>
              )}
              <div className="full"><label>Procédure arrivée hors horaires</label><textarea name="late_checkin_procedure" value={formData.late_checkin_procedure || ''} onChange={handleChange} /></div>
              <div><label>Prénom du responsable</label><input name="staff_name" value={formData.staff_name || ''} onChange={handleChange} /></div>
              <div><label>Langues parlées par l'équipe</label><input name="staff_languages" value={formData.staff_languages || ''} onChange={handleChange} /></div>
            </div>
          </div>
        )}

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

        {/* ── PETIT-DÉJEUNER — private_room, riad, bnb ── */}
        {['private_room','riad','bnb'].includes(pt) && (
          <div className="section-card">
            <p className="section-title">☕ Petit-déjeuner</p>
            <div className="grid">
              <div className="full">
                <div className="checkbox-row">
                  <input type="checkbox" id="breakfast_included" name="breakfast_included" checked={!!formData.breakfast_included} onChange={handleChange} />
                  <label htmlFor="breakfast_included">Petit-déjeuner inclus dans le tarif</label>
                </div>
              </div>
              <div><label>Horaires (début et fin)</label><input name="breakfast_hours" value={formData.breakfast_hours || ''} onChange={handleChange} placeholder="ex: 7h30 — 10h00" /></div>
              <div><label>Lieu de service</label><input name="breakfast_location" value={formData.breakfast_location || ''} onChange={handleChange} placeholder="ex: Salle, patio, terrasse" /></div>
              <div className="full"><label>Composition</label><textarea name="breakfast_details" value={formData.breakfast_details || ''} onChange={handleChange} /></div>
              <div className="full">
                <div className="checkbox-row">
                  <input type="checkbox" id="breakfast_res" name="breakfast_reservation_required" checked={!!formData.breakfast_reservation_required} onChange={handleChange} />
                  <label htmlFor="breakfast_res">Réservation la veille obligatoire</label>
                </div>
              </div>
              <div className="full"><label>Allergies & régimes gérés</label><input name="breakfast_dietary_info" value={formData.breakfast_dietary_info || ''} onChange={handleChange} /></div>
              <div className="full"><label>Petit-déjeuner en chambre (supplément)</label><input name="breakfast_in_room" value={formData.breakfast_in_room || ''} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {/* ── RESTAURATION — riad, bnb ── */}
        {['riad','bnb'].includes(pt) && (
          <div className="section-card">
            <p className="section-title">🍽️ Restauration sur place</p>
            <div className="grid">
              <div className="full">
                <div className="checkbox-row">
                  <input type="checkbox" id="dinner_available" name="dinner_available" checked={!!formData.dinner_available} onChange={handleChange} />
                  <label htmlFor="dinner_available">Table d'hôtes le soir disponible</label>
                </div>
              </div>
              {formData.dinner_available && (
                <div className="full"><label>Détails (horaires, menu, prix, réservation)</label><textarea name="dinner_details" value={formData.dinner_details || ''} onChange={handleChange} /></div>
              )}
              <div className="full">
                <div className="checkbox-row">
                  <input type="checkbox" id="room_service" name="room_service_available" checked={!!formData.room_service_available} onChange={handleChange} />
                  <label htmlFor="room_service">Room service disponible</label>
                </div>
              </div>
              <div className="full">
                <div className="checkbox-row">
                  <input type="checkbox" id="alcohol" name="alcohol_available" checked={!!formData.alcohol_available} onChange={handleChange} />
                  <label htmlFor="alcohol">Boissons alcoolisées disponibles</label>
                </div>
              </div>
              <div className="full"><label>Options spéciales (halal, végé...)</label><input name="dietary_options" value={formData.dietary_options || ''} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {/* ── SERVICES INCLUS — riad, bnb ── */}
        {['riad','bnb'].includes(pt) && (
          <div className="section-card">
            <p className="section-title">🧹 Services inclus</p>
            <div className="grid">
              <div>
                <label>Ménage (fréquence)</label>
                <select name="housekeeping_frequency" value={formData.housekeeping_frequency || ''} onChange={handleChange}>
                  <option value="">Choisir...</option>
                  <option value="Quotidien">Quotidien</option>
                  <option value="Tous les 2 jours">Tous les 2 jours</option>
                  <option value="Sur demande">Sur demande</option>
                  <option value="Non inclus">Non inclus</option>
                </select>
              </div>
              <div><label>Heure de passage</label><input name="housekeeping_time" value={formData.housekeeping_time || ''} onChange={handleChange} placeholder="ex: Entre 10h et 12h" /></div>
              <div><label>Changement serviettes</label><input name="towel_change_frequency" value={formData.towel_change_frequency || ''} onChange={handleChange} /></div>
              <div><label>Changement draps</label><input name="linen_change_frequency" value={formData.linen_change_frequency || ''} onChange={handleChange} /></div>
              <div className="full"><label>Blanchisserie sur place</label><input name="laundry_service" value={formData.laundry_service || ''} onChange={handleChange} /></div>
              <div className="full"><label>Repassage sur demande</label><input name="ironing_service" value={formData.ironing_service || ''} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {/* ── COHABITATION — private_room ── */}
        {pt === 'private_room' && (
          <div className="section-card">
            <p className="section-title">🏠 Cohabitation</p>
            <div className="grid">
              <div className="full">
                <div className="checkbox-row">
                  <input type="checkbox" id="host_on_site" name="host_on_site" checked={!!formData.host_on_site} onChange={handleChange} />
                  <label htmlFor="host_on_site">L'hôte est présent pendant le séjour</label>
                </div>
              </div>
              {formData.host_on_site && (
                <>
                  <div><label>Prénom & langues de l'hôte</label><input name="host_name_onsite" value={formData.host_name_onsite || ''} onChange={handleChange} /></div>
                  <div><label>Comment contacter l'hôte</label><input name="host_contact_onsite" value={formData.host_contact_onsite || ''} onChange={handleChange} /></div>
                  <div className="full"><label>Horaires de disponibilité</label><input name="host_availability_hours" value={formData.host_availability_hours || ''} onChange={handleChange} /></div>
                </>
              )}
              <div className="full"><label>Espaces partagés</label><textarea name="shared_spaces" value={formData.shared_spaces || ''} onChange={handleChange} /></div>
              <div className="full"><label>Règles des espaces partagés</label><textarea name="shared_spaces_rules" value={formData.shared_spaces_rules || ''} onChange={handleChange} /></div>
              <div className="full"><label>Règles cuisine partagée</label><textarea name="shared_kitchen_rules" value={formData.shared_kitchen_rules || ''} onChange={handleChange} /></div>
              <div className="full"><label>Salle de bain (privée ou partagée)</label><input name="bathroom_type" value={formData.bathroom_type || ''} onChange={handleChange} /></div>
              <div><label>Serviettes fournies</label><input name="towels_provided" value={formData.towels_provided || ''} onChange={handleChange} /></div>
              <div><label>Invités extérieurs</label><input name="guests_policy" value={formData.guests_policy || ''} onChange={handleChange} /></div>
              <div className="full"><label>Autres voyageurs simultanés</label><input name="other_guests_info" value={formData.other_guests_info || ''} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {/* ── ESPACES COMMUNS — riad, bnb, gite ── */}
        {['riad','bnb','gite'].includes(pt) && (
          <div className="section-card">
            <p className="section-title">🏊 Espaces communs</p>
            <div className="grid">
              <div className="full"><label>Piscine</label><textarea name="pool_info" value={formData.pool_info || ''} onChange={handleChange} placeholder="ex: Ouverte de 8h à 20h, chauffée, serviettes fournies" /></div>
              <div className="full"><label>Hammam</label><textarea name="hammam_info" value={formData.hammam_info || ''} onChange={handleChange} /></div>
              <div className="full"><label>Spa & Massages</label><textarea name="spa_info" value={formData.spa_info || ''} onChange={handleChange} /></div>
              <div className="full"><label>Terrasse / Rooftop</label><textarea name="rooftop_info" value={formData.rooftop_info || ''} onChange={handleChange} /></div>
              <div className="full"><label>Patio / Jardin intérieur</label><textarea name="patio_info" value={formData.patio_info || ''} onChange={handleChange} /></div>
              <div className="full"><label>Salon commun</label><textarea name="common_lounge_info" value={formData.common_lounge_info || ''} onChange={handleChange} /></div>
              <div><label>Jacuzzi</label><input name="jacuzzi_info" value={formData.jacuzzi_info || ''} onChange={handleChange} /></div>
              <div><label>Salle de sport</label><input name="gym_info" value={formData.gym_info || ''} onChange={handleChange} /></div>
              <div className="full"><label>Jeux extérieurs</label><input name="outdoor_games" value={formData.outdoor_games || ''} onChange={handleChange} /></div>
              <div className="full"><label>Règles générales espaces communs</label><textarea name="common_areas_rules" value={formData.common_areas_rules || ''} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {/* ── GUIDE LOCAL ── */}
        <div className="section-card">
          <p className="section-title">🧭 Guide Local & Recommandations</p>
          <div className="grid">
            <div className="full"><label>Recommandations du propriétaire</label><textarea name="recommendations" value={formData.recommendations} onChange={handleChange} /></div>
            <div><label>Commerces proches</label><input name="local_shops" value={formData.local_shops} onChange={handleChange} /></div>
            <div><label>Transports</label><input name="transport_info" value={formData.transport_info} onChange={handleChange} /></div>
          </div>
        </div>

        {/* ── SERVICES ADDITIONNELS — riad, bnb, gite ── */}
        {['riad','bnb','gite'].includes(pt) && (
          <div className="section-card">
            <p className="section-title">✈️ Services additionnels</p>
            <div className="grid">
              <div className="full"><label>Transfert aéroport / gare</label><input name="airport_transfer" value={formData.airport_transfer || ''} onChange={handleChange} /></div>
              <div className="full"><label>Taxi de confiance (numéro direct)</label><input name="trusted_taxi" value={formData.trusted_taxi || ''} onChange={handleChange} /></div>
              <div className="full"><label>Location vélos / scooters</label><input name="bike_rental" value={formData.bike_rental || ''} onChange={handleChange} /></div>
              <div className="full"><label>Vélos mis à disposition</label><input name="bikes_info" value={formData.bikes_info || ''} onChange={handleChange} /></div>
              <div className="full"><label>Excursions organisées</label><textarea name="excursions_info" value={formData.excursions_info || ''} onChange={handleChange} /></div>
              <div className="full"><label>Guide local recommandé</label><input name="local_guide_info" value={formData.local_guide_info || ''} onChange={handleChange} /></div>
              <div className="full"><label>Coffre-fort en chambre</label><input name="safe_info" value={formData.safe_info || ''} onChange={handleChange} /></div>
              <div className="full"><label>Blanchisserie externe recommandée</label><input name="external_laundry" value={formData.external_laundry || ''} onChange={handleChange} /></div>
            </div>
          </div>
        )}

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

        {/* ── GÎTE RURAL — gite uniquement ── */}
        {pt === 'gite' && (
          <div className="section-card">
            <p className="section-title">🌿 Spécificités du gîte</p>
            <div className="grid">
              <div className="full"><label>Barbecue</label><input name="bbq_info" value={formData.bbq_info || ''} onChange={handleChange} placeholder="ex: BBQ gaz sur terrasse, bouteille fournie" /></div>
              <div className="full"><label>Code / télécommande portail</label><input name="gate_code" value={formData.gate_code || ''} onChange={handleChange} /></div>
              <div className="full"><label>Fosse septique (consignes importantes)</label><textarea name="septic_tank_rules" value={formData.septic_tank_rules || ''} onChange={handleChange} /></div>
              <div className="full"><label>Volets / Persiennes</label><input name="shutters_info" value={formData.shutters_info || ''} onChange={handleChange} /></div>
              <div className="full"><label>Jardin & dépendances</label><textarea name="garden_info" value={formData.garden_info || ''} onChange={handleChange} /></div>
              <div className="full"><p className="subsection-title">🛒 Commerces à proximité</p></div>
              <div className="full"><label>Supermarché</label><input name="nearest_supermarket" value={formData.nearest_supermarket || ''} onChange={handleChange} placeholder="ex: Intermarché, 4 km, ouvert 8h30-19h30" /></div>
              <div className="full"><label>Boulangerie</label><input name="nearest_bakery" value={formData.nearest_bakery || ''} onChange={handleChange} placeholder="ex: Fermée le lundi" /></div>
              <div><label>Station-service</label><input name="nearest_gas_station" value={formData.nearest_gas_station || ''} onChange={handleChange} /></div>
              <div><label>Déchetterie</label><input name="nearest_recycling" value={formData.nearest_recycling || ''} onChange={handleChange} /></div>
              <div className="full"><label>Marché local (jour et lieu)</label><input name="local_market_info" value={formData.local_market_info || ''} onChange={handleChange} /></div>
              <div className="full"><p className="subsection-title">🥾 Activités nature</p></div>
              <div className="full"><label>Randonnées recommandées</label><textarea name="hiking_info" value={formData.hiking_info || ''} onChange={handleChange} /></div>
              <div className="full"><label>Activités nature</label><textarea name="nature_activities" value={formData.nature_activities || ''} onChange={handleChange} /></div>
              <div className="full"><label>Règles feux de camp</label><input name="fire_rules" value={formData.fire_rules || ''} onChange={handleChange} /></div>
              <div className="full"><label>Voisin de confiance (urgences)</label><input name="neighbor_emergency_contact" value={formData.neighbor_emergency_contact || ''} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {/* ── MÉDINA — riad uniquement ── */}
        {pt === 'riad' && (
          <div className="section-card">
            <p className="section-title">🕌 Médina & Contexte local</p>
            <div className="grid">
              <div className="full"><label>Comment trouver le riad dans la médina</label><textarea name="medina_directions" value={formData.medina_directions || ''} onChange={handleChange} placeholder="ex: Prendre un taxi jusqu'à Bab Doukkala, puis appeler..." /></div>
              <div className="full"><label>Point de RDV pour les taxis</label><input name="taxi_meeting_point" value={formData.taxi_meeting_point || ''} onChange={handleChange} /></div>
              <div className="full"><label>Conseils vestimentaires</label><input name="dress_code_info" value={formData.dress_code_info || ''} onChange={handleChange} /></div>
              <div><label>Horaires des souks</label><input name="souk_hours" value={formData.souk_hours || ''} onChange={handleChange} /></div>
              <div><label>Mosquée voisine (appels à la prière)</label><input name="mosque_info" value={formData.mosque_info || ''} onChange={handleChange} /></div>
              <div className="full"><label>Conseils de sécurité</label><textarea name="safety_tips" value={formData.safety_tips || ''} onChange={handleChange} /></div>
              <div className="full"><p className="subsection-title">⚡ Urgences spécifiques</p></div>
              <div className="full"><label>Générateur (coupures fréquentes)</label><input name="generator_info" value={formData.generator_info || ''} onChange={handleChange} /></div>
              <div className="full"><label>Réserve d'eau</label><input name="water_reserve_info" value={formData.water_reserve_info || ''} onChange={handleChange} /></div>
              <div className="full"><label>Contacts urgence locaux</label><textarea name="local_emergency_contacts" value={formData.local_emergency_contacts || ''} onChange={handleChange} placeholder="ex: Police : 19 · SAMU : 15 · Pompiers : 15" /></div>
              <div className="full"><label>Pharmacie de garde</label><input name="pharmacy_on_call" value={formData.pharmacy_on_call || ''} onChange={handleChange} /></div>
            </div>
          </div>
        )}

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
