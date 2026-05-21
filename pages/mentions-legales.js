import Head from 'next/head';
import Link from 'next/link';

export default function MentionsLegales() {
  return (
    <div className="page">
      <Head>
        <title>Mentions Légales — Alfred Major | Majordome IA location courte durée</title>
        <meta name="description" content="Mentions légales d'Alfred Major — Éditeur : Dorian Biscarrat, SIRET 531 965 044 00039. Solution SaaS de majordome IA pour hôtes Airbnb et locations courte durée." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.alfredmajor.com/mentions-legales" />
        <meta property="og:title" content="Mentions Légales — Alfred Major" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.alfredmajor.com/mentions-legales" />
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
        p { font-size: 15px; line-height: 1.8; color: #475569; margin: 0 0 12px; }
        .info-grid { display: grid; grid-template-columns: 200px 1fr; gap: 10px 20px; }
        .info-label { font-weight: 700; color: #334155; font-size: 14px; }
        .info-value { color: #475569; font-size: 14px; }

        .footer-links { margin-top: 60px; padding-top: 24px; border-top: 1px solid #e2e8f0; display: flex; gap: 24px; flex-wrap: wrap; }
        .footer-links a { font-size: 14px; color: #64748b; font-weight: 500; }
        .footer-links a:hover { color: #1a2a6c; }

        @media (max-width: 640px) {
          .container { padding: 40px 16px; }
          .page-header h1 { font-size: 26px; }
          .info-grid { grid-template-columns: 1fr; gap: 4px; }
          .info-label { margin-top: 8px; }
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
          <h1>Mentions Légales</h1>
          <p className="update-date">Dernière mise à jour : mai 2026</p>
        </div>

        {/* ÉDITEUR */}
        <div className="section">
          <h2>1. Éditeur du site</h2>
          <div className="info-grid">
            <span className="info-label">Raison sociale</span>
            <span className="info-value">DORIAN BISCARRAT (Entrepreneur Individuel)</span>
            <span className="info-label">SIRET</span>
            <span className="info-value">531 965 044 00039</span>
            <span className="info-label">SIREN</span>
            <span className="info-value">531 965 044</span>
            <span className="info-label">N° TVA intracommunautaire</span>
            <span className="info-value">FR25531965044</span>
            <span className="info-label">Adresse</span>
            <span className="info-value">44 Avenue Jean Jaurès, 33270 Floirac, France</span>
            <span className="info-label">Email</span>
            <span className="info-value"><a href="mailto:contact@alfredmajor.com">contact@alfredmajor.com</a></span>
            <span className="info-label">Directeur de publication</span>
            <span className="info-value">Dorian BISCARRAT</span>
          </div>
        </div>

        {/* HÉBERGEMENT */}
        <div className="section">
          <h2>2. Hébergement</h2>
          <div className="info-grid">
            <span className="info-label">Hébergeur</span>
            <span className="info-value">Vercel Inc.</span>
            <span className="info-label">Adresse</span>
            <span className="info-value">340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis</span>
            <span className="info-label">Site web</span>
            <span className="info-value"><a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a></span>
          </div>
        </div>

        {/* PROPRIÉTÉ INTELLECTUELLE */}
        <div className="section">
          <h2>3. Propriété intellectuelle</h2>
          <p>L'ensemble des contenus présents sur le site <strong>alfredmajor.com</strong> (textes, graphismes, logo, images, code source) sont la propriété exclusive de Dorian BISCARRAT, sauf mention contraire.</p>
          <p>Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans l'autorisation écrite préalable de Dorian BISCARRAT.</p>
        </div>

        {/* TECHNOLOGIES */}
        <div className="section">
          <h2>4. Technologies et services tiers</h2>
          <p>Le service Alfred Major utilise les technologies et prestataires suivants :</p>
          <div className="info-grid">
            <span className="info-label">Intelligence Artificielle</span>
            <span className="info-value">Groq Inc. (modèle LLaMA) — San Francisco, CA, USA</span>
            <span className="info-label">Recherche web</span>
            <span className="info-value">Tavily AI — États-Unis</span>
            <span className="info-label">Cartographie locale</span>
            <span className="info-value">Google Maps Platform — Google LLC, USA</span>
            <span className="info-label">Paiement en ligne</span>
            <span className="info-value">Stripe Payments Europe Ltd — Dublin, Irlande</span>
            <span className="info-label">Base de données</span>
            <span className="info-value">Supabase Inc. — San Francisco, CA, USA</span>
            <span className="info-label">Alertes</span>
            <span className="info-value">Telegram Messenger — Telegram FZ-LLC, Dubaï</span>
          </div>
        </div>

        {/* RESPONSABILITÉ */}
        <div className="section">
          <h2>5. Limitation de responsabilité</h2>
          <p>Alfred Major est un service d'assistance automatisée par intelligence artificielle. Les informations fournies par le service sont issues de la base de données renseignée par l'hôte et de recherches web automatisées. Alfred Major ne saurait être tenu responsable des erreurs, omissions ou inexactitudes dans les réponses générées.</p>
          <p>En cas d'urgence réelle (danger pour les personnes, incendie, etc.), les utilisateurs sont invités à contacter directement les services d'urgence (15, 17, 18, 112).</p>
        </div>

        {/* DROIT APPLICABLE */}
        <div className="section">
          <h2>6. Droit applicable et juridiction compétente</h2>
          <p>Les présentes mentions légales sont soumises au droit français. En cas de litige, et à défaut de résolution amiable, le tribunal compétent sera celui de <strong>Bordeaux (33)</strong>.</p>
        </div>

        {/* CONTACT */}
        <div className="section">
          <h2>7. Contact</h2>
          <p>Pour toute question relative au site ou au service, vous pouvez nous contacter à l'adresse suivante : <a href="mailto:contact@alfredmajor.com">contact@alfredmajor.com</a></p>
        </div>

        <div className="footer-links">
          <Link href="/conditions-generales" legacyBehavior><a>Conditions Générales de Vente</a></Link>
          <Link href="/confidentialite" legacyBehavior><a>Politique de Confidentialité</a></Link>
          <Link href="/" legacyBehavior><a>Retour à l'accueil</a></Link>
        </div>
      </div>
    </div>
  );
}
