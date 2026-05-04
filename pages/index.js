import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

export default function Home() {
  const searchParams = useSearchParams();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const messagesEndRef = useRef(null);

  // 1. Détection du client dans l'URL
  useEffect(() => {
    const client = searchParams.get('client');
    if (client) {
      setUserName(client.replace('_', ' '));
    }
  }, [searchParams]);

  // 2. Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const demanderAuConcierge = async () => {
    if (!input) return;
    setLoading(true);
    const currentMessages = [...messages, { role: 'user', content: input }];
    setMessages(currentMessages);
    setInput('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: currentMessages, userName }),
      });
      const data = await res.json();
      if (data.text) {
        setMessages([...currentMessages, { role: 'assistant', content: data.text }]);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8f5f0', // Crème de luxe
      backgroundImage: 'radial-gradient(#d4af37 0.5px, transparent 0.5px)', // Petits points or
      backgroundSize: '20px 20px',
      padding: '20px',
      fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    }}>
      
      {/* Header de Prestige */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ fontSize: '12px', letterSpacing: '3px', color: '#d4af37', fontWeight: 'bold', textTransform: 'uppercase' }}>
          Conciergerie Privée
        </div>
        <h1 style={{ fontSize: '32px', color: '#1a2a6c', margin: '10px 0', fontWeight: '300' }}>
          SmartHost <span style={{ fontWeight: 'bold' }}>AI</span>
        </h1>
        <div style={{ width: '40px', height: '2px', backgroundColor: '#d4af37', margin: '0 auto' }}></div>
      </div>

      {/* Carte Centrale */}
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
        borderRadius: '20px', 
        boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        border: '1px solid #fff'
      }}>
        
        {/* Barre de bienvenue */}
        <div style={{ padding: '15px 25px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#4caf50', borderRadius: '50%' }}></div>
          <span style={{ fontSize: '14px', color: '#666' }}>
            Marc est en ligne {userName ? `pour ${userName}` : ''}
          </span>
        </div>

        {/* Zone de Discussion */}
        <div style={{ height: '500px', overflowY: 'auto', padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: '100px' }}>
              <p style={{ fontSize: '18px', color: '#1a2a6c', fontWeight: '300' }}>
                Bienvenue {userName ? `Mme/M. ${userName}` : ''}.
              </p>
              <p style={{ fontSize: '14px', color: '#888' }}>Comment puis-je rendre votre séjour inoubliable ?</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} style={{ 
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '75%'
            }}>
              <div style={{ 
                padding: '12px 18px', 
                borderRadius: m.role === 'user' ? '20px 20px 0 20px' : '20px 20px 20px 0', 
                backgroundColor: m.role === 'user' ? '#1a2a6c' : '#f0f2f5',
                color: m.role === 'user' ? '#fff' : '#333',
                fontSize: '15px',
                lineHeight: '1.5',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
              }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && <div style={{ fontSize: '12px', color: '#aaa', fontStyle: 'italic' }}>Marc rédige un message...</div>}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Elegant */}
        <div style={{ padding: '20px', borderTop: '1px solid #eee', backgroundColor: '#fff' }}>
          <div style={{ display: 'flex', gap: '15px' }}>
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && demanderAuConcierge()}
              placeholder="Écrivez votre demande à Marc..."
              style={{ 
                flex: 1, 
                padding: '15px', 
                borderRadius: '12px', 
                border: '1px solid #eee', 
                outline: 'none',
                fontSize: '15px',
                backgroundColor: '#f9f9f9'
              }}
            />
            <button 
              onClick={demanderAuConcierge}
              disabled={loading}
              style={{ 
                padding: '0 25px', 
                backgroundColor: '#1a2a6c', 
                color: 'white', 
                border: 'none', 
                borderRadius: '12px', 
                cursor: 'pointer',
                transition: 'all 0.3s',
                fontWeight: '600'
              }}
            >
              Envoyer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
