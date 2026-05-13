import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

export default function Home() {
  const searchParams = useSearchParams();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const client = searchParams.get('client');
    if (client) setUserName(client.replace('_', ' '));
  }, [searchParams]);

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
      if (data.text) setMessages([...currentMessages, { role: 'assistant', content: data.text }]);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  return (
    <div className="container">
      <style jsx>{`
        .container {
          min-height: 100vh;
          background-color: #f8f5f0;
          background-image: radial-gradient(#d4af37 0.5px, transparent 0.5px);
          background-size: 20px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px;
          font-family: 'Segoe UI', sans-serif;
        }
        .header {
          text-align: center;
          margin: 20px 0;
        }
        .header span {
          font-size: 10px;
          letter-spacing: 2px;
          color: #d4af37;
          text-transform: uppercase;
        }
        .header h1 {
          font-size: 24px;
          color: #1a2a6c;
          margin: 5px 0;
        }
        .chat-card {
          width: 100%;
          max-width: 600px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          height: 80vh; /* Hauteur dynamique selon l'écran */
          overflow: hidden;
        }
        .chat-body {
          flex: 1;
          overflow-y: auto;
          padding: 15px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .message {
          max-width: 85%;
          padding: 10px 15px;
          font-size: 14px;
          line-height: 1.4;
          border-radius: 15px;
        }
        .user { align-self: flex-end; background: #1a2a6c; color: white; border-bottom-right-radius: 2px; }
        .assistant { align-self: flex-start; background: #f0f2f5; color: #333; border-bottom-left-radius: 2px; }
        
        .input-area {
          padding: 15px;
          background: white;
          border-top: 1px solid #eee;
          display: flex;
          gap: 10px;
        }
        input {
          flex: 1;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #ddd;
          outline: none;
          font-size: 14px;
        }
        button {
          padding: 0 15px;
          background: #1a2a6c;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
        }
        
        @media (max-width: 480px) {
          .chat-card { height: 85vh; }
          .header h1 { font-size: 20px; }
          .message { font-size: 13px; }
        }
      `}</style>

      <div className="header">
        <span>Conciergerie Privée</span>
        <h1>SmartHost <b>AI</b></h1>
      </div>

      <div className="chat-card">
        <div style={{ padding: '10px 15px', borderBottom: '1px solid #eee', fontSize: '12px', color: '#666' }}>
          🟢 Alfred est en ligne {userName ? `pour ${userName}` : ''}
        </div>

        <div className="chat-body">
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: '40%' }}>
              <p style={{ color: '#1a2a6c', fontWeight: '300' }}>Bienvenue {userName ? `Mme/M. ${userName}` : ''}.</p>
              <p style={{ color: '#888', fontSize: '13px' }}>Comment puis-je vous aider ?</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.role === 'user' ? 'user' : 'assistant'}`}>
              {m.content}
            </div>
          ))}
          {loading && <div style={{ fontSize: '11px', color: '#aaa' }}>Alfred répond...</div>}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && demanderAuConcierge()}
            placeholder="Écrivez ici..."
          />
          <button onClick={demanderAuConcierge} disabled={loading}>
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
  }
          
