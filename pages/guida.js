import React, { useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────
// Page de capture "Guida Estiva 2026" — Alfred Major
//
// Ce qui a été corrigé par rapport à la version précédente :
//  1. Le formulaire gère maintenant l'état (nom, email) et le statut d'envoi
//  2. onSubmit envoie les données vers une route API interne (/api/lead)
//     → c'est CETTE route qui parlera à Brevo/MailerLite, jamais le front
//     directement (sinon ta clé API serait visible dans le code source)
//  3. Le lien UTM de la page est lu et renvoyé avec le lead, pour savoir
//     quelle vidéo/canal a généré l'inscription
//  4. Messages de succès / erreur / chargement
//  5. Image de fond optionnelle — mise en commentaire par défaut pour éviter
//     une dépendance externe ; à réactiver une fois que tu as ta propre image
// ─────────────────────────────────────────────────────────────────────────

export default function Guida() {
  const [form, setForm] = useState({ nome: '', email: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nome || !form.email) return;

    setStatus('loading');

    // Récupère les paramètres UTM de l'URL actuelle (si la personne arrive
    // depuis une vidéo TikTok/YouTube avec un lien tracé)
    const params = new URLSearchParams(window.location.search);
    const utm = {
      source: params.get('utm_source') || '',
      medium: params.get('utm_medium') || '',
      campaign: params.get('utm_campaign') || '',
      content: params.get('utm_content') || '',
    };

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, utm }),
      });

      if (!res.ok) throw new Error('Errore di rete');

      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      // Image hébergée localement : place le fichier dans
      // smarthost-app/public/images/costa-amalfitana.png
      backgroundImage: 'linear-gradient(rgba(255,255,255,0.55), rgba(255,255,255,0.55)), url("/images/costa-amalfitana.png")',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center',
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
      fontFamily: 'sans-serif',
    }}>

      {/* Titre principal */}
      <div style={{ textAlign: 'center', color: '#1a202c', marginBottom: '40px', maxWidth: '700px' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px', lineHeight: 1.2 }}>
          Automatizza il tuo Airbnb per l'estate 2026.
        </h1>
        <p style={{ fontSize: '20px', color: '#4a5568' }}>
          Massimizza i profitti e azzera lo stress. La tua Conciergerie AI multilingue a soli 9,90€/mese.
        </p>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '60px',
        width: '100%',
        maxWidth: '900px',
      }}>

        {/* Visuel du Livre généré en CSS */}
        <div style={{
          width: '280px',
          height: '380px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
          borderRadius: '4px 10px 10px 4px',
          boxShadow: '20px 20px 60px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          textAlign: 'center',
          borderLeft: '10px solid #2d3748',
          transform: 'rotate(-3deg)',
          flexShrink: 0,
        }}>
          <h2 style={{ fontSize: '20px', color: '#2d3748', fontWeight: 'bold' }}>GUIDA ESTIVA 2026</h2>
          <div style={{ width: '50px', height: '2px', background: '#b59a63', margin: '15px 0' }} />
          <p style={{ fontSize: '16px', color: '#4a5568' }}>L'Automazione Intelligente</p>
        </div>

        {/* Formulaire avec effet Glass */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(15px)',
          padding: '30px',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          width: '350px',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
        }}>
          {status === 'success' ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ fontSize: '40px', margin: 0 }}>✓</p>
              <p style={{ fontWeight: 'bold', fontSize: '18px', marginTop: '10px' }}>
                Controlla la tua email!
              </p>
              <p style={{ fontSize: '14px', color: '#4a5568', marginTop: '8px' }}>
                Ti abbiamo inviato la Guida Estiva 2026 in formato PDF.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="nome"
                placeholder="Nome Completo"
                value={form.nome}
                onChange={handleChange}
                required
                style={inputStyle}
              />
              <input
                type="email"
                name="email"
                placeholder="Email Professionale"
                value={form.email}
                onChange={handleChange}
                required
                style={inputStyle}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                style={{
                  ...buttonStyle,
                  opacity: status === 'loading' ? 0.6 : 1,
                  cursor: status === 'loading' ? 'wait' : 'pointer',
                }}
              >
                {status === 'loading' ? 'Invio in corso...' : 'SCARICA LA GUIDA GRATUITA ↓'}
              </button>

              {status === 'error' && (
                <p style={{ color: '#c0392b', fontSize: '13px', marginTop: '10px', textAlign: 'center' }}>
                  Si è verificato un errore. Riprova tra qualche istante.
                </p>
              )}
            </form>
          )}

          <p style={{ textAlign: 'center', fontSize: '14px', marginTop: '15px', color: '#4a5568' }}>
            Oltre 100 host italiani si fidano già di Alfred
          </p>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  marginBottom: '15px',
  borderRadius: '8px',
  border: '1px solid #cbd5e0',
  boxSizing: 'border-box',
  fontSize: '15px',
};

const buttonStyle = {
  width: '100%',
  padding: '14px',
  background: '#b59a63',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 'bold',
  fontSize: '15px',
};
