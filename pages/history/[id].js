import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

export default function MessageHistory() {
  const router = useRouter();
  const { id } = router.query;
  const [messages, setMessages] = useState([]);
  const [property, setProperty] = useState(null);

  useEffect(() => {
    if (id) {
      fetchProperty();
      fetchMessages();
    }
  }, [id]);

  const fetchProperty = async () => {
    const { data } = await supabase.from('properties').select('name').eq('id', id).single();
    if (data) setProperty(data);
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .eq('property_id', id)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  return (
    <div className="history-container">
      <style jsx global>{`
        body { background: #f1f5f9; font-family: 'Inter', sans-serif; margin: 0; }
      `}</style>
      <style jsx>{`
        .history-container { max-width: 600px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; background: white; box-shadow: 0 0 20px rgba(0,0,0,0.05); }
        header { background: #1a2a6c; color: white; padding: 20px; display: flex; align-items: center; gap: 15px; position: sticky; top: 0; z-index: 10; }
        .back-btn { color: white; font-size: 20px; cursor: pointer; text-decoration: none; }
        h1 { margin: 0; font-size: 18px; font-weight: 800; }
        
        .chat-area { flex: 1; padding: 20px; display: flex; flex-direction: column; gap: 15px; background: #f8fafc; }
        .bubble { max-width: 80%; padding: 12px 16px; border-radius: 18px; font-size: 14px; line-height: 1.5; position: relative; }
        
        .guest { align-self: flex-start; background: white; color: #1e293b; border: 1px solid #e2e8f0; border-bottom-left-radius: 4px; }
        .marc { align-self: flex-end; background: #1a2a6c; color: white; border-bottom-right-radius: 4px; }
        
        .time { font-size: 10px; opacity: 0.5; margin-top: 5px; display: block; text-align: right; }
        .label { font-size: 10px; font-weight: 800; text-transform: uppercase; margin-bottom: 4px; display: block; opacity: 0.7; }
        
        .empty-state { text-align: center; color: #64748b; margin-top: 50px; }
      `}</style>

      <header>
        <Link href="/dashboard" passHref legacyBehavior><a className="back-btn">←</a></Link>
        <div>
          <h1>Historique : {property?.name || 'Chargement...'}</h1>
          <span style={{fontSize: '12px', opacity: 0.8}}>Conversation avec le voyageur</span>
        </div>
      </header>

      <div className="chat-area">
        {messages.length === 0 ? (
          <div className="empty-state">Aucun échange pour le moment.</div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`bubble ${msg.role === 'marc' ? 'marc' : 'guest'}`}>
              <span className="label">{msg.role === 'marc' ? 'Marc' : 'Voyageur'}</span>
              {msg.text}
              <span className="time">{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
