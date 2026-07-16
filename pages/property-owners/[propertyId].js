// pages/property-owners/[propertyId].js
// Page de gestion des proprietaires et documents pour un logement (cote hote).

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { supabase } from '../../lib/supabase';

export default function PropertyOwners() {
  const router = useRouter();
  const { propertyId } = router.query;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', commissionRate: 20 });
  const [inviting, setInviting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    if (propertyId) load();
  }, [propertyId]);

  const load = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      const res = await fetch(`/api/owner/manage?propertyId=${propertyId}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      if (!res.ok) { router.push('/dashboard'); return; }
      const d = await res.json();
      setData(d);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteForm.name.trim() || !inviteForm.email.trim()) return;
    setInviting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/owner/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({
          ownerName: inviteForm.name.trim(),
          ownerEmail: inviteForm.email.trim(),
          propertyId,
          commissionRate: Number(inviteForm.commissionRate) || 20,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Erreur');

      alert(`✅ Invitation envoyée à ${inviteForm.email}`);
      setInviteForm({ name: '', email: '', commissionRate: 20 });
      setShowInvite(false);
      await load();
    } catch (err) {
      alert('Erreur : ' + err.message);
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveOwner = async (linkId, ownerName) => {
    if (!window.confirm(`Retirer ${ownerName} de ce logement ?`)) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch('/api/owner/manage', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ linkId }),
      });
      await load();
    } catch (err) { alert('Erreur : ' + err.message); }
  };

  const handleUpdateCommission = async (linkId, currentRate) => {
    const newRate = prompt('Nouveau taux de commission (%) :', currentRate);
    if (newRate === null) return;
    const rate = Number(newRate);
    if (isNaN(rate) || rate < 0 || rate > 100) { alert('Taux invalide (0-100)'); return; }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch('/api/owner/manage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ linkId, commissionRate: rate }),
      });
      await load();
    } catch (err) { alert('Erreur : ' + err.message); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setUploadError('Fichier trop volumineux (max 10 MB)'); return; }
    if (data?.owners?.length === 0) { setUploadError('Invitez d\'abord un propriétaire'); return; }

    setUploading(true);
    setUploadError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${propertyId}/${Date.now()}-${safeName}`;

      const { error: uploadErr } = await supabase.storage.from('owner-documents').upload(fileName, file);
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from('owner-documents').getPublicUrl(fileName);

      const res = await fetch('/api/owner/upload-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({
          propertyId,
          name: file.name,
          fileUrl: urlData.publicUrl,
          fileType: file.type,
          fileSize: file.size,
          category: 'document',
        }),
      });
      if (!res.ok) throw new Error('Erreur enregistrement');

      await load();
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteDoc = async (documentId, name) => {
    if (!window.confirm(`Supprimer "${name}" ?`)) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch('/api/owner/manage', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ documentId }),
      });
      await load();
    } catch (err) { alert('Erreur : ' + err.message); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f7', fontFamily: 'Inter, sans-serif' }}>
      <p style={{ color: '#86868b' }}>Chargement...</p>
    </div>
  );

  if (!data) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7', fontFamily: 'Inter, sans-serif' }}>
      <Head>
        <title>Propriétaires — {data.property.name}</title>
      </Head>
      <style jsx global>{`* { box-sizing: border-box; } body { margin: 0; }`}</style>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 20px' }}>

        {/* Header */}
        <Link href="/dashboard" style={{ color: '#86868b', fontSize: '14px', textDecoration: 'none', display: 'inline-block', marginBottom: '16px' }}>
          ← Retour aux logements
        </Link>

        <h1 style={{ margin: '0 0 4px', fontSize: '26px', fontWeight: 600, color: '#1d1d1f', letterSpacing: '-0.5px' }}>
          Espace propriétaires
        </h1>
        <p style={{ margin: '0 0 24px', color: '#86868b', fontSize: '15px', fontWeight: 300 }}>
          🏠 {data.property.name}{data.property.city ? ` — ${data.property.city}` : ''}
        </p>

        {/* Section proprietaires */}
        <div style={{ background: 'white', borderRadius: '18px', padding: '24px', border: '1px solid #e8e8ed', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: '#1d1d1f' }}>
              👤 Propriétaires ({data.owners.length})
            </h2>
            {!showInvite && (
              <button onClick={() => setShowInvite(true)} style={{ background: '#c9a227', color: '#1d1d1f', padding: '10px 16px', borderRadius: '980px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}>
                + Inviter
              </button>
            )}
          </div>

          {/* Form d'invitation */}
          {showInvite && (
            <form onSubmit={handleInvite} style={{ background: '#f5f5f7', padding: '18px', borderRadius: '14px', marginBottom: '16px' }}>
              <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#6e6e73', fontWeight: 300 }}>
                Le propriétaire recevra un email pour créer son compte et accéder à son espace.
              </p>
              <div style={{ display: 'grid', gap: '10px', marginBottom: '12px' }}>
                <input type="text" placeholder="Nom du propriétaire" value={inviteForm.name}
                  onChange={e => setInviteForm(f => ({ ...f, name: e.target.value }))}
                  style={inputStyle} />
                <input type="email" placeholder="Email du propriétaire" value={inviteForm.email}
                  onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}
                  style={inputStyle} />
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#6e6e73', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                    Taux de commission conciergerie
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="number" min="0" max="100" step="0.5" value={inviteForm.commissionRate}
                      onChange={e => setInviteForm(f => ({ ...f, commissionRate: e.target.value }))}
                      style={{ ...inputStyle, width: '100px' }} />
                    <span style={{ fontSize: '14px', color: '#6e6e73' }}>%</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => setShowInvite(false)} style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #e8e8ed', borderRadius: '10px', color: '#6e6e73', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Annuler
                </button>
                <button type="submit" disabled={inviting} style={{ flex: 2, padding: '12px', background: '#1d1d1f', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {inviting ? 'Envoi...' : '✉️ Envoyer l\'invitation'}
                </button>
              </div>
            </form>
          )}

          {/* Liste proprietaires */}
          {data.owners.length === 0 ? (
            <p style={{ color: '#aeaeb2', fontSize: '14px', textAlign: 'center', padding: '20px 0', fontWeight: 300 }}>
              Aucun propriétaire assigné à ce logement.
            </p>
          ) : (
            data.owners.map(o => (
              <div key={o.link_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: '#f5f5f7', borderRadius: '10px', marginBottom: '8px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#1d1d1f' }}>
                    👤 {o.name} {!o.accepted && <span style={{ background: '#fff7ed', color: '#c2410c', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, marginLeft: '6px' }}>INVITATION EN ATTENTE</span>}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6e6e73', fontWeight: 300 }}>{o.email}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button onClick={() => handleUpdateCommission(o.link_id, o.commission_rate)}
                    style={{ background: '#eff6ff', color: '#1d4ed8', padding: '6px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}>
                    {o.commission_rate}%
                  </button>
                  <button onClick={() => handleRemoveOwner(o.link_id, o.name)}
                    style={{ background: '#fff2f2', color: '#e11d48', border: 'none', padding: '6px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Section documents */}
        <div style={{ background: 'white', borderRadius: '18px', padding: '24px', border: '1px solid #e8e8ed' }}>
          <h2 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: 600, color: '#1d1d1f' }}>
            📄 Documents partagés ({data.documents.length})
          </h2>
          <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#6e6e73', fontWeight: 300 }}>
            Baux, factures, contrats... Les documents seront visibles par le propriétaire.
          </p>

          {uploadError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 12px', borderRadius: '10px', fontSize: '13px', marginBottom: '10px' }}>
              ⚠️ {uploadError}
            </div>
          )}

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px', background: uploading ? '#f5f5f7' : '#faf6e8', border: '2px dashed #e8d88a', borderRadius: '12px', cursor: uploading ? 'wait' : 'pointer', fontSize: '14px', color: '#92710a', fontWeight: 600, marginBottom: '14px' }}>
            {uploading ? '⏳ Upload en cours...' : '📎 Ajouter un document (PDF, image, max 10 MB)'}
            <input type="file" onChange={handleUpload} disabled={uploading} style={{ display: 'none' }} />
          </label>

          {data.documents.length === 0 ? (
            <p style={{ color: '#aeaeb2', fontSize: '14px', textAlign: 'center', padding: '10px 0', fontWeight: 300 }}>
              Aucun document partagé.
            </p>
          ) : (
            data.documents.map(d => (
              <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f5f5f7', borderRadius: '10px', marginBottom: '8px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#1d1d1f' }}>📄 {d.name}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#86868b', fontWeight: 300 }}>
                    {d.file_size ? `${(d.file_size / 1024).toFixed(0)} KB · ` : ''}{new Date(d.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <a href={d.file_url} target="_blank" rel="noopener noreferrer"
                    style={{ background: '#1d1d1f', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, textDecoration: 'none' }}>
                    Voir
                  </a>
                  <button onClick={() => handleDeleteDoc(d.id, d.name)}
                    style={{ background: '#fff2f2', color: '#e11d48', border: 'none', padding: '6px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '11px 14px', border: '1px solid #e8e8ed',
  borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit',
  background: 'white', outline: 'none', color: '#1d1d1f', boxSizing: 'border-box',
};
