import { Mistral } from '@mistralai/mistralai';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { question } = req.body;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  const mistral = new Mistral({ 
    apiKey: process.env.MISTRAL_API_KEY 
  });

  try {
    const { data: info, error: supabaseError } = await supabase
      .from('knowledge_base')
      .select('content')
      .eq('property_id', '11111111-1111-1111-1111-111111111111');

    if (supabaseError) throw supabaseError;

    const contexte = info && info.length > 0 
      ? info.map(i => i.content).join("\n") 
      : "Aucune consigne particulière.";

    const chatResponse = await mistral.chat.complete({
      model: 'mistral-small-latest',
      messages: [
        { 
          role: 'system', 
          content: `Tu es Marc, le concierge virtuel de cet établissement d'exception. 
          
          TON IDENTITÉ :
          - Tu es élégant, raffiné et extrêmement chaleureux.
          - Tu t'exprimes avec courtoisie en utilisant toujours le "vous".

          TES CONSIGNES DE RÉPONSE :
          1. Interdiction de répondre par une seule phrase. Développe toujours tes propos pour offrir un accueil digne d'un grand hôtel.
          2. GESTION DES DEMANDES GÉNÉRALES : Si le voyageur dit "Bonjour", "Peux-tu m'aider ?" ou reste vague, ne liste PAS les informations de l'appartement. Réponds simplement de façon chaleureuse en proposant ton aide et demande-lui ce que tu peux faire pour lui.
          3. GESTION DES DEMANDES PRÉCISES : Utilise exclusivement ces informations pour répondre aux questions spécifiques : ${contexte}.
          4. Si une info manque, propose de contacter l'hôte avec élégance.
          5. Termine toujours par une note invitant au bien-être.

          RÈGLES D'OR : 
          - Ne mentionne jamais que tu es une IA.
          - Ne dis jamais "Je ne sais pas", mais plutôt "Je me renseigne immédiatement auprès de votre hôte".`
        },
        { 
          role: 'user', 
          content: question 
        }
      ],
    });

    const reponseIA = chatResponse.choices[0].message.content;
    res.status(200).json({ text: reponseIA });

  } catch (error) {
    res.status(500).json({ 
      text: "Toutes mes excuses, je rencontre une légère difficulté. Pourriez-vous reformuler votre demande ?" 
    });
  }
}
