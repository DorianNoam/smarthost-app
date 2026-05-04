import { useState } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  // On stocke TOUTE la conversation
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const demanderAuConcierge = async () => {
    if (!input) return;
    setLoading(true);

    // 1. Ajouter ton message à la liste
    const currentMessages = [...messages, { role: 'user', content: input }];
    setMessages(currentMessages);
    setInput(''); // On vide l'entrée

    try {
      // 2. Envoyer TOUTE la discussion au serveur
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: currentMessages }),
      });
      
      const data = await res.json();
      
      // 3. Ajouter la réponse de Marc à la liste
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
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#0070f3' }}>SmartHost AI 🏠</h1>
      <p style={{ textAlign: 'center' }}>Votre concierge de luxe à votre service.</p>

      {/* Zone de chat elegante */}
      <div style={{ 
        border: '1px solid #ddd', 
        borderRadius: '10px', 
        padding: '15px', 
        minHeight: '300px', 
        marginBottom: '20px', 
        backgroundColor: '#f9f9f9',
        overflowY: 'auto', // Permet de scroller
        maxHeight: '400px'
      }}>
        {messages.length === 0 && <p style={{ color: '#888', textAlign: 'center', marginTop: '100px' }}>Posez votre première question...</p>}
        
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: '15px', textAlign: m.role === 'user' ? 'right' : 'left' }}>
            <div style={{ 
              display: 'inline-block', 
              padding: '10px 15px', 
              borderRadius: '15px', 
              backgroundColor: m.role === 'user' ? '#0070f3' : '#fff',
              color: m.role === 'user' ? '#fff' : '#333',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              maxWidth: '80%'
            }}>
              <strong>{m.role === 'user' ? 'Vous' : 'Marc'} :</strong><br/>
              {m.content}
            </div>
          </div>
        ))}
        {loading && <p style={{ fontStyle: 'italic', color: '#888', textAlign: 'left' }}>Marc rédige sa réponse...</p>}
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <input 
          value={input} 
          // LA CORRECTION EST ICI :
          onChange={(e) => setInput(e.target.value)}
          placeholder="Écrivez votre demande ici..."
          style={{ flex: 1, padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button 
          onClick={demanderAuConcierge}
          disabled={loading}
          style={{ padding: '12px 20px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}
