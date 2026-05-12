import Link from 'next/link';
import Head from 'next/head';

export default function Confidentialite() {
  return (
    <div className="legal-container">
      <Head><title>Politique de Confidentialité | alfred major</title></Head>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Plus+Jakarta+Sans:wght@700;800&display=swap');
        .legal-container { font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.6; padding: 120px 5% 60px; max-width: 800px; margin: 0 auto; }
        h1 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 32px; color: #1a2a6c; margin-bottom: 40px; }
        h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 20px; color: #1a2a6c; margin-top: 30px; }
        nav { position: fixed; top: 0; left: 0; right: 0; background: white; padding: 15px 5%; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 10px rgba(0,0,0,0.05); z-index: 1000; }
        .brand { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 20px; font-weight: 800; color: #1a2a6c; text-decoration: none; }
        .gold { color: #d4af37; }
        .back-link { text-decoration: none; color: #64748b; font-weight: 600; font-size: 14px; }
      `}</style>

      <nav>
        <Link href="/" className="brand">Major<span className="gold">Marc</span></Link>
        <Link href="/" className="back-link">← Retour</Link>
      </nav>

      <h1>Politique de Confidentialité (RGPD)</h1>

      <section>
        <p>Dernière mise à jour : Mai 2026</p>
        
        <h2>1. Collecte des données</h2>
        <p>Nous collectons les informations que vous nous fournissez lors de votre inscription : nom, adresse e-mail, informations sur le logement (adresse, codes d'accès, consignes) et coordonnées de paiement via Stripe.</p>

        <h2>2. Utilisation des données</h2>
        <p>Vos données sont utilisées pour :</p>
        <ul>
          <li>Fournir le service de Majordome IA à vos voyageurs.</li>
          <li>Gérer votre abonnement et la facturation.</li>
          <li>Vous envoyer des alertes d'urgence via Telegram.</li>
        </ul>

        <h2>3. Conservation des données</h2>
        <p>Les données sont conservées via <strong>Supabase</strong> pendant toute la durée de vie de votre compte. En cas de suppression de compte, vos données sont effacées de nos bases de données sous 30 jours.</p>

        <h2>4. Partage des données</h2>
        <p>alfred major ne revend aucune donnée. Vos données sont partagées uniquement avec nos prestataires techniques nécessaires au service : Stripe (Paiement) et OpenAI (Traitement de l'IA).</p>

        <h2>5. Vos droits</h2>
        <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Contactez-nous à <strong>contact@majormarc.com</strong> pour toute demande.</p>
      </section>
    </div>
  );
}
