import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ConversationHistory() {
  const router = useRouter();
  const { id } = router.query;
  const [property, setProperty] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const { data: prop } = await supabase
      .from('properties')
      .select('id, name, address, city, street_number, slug')
      .eq('id', id)
      .eq('owner_id', user.id)
      .single();

    if (!prop) { router.push('/messages'); return; }
    setProperty(prop);

    const { data: conv } = await supabase
      .from('conversations')
      .select('history, last_message_at')
      .eq('property_id', id)
      .single();

    setHistory(conv?.history || []);
    setLoading(false);
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    return new Date(ts).toLocaleString('fr-FR', {
      day: '2-digit', month: 'short',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatDate = (ts) => {
    if (!ts) return '';
    return new Date(ts).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  // Groupe les messages par jour
  const groupByDay = (messages) => {
    const groups = [];
    let currentDay = null;
    messages.forEach(msg => {
      const day = msg.timestamp
        ? new Date(msg.timestamp).toDateString()
        : 'unknown';
      if (day !== currentDay) {
        currentDay = day;
        groups.push({ type: 'date', label: formatDate(msg.timestamp) });
      }
      groups.push({ type: 'message', ...msg });
    });
    return groups;
  };

  const grouped = groupByDay(history);
  const userMessages = history.filter(m => m.role === 'user').length;
  const marcMessages = history.filter(m => m.role === 'marc').length;
  const timeSaved = userMessages * 3;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif', color: '#64748b' }}>
      Chargement...
    </div>
  );

  return (
    <div className="page">
      <style jsx global>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #f8fafc; font-family: 'Inter', sans-serif; }
        a { text-decoration: none !important; color: inherit; }
      `}</style>
      <style jsx>{`
        .page { min-height: 100vh; display: flex; flex-direction: column; }

        /* Header sticky */
        .top-bar {
          background: #1a2a6c; color: white; padding: 16px 24px;
          display: flex; align-items: center; gap: 16px;
          position: sticky; top: 0; z-index: 100;
          box-shadow: 0 2px 12px rgba(0,0,0,0.2);
        }
        .back-btn {
          background: rgba(255,255,255,0.12); border: none; color: white;
          padding: 8px 14px; border-radius: 8px; font-weight: 700;
          font-size: 13px; cursor: pointer; font-family: inherit;
          display: flex; align-items: center; gap: 6px; transition: 0.2s;
          white-space: nowrap;
        }
        .back-btn:hover { background: rgba(255,255,255,0.2); }
        .top-info { flex: 1; }
        .top-name { font-size: 17px; font-weight: 800; }
        .top-sub { font-size: 12px; opacity: 0.7; margin-top: 2px; }

        /* Stats */
        .stats-bar {
          background: white; border-bottom: 1px solid #e2e8f0;
          padding: 16px 24px; display: flex; gap: 24px; flex-wrap: wrap;
        }
        .stat { display: flex; align-items: center; gap: 8px; }
        .stat-val { font-size: 18px; font-weight: 900; color: #1a2a6c; }
        .stat-lbl { font-size: 12px; color: #64748b; font-weight: 600; }

        /* Conversation */
        .conv-wrap { flex: 1; max-width: 800px; margin: 0 auto; width: 100%; padding: 24px 20px 60px; }

        /* Date separator */
        .date-sep {
          text-align: center; margin: 24px 0 16px;
          position: relative;
        }
        .date-sep::before {
          content: ''; position: absolute; left: 0; right: 0;
          top: 50%; height: 1px; background: #e2e8f0;
        }
        .date-sep span {
          background: #f8fafc; padding: 4px 16px;
          font-size: 12px; color: #94a3b8; font-weight: 600;
          position: relative; border-radius: 20px;
          border: 1px solid #e2e8f0;
        }

        /* Bubbles */
        .msg-row {
          display: flex; margin-bottom: 12px;
          align-items: flex-end; gap: 10px;
        }
        .msg-row.user { flex-direction: row-reverse; }

        .avatar {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; flex-shrink: 0;
        }
        .avatar.marc { background: linear-gradient(135deg, #1a2a6c, #2a3f9f); }
        .avatar.user { background: #e2e8f0; }

        .bubble {
          max-width: 72%; padding: 12px 16px;
          border-radius: 18px; font-size: 14px;
          line-height: 1.55; word-wrap: break-word;
        }
        .bubble.marc {
          background: white; color: #1e293b;
          border-bottom-left-radius: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          border: 1px solid #f1f5f9;
        }
        .bubble.user {
          background: linear-gradient(135deg, #1a2a6c, #2a3f9f);
          color: white; border-bottom-right-radius: 4px;
        }
        .bubble-time {
          font-size: 10px; margin-top: 5px; display: block;
          opacity: 0.55; text-align: right;
        }
        .msg-row.user .bubble-time { text-align: left; }

        /* Empty */
        .empty-conv {
          text-align: center; padding: 80px 20px; color: #94a3b8;
        }
        .empty-conv h3 { color: #475569; margin: 16px 0 8px; font-size: 18px; }
        .empty-conv p { font-size: 14px; margin: 0; }

        /* CTA bottom */
        .bottom-cta {
          text-align: center; padding: 24px 20px;
          border-top: 1px solid #e2e8f0; background: white;
          position: sticky; bottom: 0;
        }
        .btn-simulate {
          background: #1a2a6c; color: white; padding: 12px 24px;
          border-radius: 12px; font-weight: 700; font-size: 14px;
          border: none; cursor: pointer; font-family: inherit;
          transition: 0.2s; display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-simulate:hover { background: #152259; }

        @media (max-width: 640px) {
          .top-bar { padding: 12px 16px; }
          .stats-bar { padding: 12px 16px; gap: 16px; }
          .stat-val { font-size: 16px; }
          .conv-wrap { padding: 16px 12px 80px; }
          .bubble { max-width: 85%; font-size: 13px; }
          .top-sub { display: none; }
        }
      `}</style>

      {/* HEADER */}
      <div className="top-bar">
        <Link href="/messages" legacyBehavior>
          <a><button className="back-btn">← Conversations</button></a>
        </Link>
        <div className="top-info">
          <div className="top-name">{property?.name}</div>
          <div className="top-sub">
            {property?.street_number} {property?.address}{property?.city ? `, ${property?.city}` : ''}
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-bar">
        <div className="stat">
          <span className="stat-val">{userMessages}</span>
          <span className="stat-lbl">Questions gérées</span>
        </div>
        <div className="stat">
          <span className="stat-val">{marcMessages}</span>
          <span className="stat-lbl">Réponses de Marc</span>
        </div>
        <div className="stat">
          <span className="stat-val">~{timeSaved} min</span>
          <span className="stat-lbl">Temps économisé</span>
        </div>
        <div className="stat">
          <span className="stat-val">{history.length > 0 ? Math.round((marcMessages / Math.max(userMessages, 1)) * 100) : 0}%</span>
          <span className="stat-lbl">Taux de résolution</span>
        </div>
      </div>

      {/* CONVERSATION */}
      <div className="conv-wrap">
        {history.length === 0 ? (
          <div className="empty-conv">
            <span style={{ fontSize: '56px' }}>💬</span>
            <h3>Aucune conversation pour l'instant</h3>
            <p>Marc n'a pas encore reçu de messages de vos voyageurs.</p>
            <p style={{ marginTop: '8px' }}>
              Partagez le lien de votre logement pour que vos voyageurs puissent contacter Marc.
            </p>
          </div>
        ) : (
          grouped.map((item, i) => {
            if (item.type === 'date') {
              return (
                <div key={`date-${i}`} className="date-sep">
                  <span>{item.label}</span>
                </div>
              );
            }
            return (
              <div key={i} className={`msg-row ${item.role}`}>
                <div className={`avatar ${item.role}`}>
                  {item.role === 'marc' ? '🎩' : '👤'}
                </div>
                <div className={`bubble ${item.role}`}>
                  {item.text}
                  {item.timestamp && (
                    <span className="bubble-time">
                      {formatTime(item.timestamp)}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CTA STICKY EN BAS */}
      {history.length > 0 && (
        <div className="bottom-cta">
          <Link href={`/m/${property?.slug || property?.id}`} legacyBehavior>
            <a target="_blank">
              <button className="btn-simulate">
                🎭 Simuler un voyageur
              </button>
            </a>
          </Link>
        </div>
      )}
    </div>
  );
}
