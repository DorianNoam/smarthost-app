import Link from 'next/link';
import Head from 'next/head';

export default function MentionsLegales() {
  return (
    <div className="legal-container">
      <Head><title>Mentions Légales | Major Marc</title></Head>
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

      <h1>Mentions Légales</h1>

      <section>
        <h2>1. Éditeur du site</h2>
        <p>
          Le site <strong>Major Marc</strong> est édité par :<br />
          [TON NOM OU NOM DE TA SOCIÉTÉ]<br />
          [ADRESSE COMPLÈTE]<br />
          SIRET : [TON NUMÉRO SIRET]<br />
          Directeur de la publication : [TON NOM]
        </p>

        <h2>2. Hébergement</h2>
        <p>
          Le site est hébergé par <strong>Vercel Inc.</strong><br />
          Adresse : 340 S Lemon Ave #1192 Walnut, CA 91789, USA.<br />
          Site web : https://vercel.com
        </p>

        <h2>3. Propriété intellectuelle</h2>
        <p>
          L'ensemble du contenu de ce site (textes, images, logos, icônes) est la propriété exclusive de Major Marc. Toute reproduction ou représentation, en tout ou partie, est strictement interdite sans accord écrit préalable.
        </p>

        <h2>4. Contact</h2>
        <p>Pour toute question, vous pouvez nous contacter à : <strong>contact@majormarc.com</strong></p>
      </section>
    </div>
  );
}
