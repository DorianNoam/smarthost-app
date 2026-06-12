import React from 'react';

export default function Guida() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      // Remplace par l'URL de ton image de fond (ex: une photo de la côte amalfitaine)
      background: 'url("https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=2070") no-repeat center center fixed',
      backgroundSize: 'cover',
      fontFamily: 'sans-serif'
    }}>
      
      {/* Titre principal */}
      <div style={{ textAlign: 'center', color: '#1a202c', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px' }}>
          Automatizza il tuo Airbnb per l'estate 2026.
        </h1>
        <p style={{ fontSize: '20px', color: '#4a5568' }}>
          Massimizza i profitti e azzera lo stress. La tua Conciergerie AI multilingue a soli 9,90€/mese.
        </p>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '60px',
        width: '100%',
        maxWidth: '900px'
      }}>
        
        {/* Visuel du Livre (à gauche) */}
        <div style={{ transform: 'rotate(-5deg)' }}>
          <img src="/cover-guida.png" alt="Guida Estiva" style={{ width: '300px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }} />
        </div>

        {/* Formulaire (à droite avec effet Glass) */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(15px)',
          padding: '30px',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          width: '350px',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
        }}>
          <form>
            <input type="text" placeholder="Nome Completo" style={inputStyle} />
            <input type="email" placeholder="Email Professionale" style={inputStyle} />
            <button style={buttonStyle}>
              SCARICA LA GUIDA GRATUITA ↓
            </button>
          </form>
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
  boxSizing: 'border-box'
};

const buttonStyle = {
  width: '100%',
  padding: '14px',
  background: '#b59a63',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 'bold',
  cursor: 'pointer'
};
