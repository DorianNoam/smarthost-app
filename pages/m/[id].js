import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase'; // Attention au double ../ car on est dans un sous-dossier
import Head from 'next/head';

export default function ChatLocataire() {
  const router = useRouter();
  const { id } = router.query;
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    // 💡 L'astuce ultime : on vérifie si l'ID dans l'URL ressemble à un vrai UUID (chiffres/lettres avec tirets)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let query = supabase.from('properties').select('*');

    if (isUUID) {
      // Si c'est l'ancien format, on cherche par ID
      query = query.eq('id', id);
    } else {
      // Si c'est le nouveau format pro (slug), on cherche par slug
      query = query.eq('slug', id);
    }

    // Le fameux maybeSingle() conseillé par Claude
    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      console.error("Logement introuvable");
      setLoading(false);
      return;
    }

    setProperty(data);
    setLoading(false);
  };

  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>Chargement du Majordome...</div>;
  
  if (!property) return (
    <div style={{padding: '50px', textAlign: 'center', fontFamily: 'sans-serif'}}>
      <h2>Logement introuvable 🕵️‍♂️</h2>
      <p>Vérifiez le lien fourni par votre hôte.</p>
    </div>
  );

  return (
    <div className="chat-container">
      <Head>
        <title>Marc | {property.name}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </Head>

      <style jsx>{`
        /* METS ICI TOUT LE CSS QUE TU AVAIS DANS TON ANCIEN FICHIER CHAT.JS */
        body { margin: 0; background: #f0f2f5; font-family: 'Inter', sans-serif; }
        .chat-container { display: flex; flex-direction: column; height: 100vh; max-width: 600px; margin: 0 auto; background: white; }
        .header { background: #1a2a6c; color: white; padding: 20px; text-align: center; font-weight: bold; }
        .content { flex: 1; padding: 20px; overflow-y: auto; }
      `}</style>

      <div className="header">
        Bienvenue à {property.name} ! 🎩
      </div>
      
      <div className="content">
        {/* METS ICI L'INTERFACE DE TON CHAT (Messages, Input, Bouton envoyer) */}
        <p>Bonjour ! Je suis Marc, votre majordome virtuel. Comment puis-je vous aider ?</p>
      </div>
    </div>
  );
}
