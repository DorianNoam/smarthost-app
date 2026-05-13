import Head from 'next/head';
import Link from 'next/link';

export default function ConditionsGenerales() {
  return (
    <div className="page">
      <Head>
        <title>Conditions Générales de Vente | Alfred Major</title>
        <meta name="description" content="Conditions Générales de Vente d'Alfred Major" />
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
          background: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #fbbf24;
          border-radius: 12px; padding: 16px 20px; margin: 16px 0;
        }
        .highlight-box p { color: #92400e; margin: 0; font-weight: 500; }

        .price-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        .price-table th { background: #1a2a6c; color: white; padding: 12px 16px; text-align: left; font-size: 14px; }
        .price-table td { padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #475569; }
        .price-table tr:last-child td { border-bottom: none; }
        .price-table tr:nth-child(even) td { background: #f8fafc; }

        .footer-links { margin-top: 60px; padding-top: 24px; border-top: 1px solid #e2e8f0; display: flex; gap: 24px; flex-wrap: wrap; }
        .footer-links a { font-size: 14px; color: #64748b; font-weight: 500; }
        .footer-links a:hover { color: #1a2a6c; }

        @media (max-width: 640px) {
          .container { padding: 40px 16px; }
          .page-header h1 { font-size: 26px; }
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
          <h1>Conditions Générales de Vente</h1>
          <p className="update-date">Dernière mise à jour : mai 2026</p>
        </div>

        {/* PRÉAMBULE */}
        <div className="section">
          <h2>1. Préambule</h2>
          <p>Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre :</p>
          <ul>
            <li><strong>Le prestataire :</strong> Dorian BISCARRAT, Entrepreneur Individuel, SIRET 531 965 044 00039, 44 Avenue Jean Jaurès, 33270 Floirac — ci-après "Alfred Major" ou "le Prestataire"</li>
            <li><strong>Le client :</strong> toute personne physique ou morale souscrivant aux services Alfred Major — ci-après "l'Hôte" ou "le Client"</li>
          </ul>
          <p>Toute souscription au service implique l'acceptation pleine et entière des présentes CGV.</p>
        </div>

        {/* SERVICE */}
        <div className="section">
          <h2>2. Description du service</h2>
          <p>Alfred Major est un service de majordome virtuel propulsé par l'intelligence artificielle, destiné aux propriétaires et gestionnaires de locations courte durée. Le service comprend :</p>
          <ul>
            <li>Un assistant IA disponible 24h/24 et 7j/7 pour répondre aux questions des voyageurs</li>
            <li>La gestion d'une base de données personnalisée par logement (codes d'accès, WiFi, équipements, règles...)</li>
            <li>Des recommandations locales basées sur des recherches web en temps réel</li>
            <li>Un système d'alerte en temps réel via Telegram en cas d'urgence signalée par un voyageur</li>
            <li>Un lien unique par logement à partager avec les voyageurs</li>
            <li>Un tableau de bord de gestion pour l'hôte</li>
          </ul>
          <div className="highlight-box">
            <p>⚠️ Alfred Major est un service d'assistance automatisée. Il ne remplace pas les services d'urgence (SAMU : 15, Pompiers : 18, Police : 17). En cas de danger immédiat, les voyageurs doivent contacter directement les secours.</p>
          </div>
        </div>

        {/* TARIFS */}
        <div className="section">
          <h2>3. Tarifs et facturation</h2>
          <table className="price-table">
            <thead>
              <tr>
                <th>Offre</th>
                <th>Prix</th>
                <th>Conditions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1er mois — Offre de lancement</td>
                <td><strong>9,90€ HT</strong></td>
                <td>Par logement, 1er mois uniquement</td>
              </tr>
              <tr>
                <td>Abonnement mensuel</td>
                <td><strong>19,90€ HT</strong></td>
                <td>Par logement, à partir du 2ème mois</td>
              </tr>
            </tbody>
          </table>
          <p>Les prix sont indiqués hors taxes. La TVA applicable est celle en vigueur au moment de la facturation selon la réglementation française.</p>
          <p>La facturation est mensuelle, par logement actif. Le paiement est prélevé automatiquement via Stripe à chaque échéance.</p>
        </div>

        {/* SOUSCRIPTION */}
        <div className="section">
          <h2>4. Souscription et activation</h2>
          <p>La souscription au service s'effectue en ligne sur <a href="https://alfredmajor.com">alfredmajor.com</a> selon les étapes suivantes :</p>
          <ul>
            <li>Création d'un compte hôte</li>
            <li>Configuration d'un logement via le formulaire guidé</li>
            <li>Paiement en ligne sécurisé via Stripe</li>
            <li>Activation immédiate du service après confirmation du paiement</li>
          </ul>
          <p>Le Client reçoit un email de confirmation lors de chaque étape.</p>
        </div>

        {/* DROIT DE RÉTRACTATION */}
        <div className="section">
          <h2>5. Droit de rétractation</h2>
          <p>Conformément à l'article L.221-18 du Code de la consommation, le Client dispose d'un délai de <strong>14 jours calendaires</strong> à compter de la souscription pour exercer son droit de rétractation, sans avoir à justifier de motifs.</p>
          <p>Pour exercer ce droit, le Client doit notifier sa décision par email à : <a href="mailto:contact@alfredmajor.com">contact@alfredmajor.com</a></p>
          <div className="highlight-box">
            <p>⚠️ Conformément à l'article L.221-28 du Code de la consommation, le droit de rétractation ne peut être exercé pour les services pleinement exécutés avant la fin du délai de rétractation, avec l'accord exprès du consommateur.</p>
          </div>
        </div>

        {/* RÉSILIATION */}
        <div className="section">
          <h2>6. Résiliation et sans engagement</h2>
          <p>L'abonnement Alfred Major est <strong>sans engagement de durée</strong>. Le Client peut résilier à tout moment depuis :</p>
          <ul>
            <li>Son tableau de bord Alfred Major → Paramètres → Gérer via Stripe</li>
            <li>Ou par email à <a href="mailto:contact@alfredmajor.com">contact@alfredmajor.com</a></li>
          </ul>
          <p>La résiliation prend effet à la fin de la période de facturation en cours. Aucun remboursement n'est effectué pour la période entamée.</p>
        </div>

        {/* OBLIGATIONS */}
        <div className="section">
          <h2>7. Obligations des parties</h2>
          <h3>7.1 Obligations d'Alfred Major</h3>
          <ul>
            <li>Fournir le service avec diligence et selon les meilleures pratiques</li>
            <li>Assurer la disponibilité du service 24h/24 (hors maintenance planifiée)</li>
            <li>Protéger les données personnelles conformément au RGPD</li>
            <li>Ne jamais vendre les données des clients ou de leurs voyageurs à des tiers</li>
          </ul>
          <h3>7.2 Obligations du Client</h3>
          <ul>
            <li>Fournir des informations exactes et à jour sur ses logements</li>
            <li>S'assurer que les informations partagées avec les voyageurs sont légales et exactes</li>
            <li>Ne pas utiliser le service à des fins illicites</li>
            <li>Maintenir ses coordonnées de paiement à jour</li>
            <li>Informer ses voyageurs qu'ils interagissent avec un assistant automatisé</li>
          </ul>
        </div>

        {/* LIMITATION DE RESPONSABILITÉ */}
        <div className="section">
          <h2>8. Limitation de responsabilité</h2>
          <p>Alfred Major est un service d'assistance automatisée par intelligence artificielle. Les réponses générées sont basées sur les informations renseignées par l'hôte et des recherches web automatisées.</p>
          <p>Alfred Major ne saurait être tenu responsable :</p>
          <ul>
            <li>Des erreurs ou inexactitudes dans les informations renseignées par l'hôte</li>
            <li>Des dommages directs ou indirects résultant de l'utilisation ou de l'impossibilité d'utiliser le service</li>
            <li>Des interruptions de service dues à des causes extérieures (pannes réseau, fournisseurs tiers, force majeure)</li>
            <li>Des réponses générées par l'IA en dehors des informations fournies par l'hôte</li>
          </ul>
          <p>La responsabilité d'Alfred Major est limitée au montant des sommes versées par le Client au cours des 3 derniers mois précédant le fait générateur du litige.</p>
        </div>

        {/* DONNÉES PERSONNELLES */}
        <div className="section">
          <h2>9. Données personnelles</h2>
          <p>Le traitement des données personnelles est détaillé dans notre <Link href="/confidentialite" legacyBehavior><a>Politique de Confidentialité</a></Link>, conforme au Règlement Général sur la Protection des Données (RGPD — Règlement UE 2016/679).</p>
        </div>

        {/* MODIFICATION */}
        <div className="section">
          <h2>10. Modification des CGV</h2>
          <p>Alfred Major se réserve le droit de modifier les présentes CGV à tout moment. Les modifications seront notifiées par email au Client avec un préavis de 30 jours. Le Client qui n'accepte pas les nouvelles conditions pourra résilier son abonnement sans frais pendant ce délai.</p>
        </div>

        {/* DROIT APPLICABLE */}
        <div className="section">
          <h2>11. Droit applicable et litiges</h2>
          <p>Les présentes CGV sont soumises au droit français. En cas de litige, les parties s'engagent à rechercher une solution amiable dans un délai de 30 jours.</p>
          <p>À défaut de résolution amiable, le litige sera soumis au tribunal compétent de <strong>Bordeaux (33)</strong>.</p>
          <p>Conformément aux articles L.612-1 et suivants du Code de la consommation, le Client consommateur peut recourir gratuitement à un médiateur de la consommation.</p>
        </div>

        {/* CONTACT */}
        <div className="section">
          <h2>12. Contact</h2>
          <p>Pour toute question relative aux présentes CGV : <a href="mailto:contact@alfredmajor.com">contact@alfredmajor.com</a></p>
        </div>

        <div className="footer-links">
          <Link href="/mentions-legales" legacyBehavior><a>Mentions Légales</a></Link>
          <Link href="/confidentialite" legacyBehavior><a>Politique de Confidentialité</a></Link>
          <Link href="/" legacyBehavior><a>Retour à l'accueil</a></Link>
        </div>
      </div>
    </div>
  );
}
