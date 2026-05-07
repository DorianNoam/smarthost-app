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

  useEffect(() => { if (id) fetchPropertyData(); }, [id]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const renderText = (text) => {
    const linkRegex = /\[(.*?)\]\((.*?)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = linkRegex.exec(text)) !== null) {
      parts.push(text.substring(lastIndex, match.index));
      parts.push(<a key={match.index} href={match[2]} target="_blank" rel="noopener noreferrer" style={{ color: '#fbbf24', fontWeight: 'bold', textDecoration: 'underline' }}>{match[1]}</a>);
      lastIndex = linkRegex.lastIndex;
    }
    parts.push(text.substring(lastIndex));
    return parts.length > 0 ? parts : text;
  };

  const fetchPropertyData = async () => {
    const { data, error } = await supabase.from('properties').select('*').eq('id', id).single();
    if (!error) {
      setProperty(data);
      setMessages([{ role: 'marc', text: `Bonjour ! Je suis Marc, votre majordome pour votre séjour à "${data.name}". Comment puis-je vous aider ?` }]);
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
      setMessages(prev => [...prev, { role: 'marc', text: "Désolé, j'ai un souci technique." }]);
    } finally { setIsTyping(false); }
  };

  if (!property) return null;

  return (
    <div className="chat-layout">
      <style jsx global>{`
        body { margin: 0; background: #f4f7fb; height: 100vh; overflow: hidden; }
      `}</style>
      
      <style jsx>{`
        .chat-layout { display: flex; flex-direction: column; height: 100vh; font-family: 'Inter', sans-serif; }
        
        /* BANDEAU BLEU FIXE EN HAUT */
        header { 
          background: #1a2a6c; 
          color: white; 
          padding: 12px 15px; 
          text-align: center; 
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          position: sticky;
          top: 0;
          z-index: 1000;
        }
        header h1 { margin: 0; font-size: 16px; font-weight: 800; letter-spacing: 0.5px; }
        header p { margin: 2px 0 0; font-size: 10px; opacity: 0.7; text-transform: uppercase; letter-spacing: 1.5px; }

        .messages-container { 
          flex: 1; 
          overflow-y: auto; 
          padding: 20px 15px; 
          display: flex; 
          flex-direction: column; 
          gap: 15px;
          background: #f4f7fb;
        }

        .bubble { max-width: 85%; padding: 12px 16px; border-radius: 20px; font-size: 14px; line-height: 1.5; }
        .marc { align-self: flex-start; background: white; color: #1e293b; border-bottom-left-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .user { align-self: flex-end; background: #1a2a6c; color: white; border-bottom-right-radius: 4px; }

        .input-area { 
          background: white; 
          padding: 15px; 
          border-top: 1px solid #e2e8f0; 
          display: flex; 
          gap: 10px; 
          padding-bottom: calc(15px + env(safe-area-inset-bottom, 0px));
        }
        input { flex: 1; padding: 12px 20px; border: 1px solid #e2e8f0; border-radius: 25px; font-size: 14px; outline: none; background: #f8fafc; }
        button { background: #1a2a6c; color: white; border: none; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
      `}</style>

      {/* LE NOM DU LOGEMENT APPARAÎT ICI DANS LE BANDEAU BLEU */}
      <header>
        <h1>{property.name}</h1>
        <p>Service de Conciergerie</p>
      </header>

      <div className="messages-container">
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>
            {renderText(m.text)}
          </div>
        ))}
        {isTyping && <div style={{fontSize:'12px', color:'#64748b', marginLeft:'10px'}}>Marc réfléchit...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()} 
          placeholder="Posez votre question à Marc..." 
        />
        <button onClick={sendMessage}>🚀</button>
      </div>
    </div>
  );
}
