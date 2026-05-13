import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase'; // Vérifie bien si c'est ../ ou ../../ selon ton dossier
import Head from 'next/head';

export default function ChatLocataire() {
  const router = useRouter();
  const { id } = router.query;
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // 1. CHERCHER LE LOGEMENT (Par ID ou par SLUG)
  useEffect(() => {
    if (id) fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    // Détection si c'est un UUID ou un Slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let query = supabase.from('properties').select('*');
    if (isUUID) {
      query = query.eq('id', id);
    } else {
      query = query.eq('slug', id);
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      console.error("Logement introuvable");
      setLoading(false);
      return;
    }

    setProperty(data);
    
    // ✅ CHANGEMENT : Bienvenue par Alfred
    setMessages([
      { role: 'alfred', text: `Bonjour ! Je suis Alfred, votre majordome pour votre séjour à ${data.name}. Comment puis-je vous aider ?` }
    ]);
    setLoading(false);
  };

  // 2. SCROLL AUTOMATIQUE
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // 3. ENVOI DU MESSAGE
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    const newMessages = [...messages, { role: 'user', text: userText }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const userLang = navigator.language || navigator.userLanguage;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messagesHistory: newMessages,
          propertyData: property,
          userLanguage: userLang
        }),
      });

      const data = await response.json();

      if (data.answer) {
        // ✅ CHANGEMENT : Rôle alfred
        setMessages([...newMessages, { role: 'alfred', text: data.answer }]);
      } else {
        throw new Error("Pas de réponse");
      }
    } catch (error) {
      setMessages([...newMessages, { role: 'alfred', text: "Désolé, j'ai eu un petit problème technique. Pouvez-vous répéter ?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (loading) return <div style={{padding: '50px', textAlign: 'center', fontFamily: 'sans-serif', color: '#1a2a6c'}}>Chargement d'Alfred...</div>;
  
  if (!property) return (
    <div style={{padding: '50px', textAlign: 'center', fontFamily: 'sans-serif'}}>
      <h2>Logement introuvable 🕵️‍♂️</h2>
      <p>Vérifiez le lien fourni par votre hôte.</p>
    </div>
  );

  return (
    <div className="chat-container">
      <Head>
        {/* ✅ CHANGEMENT : Titre Alfred */}
        <title>Alfred | {property.name}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </Head>

      <style jsx>{`
        .chat-container { display: flex; flex-direction: column; height: 100vh; height: 100dvh; max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 0 20px rgba(0,0,0,0.05); position: relative; }
        
        .header { background: #1a2a6c; color: white; padding: 15px 20px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); z-index: 10; }
        .header-title { font-weight: 800; font-size: 18px; font-family: 'Plus Jakarta Sans', sans-serif; }
        .gold { color: #d4af37; }
        .subtitle { font-size: 12px; opacity: 0.8; margin-top: 2px; }

        .chat-area { flex: 1; padding: 20px; overflow-y: auto; background: #f8fafc; display: flex; flex-direction: column; gap: 15px; }
        
        .msg-wrapper { display: flex; flex-direction: column; }
        .msg { padding: 12px 16px; border-radius: 18px; font-size: 15px; line-height: 1.5; max-width: 85%; word-wrap: break-word; }
        .msg-user { background: #1a2a6c; color: white; align-self: flex-end; border-bottom-right-radius: 4px; }
        
        /* ✅ STYLE : Bulle Alfred */
        .msg-alfred { background: white; color: #1e293b; align-self: flex-start; border-bottom-left-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        
        .typing { align-self: flex-start; color: #64748b; font-size: 13px; font-style: italic; padding: 5px 10px; }

        .input-area { padding: 15px; background: white; border-top: 1px solid #e2e8f0; display: flex; gap: 10px; align-items: center; padding-bottom: calc(15px + env(safe-area-inset-bottom)); }
        input { flex: 1; padding: 14px 20px; border: 1px solid #e2e8f0; border-radius: 30px; font-size: 16px; outline: none; background: #f1f5f9; transition: 0.2s; }
        input:focus { border-color: #d4af37; background: white; box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1); }
        
        button { background: #d4af37; color: #1a2a6c; border: none; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; flex-shrink: 0; }
        button:hover { transform: scale(1.05); background: #f0cc5a; }
        button:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      <div className="header">
        <div className="header-title">🎩 Alfred <span className="gold">Major</span></div>
        <div className="subtitle">{property.name} — Majordome privé</div>
      </div>

      <div className="chat-area">
        {messages.map((msg, idx) => (
          <div key={idx} className="msg-wrapper">
            <div className={`msg ${msg.role === 'user' ? 'msg-user' : 'msg-alfred'}`}>
              <span style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</span>
            </div>
          </div>
        ))}
        {isTyping && <div className="typing">Alfred est en train d'écrire...</div>}
        <div ref={messagesEndRef} />
      </div>

      <form className="input-area" onSubmit={sendMessage}>
        <input 
          type="text" 
          placeholder="Posez votre question à Alfred..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isTyping}
        />
        <button type="submit" disabled={!input.trim() || isTyping}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  );
}
