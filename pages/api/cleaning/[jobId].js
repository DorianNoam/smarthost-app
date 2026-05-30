// pages/cleaning/[jobId].js
// Interface ultra simple pour le prestataire de ménage
// Accessible via un lien unique sans création de compte

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';

export default function CleaningJob() {
  const router = useRouter();
  const { jobId } = router.query;

  const [job, setJob] = useState(null);
  const [property, setProperty] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [checklistDone, setChecklistDone] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (jobId) fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    try {
      const { data: jobData } = await supabase
        .from('cleaning_jobs')
        .select('*, properties(name, city)')
        .eq('id', jobId)
        .single();

      if (!jobData) { setLoading(false); return; }

      setJob(jobData);
      setProperty(jobData.properties);

      if (jobData.status === 'completed') {
        setDone(true);
      }

      // Récupérer la checklist du logement
      const { data: config } = await supabase
        .from('property_cleaning')
        .select('checklist')
        .eq('property_id', jobData.property_id)
        .single();

      if (config?.checklist) {
        setChecklist(config.checklist);
        setChecklistDone(jobData.checklist_done || []);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (item) => {
    setChecklistDone(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const fileName = `cleaning/${jobId}/${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from('cleaning-photos')
          .upload(fileName, file);

        if (!error) {
          const { data: urlData } = supabase.storage
            .from('cleaning-photos')
            .getPublicUrl(fileName);
          uploadedUrls.push(urlData.publicUrl);
        }
      }
      setPhotos(prev => [...prev, ...uploadedUrls]);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Sauvegarder en base d'abord
      await supabase
        .from('cleaning_jobs')
        .update({
          status: 'completed',
          checklist_done: checklistDone,
          photos: photos,
          confirmed_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      // Puis notifier l'hôte via l'API
      await fetch('/api/cleaning/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          checklistDone,
          photos,
          status: 'completed',
        }),
      });

      setDone(true);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la confirmation. Réessayez.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (iso) => {
    if (!iso) return null;
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc' }}>
      <p style={{ color: '#64748b' }}>Chargement...</p>
    </div>
  );

  if (!job) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc', padding: '20px', textAlign: 'center' }}>
      <div>
        <p style={{ fontSize: '48px' }}>❌</p>
        <p style={{ color: '#64748b' }}>Mission introuvable ou lien invalide.</p>
      </div>
    </div>
  );

  if (done) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f0fdf4', padding: '20px', textAlign: 'center' }}>
      <p style={{ fontSize: '72px', margin: '0 0 20px' }}>✅</p>
      <h1 style={{ color: '#15803d', fontWeight: 900, fontSize: '24px', margin: '0 0 10px' }}>Ménage confirmé !</h1>
      <p style={{ color: '#166534', fontSize: '15px' }}>Le propriétaire a été notifié. Merci !</p>
      <p style={{ color: '#64748b', fontSize: '13px', marginTop: '8px' }}>🎩 Alfred Major</p>
    </div>
  );

  const allChecked = checklist.length === 0 || checklist.every(item => checklistDone.includes(item));

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <style global jsx>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>

      {/* HEADER */}
      <div style={{ background: '#1a2a6c', padding: '20px', textAlign: 'center' }}>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Mission ménage</p>
        <h1 style={{ margin: '6px 0 0', color: 'white', fontSize: '20px', fontWeight: 800 }}>
          {property?.name}
        </h1>
        {property?.city && (
          <p style={{ margin: '4px 0 0', color: '#fbbf24', fontSize: '13px', fontWeight: 600 }}>📍 {property.city}</p>
        )}
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px' }}>

        {/* HORAIRES */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '18px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ flex: 1, textAlign: 'center', background: '#fff7ed', padding: '12px', borderRadius: '12px' }}>
              <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Départ</p>
              <p style={{ margin: 0, fontWeight: 800, color: '#c2410c', fontSize: '16px' }}>
                {formatTime(job.checkout_time) || '—'}
              </p>
            </div>
            <div style={{ flex: 1, textAlign: 'center', background: '#f0fdf4', padding: '12px', borderRadius: '12px' }}>
              <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Arrivée</p>
              <p style={{ margin: 0, fontWeight: 800, color: '#15803d', fontSize: '16px' }}>
                {formatTime(job.next_checkin) || '—'}
              </p>
            </div>
          </div>
        </div>

        {/* CHECKLIST */}
        {checklist.length > 0 && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '18px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 800, color: '#1a2a6c' }}>
              📋 Checklist ({checklistDone.length}/{checklist.length})
            </h2>
            {checklist.map((item, i) => (
              <div
                key={i}
                onClick={() => toggleItem(item)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px', borderRadius: '10px', marginBottom: '8px',
                  background: checklistDone.includes(item) ? '#f0fdf4' : '#f8fafc',
                  border: `1px solid ${checklistDone.includes(item) ? '#bbf7d0' : '#e2e8f0'}`,
                  cursor: 'pointer', transition: '0.15s',
                }}
              >
                <div style={{
                  width: '24px', height: '24px', borderRadius: '6px', flexShrink: 0,
                  background: checklistDone.includes(item) ? '#22c55e' : 'white',
                  border: `2px solid ${checklistDone.includes(item) ? '#22c55e' : '#cbd5e1'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {checklistDone.includes(item) && <span style={{ color: 'white', fontSize: '14px', fontWeight: 900 }}>✓</span>}
                </div>
                <span style={{
                  fontSize: '14px', fontWeight: 600,
                  color: checklistDone.includes(item) ? '#15803d' : '#1e293b',
                  textDecoration: checklistDone.includes(item) ? 'line-through' : 'none',
                }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* PHOTOS */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '18px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 800, color: '#1a2a6c' }}>
            📸 Photos du ménage terminé
          </h2>
          <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#64748b' }}>
            Prenez des photos pour prouver que le logement est prêt.
          </p>

          {photos.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
              {photos.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Photo ${i + 1}`}
                  style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '8px' }}
                />
              ))}
            </div>
          )}

          <label style={{
            display: 'block', padding: '12px', background: '#f8fafc',
            border: '2px dashed #cbd5e1', borderRadius: '12px',
            textAlign: 'center', cursor: 'pointer', fontSize: '14px', color: '#64748b', fontWeight: 600,
          }}>
            {uploading ? '⏳ Upload en cours...' : '📷 Ajouter des photos'}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
              disabled={uploading}
            />
          </label>
        </div>

        {/* BOUTON CONFIRMER */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            width: '100%', padding: '16px',
            background: allChecked ? '#22c55e' : '#94a3b8',
            color: 'white', border: 'none', borderRadius: '14px',
            fontSize: '16px', fontWeight: 800, cursor: submitting ? 'not-allowed' : 'pointer',
            transition: '0.2s', marginBottom: '30px',
          }}
        >
          {submitting ? '⏳ Envoi en cours...' : '✅ Confirmer le ménage terminé'}
        </button>

        {!allChecked && checklist.length > 0 && (
          <p style={{ textAlign: 'center', color: '#f59e0b', fontSize: '13px', fontWeight: 600, marginTop: '-16px' }}>
            ⚠️ Cochez tous les éléments de la checklist avant de confirmer
          </p>
        )}

        <p style={{ textAlign: 'center', color: '#cbd5e1', fontSize: '12px', marginTop: '20px' }}>
          🎩 Alfred Major — Service de conciergerie
        </p>
      </div>
    </div>
  );
}
