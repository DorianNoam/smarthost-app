import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabase';

export default function PropertyChat() {
  const router = useRouter();
  const { id } = router.query;
  const [property, setProperty] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const messagesEndRef = useRef(null);

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

  const fetchPropertyData = async () => {
    // ── Cherche par slug d'abord, puis par UUID si pas trouvé ──
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let data = null;

    if (isUUID) {
      const res = await supabase
        .from('properties')
        .select('id, name, city')
        .eq('id', id)
        .eq('is_active', true)
        .single();
      data = res.data;
    } else {
      // Cherche par slug
      const res = await supabase
        .from('properties')
        .select('id, name, city')
        .eq('slug', id)
        .eq('is_active', true)
        .single();
      data = res.data;
    }

    if (data) {
      setProperty(data);

      const userLang = typeof window !== 'undefined' ? (navigator.language || navigator.userLanguage) : 'fr';
      const shortLang = userLang.split('-')[0];

      const greetings = {
        fr: `Bonjour ! Je suis Alfred, votre majordome pour votre séjour à "${data.name}". Comment puis-je vous aider ?`,
        en: `Hello! I am Alfred, your butler for your stay at "${data.name}". How can I help you today?`,
        es: `¡Hola! Soy Alfred, su mayordomo para su estancia en "${data.name}". ¿Cómo puedo ayudarle?`,
        de: `Hallo! Ich bin Alfred, Ihr Butler für Ihren Aufenthalt in "${data.name}". Wie kann ich Ihnen helfen?`,
        it: `Buongiorno! Sono Alfred, il vostro maggiordomo per il soggiorno a "${data.name}". Come posso aiutarvi?`,
        nl: `Hallo! Ik ben Alfred, uw butler voor uw verblijf in "${data.name}". Hoe kan ik u helpen?`,
        pt: `Olá! Sou Alfred, o seu mordomo para a sua estadia em "${data.name}". Como posso ajudar?`,
        ar: `مرحباً! أنا ألفريد، خادمك الشخصي خلال إقامتك في "${data.name}". كيف يمكنني مساعدتك؟`,
        zh: `您好！我是Alfred，您在"${data.name}"住宿期间的管家。我可以帮您什么？`,
        ja: `こんにちは！私はアルフレッドです。"${data.name}"でのご滞在中のバトラーです。何かお手伝いできることはありますか？`,
        ru: `Здравствуйте! Я Альфред, ваш дворецкий в "${data.name}". Чем могу помочь?`,
      };

      setMessages([{ role: 'marc', text: greetings[shortLang] || greetings['en'] }]);
    } else {
      setNotFound(true);
    }
  };

  const renderText = (text) => {
    if (!text) return "";
    const linkRegex = /\[(.*?)\]\((.*?)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = linkRegex.exec(text)) !== null) {
      parts.push(text.substring(lastIndex, match.index));
      parts.push(
        <a key={match.index} href={match[2]} target="_blank" rel="noopener noreferrer"
          style={{ color: '#fbbf24', fontWeight: 'bold', textDecoration: 'underline' }}>
          {match[1]}
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }
    parts.push(text.substring(lastIndex));
    return parts.length > 1 ? parts : text;
  };

  const sendMessage = async () => {
    if (!input.trim() || !property) return;
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
          propertyId: property.id,
          userLanguage: userLang,
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'marc', text: data.answer }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'marc', text: "Désolé, j'ai un souci technique. Réessayez dans un instant." }]);
    } finally {
      setIsTyping(false);
    }
  };

  // ── Page introuvable ──
  if (notFound) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif', flexDirection: 'column', gap: 16, padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 56 }}>🎩</div>
      <h2 style={{ color: '#1a2a6c', margin: 0 }}>Logement introuvable</h2>
      <p style={{ color: '#64748b', margin: 0 }}>Ce lien ne correspond à aucun logement actif. Vérifiez l'URL ou contactez votre hôte.</p>
    </div>
  );

  // ── Chargement ──
  if (!property) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 40 }}>🎩</div>
      <p style={{ color: '#64748b' }}>Connexion en cours...</p>
    </div>
  );

  return (
    <div className="app-container">
      <Head>
        <meta name="robots" content="noindex, nofollow" />
        <title>Alfred — {property.name}</title>
      </Head>
      <style jsx global>{`
        body { margin: 0; padding: 0; overflow: hidden; height: calc(var(--vh, 1vh) * 100); background: #f4f7fb; position: fixed; width: 100%; }
      `}</style>
      <style jsx>{`
        .app-container { display: flex; flex-direction: column; height: calc(var(--vh, 1vh) * 100); width: 100%; font-family: 'Inter', sans-serif; }
        header { background: #1a2a6c; color: white; padding: calc(45px + env(safe-area-inset-top, 0px)) 20px 15px; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.2); z-index: 100; }
        header h1 { margin: 0; font-size: 18px; font-weight: 800; }
        header p { margin: 4px 0 0; font-size: 10px; opacity: 0.7; text-transform: uppercase; letter-spacing: 1.5px; }
        .chat-area { flex: 1; overflow-y: auto; padding: 20px 15px; display: flex; flex-direction: column; gap: 15px; -webkit-overflow-scrolling: touch; }
        .bubble { max-width: 85%; padding: 12px 16px; border-radius: 20px; font-size: 14px; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word; }
        .marc { align-self: flex-start; background: white; color: #1e293b; border-bottom-left-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .user { align-self: flex-end; background: #1a2a6c; color: white; border-bottom-right-radius: 4px; }
        .typing { font-size: 12px; color: #64748b; margin-left: 10px; font-style: italic; align-self: flex-start; }
        .input-bar { background: white; padding: 15px; display: flex; gap: 10px; border-top: 1px solid #eee; padding-bottom: calc(15px + env(safe-area-inset-bottom, 0px)); }
        input { flex: 1; padding: 12px 20px; border: 1px solid #ddd; border-radius: 30px; outline: none; font-size: 16px; background: #f8fafc; font-family: 'Inter', sans-serif; }
        .send-btn { background: #1a2a6c; border: none; width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
        .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <header>
        <h1>🎩 {property.name}</h1>
        <p>Service de Conciergerie · Disponible 24h/24</p>
      </header>

      <div className="chat-area">
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>{renderText(m.text)}</div>
        ))}
        {isTyping && <div className="typing">Alfred écrit...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-bar">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && sendMessage()}
          placeholder="Posez votre question..."
        />
        <button className="send-btn" onClick={sendMessage} disabled={isTyping}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
