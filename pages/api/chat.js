import { Mistral } from '@mistralai/mistralai';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  // On récupère maintenant tout l'historique envoyé par le site
  const { messages, userName } = req.body; 

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

  try {
    const { data: info } = await supabase
      .from('knowledge_base')
      .select('content')
      .eq('property_id', '11111111-1111-1111-1111-111111111111');

    const contexte = info && info.length > 0 ? info.map(i => i.content).join("\n") : "Pas d'infos.";

    // On prépare le message système (les consignes de Marc)
    const systemMessage = { 
      role: 'system', 
      content: `Tu es Marc, un concierge de luxe. Ton ton est raffiné et efficace. 
      RÈGLES :
      - Maximum 3 phrases.
      - Salue poliment (${userName || 'Madame, Monsieur'}).
      - Utilise cet historique pour rester cohérent dans la discussion.
      - Voici tes infos : ${contexte}.`
    };

    // On fusionne : les consignes + tout l'historique de la discussion
    const completeConversation = [systemMessage, ...messages];

    const chatResponse = await mistral.chat.complete({
      model: 'mistral-small-latest',
      messages: completeConversation, // On envoie TOUTE la mémoire
    });

    res.status(200).json({ text: chatResponse.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ text: "Toutes mes excuses, ma mémoire me fait défaut. Un instant..." });
  }
}
