import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Messages() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    // Récupère les logements avec leur conversation associée
    const { data: properties } = await supabase
      .from('properties')
      .select('id, name, address, city, slug, is_active')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (!properties) { setLoading(false); return; }

    // Pour chaque logement, récupère la conversation
    const enriched = await Promise.all(
      properties.map(async (prop) => {
        const { data: conv } = await supabase
          .from('conversations')
          .select('history, last_message_at')
          .eq('property_id', prop.id)
          .single();

        const history = conv?.history || [];
        const userMessages = history.filter(m => m.role === 'user').length;
        const marcMessages = history.filter(m => m.role === 'marc').length;
        const lastMsg = history[history.length - 1];

        return {
          ...prop,
          messageCount: history.length,
          userMessages,
          marcMessages,
          lastActivity: conv?.last_message_at || null,
          lastMessage: lastMsg?.text || null,
          lastRole: lastMsg?.role || null,
        };
      })
    );

    setData(enriched);
    setLoading(false);
  };

  const formatDate = (ts) => {
    if (!ts) return null;
    const date = new Date(ts);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60);
    if (diff < 1) return 'À l\'instant';
    if (diff < 60) return `Il y a ${diff} min`;
    if (diff < 1440) return `Il y a ${Math.floor(diff / 60)}h`;
    if (diff < 2880) return 'Hier';
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const truncate = (text, max = 60) => {
    if (!text) return '';
    return text.length > max ? text.substring(0, max) + '...' : text;
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif', color: '#64748b' }}>
      Chargement...
    </div>
  );

  const totalMessages = data.reduce((sum, p) => sum + p.messageCount, 0);
  const totalUserMessages = data.reduce((sum, p) => sum + p.userMessages, 0);
  const activeConvs = data.filter(p => p.messageCount > 0).length;

  return (
    <div className="layout">
      <style jsx global>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #f8fafc; font-family: 'Inter', sans-serif; }
        a { text-decoration: none !important; color: inherit; }
      `}</style>
      <style jsx>{`
        .layout { display: flex; min-height: 100vh; }

        nav {
          width: 260px; background: #1a2a6c; color: white;
          padding: 40px 20px; position: fixed; height: 100vh;
          z-index: 100; display: flex; flex-direction: column;
        }
        .logo { font-size: 22px; font-weight: 900; margin-bottom: 50px; text-align: center; }
        .nav-item {
          padding: 14px 18px; border-radius: 12px; display: flex;
          align-items: center; gap: 12px; font-weight: 600;
          opacity: 0.8; margin-bottom: 10px; cursor: pointer;
          color: white; transition: 0.2s;
        }
        .nav-item:hover { opacity: 1; background: rgba(255,255,255,0.05); }
        .nav-item.active { background: rgba(255,255,255,0.15); color: #fbbf24; opacity: 1; }

        main { flex: 1; margin-left: 260px; padding: 50px; }

        .page-header { margin-bottom: 36px; }
        h1 { margin: 0 0 6px; color: #1e293b; font-size: 30px; font-weight: 800; }
        .subtitle { color: #64748b; font-size: 15px; margin: 0; }

        /* Stats rapides */
        .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 36px; }
        .stat-box { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; text-align: center; }
        .stat-num { font-size: 28px; font-weight: 900; color: #1a2a6c; display: block; }
        .stat-label { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; display: block; }

        /* Liste */
        .conv-list { display: flex; flex-direction: column; gap: 14px; max-width: 900px; }
        .conv-card {
          background: white; border-radius: 20px; padding: 22px 24px;
          border: 1px solid #e2e8f0; display: flex; align-items: center;
          gap: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);
          transition: 0.2s; cursor: pointer;
        }
        .conv-card:hover { border-color: #1a2a6c; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(26,42,108,0.08); }
        .conv-card.no-activity { opacity: 0.6; }

        .conv-avatar {
          width: 48px; height: 48px; border-radius: 14px;
          background: linear-gradient(135deg, #1a2a6c, #2a3f9f);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; flex-shrink: 0;
        }
        .conv-avatar.empty { background: #f1f5f9; }

        .conv-main { flex: 1; min-width: 0; }
        .conv-top { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
        .conv-name { font-weight: 800; font-size: 16px; color: #1e293b; }
        .conv-address { font-size: 12px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .conv-preview { font-size: 13px; color: #64748b; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .conv-preview.user-msg::before { content: '👤 '; }
        .conv-preview.marc-msg::before { content: '🎩 '; }
        .conv-preview.empty-msg { font-style: italic; color: #94a3b8; }

        .conv-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0; }
        .conv-time { font-size: 12px; color: #94a3b8; font-weight: 500; }
        .badge-count {
          background: #1a2a6c; color: white; font-size: 11px;
          font-weight: 800; padding: 3px 10px; border-radius: 20px;
          min-width: 24px; text-align: center;
        }
        .badge-count.zero { background: #f1f5f9; color: #94a3b8; }

        .btn-view {
          background: #1a2a6c; color: white; padding: 10px 18px;
          border-radius: 10px; font-weight: 700; font-size: 13px;
          border: none; cursor: pointer; font-family: inherit;
          white-space: nowrap; transition: 0.2s; flex-shrink: 0;
        }
        .btn-view:hover { background: #152259; }

        /* Empty state */
        .empty-state { text-align: center; padding: 60px 20px; color: #64748b; }
        .empty-state p { font-size: 16px; margin: 12px 0 0; }

        @media (max-width: 900px) {
          nav {
            width: 100%; height: 70px; position: fixed; bottom: 0;
            left: 0; top: auto; flex-direction: row; padding: 0;
            justify-content: space-around; align-items: center;
            padding-bottom: env(safe-area-inset-bottom, 0);
          }
          .logo, .nav-text { display: none; }
          .nav-item { margin: 0; padding: 10px; flex: 1; justify-content: center; font-size: 22px; border-radius: 0; }
          main { margin-left: 0; padding: 24px 16px 100px; }
          .stats-row { grid-template-columns: repeat(3, 1fr); gap: 10px; }
          .stat-box { padding: 14px 10px; }
          .stat-num { font-size: 22px; }
          .conv-card { padding: 16px; gap: 12px; }
          .conv-address { display: none; }
          .btn-view { display: none; }
        }
      `}</style>

      {/* SIDEBAR */}
      <nav>
        <div className="logo">MajorMarc 🎩</div>
        <Link href="/dashboard" legacyBehavior>
          <a className="nav-item">🏠 <span className="nav-text">Logements</span></a>
        </Link>
        <Link href="/messages" legacyBehavior>
          <a className="nav-item active">💬 <span className="nav-text">Conversations</span></a>
        </Link>
        <Link href="/settings" legacyBehavior>
          <a className="nav-item">⚙️ <span className="nav-text">Paramètres</span></a>
        </Link>
      </nav>

      <main>
        <div className="page-header">
          <h1>💬 Conversations</h1>
          <p className="subtitle">Tout ce que Marc a géré pour vous.</p>
        </div>

        {/* Stats rapides */}
        <div className="stats-row">
          <div className="stat-box">
            <span className="stat-num">{totalMessages}</span>
            <span className="stat-label">Messages échangés</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">{totalUserMessages}</span>
            <span className="stat-label">Questions gérées</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">{Math.round(totalUserMessages * 3)} min</span>
            <span className="stat-label">Temps économisé</span>
          </div>
        </div>

        {/* Liste des conversations */}
        <div className="conv-list">
          {data.length === 0 ? (
            <div className="empty-state">
              <span style={{ fontSize: '48px' }}>💬</span>
              <p>Aucun logement trouvé.</p>
            </div>
          ) : (
            data.map(prop => (
              <div
                key={prop.id}
                className={`conv-card ${prop.messageCount === 0 ? 'no-activity' : ''}`}
                onClick={() => router.push(`/history/${prop.id}`)}
              >
                <div className={`conv-avatar ${prop.messageCount === 0 ? 'empty' : ''}`}>
                  {prop.messageCount === 0 ? '🏠' : '🎩'}
                </div>

                <div className="conv-main">
                  <div className="conv-top">
                    <span className="conv-name">{prop.name}</span>
                    {prop.city && <span className="conv-address">📍 {prop.city}</span>}
                  </div>
                  {prop.lastMessage ? (
                    <div className={`conv-preview ${prop.lastRole === 'user' ? 'user-msg' : 'marc-msg'}`}>
                      {truncate(prop.lastMessage)}
                    </div>
                  ) : (
                    <div className="conv-preview empty-msg">Aucune conversation pour l'instant</div>
                  )}
                </div>

                <div className="conv-right">
                  {prop.lastActivity && (
                    <span className="conv-time">{formatDate(prop.lastActivity)}</span>
                  )}
                  <span className={`badge-count ${prop.messageCount === 0 ? 'zero' : ''}`}>
                    {prop.messageCount === 0 ? '—' : `${prop.userMessages} msg`}
                  </span>
                </div>

                <button
                  className="btn-view"
                  onClick={(e) => { e.stopPropagation(); router.push(`/history/${prop.id}`); }}
                >
                  Voir →
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
