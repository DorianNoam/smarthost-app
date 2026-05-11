import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase'; // Attention au double ../
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
    // On vérifie si l'URL contient l'ancien ID complexe ou le nouveau Slug propre
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
    // Message de bienvenue initial
    setMessages([
      { role: 'marc', text: `Bonjour ! Je suis Marc, votre majordome virtuel pour ${data.name}. Comment puis-je vous aider ?` }
    ]);
    setLoading(false);
  };

  // 2. SCROLL AUTOMATIQUE VERS LE BAS
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // 3. ENVOI DU MESSAGE À TON API PARFAITE
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    const newMessages = [...messages, { role: 'user', text: userText }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      // Détection basique de la langue du navigateur pour aider ton API
      const userLang = navigator.language || navigator.userLanguage;

      // On envoie à ton fichier parfait : pages/api/chat.js
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
        setMessages([...newMessages, { role: 'marc', text: data.answer }]);
      } else {
        throw new Error("Pas de réponse");
      }
    } catch (error) {
      setMessages([...newMessages, { role: 'marc', text: "Désolé, j'ai eu un petit problème technique. Pouvez-vous répéter ?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  // --- RENDU VISUEL ---
  if (loading) return <div style={{padding: '50px', textAlign: 'center', fontFamily: 'sans-serif'}}>Chargement du Majordome...</div>;
  
  if (!property) return (
    <div style={{padding: '50px', textAlign: 'center', fontFamily: 'sans-serif'}}>
      <h2>Logement introuvable 🕵️‍♂️</h2>
      <p>Vérifiez le lien fourni par votre hôte.</p>
    </div>
  );

  return (
    <div className="chat-container">
      <Head>
        <title>Marc | {property.name}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </Head>

      <style jsx>{`
        body { margin: 0; background: #f0f2f5; font-family: 'Inter', sans-serif; }
        .chat-container { display: flex; flex-direction: column; height: 100vh; height: 100dvh; max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 0 20px rgba(0,0,0,0.05); }
        
        .header { background: #1a2a6c; color: white; padding: 20px; text-align: center; font-weight: bold; font-size: 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); z-index: 10; }
        .gold { color: #d4af37; }
        .subtitle { font-size: 12px; font-weight: normal; opacity: 0.8; margin-top: 5px; }

        .chat-area { flex: 1; padding: 20px; overflow-y: auto; background: #f0f2f5; display: flex; flex-direction: column; gap: 15px; }
        
        .msg-wrapper { display: flex; flex-direction: column; }
        .msg { padding: 12px 16px; border-radius: 18px; font-size: 15px; line-height: 1.5; max-width: 85%; word-wrap: break-word; }
        .msg-user { background: #1a2a6c; color: white; align-self: flex-end; border-bottom-right-radius: 4px; }
        .msg-marc { background: white; color: #1e293b; align-self: flex-start; border-bottom-left-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        
        .typing { align-self: flex-start; color: #64748b; font-size: 13px; font-style: italic; padding: 0 10px; }

        .input-area { padding: 15px; background: white; border-top: 1px solid #e2e8f0; display: flex; gap: 10px; align-items: center; }
        input { flex: 1; padding: 15px 20px; border: 1px solid #e2e8f0; border-radius: 30px; font-size: 15px; outline: none; background: #f8fafc; transition: 0.2s; }
        input:focus { border-color: #d4af37; background: white; }
        button { background: #d4af37; color: #1a2a6c; border: none; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
        button:hover { transform: scale(1.05); }
        button:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div className="header">
        <div>{property.name}</div>
        <div className="subtitle">Assistant virtuel disponible 24/7</div>
      </div>

      <div className="chat-area">
        {messages.map((msg, idx) => (
          <div key={idx} className="msg-wrapper">
            <div className={`msg ${msg.role === 'user' ? 'msg-user' : 'msg-marc'}`}>
              {/* Utilisation de pre-wrap pour respecter les sauts de ligne envoyés par ton API */}
              <span style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</span>
            </div>
          </div>
        ))}
        {isTyping && <div className="typing">Marc est en train d'écrire...</div>}
        <div ref={messagesEndRef} />
      </div>

      <form className="input-area" onSubmit={sendMessage}>
        <input 
          type="text" 
          placeholder="Posez votre question..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isTyping}
        />
        <button type="submit" disabled={!input.trim() || isTyping}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </form>
    </div>
  );
}
