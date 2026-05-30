// pages/property/[id].js
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

export default function PropertySpecs() {
  const router = useRouter();
  const { id } = router.query;
  const [property, setProperty] = useState(null);

  // ── MÉNAGE ──
  const [cleaningConfig, setCleaningConfig] = useState(null);
  const [cleaningProvider, setCleaningProvider] = useState(null);
  const [providerName, setProviderName] = useState('');
  const [providerTelegram, setProviderTelegram] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [checklist, setChecklist] = useState([]);
  const [savingCleaning, setSavingCleaning] = useState(false);
  const [cleaningStatus, setCleaningStatus] = useState(null);

  useEffect(() => {
    if (id) {
      fetchProperty();
      fetchCleaningConfig();
    }
  }, [id]);

  const fetchProperty = async () => {
    const { data } = await supabase.from('properties').select('*').eq('id', id).single();
    setProperty(data);
  };

  const fetchCleaningConfig = async () => {
    const { data: config } = await supabase
      .from('property_cleaning')
      .select('*, cleaning_providers(*)')
      .eq('property_id', id)
      .maybeSingle();

    if (config) {
      setCleaningConfig(config);
      setChecklist(config.checklist || []);
      if (config.cleaning_providers) {
        setCleaningProvider(config.cleaning_providers);
        setProviderName(config.cleaning_providers.name || '');
        setProviderTelegram(config.cleaning_providers.telegram_chat_id || '');
      }
    }

    // Statut du dernier ménage
    const res = await fetch(`/api/cleaning/status?propertyId=${id}`);
    const statusData = await res.json();
    setCleaningStatus(statusData);
  };

  const saveCleaning = async () => {
    setSavingCleaning(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let providerId = cleaningProvider?.id;

      if (providerId) {
        await supabase.from('cleaning_providers').update({
          name: providerName,
          telegram_chat_id: providerTelegram,
        }).eq('id', providerId);
      } else {
        const { data: newProvider } = await supabase
          .from('cleaning_providers')
          .insert({ owner_id: user.id, name: providerName, telegram_chat_id: providerTelegram })
          .select()
          .single();
        providerId = newProvider.id;
        setCleaningProvider(newProvider);
      }

      await supabase.from('property_cleaning').upsert({
        property_id: id,
        provider_id: providerId,
        checklist,
      }, { onConflict: 'property_id' });

      alert('✅ Configuration ménage sauvegardée !');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la sauvegarde.');
    } finally {
      setSavingCleaning(false);
    }
  };

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    setChecklist(prev => [...prev, newChecklistItem.trim()]);
    setNewChecklistItem('');
  };

  const removeChecklistItem = (index) => {
    setChecklist(prev => prev.filter((_, i) => i !== index));
  };

  const triggerCleaning = async () => {
    if (!cleaningConfig) {
      alert('Configurez d\'abord un prestataire de ménage.');
      return;
    }
    try {
      await fetch('/api/cleaning/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: id }),
      });
      alert('✅ Prestataire notifié !');
      fetchCleaningConfig();
    } catch (err) {
      alert('Erreur lors de la notification.');
    }
  };

  if (!property) return null;

  const DataItem = ({ label, value, fullWidth }) => (
    <div className="data-item" style={{ gridColumn: fullWidth ? 'span 2' : 'auto' }}>
      <label>{label}</label>
      <p>{value ? value : <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>Non renseigné</span>}</p>
    </div>
  );

  const statusColors = {
    pending: { bg: '#fff7ed', border: '#f97316', color: '#c2410c', label: '🔴 En attente' },
    in_progress: { bg: '#eff6ff', border: '#3b82f6', color: '#1d4ed8', label: '🟡 En cours' },
    completed: { bg: '#f0fdf4', border: '#22c55e', color: '#15803d', label: '🟢 Terminé' },
  };
  const currentStatus = cleaningStatus?.status ? statusColors[cleaningStatus.status] : null;

  return (
    <div className="specs-container">
      <style jsx global>{`
        body { margin: 0; background: #f8fafc; font-family: 'Inter', sans-serif; }
        a { text-decoration: none; }
      `}</style>
      <style jsx>{`
        .specs-container { min-height: 100vh; }
        nav { background: #1a2a6c; color: white; padding: 15px 30px; display: flex; align-items: center; gap: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .back-link { color: white !important; font-size: 14px; opacity: 0.8; transition: 0.2s; font-weight: 600; }
        .back-link:hover { opacity: 1; text-decoration: underline; }
        h1 { font-size: 20px; margin: 0; font-weight: 800; border-left: 2px solid rgba(255,255,255,0.2); padding-left: 20px; }
        main { max-width: 1100px; margin: 40px auto; padding: 0 20px; display: grid; grid-template-columns: 2fr 1fr; gap: 30px; align-items: start; }
        .left-col { display: flex; flex-direction: column; gap: 25px; }
        .section { background: white; padding: 30px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
        h2 { font-size: 18px; color: #1a2a6c; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-top: 0; margin-bottom: 20px; font-weight: 800; display: flex; align-items: center; gap: 10px; }
        .data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .data-item label { display: block; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        .data-item p { margin: 6px 0 0; font-size: 15px; color: #1e293b; font-weight: 500; line-height: 1.5; white-space: pre-wrap; }
        .right-col { display: flex; flex-direction: column; gap: 20px; position: sticky; top: 40px; }
        .stat-card { background: #1a2a6c; color: white; padding: 30px; border-radius: 24px; text-align: center; box-shadow: 0 10px 15px -3px rgba(26,42,108,0.3); }
        .stat-value { font-size: 36px; font-weight: 900; display: block; color: #fbbf24; margin: 10px 0; }
        .stat-label { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9; }
        .btn-edit { background: #fbbf24; color: #1a2a6c !important; padding: 16px; border-radius: 16px; font-weight: 800; font-size: 15px; text-align: center; display: block; box-shadow: 0 4px 6px rgba(251,191,36,0.3); transition: 0.2s; }
        .btn-edit:hover { transform: translateY(-3px); }
        input { font-family: 'Inter', sans-serif; }
        @media (max-width: 900px) {
          main { grid-template-columns: 1fr; }
          .right-col { position: static; }
          .data-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <nav>
        <Link href="/dashboard" passHref legacyBehavior>
          <a className="back-link">← Retour Dashboard</a>
        </Link>
        <h1>{property.name}</h1>
      </nav>

      <main>
        <div className="left-col">

          <div className="section">
            <h2>📍 Identité & Localisation</h2>
            <div className="data-grid">
              <DataItem label="Adresse" value={`${property.street_number || ''} ${property.address || ''}`} fullWidth />
              <DataItem label="Complément" value={property.address_complement} fullWidth />
              <DataItem label="Ville" value={property.city} />
              <DataItem label="Bâtiment / Étage" value={`${property.building || ''} ${property.floor ? `- Étage ${property.floor}` : ''}`} />
            </div>
          </div>

          <div className="section">
            <h2>🔑 Accès & Arrivée</h2>
            <div className="data-grid">
              <DataItem label="Check-in" value={`Dès ${property.check_in_hour}`} />
              <DataItem label="Check-out" value={`Avant ${property.check_out_hour}`} />
              <DataItem label="Arrivée autonome" value={property.self_checkin ? "✅ Oui" : "❌ Non"} />
              {property.self_checkin && (
                <>
                  <DataItem label="Type de dispositif" value={property.entrance_type} />
                  <DataItem label="Code d'accès" value={property.key_code} />
                </>
              )}
              <DataItem label="Parking" value={property.parking_info} fullWidth />
              <DataItem label="Lien GPS" value={property.gps_link} fullWidth />
              <DataItem label="Instructions d'entrée" value={property.checkin_instructions} fullWidth />
            </div>
          </div>

          <div className="section">
            <h2>📡 Wifi & Confort</h2>
            <div className="data-grid">
              <DataItem label="Nom du réseau (SSID)" value={property.wifi_name} />
              <DataItem label="Mot de passe" value={property.wifi_password} />
              <DataItem label="Chauffage / Climatisation" value={property.heating_cooling_info} fullWidth />
            </div>
          </div>

          <div className="section">
            <h2>🛠️ Technique & Entretien</h2>
            <div className="data-grid">
              <DataItem label="Tableau électrique" value={property.breaker_box_location} />
              <DataItem label="Vanne d'eau" value={property.water_shutoff_location} />
              <DataItem label="Gestion des poubelles" value={property.trash_instructions} fullWidth />
              <DataItem label="Urgences & Santé" value={property.health_emergency_info} fullWidth />
            </div>
          </div>

          <div className="section">
            <h2>🧭 Guide Local & Recommandations</h2>
            <div className="data-grid">
              <DataItem label="Commerces proches" value={property.local_shops} />
              <DataItem label="Transports" value={property.transport_info} />
              <DataItem label="Recommandations du propriétaire" value={property.recommendations} fullWidth />
            </div>
          </div>

          <div className="section">
            <h2>👋 Départ & Avis</h2>
            <div className="data-grid">
              <DataItem label="Consignes de sortie" value={property.checkout_instructions} fullWidth />
              <DataItem label="Retour des clés" value={property.key_return_details} />
              <DataItem label="Lien Airbnb pour avis" value={property.review_link} />
            </div>
          </div>

          <div className="section">
            <h2>📺 Divertissement & Appareils</h2>
            <div className="data-grid">
              <DataItem label="TV & Streaming" value={property.tv_manual} fullWidth />
              <DataItem label="Électroménager" value={property.appliances_instructions} fullWidth />
              <DataItem label="Audio" value={property.music_system} />
              <DataItem label="Jeux" value={property.games_available} />
            </div>
          </div>

          <div className="section">
            <h2>🧺 Inventaire & Linge</h2>
            <div className="data-grid">
              <DataItem label="Produits de base (Sel, poivre...)" value={property.pantry_basics} fullWidth />
              <DataItem label="Emplacement recharges (Papier, savon...)" value={property.consumables_location} fullWidth />
              <DataItem label="Lave-linge & Fer" value={property.laundry_iron_info} fullWidth />
            </div>
          </div>

          <div className="section">
            <h2>⚠️ Particularités & Nuisances</h2>
            <div className="data-grid">
              <DataItem label="Détails spécifiques au logement" value={property.property_quirks} fullWidth />
              <DataItem label="Nuisances de quartier" value={property.neighborhood_nuisances} fullWidth />
            </div>
          </div>

          <div className="section">
            <h2>📜 Familles, Règles & Taxes</h2>
            <div className="data-grid">
              <DataItem label="Équipements bébé" value={property.baby_equipment} fullWidth />
              <DataItem label="Règles de vie & Bruit" value={property.noise_rules} fullWidth />
              <DataItem label="Taxe de séjour" value={property.tourist_tax_info} fullWidth />
            </div>
          </div>

          {/* ── SECTION MÉNAGE ── */}
          <div className="section">
            <h2>🧹 Gestion des Ménages</h2>

            {/* STATUT EN TEMPS RÉEL */}
            {currentStatus && (
              <div style={{
                background: currentStatus.bg,
                border: `1px solid ${currentStatus.border}`,
                borderRadius: '12px', padding: '14px 16px',
                marginBottom: '20px', display: 'flex',
                justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <p style={{ margin: '0 0 2px', fontWeight: 800, color: currentStatus.color, fontSize: '14px' }}>
                    {currentStatus.label}
                  </p>
                  {cleaningStatus.providerName && (
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                      Prestataire : {cleaningStatus.providerName}
                      {cleaningStatus.confirmedAt && ` — Confirmé à ${new Date(cleaningStatus.confirmedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                    </p>
                  )}
                </div>
                {cleaningStatus.status === 'completed' && cleaningStatus.photos?.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {cleaningStatus.photos.slice(0, 3).map((url, i) => (
                      <img key={i} src={url} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PRESTATAIRE */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                Prestataire de ménage
              </label>
              <input
                type="text"
                placeholder="Nom du prestataire"
                value={providerName}
                onChange={e => setProviderName(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', marginBottom: '10px', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>📲</span>
                <input
                  type="text"
                  placeholder="Telegram Chat ID du prestataire"
                  value={providerTelegram}
                  onChange={e => setProviderTelegram(e.target.value)}
                  style={{ flex: 1, padding: '11px 14px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit' }}
                />
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                Le prestataire doit démarrer <strong>@AlfredMajorBot</strong> sur Telegram pour obtenir son Chat ID.
              </p>
            </div>

            {/* CHECKLIST */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                Checklist de ménage ({checklist.length} éléments)
              </label>

              {checklist.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ flex: 1, padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', color: '#1e293b' }}>
                    ✓ {item}
                  </span>
                  <button
                    onClick={() => removeChecklistItem(i)}
                    style={{ padding: '8px 12px', background: '#fee2e2', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#e11d48', fontWeight: 700, fontSize: '14px' }}
                  >
                    ✕
                  </button>
                </div>
              ))}

              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <input
                  type="text"
                  placeholder="ex: Changer les draps, Vider les poubelles..."
                  value={newChecklistItem}
                  onChange={e => setNewChecklistItem(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && addChecklistItem()}
                  style={{ flex: 1, padding: '11px 14px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit' }}
                />
                <button
                  onClick={addChecklistItem}
                  style={{ padding: '11px 16px', background: '#1a2a6c', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}
                >
                  + Ajouter
                </button>
              </div>
            </div>

            {/* BOUTONS */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={saveCleaning}
                disabled={savingCleaning}
                style={{ flex: 1, padding: '12px', background: '#fbbf24', color: '#1a2a6c', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', fontSize: '14px', minWidth: '140px', fontFamily: 'inherit' }}
              >
                {savingCleaning ? '⏳ Sauvegarde...' : '💾 Sauvegarder'}
              </button>

              {cleaningConfig && (
                <button
                  onClick={triggerCleaning}
                  style={{ flex: 1, padding: '12px', background: '#f0fdf4', color: '#15803d', border: '2px solid #22c55e', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', fontSize: '14px', minWidth: '140px', fontFamily: 'inherit' }}
                >
                  🧹 Notifier maintenant
                </button>
              )}
            </div>
          </div>

        </div>

        <div className="right-col">
          <div className="stat-card">
            <span className="stat-label">Temps gagné</span>
            <span className="stat-value">0h 00</span>
            <p style={{ fontSize: '12px', margin: 0, opacity: 0.8 }}>En attente des premiers messages...</p>
          </div>

          <div className="stat-card" style={{ background: 'white', color: '#1a2a6c', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <span className="stat-label" style={{ color: '#64748b' }}>Échanges Clients</span>
            <span className="stat-value" style={{ color: '#1a2a6c' }}>0</span>
          </div>

          {/* STATUT MÉNAGE DANS LA SIDEBAR */}
          {currentStatus && (
            <div style={{ background: currentStatus.bg, border: `1px solid ${currentStatus.border}`, borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Ménage</p>
              <p style={{ margin: 0, fontWeight: 800, color: currentStatus.color, fontSize: '16px' }}>{currentStatus.label}</p>
              {cleaningStatus.confirmedAt && (
                <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#64748b' }}>
                  {new Date(cleaningStatus.confirmedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          )}

          <Link href={`/add-property?id=${property.id}`} passHref legacyBehavior>
            <a className="btn-edit">⚙️ Modifier les infos</a>
          </Link>
        </div>
      </main>
    </div>
  );
}
