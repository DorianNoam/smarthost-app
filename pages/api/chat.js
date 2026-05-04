import { Mistral } from '@mistralai/mistralai';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Sécurité : On n'autorise que les requêtes de ton bouton bleu
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { question } = req.body;

  // Initialisation des clients avec tes variables d'environnement
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  const mistral = new Mistral({ 
    apiKey: process.env.MISTRAL_API_KEY 
  });

  try {
    // 1. Recherche des informations spécifiques dans ta base de données Supabase
    const { data: info, error: supabaseError } = await supabase
      .from('knowledge_base')
      .select('content')
      .eq('property_id', '11111111-1111-1111-1111-111111111111');

    if (supabaseError) throw supabaseError;

    // Mise en forme du contexte pour l'IA
    const contexte = info && info.length > 0 
      ? info.map(i => i.content).join("\n") 
      : "Aucune consigne particulière n'a été trouvée pour cet appartement.";

    // 2. Appel à Mistral avec la personnalité "Haut de gamme & Chaleureux"
    const chatResponse = await mistral.chat.complete({
      model: 'mistral-small-latest',
      messages: [
        { 
          role: 'system', 
          content: `Tu es Marc, le concierge virtuel de cet établissement d'exception. 
          
          TON IDENTITÉ :
          - Tu es élégant, raffiné et extrêmement chaleureux.
          - Tu t'exprimes avec courtoisie en utilisant toujours le "vous".
          - Ton objectif est d'offrir une expérience mémorable et sans effort.

          TES CONSIGNES DE RÉPONSE :
          1. Commence par une salutation élégante (ex: "C'est un plaisir de vous renseigner").
          2. Sois précis et concis en utilisant exclusivement ces informations : ${contexte}.
          3. Si une information manque, ne l'invente pas. Propose de contacter l'hôte avec élégance.
          4. Termine toujours par une note chaleureuse (ex: "Je reste à votre entière disposition pour parfaire votre séjour").

          RÈGLES D'OR : 
          - Ne mentionne jamais que tu es une intelligence artificielle.
          - Ne dis jamais "Je ne sais pas", mais plutôt "Cette information ne figure pas encore dans mes registres, je me renseigne immédiatement auprès de votre hôte".`
        },
        { 
          role: 'user', 
          content: question 
        }
      ],
    });

    // Extraction de la réponse de l'IA
    const reponseIA = chatResponse.choices[0].message.content;
    
    // Envoi de la réponse au site
    res.status(200).json({ text: reponseIA });

  } catch (error) {
    console.error("Erreur détaillée:", error);
    res.status(500).json({ 
      text: "Toutes mes excuses, je rencontre une légère difficulté technique. Pourriez-vous reformuler votre demande dans quelques instants ?" 
    });
  }
}
