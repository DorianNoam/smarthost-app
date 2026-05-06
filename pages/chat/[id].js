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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchPropertyData = async () => {
    const { data, error } = await supabase.from('properties').select('*').eq('id', id).single();
    if (!error) {
      setProperty(data);
      setMessages([{ role: 'marc', text: `Bonjour ! Je suis Marc, votre majordome pour votre séjour à "${data.name}". Comment puis-je vous aider aujourd'hui ?` }]);
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
      setMessages(prev => [...prev, { role: 'marc', text: "Désolé, je rencontre un petit souci technique." }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!property) return null;

  return (
    <div className="chat-wrapper">
      <style jsx global>{`
        body { margin: 0; background: #f4f7fb; height: 100vh; overflow: hidden; }
      `}</style>
      
      <style jsx>{`
        .chat-wrapper { display: flex; flex-direction: column; height: 100vh; font-family: 'Inter', sans-serif; }
        
        header { 
          background: #1a2a6c; color: white; padding: 15px; 
          text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          flex-shrink: 0;
        }
        header h1 { margin: 0; font-size: 18px; font-weight: 800; }
        header p { margin: 4px 0 0; font-size: 11px; opacity: 0.8; letter-spacing: 1px; text-transform: uppercase; }

        .messages-list { 
          flex: 1; overflow-y: auto; padding: 20px 15px;
          display: flex; flex-direction: column; gap: 15px;
        }

        .bubble { 
          max-width: 80%; padding: 12px 16px; border-radius: 20px; 
          font-size: 14px; line-height: 1.5; 
        }
        .marc { align-self: flex-start; background: white; color: #1e293b; border-bottom-left-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .user { align-self: flex-end; background: #1a2a6c; color: white; border-bottom-right-radius: 4px; }

        .typing { font-size: 12px; color: #64748b; margin-left: 10px; }

        .input-container { 
          padding: 15px; background: white; border-top: 1px solid #e2e8f0;
          display: flex; gap: 10px; align-items: center;
          padding-bottom: calc(15px + env(safe-area-inset-bottom, 0px));
        }
        input { flex: 1; padding: 12px 20px; border: 1px solid #e2e8f0; border-radius: 30px; font-size: 14px; outline: none; background: #f8fafc; }
        button { background: #1a2a6c; color: white; border: none; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
      `}</style>

      <header>
        <h1>{property.name}</h1>
        <p>Service de Conciergerie</p>
      </header>

      <div className="messages-list">
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>{m.text}</div>
        ))}
        {isTyping && <div className="typing">Marc écrit...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <input 
          value={input} onChange={(e) => setInput(e.target.value)} 
          placeholder="Écrivez à Marc..." onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </div>
    </div>
  );
}
