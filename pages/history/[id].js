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
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    const { data: prop } = await supabase.from('properties').select('name').eq('id', id).single();
    if (prop) setProperty(prop);

    const { data: conv } = await supabase
      .from('conversations')
      .select('history')
      .eq('property_id', id)
      .single();
    
    if (conv && conv.history) {
      setMessages(conv.history);
    }
  };

  return (
    <div className="history-container">
      <style jsx>{`
        .history-container { max-width: 600px; margin: 0 auto; background: white; min-height: 100vh; }
        header { background: #1a2a6c; color: white; padding: 20px; display: flex; align-items: center; gap: 15px; }
        .chat-area { padding: 20px; display: flex; flex-direction: column; gap: 10px; }
        .bubble { padding: 12px; border-radius: 15px; max-width: 80%; font-size: 14px; }
        .guest { align-self: flex-start; background: #f1f5f9; }
        .marc { align-self: flex-end; background: #1a2a6c; color: white; }
        .label { font-size: 10px; font-weight: bold; display: block; margin-bottom: 4px; opacity: 0.6; }
      `}</style>

      <header>
        <Link href="/dashboard" passHref legacyBehavior><a>←</a></Link>
        <h1>{property?.name}</h1>
      </header>

      <div className="chat-area">
        {messages.length === 0 ? (
          <p>Aucun échange.</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`bubble ${msg.role === 'marc' ? 'marc' : 'guest'}`}>
              <span className="label">{msg.role === 'marc' ? 'Marc' : 'Voyageur'}</span>
              {msg.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
