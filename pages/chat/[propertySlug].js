import { useState, useEffect } from 'react';

export default function GuestChat() {
  const [messages, setMessages] = useState([
    { role: 'marc', text: "Bonjour ! Je suis Marc, votre majordome virtuel pour ce séjour. Comment puis-je vous aider aujourd'hui ?" }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Ajout du message voyageur
    const newMessages = [...messages, { role: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    // Simulation d'une réponse de Marc (en attendant ton vrai backend)
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'marc', 
        text: "Je recherche l'information pour vous... (Marc puise dans le livret d'accueil)" 
      }]);
    }, 1000);
  };

  return (
    <div className="chat-viewport">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@300;400;600;700&display=swap');

        .chat-viewport {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #f8f9fa;
          font-family: 'Montserrat', sans-serif;
        }

        /* Header Prestige */
        header {
          background: #1a2a6c;
          color: white;
          padding: 20px;
          text-align: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .property-name { font-family: 'Playfair Display', serif; font-size: 18px; display: block; }
        .concierge-badge { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #d4af37; font-weight: 700; margin-top: 5px; display: block; }

        /* Zone de messages */
        .messages-area {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .bubble {
          max-width: 85%;
          padding: 15px;
          border-radius: 20px;
          font-size: 14px;
          line-height: 1.5;
        }

        .bubble.marc {
          background: white;
          color: #1a2a6c;
          align-self: flex-start;
          border-bottom-left-radius: 2px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .bubble.user {
          background: #1a2a6c;
          color: white;
          align-self: flex-end;
          border-bottom-right-radius: 2px;
        }

        /* Zone d'entrée */
        .input-area {
          background: white;
          padding: 20px;
          display: flex;
          gap: 10px;
          border-top: 1px solid #eee;
        }

        input {
          flex: 1;
          padding: 15px;
          border: 1px solid #eee;
          border-radius: 30px;
          background: #f9f9f9;
          font-family: 'Montserrat', sans-serif;
          outline: none;
        }

        .btn-send {
          background: #1a2a6c;
          border: none;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .footer-note {
          text-align: center;
          font-size: 10px;
          color: #bbb;
          padding-bottom: 10px;
          background: white;
        }
      `}</style>

      <header>
        <span className="property-name">Villa Bella</span>
        <span className="concierge-badge">Service de Conciergerie</span>
      </header>

      <div className="messages-area">
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>
            {m.text}
          </div>
        ))}
      </div>

      <div className="input-area">
        <input 
          type="text" 
          placeholder="Posez votre question à Marc..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="btn-send" onClick={handleSend}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
      <div className="footer-note">
        Propulsé par MajorMarc - L'excellence à votre service.
      </div>
    </div>
  );
}
