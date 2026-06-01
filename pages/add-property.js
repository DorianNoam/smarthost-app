import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import { COUNTRIES, getAddressFormat } from '../lib/countries';

// ─── Types d'hébergement ───────────────────────────────────
const PROPERTY_TYPES = [
  { value: 'apartment', emoji: '🏠', label: 'Appartement / Maison entière', desc: 'Le voyageur dispose du logement en exclusivité' },
  { value: 'private_room', emoji: '🛏️', label: 'Chambre privée', desc: 'Chambre dans un logement partagé avec l\'hôte ou d\'autres locataires' },
  { value: 'gite', emoji: '🏡', label: 'Gîte / Villa', desc: 'Propriété indépendante, souvent en zone rurale ou touristique' },
  { value: 'riad', emoji: '🕌', label: 'Riad / Maison d\'hôtes', desc: 'Maison d\'hôtes avec espaces communs, patio, services inclus' },
  { value: 'bnb', emoji: '☕', label: 'B&B / Chambre d\'hôtes', desc: 'Chambre avec petit-déjeuner inclus, style maison de famille' },
];

// ─── Étapes selon le type ──────────────────────────────────
// Retourne true si l'étape supplémentaire doit s'afficher pour ce type
const showStepForType = (stepKey, propertyType) => {
  const map = {
    cohabitation:  ['private_room'],
    breakfast:     ['private_room', 'riad', 'bnb'],
    dinner:        ['riad', 'bnb'],
    services:      ['riad', 'bnb'],
    reception:     ['riad', 'bnb'],
    common_spaces: ['riad', 'bnb', 'gite'],
    extras:        ['riad', 'bnb', 'gite'],
    gite_rural:    ['gite'],
    medina:        ['riad'],
  };
  return (map[stepKey] || []).includes(propertyType);
};

// ─── Calcul des étapes actives ────────────────────────────
const getActiveSteps = (propertyType) => {
  const base = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // étapes fixes
  const extra = [];
  if (showStepForType('cohabitation', propertyType))  extra.push('cohabitation');
  if (showStepForType('breakfast', propertyType))     extra.push('breakfast');
  if (showStepForType('dinner', propertyType))        extra.push('dinner');
  if (showStepForType('services', propertyType))      extra.push('services');
  if (showStepForType('reception', propertyType))     extra.push('reception');
  if (showStepForType('common_spaces', propertyType)) extra.push('common_spaces');
  if (showStepForType('extras', propertyType))        extra.push('extras');
  if (showStepForType('gite_rural', propertyType))    extra.push('gite_rural');
  if (showStepForType('medina', propertyType))        extra.push('medina');
  return [...base, ...extra];
};

export default function AddPropertyWizard() {
  const router = useRouter();
  const { id } = router.query;
  const [step, setStep] = useState(0); // 0 = choix du type
  const [loading, setLoading] = useState(false);
  const [propertyId, setPropertyId] = useState(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({ code: 'FR', flag: '🇫🇷', name: 'France' });

  // ── Import document (Phase 3) ──────────────────────────
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null); // { filled: [...], missing: [...] }
  const [pastedText, setPastedText] = useState('');
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    // ── Universel ──
    property_type: '',
    name: '', slug: '', country: 'FR',
    street_number: '', address: '', floor: '', building: '',
    address_complement: '', city: '', postal_code: '', state: '',
    check_in_hour: '15:00', check_out_hour: '11:00',
    self_checkin: false, entrance_type: 'Boîte à clés',
    key_code: '', parking_info: '', gps_link: '', checkin_instructions: '',
    wifi_name: '', wifi_password: '', heating_cooling_info: '',
    trash_instructions: '', breaker_box_location: '', water_shutoff_location: '',
    health_emergency_info: '', recommendations: '', local_shops: '', transport_info: '',
    checkout_instructions: '', key_return_details: '', luggage_storage_info: '', review_link: '',
    tv_manual: '', music_system: '', games_available: '', appliances_instructions: '',
    consumables_location: '', pantry_basics: '', laundry_iron_info: '',
    property_quirks: '', neighborhood_nuisances: '',
    ical_url: '',
    baby_equipment: '', noise_rules: '', pet_policy: 'Non', tourist_tax_info: '',
    // ── Chambre (riad, bnb, private_room) ──
    room_name: '', room_floor: '', room_bed_config: '', room_view: '',
    // ── Cohabitation (private_room) ──
    host_on_site: false, host_name_onsite: '', host_contact_onsite: '',
    host_availability_hours: '', other_guests_info: '', shared_spaces: '',
    shared_spaces_rules: '', shared_kitchen_rules: '', bathroom_type: '',
    towels_provided: '', guests_policy: '', shoes_policy: '',
    // ── Petit-déjeuner ──
    breakfast_included: false, breakfast_hours: '', breakfast_location: '',
    breakfast_details: '', breakfast_reservation_required: false,
    breakfast_dietary_info: '', breakfast_in_room: '',
    // ── Restauration ──
    dinner_available: false, dinner_details: '',
    alcohol_available: true, room_service_available: false, dietary_options: '',
    // ── Services ──
    housekeeping_frequency: '', housekeeping_time: '', towel_change_frequency: '',
    linen_change_frequency: '', laundry_service: '', ironing_service: '',
    // ── Réception ──
    has_reception: false, reception_hours: '', late_checkin_procedure: '',
    staff_name: '', staff_languages: '',
    // ── Espaces communs ──
    pool_info: '', jacuzzi_info: '', hammam_info: '', spa_info: '',
    rooftop_info: '', patio_info: '', common_lounge_info: '', gym_info: '',
    garden_info: '', outdoor_games: '', common_areas_rules: '',
    // ── Services additionnels ──
    airport_transfer: '', bike_rental: '', bikes_info: '', excursions_info: '',
    local_guide_info: '', trusted_taxi: '', external_laundry: '', safe_info: '',
    // ── Gîte rural ──
    gate_code: '', septic_tank_rules: '', water_tank_info: '', shutters_info: '',
    doorbell_info: '', bbq_info: '', nearest_supermarket: '', nearest_bakery: '',
    nearest_gas_station: '', nearest_recycling: '', local_market_info: '',
    nature_activities: '', hiking_info: '', fire_rules: '', neighbor_emergency_contact: '',
    // ── Médina / Riad ──
    medina_directions: '', taxi_meeting_point: '', dress_code_info: '',
    souk_hours: '', safety_tips: '', mosque_info: '', generator_info: '',
    water_reserve_info: '', local_emergency_contacts: '', pharmacy_on_call: '',
  });

  const addressFormat = getAddressFormat(selectedCountry.code);
  const activeSteps = getActiveSteps(formData.property_type);
  const totalSteps = activeSteps.length;

  // Index de l'étape courante dans la liste active (0-indexed, step 0 est hors liste)
  const currentStepIndex = activeSteps.indexOf(step);
  const progressPct = step === 0 ? 0 : ((currentStepIndex + 1) / totalSteps) * 100;

  const selectCountry = (country) => {
    setSelectedCountry(country);
    setFormData(prev => ({ ...prev, country: country.code }));
    setShowCountryPicker(false);
  };

  useEffect(() => {
    if (id) {
      setPropertyId(id);
      fetchPropertyData(id);
    }
  }, [id]);

  const fetchPropertyData = async (propId) => {
    const { data, error } = await supabase.from('properties').select('*').eq('id', propId).single();
    if (!error && data) {
      setFormData(prev => ({ ...prev, ...data }));
      if (data.country) {
        const found = COUNTRIES.find(c => c.code === data.country);
        if (found) setSelectedCountry(found);
      }
      if (data.property_type) setStep(1); // Si édition, passer directement à l'étape 1
    }
  };

  const slugify = (text) => text.toString().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
    .replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;
    if (name === 'street_number') finalValue = value.replace(/\D/g, '');
    if (name === 'name') {
      setFormData({ ...formData, name: value, slug: slugify(value) });
    } else {
      setFormData({ ...formData, [name]: finalValue });
    }
  };

  // ─── Sélection du type et passage à l'étape 1 ────────────
  const selectType = (typeValue) => {
    setFormData(prev => ({ ...prev, property_type: typeValue }));
    setStep('import'); // étape intermédiaire d'import document
  };

  // ─── Navigation ───────────────────────────────────────────
  const goNext = () => {
    const idx = activeSteps.indexOf(step);
    if (idx < activeSteps.length - 1) {
      setStep(activeSteps[idx + 1]);
    }
    window.scrollTo(0, 0);
  };

  const goPrev = () => {
    const idx = activeSteps.indexOf(step);
    if (idx > 0) {
      setStep(activeSteps[idx - 1]);
    } else {
      setStep('import'); // retour à l'import depuis étape 1
    }
    window.scrollTo(0, 0);
  };

  const isLastStep = activeSteps.indexOf(step) === activeSteps.length - 1;

  // ─── Sauvegarde ───────────────────────────────────────────
  const saveProgress = async (isFinal = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = { owner_id: user.id, ...formData };
      if (propertyId) {
        payload.id = propertyId;
      } else {
        payload.is_active = false;
      }
      const { data, error } = await supabase.from('properties').upsert(payload).select().single();
      if (error) throw error;
      setPropertyId(data.id);
      if (isFinal) {
        router.push('/dashboard');
      } else {
        goNext();
      }
    } catch (error) {
      alert("Erreur de sauvegarde : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Import document ──────────────────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportLoading(true);
    try {
      const formDataFile = new FormData();
      formDataFile.append('file', file);
      const res = await fetch('/api/parse-document', { method: 'POST', body: formDataFile });
      const result = await res.json();
      if (result.fields) {
        setFormData(prev => ({ ...prev, ...result.fields }));
        setImportResult(result.summary);
      }
    } catch (err) {
      alert("Erreur lors de l'analyse : " + err.message);
    } finally {
      setImportLoading(false);
    }
  };

  const handlePastedText = async () => {
    if (!pastedText.trim()) return;
    setImportLoading(true);
    try {
      const res = await fetch('/api/parse-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pastedText }),
      });
      const result = await res.json();
      if (result.fields) {
        setFormData(prev => ({ ...prev, ...result.fields }));
        setImportResult(result.summary);
      }
    } catch (err) {
      alert("Erreur lors de l'analyse : " + err.message);
    } finally {
      setImportLoading(false);
    }
  };

  const skipImport = () => {
    setStep(activeSteps[0]); // aller directement à l'étape 1
    window.scrollTo(0, 0);
  };

  // ─── Render ───────────────────────────────────────────────
  return (
    <div className="wizard-container">
      <style jsx>{`
        .wizard-container { min-height: 100vh; background: #0f172a; display: flex; align-items: center; justify-content: center; font-family: 'Inter', sans-serif; padding: 15px; }
        .wizard-card { background: white; padding: 30px; border-radius: 24px; width: 100%; max-width: 700px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); box-sizing: border-box; }
        .progress-bar { height: 6px; background: #e2e8f0; border-radius: 10px; margin-bottom: 25px; }
        .progress-fill { height: 100%; background: #fbbf24; transition: 0.5s; width: ${progressPct}%; border-radius: 10px; }
        h2 { color: #1e293b; font-size: 22px; margin-bottom: 8px; font-weight: 800; }
        .step-desc { color: #64748b; font-size: 14px; margin-bottom: 20px; }
        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
        .full { grid-column: span 2; }
        .input-group { display: flex; flex-direction: column; }
        label { font-weight: 700; font-size: 11px; color: #64748b; text-transform: uppercase; margin-bottom: 5px; display: block; }
        input, textarea, select { padding: 12px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 15px; background: #f8fafc; width: 100%; box-sizing: border-box; outline: none; transition: 0.2s; }
        input:focus, select:focus, textarea:focus { border-color: #fbbf24; background: white; }
        textarea { min-height: 80px; resize: vertical; }
        
        .actions { display: flex; gap: 12px; margin-top: 30px; }
        .btn-next { flex: 2; background: #1e293b; color: white; padding: 16px; border-radius: 14px; border: none; font-weight: 700; cursor: pointer; font-size: 16px; transition: 0.2s; }
        .btn-next:hover { background: #fbbf24; color: #1e293b; }
        .btn-prev { flex: 1; background: #f1f5f9; color: #64748b; padding: 16px; border-radius: 14px; border: none; font-weight: 700; cursor: pointer; font-size: 16px; }
        .btn-later { display: block; text-align: center; color: #64748b; padding: 15px; font-weight: 600; font-size: 13px; text-decoration: none; cursor: pointer; width: 100%; }

        .checkbox-group { display: flex; align-items: center; gap: 12px; background: #fffbeb; padding: 18px; border-radius: 14px; border: 1px solid #fef3c7; }
        .checkbox-group input[type="checkbox"] { width: 20px; height: 20px; cursor: pointer; }

        /* ── Sélection du type ── */
        .type-grid { display: grid; grid-template-columns: 1fr; gap: 12px; margin-top: 10px; }
        .type-card { display: flex; align-items: center; gap: 16px; padding: 18px 20px; border: 2px solid #e2e8f0; border-radius: 16px; cursor: pointer; transition: 0.2s; background: #f8fafc; }
        .type-card:hover { border-color: #fbbf24; background: #fffbeb; }
        .type-card.selected { border-color: #1a2a6c; background: #eff6ff; }
        .type-emoji { font-size: 28px; }
        .type-info { flex: 1; }
        .type-label { font-weight: 800; font-size: 15px; color: #1e293b; }
        .type-desc { font-size: 13px; color: #64748b; margin-top: 2px; }

        /* ── Import document ── */
        .import-zone { border: 2px dashed #e2e8f0; border-radius: 16px; padding: 30px; text-align: center; cursor: pointer; transition: 0.2s; margin: 16px 0; }
        .import-zone:hover { border-color: #fbbf24; background: #fffbeb; }
        .import-zone-icon { font-size: 36px; margin-bottom: 8px; }
        .import-zone-title { font-weight: 700; color: #1e293b; font-size: 15px; }
        .import-zone-sub { color: #94a3b8; font-size: 13px; margin-top: 4px; }
        .import-divider { text-align: center; color: #94a3b8; font-size: 13px; margin: 16px 0; font-weight: 600; }
        .import-result { background: #f0fdf4; border: 1px solid #86efac; border-radius: 14px; padding: 16px; margin-top: 12px; }
        .import-result-title { font-weight: 800; color: #166534; font-size: 14px; margin-bottom: 8px; }
        .import-result-row { display: flex; justify-content: space-between; font-size: 13px; color: #15803d; }
        .btn-skip { background: none; border: none; color: #94a3b8; font-size: 13px; font-weight: 600; cursor: pointer; padding: 8px; text-decoration: underline; }
        .btn-import-analyze { background: #1a2a6c; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; width: 100%; margin-top: 8px; transition: 0.2s; }
        .btn-import-analyze:hover { background: #fbbf24; color: #1a2a6c; }
        .btn-import-analyze:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ── Sélecteur de pays ── */
        .country-selector { padding: 12px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 15px; background: #f8fafc; width: 100%; box-sizing: border-box; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: 0.2s; }
        .country-selector:hover { border-color: #fbbf24; background: white; }
        .country-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: flex-end; justify-content: center; }
        .country-modal { background: white; border-radius: 24px 24px 0 0; width: 100%; max-width: 700px; max-height: 70vh; overflow-y: auto; padding-bottom: 20px; }
        .country-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #f1f5f9; position: sticky; top: 0; background: white; }
        .country-modal-title { font-weight: 800; color: #1a2a6c; font-size: 16px; }
        .country-modal-close { background: none; border: none; font-size: 20px; cursor: pointer; color: #94a3b8; }
        .country-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 24px; cursor: pointer; border-bottom: 1px solid #f8fafc; transition: 0.15s; }
        .country-item:hover { background: #f8fafc; }
        .country-item.selected { background: #eff6ff; }
        .country-item-text { font-size: 15px; color: #1e293b; }
        .country-item-check { color: #1a2a6c; font-weight: 800; }

        /* ── Section badge ── */
        .section-badge { background: #f0f9ff; border-left: 4px solid #1a2a6c; padding: 12px 16px; border-radius: 0 12px 12px 0; margin-bottom: 20px; }
        .section-badge-title { font-weight: 800; color: #1a2a6c; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }

        @media (max-width: 600px) {
          .grid { grid-template-columns: 1fr; }
          .full { grid-column: span 1; }
          .actions { flex-direction: column; }
        }
      `}</style>

      <div className="wizard-card">
        <div className="progress-bar"><div className="progress-fill"></div></div>

        {/* ════════════════════════════════════════
            ÉTAPE 0 — CHOIX DU TYPE D'HÉBERGEMENT
        ════════════════════════════════════════ */}
        {step === 0 && (
          <div className="step">
            <h2>🎩 Bienvenue sur Alfred Major</h2>
            <p className="step-desc">Commençons par définir votre type d'hébergement. Alfred adaptera ses questions et son comportement en conséquence.</p>
            <div className="type-grid">
              {PROPERTY_TYPES.map(type => (
                <div
                  key={type.value}
                  className={`type-card ${formData.property_type === type.value ? 'selected' : ''}`}
                  onClick={() => selectType(type.value)}
                >
                  <span className="type-emoji">{type.emoji}</span>
                  <div className="type-info">
                    <div className="type-label">{type.label}</div>
                    <div className="type-desc">{type.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            ÉTAPE IMPORT — DOCUMENT EXISTANT
        ════════════════════════════════════════ */}
        {step === 'import' && (
          <div className="step">
            <h2>📄 Vous avez déjà un guide ?</h2>
            <p className="step-desc">Si vous avez un guide de bienvenue, un PDF ou un texte avec les infos de votre logement, Alfred peut le lire et pré-remplir votre configuration automatiquement.</p>

            {/* Zone drag & drop fichier */}
            <div className="import-zone" onClick={() => fileInputRef.current?.click()}>
              <div className="import-zone-icon">📎</div>
              <div className="import-zone-title">Déposer un fichier ou cliquer pour importer</div>
              <div className="import-zone-sub">PDF, Word (.docx), image ou fichier texte</div>
              <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt,.jpg,.jpeg,.png" style={{display:'none'}} onChange={handleFileUpload} />
            </div>

            <div className="import-divider">— ou coller votre texte directement —</div>

            <textarea
              placeholder="Copiez-collez ici votre guide de bienvenue, email type, ou toute description de votre logement..."
              value={pastedText}
              onChange={e => setPastedText(e.target.value)}
              style={{minHeight: '120px'}}
            />
            {pastedText.trim() && (
              <button className="btn-import-analyze" onClick={handlePastedText} disabled={importLoading}>
                {importLoading ? '⏳ Analyse en cours...' : '✨ Analyser et pré-remplir'}
              </button>
            )}

            {/* Résultat de l'import */}
            {importResult && (
              <div className="import-result">
                <div className="import-result-title">✅ Analyse terminée</div>
                <div className="import-result-row">
                  <span>Champs pré-remplis</span>
                  <span><strong>{importResult.filled}</strong></span>
                </div>
                <div className="import-result-row">
                  <span>Champs à compléter</span>
                  <span><strong>{importResult.missing}</strong></span>
                </div>
                <p style={{fontSize:'12px', color:'#166534', marginTop:'8px', marginBottom:0}}>
                  Vérifiez les informations dans le formulaire et corrigez si nécessaire.
                </p>
              </div>
            )}

            <div className="actions" style={{marginTop:'24px'}}>
              <button className="btn-prev" onClick={() => setStep(0)}>← Type</button>
              <button className="btn-next" onClick={skipImport}>
                {importResult ? 'Continuer & Vérifier →' : 'Passer cette étape →'}
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            ÉTAPE 1 — IDENTITÉ DU LOGEMENT
        ════════════════════════════════════════ */}
        {step === 1 && (
          <div className="step">
            <h2>1. Identité du logement</h2>
            <div className="grid">
              <div className="input-group full">
                <label>Nom du logement (ex: Villa Noam, Chambre Jasmin)</label>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="ex: Villa Noam" />
              </div>

              {/* Champs chambre si applicable */}
              {['riad','bnb','private_room'].includes(formData.property_type) && (
                <>
                  <div className="input-group full" style={{marginTop:'8px'}}>
                    <div className="section-badge"><div className="section-badge-title">🛏️ Identité de la chambre</div></div>
                  </div>
                  <div className="input-group full">
                    <label>Nom de la chambre (ex: Suite Atlas, Chambre Jasmin)</label>
                    <input name="room_name" value={formData.room_name} onChange={handleChange} placeholder="ex: Chambre Jasmin" />
                  </div>
                  <div className="input-group">
                    <label>Étage / Localisation dans l'établissement</label>
                    <input name="room_floor" value={formData.room_floor} onChange={handleChange} placeholder="ex: 1er étage, aile gauche" />
                  </div>
                  <div className="input-group">
                    <label>Configuration du lit</label>
                    <select name="room_bed_config" value={formData.room_bed_config} onChange={handleChange}>
                      <option value="">Choisir...</option>
                      <option value="Lit double (Queen)">Lit double (Queen)</option>
                      <option value="Lit double (King)">Lit double (King)</option>
                      <option value="2 lits simples (Twin)">2 lits simples (Twin)</option>
                      <option value="Lit simple">Lit simple</option>
                      <option value="Suite avec salon">Suite avec salon</option>
                    </select>
                  </div>
                  <div className="input-group full">
                    <label>Vue depuis la chambre</label>
                    <input name="room_view" value={formData.room_view} onChange={handleChange} placeholder="ex: Vue sur le patio, Vue sur la mer..." />
                  </div>
                </>
              )}

              {/* Pays + adresse */}
              <div className="input-group full" style={{marginTop:'8px'}}>
                <div className="section-badge"><div className="section-badge-title">📍 Adresse</div></div>
              </div>
              <div className="input-group full">
                <label>Pays</label>
                <button type="button" className="country-selector" onClick={() => setShowCountryPicker(true)}>
                  <span>{selectedCountry.flag} {selectedCountry.name}</span>
                  <span>▼</span>
                </button>
              </div>
              {addressFormat.fields.map(field => (
                <div key={field} className={`input-group ${['address', 'address_complement'].includes(field) ? 'full' : ''}`}>
                  <label>{addressFormat.labels[field]}</label>
                  <input name={field} value={formData[field] || ''} onChange={handleChange} placeholder={addressFormat.placeholders[field]} />
                </div>
              ))}
              <div className="input-group"><label>Étage</label><input name="floor" value={formData.floor} onChange={handleChange} placeholder="ex: 3ème étage" /></div>
              <div className="input-group"><label>Bâtiment</label><input name="building" value={formData.building} onChange={handleChange} placeholder="ex: Bâtiment B" /></div>

              {/* ── iCal Sync ── */}
              <div className="input-group full" style={{marginTop:'8px'}}>
                <div className="section-badge"><div className="section-badge-title">📅 Synchronisation calendrier</div></div>
              </div>
              <div className="input-group full">
                <label>Lien iCal Airbnb / Booking (optionnel)</label>
                <input
                  name="ical_url"
                  value={formData.ical_url || ''}
                  onChange={handleChange}
                  placeholder="ex: https://www.airbnb.fr/calendar/ical/XXXXX.ics"
                />
                <span style={{fontSize:'12px', color:'#94a3b8', marginTop:'4px', display:'block'}}>
                  Airbnb → Calendrier → Exporter → Copier le lien .ics · Même chose sur Booking.com
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            ÉTAPE 2 — ACCÈS & ARRIVÉE
        ════════════════════════════════════════ */}
        {step === 2 && (
          <div className="step">
            <h2>2. Accès & Arrivée</h2>
            <div className="grid">
              <div className="input-group"><label>Arrivée dès</label><input type="time" name="check_in_hour" value={formData.check_in_hour} onChange={handleChange} /></div>
              <div className="input-group"><label>Départ avant</label><input type="time" name="check_out_hour" value={formData.check_out_hour} onChange={handleChange} /></div>
              <div className="input-group full">
                <div className="checkbox-group">
                  <input type="checkbox" name="self_checkin" id="self_checkin" checked={formData.self_checkin} onChange={handleChange} />
                  <label htmlFor="self_checkin" style={{margin:0, color:'#92400e'}}>Activer l'arrivée autonome pour les voyageurs</label>
                </div>
              </div>
              {formData.self_checkin && (
                <>
                  <div className="input-group">
                    <label>Type de dispositif</label>
                    <select name="entrance_type" value={formData.entrance_type} onChange={handleChange}>
                      <option value="Boîte à clés">Boîte à clés</option>
                      <option value="Serrure Connectée">Serrure Connectée</option>
                      <option value="Digicode">Digicode</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Code d'accès</label>
                    <input name="key_code" value={formData.key_code} onChange={handleChange} inputMode="numeric" />
                  </div>
                </>
              )}
              <div className="input-group full"><label>Parking</label><textarea name="parking_info" value={formData.parking_info} onChange={handleChange} /></div>
              <div className="input-group full"><label>Lien GPS</label><input name="gps_link" value={formData.gps_link} onChange={handleChange} /></div>
              <div className="input-group full"><label>Instructions précises d'accès</label><textarea name="checkin_instructions" value={formData.checkin_instructions} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            ÉTAPE 3 — WIFI & CONFORT
        ════════════════════════════════════════ */}
        {step === 3 && (
          <div className="step">
            <h2>3. WiFi & Confort</h2>
            <div className="grid">
              <div className="input-group"><label>Nom du WiFi</label><input name="wifi_name" value={formData.wifi_name} onChange={handleChange} /></div>
              <div className="input-group"><label>Mot de passe</label><input name="wifi_password" value={formData.wifi_password} onChange={handleChange} /></div>
              <div className="input-group full"><label>Chauffage / Climatisation</label><textarea name="heating_cooling_info" value={formData.heating_cooling_info} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            ÉTAPE 4 — ENTRETIEN & SÉCURITÉ
        ════════════════════════════════════════ */}
        {step === 4 && (
          <div className="step">
            <h2>4. Entretien & Sécurité</h2>
            <div className="grid">
              <div className="input-group full"><label>Poubelles & Tri sélectif</label><textarea name="trash_instructions" value={formData.trash_instructions} onChange={handleChange} /></div>
              <div className="input-group"><label>Tableau électrique</label><input name="breaker_box_location" value={formData.breaker_box_location} onChange={handleChange} /></div>
              <div className="input-group"><label>Vanne d'eau principale</label><input name="water_shutoff_location" value={formData.water_shutoff_location} onChange={handleChange} /></div>
              <div className="input-group full"><label>Urgences & Santé</label><textarea name="health_emergency_info" value={formData.health_emergency_info} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {/* ÉTAPE 5 — GUIDE LOCAL */}
        {step === 5 && (
          <div className="step">
            <h2>5. Guide Local</h2>
            <div className="grid">
              <div className="input-group full"><label>Bonnes adresses & Recommandations</label><textarea name="recommendations" value={formData.recommendations} onChange={handleChange} /></div>
              <div className="input-group"><label>Transports</label><input name="transport_info" value={formData.transport_info} onChange={handleChange} /></div>
              <div className="input-group"><label>Commerces de proximité</label><input name="local_shops" value={formData.local_shops} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {/* ÉTAPE 6 — DÉPART */}
        {step === 6 && (
          <div className="step">
            <h2>6. Départ & Avis</h2>
            <div className="grid">
              <div className="input-group full"><label>Consignes de départ</label><textarea name="checkout_instructions" value={formData.checkout_instructions} onChange={handleChange} /></div>
              <div className="input-group"><label>Retour des clés</label><input name="key_return_details" value={formData.key_return_details} onChange={handleChange} /></div>
              <div className="input-group full"><label>Lien pour laisser un avis</label><input name="review_link" value={formData.review_link} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {/* ÉTAPE 7 — APPAREILS */}
        {step === 7 && (
          <div className="step">
            <h2>7. Divertissement & Appareils</h2>
            <div className="grid">
              <div className="input-group full"><label>TV & Streaming</label><textarea name="tv_manual" value={formData.tv_manual} onChange={handleChange} /></div>
              <div className="input-group full"><label>Électroménager</label><textarea name="appliances_instructions" value={formData.appliances_instructions} onChange={handleChange} /></div>
              <div className="input-group"><label>Audio</label><input name="music_system" value={formData.music_system} onChange={handleChange} /></div>
              <div className="input-group"><label>Jeux disponibles</label><input name="games_available" value={formData.games_available} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {/* ÉTAPE 8 — INVENTAIRE */}
        {step === 8 && (
          <div className="step">
            <h2>8. Inventaire & Linge</h2>
            <div className="grid">
              <div className="input-group full"><label>Emplacement des recharges</label><textarea name="consumables_location" value={formData.consumables_location} onChange={handleChange} /></div>
              <div className="input-group"><label>Produits de base fournis</label><input name="pantry_basics" value={formData.pantry_basics} onChange={handleChange} /></div>
              <div className="input-group"><label>Lave-linge & Repassage</label><input name="laundry_iron_info" value={formData.laundry_iron_info} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {/* ÉTAPE 9 — PARTICULARITÉS */}
        {step === 9 && (
          <div className="step">
            <h2>9. Particularités</h2>
            <div className="grid">
              <div className="input-group full"><label>Spécificités du logement à connaître</label><textarea name="property_quirks" value={formData.property_quirks} onChange={handleChange} /></div>
              <div className="input-group full"><label>Nuisances du quartier</label><input name="neighborhood_nuisances" value={formData.neighborhood_nuisances} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {/* ÉTAPE 10 — RÈGLES */}
        {step === 10 && (
          <div className="step">
            <h2>10. Familles, Règles & Taxes</h2>
            <div className="grid">
              <div className="input-group full"><label>Équipements bébé</label><input name="baby_equipment" value={formData.baby_equipment} onChange={handleChange} /></div>
              <div className="input-group full"><label>Règles de vie</label><textarea name="noise_rules" value={formData.noise_rules} onChange={handleChange} /></div>
              <div className="input-group"><label>Animaux acceptés</label>
                <select name="pet_policy" value={formData.pet_policy} onChange={handleChange}>
                  <option value="Non">Non</option>
                  <option value="Oui">Oui</option>
                  <option value="Sur demande">Sur demande</option>
                </select>
              </div>
              <div className="input-group"><label>Taxe de séjour</label><input name="tourist_tax_info" value={formData.tourist_tax_info} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            ÉTAPES CONDITIONNELLES
        ════════════════════════════════════════ */}

        {/* COHABITATION — private_room */}
        {step === 'cohabitation' && (
          <div className="step">
            <h2>🏠 Cohabitation</h2>
            <p className="step-desc">Informations sur la vie partagée avec l'hôte et les espaces communs.</p>
            <div className="grid">
              <div className="input-group full">
                <div className="checkbox-group">
                  <input type="checkbox" name="host_on_site" id="host_on_site" checked={formData.host_on_site} onChange={handleChange} />
                  <label htmlFor="host_on_site" style={{margin:0, color:'#92400e'}}>L'hôte est présent pendant le séjour</label>
                </div>
              </div>
              {formData.host_on_site && (
                <>
                  <div className="input-group"><label>Prénom de l'hôte & langues parlées</label><input name="host_name_onsite" value={formData.host_name_onsite} onChange={handleChange} placeholder="ex: Marie, parle français et anglais" /></div>
                  <div className="input-group"><label>Comment contacter l'hôte sur place</label><input name="host_contact_onsite" value={formData.host_contact_onsite} onChange={handleChange} placeholder="ex: Frapper à la porte du salon" /></div>
                  <div className="input-group full"><label>Horaires de disponibilité</label><input name="host_availability_hours" value={formData.host_availability_hours} onChange={handleChange} placeholder="ex: 8h-22h" /></div>
                </>
              )}
              <div className="input-group full"><label>Espaces partagés avec le voyageur</label><textarea name="shared_spaces" value={formData.shared_spaces} onChange={handleChange} placeholder="ex: Cuisine, salon, salle de bain du couloir" /></div>
              <div className="input-group full"><label>Règles des espaces partagés</label><textarea name="shared_spaces_rules" value={formData.shared_spaces_rules} onChange={handleChange} placeholder="ex: Cuisine accessible jusqu'à 22h, merci de laisser propre" /></div>
              <div className="input-group full"><label>Règles cuisine partagée</label><textarea name="shared_kitchen_rules" value={formData.shared_kitchen_rules} onChange={handleChange} placeholder="ex: Frigo partagé, étagère du bas réservée aux voyageurs" /></div>
              <div className="input-group full"><label>Salle de bain (privée ou partagée)</label><input name="bathroom_type" value={formData.bathroom_type} onChange={handleChange} placeholder="ex: Salle de bain partagée avec 1 autre chambre" /></div>
              <div className="input-group"><label>Serviettes fournies</label><input name="towels_provided" value={formData.towels_provided} onChange={handleChange} placeholder="ex: 2 serviettes fournies" /></div>
              <div className="input-group"><label>Invités extérieurs autorisés ?</label><input name="guests_policy" value={formData.guests_policy} onChange={handleChange} placeholder="ex: Non autorisés sans accord préalable" /></div>
              <div className="input-group full"><label>Autres voyageurs présents en même temps ?</label><input name="other_guests_info" value={formData.other_guests_info} onChange={handleChange} placeholder="ex: Possible, max 1 autre chambre louée simultanément" /></div>
            </div>
          </div>
        )}

        {/* PETIT-DÉJEUNER — riad, bnb, private_room */}
        {step === 'breakfast' && (
          <div className="step">
            <h2>☕ Petit-déjeuner</h2>
            <p className="step-desc">C'est souvent la première question des voyageurs dans un B&B ou un riad.</p>
            <div className="grid">
              <div className="input-group full">
                <div className="checkbox-group">
                  <input type="checkbox" name="breakfast_included" id="breakfast_included" checked={formData.breakfast_included} onChange={handleChange} />
                  <label htmlFor="breakfast_included" style={{margin:0, color:'#92400e'}}>Petit-déjeuner inclus dans le tarif</label>
                </div>
              </div>
              <div className="input-group"><label>Horaires (début et fin)</label><input name="breakfast_hours" value={formData.breakfast_hours} onChange={handleChange} placeholder="ex: 7h30 — 10h00" /></div>
              <div className="input-group"><label>Lieu de service</label><input name="breakfast_location" value={formData.breakfast_location} onChange={handleChange} placeholder="ex: Salle à manger, terrasse, patio..." /></div>
              <div className="input-group full"><label>Composition du petit-déjeuner</label><textarea name="breakfast_details" value={formData.breakfast_details} onChange={handleChange} placeholder="ex: Buffet continental : viennoiseries, fruits, fromages, jus frais..." /></div>
              <div className="input-group full">
                <div className="checkbox-group">
                  <input type="checkbox" name="breakfast_reservation_required" id="breakfast_reservation_required" checked={formData.breakfast_reservation_required} onChange={handleChange} />
                  <label htmlFor="breakfast_reservation_required" style={{margin:0, color:'#92400e'}}>Réservation la veille obligatoire</label>
                </div>
              </div>
              <div className="input-group full"><label>Allergies & régimes alimentaires gérés</label><input name="breakfast_dietary_info" value={formData.breakfast_dietary_info} onChange={handleChange} placeholder="ex: Sans gluten sur demande, options végétariennes disponibles" /></div>
              <div className="input-group full"><label>Petit-déjeuner en chambre (supplément)</label><input name="breakfast_in_room" value={formData.breakfast_in_room} onChange={handleChange} placeholder="ex: Disponible pour +8€, à commander la veille" /></div>
            </div>
          </div>
        )}

        {/* DÎNER & RESTAURATION — riad, bnb */}
        {step === 'dinner' && (
          <div className="step">
            <h2>🍽️ Restauration sur place</h2>
            <div className="grid">
              <div className="input-group full">
                <div className="checkbox-group">
                  <input type="checkbox" name="dinner_available" id="dinner_available" checked={formData.dinner_available} onChange={handleChange} />
                  <label htmlFor="dinner_available" style={{margin:0, color:'#92400e'}}>Table d'hôtes le soir disponible</label>
                </div>
              </div>
              {formData.dinner_available && (
                <div className="input-group full"><label>Détails (horaires, menu, prix, réservation)</label><textarea name="dinner_details" value={formData.dinner_details} onChange={handleChange} placeholder="ex: Dîner à 19h30, menu unique à 25€, réservation obligatoire avant 12h" /></div>
              )}
              <div className="input-group full">
                <div className="checkbox-group">
                  <input type="checkbox" name="room_service_available" id="room_service_available" checked={formData.room_service_available} onChange={handleChange} />
                  <label htmlFor="room_service_available" style={{margin:0, color:'#92400e'}}>Room service disponible</label>
                </div>
              </div>
              <div className="input-group full">
                <div className="checkbox-group">
                  <input type="checkbox" name="alcohol_available" id="alcohol_available" checked={formData.alcohol_available} onChange={handleChange} />
                  <label htmlFor="alcohol_available" style={{margin:0, color:'#92400e'}}>Boissons alcoolisées disponibles</label>
                </div>
              </div>
              <div className="input-group full"><label>Options alimentaires spéciales</label><input name="dietary_options" value={formData.dietary_options} onChange={handleChange} placeholder="ex: Cuisine halal, végétarienne sur demande" /></div>
            </div>
          </div>
        )}

        {/* SERVICES INCLUS — riad, bnb */}
        {step === 'services' && (
          <div className="step">
            <h2>🧹 Services inclus</h2>
            <div className="grid">
              <div className="input-group"><label>Ménage (fréquence)</label>
                <select name="housekeeping_frequency" value={formData.housekeeping_frequency} onChange={handleChange}>
                  <option value="">Choisir...</option>
                  <option value="Quotidien">Quotidien</option>
                  <option value="Tous les 2 jours">Tous les 2 jours</option>
                  <option value="Sur demande">Sur demande</option>
                  <option value="Non inclus">Non inclus</option>
                </select>
              </div>
              <div className="input-group"><label>Heure de passage du ménage</label><input name="housekeeping_time" value={formData.housekeeping_time} onChange={handleChange} placeholder="ex: Entre 10h et 12h" /></div>
              <div className="input-group"><label>Changement serviettes</label><input name="towel_change_frequency" value={formData.towel_change_frequency} onChange={handleChange} placeholder="ex: Tous les 2 jours" /></div>
              <div className="input-group"><label>Changement draps</label><input name="linen_change_frequency" value={formData.linen_change_frequency} onChange={handleChange} placeholder="ex: Tous les 3 jours" /></div>
              <div className="input-group full"><label>Blanchisserie sur place</label><input name="laundry_service" value={formData.laundry_service} onChange={handleChange} placeholder="ex: Disponible, délai 24h, tarif 10€/kg" /></div>
              <div className="input-group full"><label>Repassage sur demande</label><input name="ironing_service" value={formData.ironing_service} onChange={handleChange} placeholder="ex: Disponible, délai 2h, gratuit" /></div>
            </div>
          </div>
        )}

        {/* RÉCEPTION — riad, bnb */}
        {step === 'reception' && (
          <div className="step">
            <h2>🛎️ Réception & Équipe</h2>
            <div className="grid">
              <div className="input-group full">
                <div className="checkbox-group">
                  <input type="checkbox" name="has_reception" id="has_reception" checked={formData.has_reception} onChange={handleChange} />
                  <label htmlFor="has_reception" style={{margin:0, color:'#92400e'}}>L'établissement dispose d'une réception physique</label>
                </div>
              </div>
              {formData.has_reception && (
                <div className="input-group full"><label>Horaires de la réception</label><input name="reception_hours" value={formData.reception_hours} onChange={handleChange} placeholder="ex: 7h — 22h tous les jours" /></div>
              )}
              <div className="input-group full"><label>Procédure si arrivée hors horaires</label><textarea name="late_checkin_procedure" value={formData.late_checkin_procedure} onChange={handleChange} placeholder="ex: Appeler le 06 XX XX XX XX, une clé est déposée dans la boîte..." /></div>
              <div className="input-group"><label>Prénom du responsable / accueil</label><input name="staff_name" value={formData.staff_name} onChange={handleChange} placeholder="ex: Fatima, Ahmed..." /></div>
              <div className="input-group"><label>Langues parlées par l'équipe</label><input name="staff_languages" value={formData.staff_languages} onChange={handleChange} placeholder="ex: Français, anglais, arabe" /></div>
            </div>
          </div>
        )}

        {/* ESPACES COMMUNS — riad, bnb, gite */}
        {step === 'common_spaces' && (
          <div className="step">
            <h2>🏊 Espaces communs</h2>
            <p className="step-desc">Renseignez uniquement les espaces disponibles dans votre établissement.</p>
            <div className="grid">
              <div className="input-group full"><label>Piscine</label><textarea name="pool_info" value={formData.pool_info} onChange={handleChange} placeholder="ex: Piscine chauffée, ouverte de 8h à 20h, serviettes fournies" /></div>
              <div className="input-group full"><label>Hammam</label><textarea name="hammam_info" value={formData.hammam_info} onChange={handleChange} placeholder="ex: Hammam privatif inclus, réservation à la réception, sessions 30 min" /></div>
              <div className="input-group full"><label>Spa & Massages</label><textarea name="spa_info" value={formData.spa_info} onChange={handleChange} placeholder="ex: Massages disponibles sur réservation, tarifs à partir de 40€/h" /></div>
              <div className="input-group full"><label>Terrasse / Rooftop</label><textarea name="rooftop_info" value={formData.rooftop_info} onChange={handleChange} placeholder="ex: Terrasse ouverte jusqu'à 23h, zone fumeurs autorisée" /></div>
              <div className="input-group full"><label>Patio / Jardin intérieur</label><textarea name="patio_info" value={formData.patio_info} onChange={handleChange} placeholder="ex: Patio accessible toute la journée, fontaine centrale" /></div>
              <div className="input-group full"><label>Salon commun</label><textarea name="common_lounge_info" value={formData.common_lounge_info} onChange={handleChange} placeholder="ex: Salon avec TV, bibliothèque, ouvert 24h/24" /></div>
              <div className="input-group full"><label>Jacuzzi</label><input name="jacuzzi_info" value={formData.jacuzzi_info} onChange={handleChange} placeholder="ex: Jacuzzi extérieur, sur réservation, 45 min max" /></div>
              <div className="input-group full"><label>Salle de sport</label><input name="gym_info" value={formData.gym_info} onChange={handleChange} /></div>
              <div className="input-group full"><label>Jeux extérieurs</label><input name="outdoor_games" value={formData.outdoor_games} onChange={handleChange} placeholder="ex: Terrain de pétanque, ping-pong" /></div>
              <div className="input-group full"><label>Règles générales des espaces communs</label><textarea name="common_areas_rules" value={formData.common_areas_rules} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {/* SERVICES ADDITIONNELS — riad, bnb, gite */}
        {step === 'extras' && (
          <div className="step">
            <h2>✨ Services additionnels</h2>
            <div className="grid">
              <div className="input-group full"><label>Transfert aéroport / gare</label><input name="airport_transfer" value={formData.airport_transfer} onChange={handleChange} placeholder="ex: Disponible, 25€ jusqu'à l'aéroport, à réserver 24h à l'avance" /></div>
              <div className="input-group full"><label>Taxi de confiance (numéro direct)</label><input name="trusted_taxi" value={formData.trusted_taxi} onChange={handleChange} placeholder="ex: Karim Taxi : +212 6XX XX XX XX" /></div>
              <div className="input-group full"><label>Location de vélos / scooters</label><input name="bike_rental" value={formData.bike_rental} onChange={handleChange} placeholder="ex: Vélos disponibles sur place, 10€/jour" /></div>
              <div className="input-group full"><label>Vélos mis à disposition gratuitement</label><input name="bikes_info" value={formData.bikes_info} onChange={handleChange} placeholder="ex: 2 vélos avec cadenas, casques dans le local" /></div>
              <div className="input-group full"><label>Excursions organisées</label><textarea name="excursions_info" value={formData.excursions_info} onChange={handleChange} placeholder="ex: Excursion désert d'Agafay, journée dès 60€/pers, sur réservation" /></div>
              <div className="input-group full"><label>Guide local recommandé</label><input name="local_guide_info" value={formData.local_guide_info} onChange={handleChange} /></div>
              <div className="input-group full"><label>Coffre-fort en chambre</label><input name="safe_info" value={formData.safe_info} onChange={handleChange} placeholder="ex: Coffre numérique sous le bureau, capacité ordinateur 15 pouces" /></div>
              <div className="input-group full"><label>Blanchisserie externe recommandée</label><input name="external_laundry" value={formData.external_laundry} onChange={handleChange} /></div>
            </div>
          </div>
        )}

        {/* GÎTE RURAL — gite uniquement */}
        {step === 'gite_rural' && (
          <div className="step">
            <h2>🌿 Spécificités du gîte</h2>
            <p className="step-desc">Informations importantes pour les voyageurs en zone rurale.</p>
            <div className="grid">
              <div className="input-group full"><label>Barbecue</label><input name="bbq_info" value={formData.bbq_info} onChange={handleChange} placeholder="ex: BBQ gaz sur la terrasse, bouteille fournie, merci de nettoyer" /></div>
              <div className="input-group full"><label>Code / télécommande du portail</label><input name="gate_code" value={formData.gate_code} onChange={handleChange} /></div>
              <div className="input-group full"><label>Consignes fosse septique</label><textarea name="septic_tank_rules" value={formData.septic_tank_rules} onChange={handleChange} placeholder="ex: Ne pas jeter lingettes, huile, médicaments. Uniquement papier toilette biodégradable." /></div>
              <div className="input-group full"><label>Volets / persiennes</label><input name="shutters_info" value={formData.shutters_info} onChange={handleChange} placeholder="ex: Volets électriques, télécommande sur la table de nuit" /></div>
              <div className="input-group full"><label>Jardin & dépendances</label><textarea name="garden_info" value={formData.garden_info} onChange={handleChange} /></div>
              <div className="input-group full">
                <div className="section-badge"><div className="section-badge-title">🛒 Commerces & services à proximité</div></div>
              </div>
              <div className="input-group full"><label>Supermarché le plus proche</label><input name="nearest_supermarket" value={formData.nearest_supermarket} onChange={handleChange} placeholder="ex: Intermarché Saint-Gilles, 4 km, ouvert 8h30-19h30" /></div>
              <div className="input-group full"><label>Boulangerie</label><input name="nearest_bakery" value={formData.nearest_bakery} onChange={handleChange} placeholder="ex: Boulangerie du Village, 2 km, fermée le lundi" /></div>
              <div className="input-group"><label>Station-service</label><input name="nearest_gas_station" value={formData.nearest_gas_station} onChange={handleChange} /></div>
              <div className="input-group"><label>Déchetterie</label><input name="nearest_recycling" value={formData.nearest_recycling} onChange={handleChange} /></div>
              <div className="input-group full"><label>Marché local (jour et lieu)</label><input name="local_market_info" value={formData.local_market_info} onChange={handleChange} placeholder="ex: Marché de Moustiers le samedi matin" /></div>
              <div className="input-group full">
                <div className="section-badge"><div className="section-badge-title">🥾 Activités nature</div></div>
              </div>
              <div className="input-group full"><label>Randonnées recommandées</label><textarea name="hiking_info" value={formData.hiking_info} onChange={handleChange} placeholder="ex: Sentier du Moulin (2h, facile), départ à 500m du gîte" /></div>
              <div className="input-group full"><label>Activités nature (lacs, vélo, équitation...)</label><textarea name="nature_activities" value={formData.nature_activities} onChange={handleChange} /></div>
              <div className="input-group full"><label>Règles feux de camp</label><input name="fire_rules" value={formData.fire_rules} onChange={handleChange} placeholder="ex: Feux interdits du 15 juin au 15 septembre (arrêté préfectoral)" /></div>
              <div className="input-group full"><label>Voisin de confiance (urgences)</label><input name="neighbor_emergency_contact" value={formData.neighbor_emergency_contact} onChange={handleChange} placeholder="ex: Jean-Pierre (voisin) : 06 XX XX XX XX" /></div>
            </div>
          </div>
        )}

        {/* MÉDINA — riad uniquement */}
        {step === 'medina' && (
          <div className="step">
            <h2>🕌 Médina & Contexte local</h2>
            <p className="step-desc">Informations essentielles pour les voyageurs dans un riad en médina.</p>
            <div className="grid">
              <div className="input-group full"><label>Instructions pour trouver le riad dans la médina</label><textarea name="medina_directions" value={formData.medina_directions} onChange={handleChange} placeholder="ex: Prendre un taxi jusqu'à Bab Doukkala, puis appeler à l'arrivée. Le riad ne figure pas sur Google Maps. Coordonnées GPS : 31.6295, -7.9811" /></div>
              <div className="input-group full"><label>Point de rendez-vous pour les taxis</label><input name="taxi_meeting_point" value={formData.taxi_meeting_point} onChange={handleChange} placeholder="ex: Place Jemaa el-Fna, côté fontaine — les voitures ne rentrent pas dans la médina" /></div>
              <div className="input-group full"><label>Conseils vestimentaires</label><input name="dress_code_info" value={formData.dress_code_info} onChange={handleChange} placeholder="ex: Épaules et genoux couverts recommandés dans la médina" /></div>
              <div className="input-group"><label>Horaires des souks</label><input name="souk_hours" value={formData.souk_hours} onChange={handleChange} placeholder="ex: 9h — 20h, fermeture le vendredi midi" /></div>
              <div className="input-group"><label>Mosquée voisine (appels à la prière)</label><input name="mosque_info" value={formData.mosque_info} onChange={handleChange} placeholder="ex: Mosquée à 50m, premier appel à 5h15 en été" /></div>
              <div className="input-group full"><label>Zones à éviter / conseils de sécurité</label><textarea name="safety_tips" value={formData.safety_tips} onChange={handleChange} /></div>
              <div className="input-group full">
                <div className="section-badge"><div className="section-badge-title">⚡ Urgences spécifiques</div></div>
              </div>
              <div className="input-group full"><label>Générateur (coupures de courant fréquentes)</label><input name="generator_info" value={formData.generator_info} onChange={handleChange} placeholder="ex: Générateur automatique, s'enclenche après 30 secondes de coupure" /></div>
              <div className="input-group full"><label>Réserve d'eau</label><input name="water_reserve_info" value={formData.water_reserve_info} onChange={handleChange} /></div>
              <div className="input-group full"><label>Contacts urgence locaux</label><textarea name="local_emergency_contacts" value={formData.local_emergency_contacts} onChange={handleChange} placeholder="ex: Police : 19 · SAMU : 15 · Pompiers : 15 · Hôpital Ibn Tofail : 0524 33 89 12" /></div>
              <div className="input-group full"><label>Pharmacie de garde</label><input name="pharmacy_on_call" value={formData.pharmacy_on_call} onChange={handleChange} placeholder="ex: Pharmacie Centrale Medina, Rue Bab Agnaou — ouverte jusqu'à 23h" /></div>
            </div>
          </div>
        )}

        {/* ── Boutons de navigation (sauf étapes 0 et import) ── */}
        {step !== 0 && step !== 'import' && (
          <>
            <div className="actions">
              <button className="btn-prev" onClick={goPrev}>← Retour</button>
              <button className="btn-next" onClick={() => saveProgress(isLastStep)}>
                {loading ? 'Sauvegarde...' : isLastStep ? '✅ Terminer & Publier' : 'Continuer →'}
              </button>
            </div>
            <Link href="/dashboard" legacyBehavior>
              <a className="btn-later">Enregistrer et terminer plus tard</a>
            </Link>
          </>
        )}
      </div>

      {/* ── Modal sélecteur de pays ── */}
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
