import Head from 'next/head';
import Link from 'next/link';

export default function Confidentialite() {
  return (
    <div className="page">
      <Head>
        <title>Politique de Confidentialité & RGPD — Alfred Major</title>
        <meta name="description" content="Politique de confidentialité d'Alfred Major : protection des données personnelles, conformité RGPD, hébergement européen via Supabase. Vos données restent privées et sécurisées." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.alfredmajor.com/confidentialite" />
        <meta property="og:title" content="Politique de Confidentialité & RGPD — Alfred Major" />
        <meta property="og:description" content="Protection des données personnelles et conformité RGPD. Hébergement européen, données sécurisées." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.alfredmajor.com/confidentialite" />
        <meta property="og:site_name" content="Alfred Major" />
        <meta property="og:locale" content="fr_FR" />
      </Head>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        :global(body) { margin: 0; background: #f8fafc; font-family: 'Inter', sans-serif; color: #1e293b; }
        :global(a) { color: #1a2a6c; text-decoration: none; }
        :global(a:hover) { text-decoration: underline; }

        .page { min-height: 100vh; }

        nav {
          background: #1a2a6c; color: white; padding: 16px 5%;
          display: flex; align-items: center; justify-content: space-between;
        }
        .logo { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 22px; font-weight: 800; color: white; }
        .gold { color: #d4af37; }
        .nav-back { color: rgba(255,255,255,0.8); font-size: 14px; font-weight: 600; transition: 0.2s; }
        .nav-back:hover { color: white; text-decoration: none; }

        .container { max-width: 860px; margin: 0 auto; padding: 60px 24px; }

        .page-header { margin-bottom: 48px; padding-bottom: 24px; border-bottom: 2px solid #e2e8f0; }
        .page-header h1 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 34px; font-weight: 800; color: #1a2a6c; margin: 0 0 8px; }
        .update-date { font-size: 14px; color: #64748b; margin: 0; }

        .section { margin-bottom: 40px; }
        h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 20px; font-weight: 800; color: #1a2a6c; margin: 0 0 16px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; }
        h3 { font-size: 16px; font-weight: 700; color: #334155; margin: 20px 0 10px; }
        p { font-size: 15px; line-height: 1.8; color: #475569; margin: 0 0 12px; }
        ul { padding-left: 20px; margin: 0 0 12px; }
        ul li { font-size: 15px; line-height: 1.8; color: #475569; margin-bottom: 6px; }

        .highlight-box {
          background: #eff6ff; border: 1px solid #bfdbfe; border-left: 4px solid #1a2a6c;
          border-radius: 12px; padding: 16px 20px; margin: 16px 0;
        }
        .highlight-box p { color: #1e40af; margin: 0; font-weight: 500; }

        .data-table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
        .data-table th { background: #1a2a6c; color: white; padding: 12px 16px; text-align: left; }
        .data-table td { padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #475569; vertical-align: top; }
        .data-table tr:last-child td { border-bottom: none; }
        .data-table tr:nth-child(even) td { background: #f8fafc; }

        .rights-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0; }
        .right-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
        .right-card h4 { margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #1a2a6c; }
        .right-card p { margin: 0; font-size: 13px; color: #64748b; line-height: 1.5; }

        .footer-links { margin-top: 60px; padding-top: 24px; border-top: 1px solid #e2e8f0; display: flex; gap: 24px; flex-wrap: wrap; }
        .footer-links a { font-size: 14px; color: #64748b; font-weight: 500; }
        .footer-links a:hover { color: #1a2a6c; }

        @media (max-width: 640px) {
          .container { padding: 40px 16px; }
          .page-header h1 { font-size: 26px; }
          .rights-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <nav>
        <Link href="/" legacyBehavior>
          <a className="logo">Alfred<span className="gold">Major</span></a>
        </Link>
        <Link href="/" legacyBehavior>
          <a className="nav-back">← Retour à l'accueil</a>
        </Link>
      </nav>

      <div className="container">
        <div className="page-header">
          <h1>Politique de Confidentialité</h1>
          <p className="update-date">Dernière mise à jour : mai 2026 — Conforme RGPD (Règlement UE 2016/679)</p>
        </div>

        {/* RESPONSABLE */}
        <div className="section">
          <h2>1. Responsable du traitement</h2>
          <p>Le responsable du traitement des données personnelles est :</p>
          <p><strong>Dorian BISCARRAT</strong> — Entrepreneur Individuel<br />
          44 Avenue Jean Jaurès, 33270 Floirac, France<br />
          SIRET : 531 965 044 00039<br />
          Email : <a href="mailto:contact@alfredmajor.com">contact@alfredmajor.com</a></p>
        </div>

        {/* DONNÉES COLLECTÉES */}
        <div className="section">
          <h2>2. Données collectées et finalités</h2>

          <h3>2.1 Données des Hôtes (propriétaires)</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Données</th>
                <th>Finalité</th>
                <th>Base légale</th>
                <th>Durée</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Nom, email, mot de passe</td>
                <td>Création et gestion du compte</td>
                <td>Exécution du contrat</td>
                <td>Durée du compte + 3 ans</td>
              </tr>
              <tr>
                <td>Informations de facturation</td>
                <td>Traitement des paiements</td>
                <td>Obligation légale</td>
                <td>10 ans (comptabilité)</td>
              </tr>
              <tr>
                <td>Informations des logements</td>
                <td>Alimenter la base de connaissances d'Alfred</td>
                <td>Exécution du contrat</td>
                <td>Durée du contrat + 1 an</td>
              </tr>
              <tr>
                <td>Identifiant Telegram</td>
                <td>Envoi des alertes d'urgence</td>
                <td>Consentement</td>
                <td>Jusqu'à déconnexion</td>
              </tr>
            </tbody>
          </table>

          <h3>2.2 Données des Voyageurs</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Données</th>
                <th>Finalité</th>
                <th>Base légale</th>
                <th>Durée</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Contenu des messages échangés avec Alfred</td>
                <td>Fourniture du service de conciergerie</td>
                <td>Intérêt légitime</td>
                <td>12 mois après le dernier échange</td>
              </tr>
              <tr>
                <td>Langue détectée du navigateur</td>
                <td>Adapter la langue de réponse d'Alfred</td>
                <td>Intérêt légitime</td>
                <td>Non conservée</td>
              </tr>
            </tbody>
          </table>

          <div className="highlight-box">
            <p>🔒 Alfred Major ne collecte pas de nom, prénom, email ou numéro de téléphone des voyageurs. Aucun compte n'est créé pour les voyageurs. Les conversations sont uniquement accessibles à l'hôte propriétaire du logement.</p>
          </div>
        </div>

        {/* SOUS-TRAITANTS */}
        <div className="section">
          <h2>3. Sous-traitants et transferts de données</h2>
          <p>Alfred Major fait appel aux prestataires suivants qui peuvent traiter des données personnelles :</p>
          <table className="data-table">
            <thead>
              <tr>
                <th>Prestataire</th>
                <th>Rôle</th>
                <th>Pays</th>
                <th>Garanties</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Supabase Inc.</strong></td>
                <td>Hébergement base de données</td>
                <td>USA / EU</td>
                <td>Clauses contractuelles types UE</td>
              </tr>
              <tr>
                <td><strong>Vercel Inc.</strong></td>
                <td>Hébergement application web</td>
                <td>USA</td>
                <td>Clauses contractuelles types UE</td>
              </tr>
              <tr>
                <td><strong>Groq Inc.</strong></td>
                <td>Traitement IA des messages</td>
                <td>USA</td>
                <td>Accord de traitement des données</td>
              </tr>
              <tr>
                <td><strong>Tavily AI</strong></td>
                <td>Recherche web locale</td>
                <td>USA</td>
                <td>Accord de traitement des données</td>
              </tr>
              <tr>
                <td><strong>Google LLC</strong></td>
                <td>Google Maps (géolocalisation)</td>
                <td>USA</td>
                <td>Clauses contractuelles types UE</td>
              </tr>
              <tr>
                <td><strong>Stripe Payments Europe</strong></td>
                <td>Traitement des paiements</td>
                <td>Irlande (UE)</td>
                <td>Conformité RGPD</td>
              </tr>
              <tr>
                <td><strong>Telegram FZ-LLC</strong></td>
                <td>Alertes d'urgence</td>
                <td>Dubaï</td>
                <td>Consentement explicite de l'hôte</td>
              </tr>
            </tbody>
          </table>
          <p>Alfred Major ne vend, ne loue et ne cède jamais les données personnelles de ses clients ou de leurs voyageurs à des tiers à des fins commerciales.</p>
        </div>

        {/* DROITS */}
        <div className="section">
          <h2>4. Vos droits</h2>
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <div className="rights-grid">
            <div className="right-card">
              <h4>📋 Droit d'accès</h4>
              <p>Obtenir une copie de vos données personnelles traitées par Alfred Major.</p>
            </div>
            <div className="right-card">
              <h4>✏️ Droit de rectification</h4>
              <p>Corriger des données inexactes ou incomplètes vous concernant.</p>
            </div>
            <div className="right-card">
              <h4>🗑️ Droit à l'effacement</h4>
              <p>Demander la suppression de vos données dans les cas prévus par le RGPD.</p>
            </div>
            <div className="right-card">
              <h4>⏸️ Droit à la limitation</h4>
              <p>Restreindre le traitement de vos données dans certaines circonstances.</p>
            </div>
            <div className="right-card">
              <h4>📦 Droit à la portabilité</h4>
              <p>Recevoir vos données dans un format structuré et lisible par machine.</p>
            </div>
            <div className="right-card">
              <h4>🚫 Droit d'opposition</h4>
              <p>Vous opposer au traitement de vos données pour des raisons légitimes.</p>
            </div>
          </div>
          <p>Pour exercer vos droits, contactez-nous à : <a href="mailto:contact@alfredmajor.com">contact@alfredmajor.com</a></p>
          <p>Nous nous engageons à répondre dans un délai maximum de <strong>30 jours</strong>.</p>
          <p>Vous avez également le droit d'introduire une réclamation auprès de la <strong>CNIL</strong> (Commission Nationale de l'Informatique et des Libertés) : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a></p>
        </div>

        {/* SÉCURITÉ */}
        <div className="section">
          <h2>5. Sécurité des données</h2>
          <p>Alfred Major met en œuvre les mesures techniques et organisationnelles appropriées pour protéger vos données :</p>
          <ul>
            <li>Chiffrement des données en transit (HTTPS/TLS)</li>
            <li>Chiffrement des données au repos (Supabase)</li>
            <li>Authentification sécurisée avec gestion des sessions</li>
            <li>Accès aux données limité au personnel autorisé</li>
            <li>Mots de passe hachés (jamais stockés en clair)</li>
            <li>Row Level Security (RLS) sur toutes les tables de base de données</li>
          </ul>
        </div>

        {/* COOKIES */}
        <div className="section">
          <h2>6. Cookies</h2>
          <p>Alfred Major utilise uniquement des cookies strictement nécessaires au fonctionnement du service :</p>
          <ul>
            <li><strong>Cookie de session :</strong> maintient votre connexion à votre espace hôte (durée : session)</li>
            <li><strong>Cookie d'authentification Supabase :</strong> sécurise votre session (durée : 7 jours)</li>
          </ul>
          <p>Aucun cookie publicitaire ou de tracking n'est utilisé. Aucune donnée n'est partagée à des fins publicitaires.</p>
        </div>

        {/* IA */}
        <div className="section">
          <h2>7. Intelligence artificielle et traitement automatisé</h2>
          <p>Les messages échangés avec Alfred sont traités par des systèmes d'intelligence artificielle (Groq/LLaMA) pour générer des réponses pertinentes. Ce traitement est automatisé.</p>
          <p>Alfred Major s'engage à :</p>
          <ul>
            <li>Ne pas utiliser les conversations pour entraîner ou améliorer des modèles d'IA tiers</li>
            <li>Ne pas analyser les conversations à des fins commerciales</li>
            <li>Informer clairement les voyageurs qu'ils interagissent avec un assistant automatisé</li>
          </ul>
          <div className="highlight-box">
            <p>💡 Les voyageurs interagissant avec Alfred ne font l'objet d'aucune décision automatisée ayant des effets juridiques ou les affectant de manière significative.</p>
          </div>
        </div>

        {/* MODIFICATION */}
        <div className="section">
          <h2>8. Modification de la politique de confidentialité</h2>
          <p>Alfred Major se réserve le droit de modifier la présente politique à tout moment. Les modifications importantes seront notifiées par email aux hôtes enregistrés avec un préavis de 30 jours.</p>
        </div>

        {/* CONTACT */}
        <div className="section">
          <h2>9. Contact et réclamations</h2>
          <p>Pour toute question relative à la protection de vos données personnelles :</p>
          <p>
            <strong>Dorian BISCARRAT</strong><br />
            44 Avenue Jean Jaurès, 33270 Floirac<br />
            Email : <a href="mailto:contact@alfredmajor.com">contact@alfredmajor.com</a>
          </p>
          <p>En cas de réclamation non résolue, vous pouvez contacter la CNIL :<br />
            3 Place de Fontenoy, TSA 80715, 75334 PARIS CEDEX 07<br />
            <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>
          </p>
        </div>

        <div className="footer-links">
          <Link href="/mentions-legales" legacyBehavior><a>Mentions Légales</a></Link>
          <Link href="/conditions-generales" legacyBehavior><a>Conditions Générales de Vente</a></Link>
          <Link href="/" legacyBehavior><a>Retour à l'accueil</a></Link>
        </div>
      </div>
    </div>
  );
}
