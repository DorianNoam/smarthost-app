import { useState } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('logements');

  return (
    <div className="dashboard-container">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@300;400;600;700&display=swap');

        .dashboard-container {
          display: flex;
          min-height: 100vh;
          font-family: 'Montserrat', sans-serif;
          background: #f4f7f9;
        }

        /* Sidebar */
        .sidebar {
          width: 260px;
          background: #1a2a6c;
          color: white;
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
        }

        .logo {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          margin-bottom: 50px;
          text-align: center;
        }
        .gold { color: #d4af37; }

        .nav-item {
          padding: 15px 20px;
          margin-bottom: 10px;
          border-radius: 12px;
          cursor: pointer;
          transition: 0.3s;
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nav-item:hover, .nav-item.active {
          background: rgba(212, 175, 55, 0.15);
          color: #d4af37;
        }

        .logout { margin-top: auto; opacity: 0.6; font-size: 13px; }

        /* Main Content */
        .main-content {
          flex: 1;
          padding: 40px 5%;
          overflow-y: auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }

        h1 { font-family: 'Playfair Display', serif; color: #1a2a6c; font-size: 28px; }

        .btn-add {
          background: #d4af37;
          color: #1a2a6c;
          padding: 12px 25px;
          border-radius: 50px;
          font-weight: 700;
          text-decoration: none;
          font-size: 14px;
          transition: 0.3s;
        }
        .btn-add:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3); }

        /* Stats Cards */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: white;
          padding: 25px;
          border-radius: 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
        }

        .stat-label { font-size: 11px; text-transform: uppercase; color: #999; font-weight: 700; letter-spacing: 1px; }
        .stat-value { font-size: 24px; font-weight: 700; color: #1a2a6c; margin-top: 5px; }

        /* List of Properties */
        .property-card {
          background: white;
          border-radius: 20px;
          padding: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
          margin-bottom: 20px;
          border: 1px solid transparent;
          transition: 0.3s;
        }

        .property-card:hover { border-color: #d4af37; }

        .property-info h3 { margin: 0; color: #1a2a6c; font-size: 18px; }
        .property-info p { margin: 5px 0 0; color: #777; font-size: 13px; }

        .status-badge {
          background: #e6fffa;
          color: #38b2ac;
          padding: 5px 12px;
          border-radius: 50px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .actions { display: flex; gap: 15px; }
        .btn-action {
          padding: 8px 18px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid #eee;
          background: white;
          transition: 0.2s;
        }
        .btn-action:hover { background: #f9f9f9; border-color: #999; }
      `}</style>

      {/* Sidebar de Navigation */}
      <aside className="sidebar">
        <div className="logo">Major<span className="gold">Marc</span></div>
        <nav>
          <div className={`nav-item ${activeTab === 'logements' ? 'active' : ''}`} onClick={() => setActiveTab('logements')}>
             🏠 Mes Logements
          </div>
          <div className={`nav-item ${activeTab === 'abonnement' ? 'active' : ''}`} onClick={() => setActiveTab('abonnement')}>
             💳 Mon Abonnement
          </div>
          <div className={`nav-item ${activeTab === 'profil' ? 'active' : ''}`} onClick={() => setActiveTab('profil')}>
             👤 Profil & Alertes
          </div>
        </nav>
        <div className="logout">Se déconnecter</div>
      </aside>

      {/* Contenu Principal */}
      <main className="main-content">
        <header className="header">
          <h1>Bienvenue, Jean</h1>
          <Link href="/add-property" className="btn-add">
            + Ajouter un logement
          </Link>
        </header>

        {/* Section Statistiques Rapides */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Messages gérés</div>
            <div className="stat-value">128</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Urgences détectées</div>
            <div className="stat-value">2</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Temps gagné</div>
            <div className="stat-value">14h</div>
          </div>
        </div>

        {/* Liste des logements (Placeholder) */}
        <h2 style={{fontSize: '20px', marginBottom: '20px', color: '#1a2a6c'}}>Vos propriétés</h2>
        
        <div className="property-card">
          <div className="property-info">
            <h3>Villa Bella</h3>
            <p>Lien concierge : <span style={{color: '#d4af37'}}>majormarc.com/villa-bella</span></p>
          </div>
          <div className="status-badge">Actif</div>
          <div className="actions">
            <button className="btn-action">Paramètres</button>
            <button className="btn-action">Voir le chat</button>
          </div>
        </div>

        <div className="property-card">
          <div className="property-info">
            <h3>Appartement Vieux-Port</h3>
            <p>Configuration incomplète - Marc a besoin d'infos</p>
          </div>
          <div style={{background: '#fff5f5', color: '#e53e3e'}} className="status-badge">À configurer</div>
          <div className="actions">
            <button className="btn-action" style={{borderColor: '#d4af37'}}>Terminer</button>
          </div>
        </div>
      </main>
    </div>
  );
}
