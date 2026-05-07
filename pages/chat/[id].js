import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';

export default function PropertyChat() {
  const router = useRouter();
  const { id } = router.query;
  const [property, setProperty] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // 1. FIX MOBILE : Calcule la vraie hauteur visible (évite que le titre soit caché)
  useEffect(() => {
    const setHeight = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };
    setHeight();
    window.addEventListener('resize', setHeight);
    return () => window.removeEventListener('resize', setHeight);
  }, []);

  useEffect(() => { if (id) fetchPropertyData(); }, [id]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // 2. DETECTION DE LA LANGUE & RECUPERATION DES INFOS
  const fetchPropertyData = async () => {
    const { data } = await supabase.from('properties').select('*').eq('id', id).single();
    if (data) {
      setProperty(data);
      
      // Détection de la langue du smartphone
      const userLang = typeof window !== 'undefined' ? (navigator.language || navigator.userLanguage) : 'fr';
      const shortLang = userLang.split('-')[0];

      // Dictionnaire de bienvenue
      const greetings = {
        fr: `Bonjour ! Je suis Marc, votre majordome pour votre séjour à "${data.name}". Comment puis-je vous aider aujourd'hui ?`,
        en: `Hello! I am Marc, your butler for your stay at "${data.name}". How can I help you today?`,
        es: `¡Hola! Soy Marc, su mayordomo para su estancia en "${data.name}". ¿Cómo puedo ayudarle hoy?`,
        de: `Hallo! Ich bin Marc, Ihr Butler für Ihren Aufenthalt im "${data.name}". Wie kann ich Ihnen heute helfen?`,
        it: `Buongiorno! Sono Marc, il vostro maggiordomo per il vostro soggiorno a "${data.name}". Come posso aiutarvi oggi?`
      };

      const welcomeMessage = greetings[shortLang] || greetings['en'];
      setMessages([{ role: 'marc', text: welcomeMessage }]);
    }
  };

  // 3. RENDU DES LIENS (Maps, etc.)
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

  // 4. ENVOI DU MESSAGE
  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const userLang = navigator.language || navigator.userLanguage;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messagesHistory: [...messages, userMsg], 
          propertyData: property,
          userLanguage: userLang 
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'marc', text: data.answer }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'marc', text: "Désolé, j'ai un souci technique." }]);
    } finally { setIsTyping(false); }
  };

  if (!property) return null;

  return (
    <div className="app-container">
      <style jsx global>{`
        body { margin: 0; padding: 0; overflow: hidden; height: calc(var(--vh, 1vh) * 100); background: #f4f7fb; position: fixed; width: 100%; }
      `}</style>
      
      <style jsx>{`
        .app-container { display: flex; flex-direction: column; height: calc(var(--vh, 1vh) * 100); width: 100%; font-family: 'Inter', sans-serif; }
        
        header { 
          background: #1a2a6c; color: white; 
          /* Protection contre la barre de recherche mobile */
          padding: calc(45px + env(safe-area-inset-top, 0px)) 20px 15px; 
          text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.2); z-index: 100;
        }
        header h1 { margin: 0; font-size: 18px; font-weight: 800; }
        header p { margin: 4px 0 0; font-size: 10px; opacity: 0.7; text-transform: uppercase; letter-spacing: 1.5px; }

        .chat-area { flex: 1; overflow-y: auto; padding: 20px 15px; display: flex; flex-direction: column; gap: 15px; -webkit-overflow-scrolling: touch; }
        .bubble { max-width: 85%; padding: 12px 16px; border-radius: 20px; font-size: 14px; line-height: 1.5; }
        .marc { align-self: flex-start; background: white; color: #1e293b; border-bottom-left-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .user { align-self: flex-end; background: #1a2a6c; color: white; border-bottom-right-radius: 4px; }

        .input-bar { background: white; padding: 15px; display: flex; gap: 10px; border-top: 1px solid #eee; padding-bottom: calc(15px + env(safe-area-inset-bottom, 0px)); }
        input { flex: 1; padding: 12px 20px; border: 1px solid #ddd; border-radius: 30px; outline: none; font-size: 16px; background: #f8fafc; }

        .send-btn { 
            background: #1a2a6c; border: none; width: 45px; height: 45px; border-radius: 50%; 
            display: flex; align-items: center; justify-content: center; cursor: pointer; 
        }
      `}</style>

      <header>
        <h1>{property.name}</h1>
        <p>Service de Conciergerie</p>
      </header>

      <div className="chat-area">
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>
            {renderText(m.text)}
          </div>
        ))}
        {isTyping && <div style={{fontSize:'12px', color:'#64748b', marginLeft:'10px', fontStyle: 'italic'}}>Marc écrit...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-bar">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()} 
          placeholder="Posez votre question..." 
        />
        <button className="send-btn" onClick={sendMessage}>
          {/* Nouvelle icône Avion en papier */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
}
