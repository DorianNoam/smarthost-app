import Link from 'next/link';
import Head from 'next/head';

export default function CGU() {
  return (
    <div className="legal-container">
      <Head><title>Conditions Générales | alfred major</title></Head>
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

      <h1>Conditions Générales de Vente et d'Utilisation</h1>

      <section>
        <h2>1. Objet</h2>
        <p>Les présentes CGV/CGU encadrent l'utilisation du service alfred major, un assistant virtuel basé sur l'intelligence artificielle pour la gestion de locations de courte durée.</p>

        <h2>2. Abonnement et Tarifs</h2>
        <p>Le service est facturé sous forme d'abonnement mensuel de 19,90€ par logement actif. Une offre de lancement permet de bénéficier du premier mois au tarif réduit de 9,90€.</p>

        <h2>3. Résiliation</h2>
        <p>Le service est sans engagement. L'utilisateur peut résilier son abonnement à tout moment depuis son Espace Hôte. Le mois entamé reste dû et le service continue jusqu'à la fin de la période de facturation.</p>

        <h2>4. Responsabilité</h2>
        <p>alfred major utilise l'IA pour répondre aux voyageurs. Bien que nous fassions tout pour garantir l'exactitude des réponses, nous ne pouvons être tenus responsables des erreurs commises par l'IA. L'Hôte reste responsable des informations qu'il fournit à Marc (codes wifi, consignes, etc.).</p>

        <h2>5. Droit applicable</h2>
        <p>Les présentes conditions sont soumises au droit français. En cas de litige, les tribunaux de [TA VILLE] seront compétents.</p>
      </section>
    </div>
  );
}
