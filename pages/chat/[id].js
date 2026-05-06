import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';

export default function ChatPage() {
  const router = useRouter();
  const { id } = router.query;
  const [property, setProperty] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (id) fetchPropertyData();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchPropertyData = async () => {
    const { data, error } = await supabase.from('properties').select('*').eq('id', id).single();
    if (!error) {
      setProperty(data);
      setMessages([{ role: 'marc', text: `Bonjour ! Je suis Marc, le majordome de "${data.name}". Comment puis-je vous aider ?` }]);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messagesHistory: [...messages, userMsg], propertyData: property })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'marc', text: data.answer }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'marc', text: "Toutes mes excuses, je rencontre une petite difficulté technique." }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!property) return null;

  return (
    <div className="chat-layout">
      <style jsx global>{`
        body { margin: 0; background: #f4f7fb; overflow: hidden; }
      `}</style>
      
      <style jsx>{`
        .chat-layout { display: flex; flex-direction: column; height: 100vh; font-family: 'Inter', sans-serif; }
        
        /* HEADER COMPACT */
        header { 
          background: #1a2a6c; color: white; padding: 12px 15px; 
          text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
          z-index: 10;
        }
        header h1 { margin: 0; font-size: 16px; font-weight: 800; }
        header p { margin: 2px 0 0; font-size: 10px; opacity: 0.8; text-transform: uppercase; letter-spacing: 1px; }

        /* ZONE DE MESSAGES */
        .messages-container { 
          flex: 1; overflow-y: auto; padding: 15px; 
          display: flex; flex-direction: column; gap: 12px;
          padding-bottom: 90px; /* Espace pour la barre d'entrée */
        }

        .bubble { 
          max-width: 85%; padding: 12px 16px; border-radius: 18px; 
          font-size: 14px; line-height: 1.4; position: relative;
        }
        
        .marc { 
          align-self: flex-start; background: white; color: #1e293b; 
          border-bottom-left-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        
        .user { 
          align-self: flex-end; background: #1a2a6c; color: white; 
          border-bottom-right-radius: 4px; 
        }

        .typing { font-size: 12px; color: #64748b; font-style: italic; margin-left: 5px; }

        /* BARRE D'ENTRÉE FIXÉE EN BAS */
        .input-area { 
          position: fixed; bottom: 0; left: 0; right: 0; 
          background: white; padding: 12px 15px; 
          display: flex; gap: 10px; align-items: center;
          border-top: 1px solid #e2e8f0;
          padding-bottom: env(safe-area-inset-bottom, 12px); /* Pour iPhone sans bouton */
        }

        input { 
          flex: 1; padding: 12px 18px; border: 1px solid #e2e8f0; 
          border-radius: 25px; font-size: 14px; outline: none; background: #f8fafc;
        }
        input:focus { border-color: #1a2a6c; background: white; }

        button { 
          background: #1a2a6c; color: white; border: none; 
          width: 40px; height: 40px; border-radius: 50%; 
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0;
        }
      `}</style>

      <header>
        <h1>{property.name}</h1>
        <p>Service de Conciergerie</p>
      </header>

      <div className="messages-container">
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>
            {m.text}
          </div>
        ))}
        {isTyping && <div className="typing">Marc réfléchit...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <input 
          type="text" 
          placeholder="Écrivez à Marc..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
          }
          
