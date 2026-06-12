import React from 'react';

export default function Guida() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'url("https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=2070") no-repeat center center fixed',
      backgroundSize: 'cover'
    }}>
      <div style={{
        maxWidth: '1000px',
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '40px'
      }}>
        
        {/* Partie Gauche : Texte */}
        <div style={{ color: 'white', flex: 1 }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '20px' }}>
            Automatizza il tuo Airbnb per l'estate 2026.
          </h1>
          <p style={{ fontSize: '20px', opacity: 0.9 }}>
            Massimizza i profitti e azzera lo stress. La tua Conciergerie AI multilingue a soli 9,90€/mese.
          </p>
        </div>

        {/* Partie Droite : Formulaire style "Glass" */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          padding: '40px',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          width: '400px'
        }}>
          <form>
            <input type="text" placeholder="Nome Completo" style={{ width: '100%', padding: '15px', marginBottom: '15px', borderRadius: '10px', border: 'none' }} />
            <input type="email" placeholder="Email Professionale" style={{ width: '100%', padding: '15px', marginBottom: '15px', borderRadius: '10px', border: 'none' }} />
            <button style={{ 
              width: '100%', 
              padding: '15px', 
              background: '#B8985B', 
              color: 'white', 
              border: 'none', 
              borderRadius: '10px', 
              fontWeight: 'bold',
              cursor: 'pointer' 
            }}>
              SCARICA LA GUIDA GRATUITA ↓
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
