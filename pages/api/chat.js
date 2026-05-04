import { Mistral } from '@mistralai/mistralai';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { messages, userName } = req.body;
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

  try {
    const { data: info } = await supabase
      .from('knowledge_base')
      .select('content')
      .eq('property_id', '11111111-1111-1111-1111-111111111111');

    const contexte = info && info.length > 0 ? info.map(i => i.content).join("\n") : "Pas d'infos.";

    const systemMessage = { 
      role: 'system', 
      content: `Tu es Marc, le concierge privé de cet appartement de prestige.
      
      RÈGLES D'OR DE SAVOIR-VIVRE :
      1. GENRE : Si tu ne connais pas le nom du client via la variable ${userName}, utilise impérativement "Madame, Monsieur". Ne dis JAMAIS "Monsieur" ou "Madame" au hasard.
      2. ACTIONS : Tu es un assistant conversationnel. Tu ne peux rien faire physiquement. Si un problème technique survient, ta SEULE réponse est : "Je transmets immédiatement votre demande à votre hôte pour qu'une intervention soit organisée."
      3. CONCISION : Pas de blabla inutile. 2 à 3 phrases maximum.
      4. CONTEXTE : Utilise exclusivement ces informations : ${contexte}.
      
      TON INTERDICTION : 
      - Ne demande jamais de "numéro de chambre" (c'est un appartement privé).
      - Ne dis jamais "Je m'en occupe" pour un objet physique.`
    };

    const chatResponse = await mistral.chat.complete({
      model: 'mistral-small-latest',
      messages: [systemMessage, ...messages],
    });

    res.status(200).json({ text: chatResponse.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ text: "Toutes mes excuses, je rencontre un contretemps technique. Un instant s'il vous plaît." });
  }
}
