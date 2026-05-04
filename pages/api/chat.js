import { Mistral } from '@mistralai/mistralai';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // On n'accepte que les requêtes POST (celles de ton bouton bleu)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { question } = req.body;

  // Connexion aux deux services
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  const mistral = new Mistral({ 
    apiKey: process.env.MISTRAL_API_KEY 
  });

  try {
    // 1. Récupérer les infos de l'appartement dans Supabase
    // On garde l'ID de test utilisé dans ton SQL
    const { data: info, error: supabaseError } = await supabase
      .from('knowledge_base')
      .select('content')
      .eq('property_id', '11111111-1111-1111-1111-111111111111');

    if (supabaseError) throw supabaseError;

    const contexte = info && info.length > 0 
      ? info.map(i => i.content).join("\n") 
      : "Aucune information n'a été trouvée pour cet appartement.";

    // 2. Demander à Mistral de répondre au voyageur
    const chatResponse = await mistral.chat.complete({
      model: 'mistral-small-latest',
      messages: [
        { 
          role: 'system', 
          content: `Tu es un concierge d'appartement expert. Réponds de façon concise et polie en utilisant ces infos : ${contexte}` 
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
    console.error("Détails de l'erreur:", error);
    res.status(500).json({ text: "Le concierge Mistral est un peu fatigué, réessaye dans quelques secondes !" });
  }
}
