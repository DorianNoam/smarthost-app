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
      
      RÈGLES DE COMMUNICATION :
      1. SALUTATION : Adresse-toi au client en utilisant son nom si fourni : ${userName || ''}. Si tu ne connais pas son nom, dis simplement "Bonjour" sans ajouter de titre comme "Madame" ou "Monsieur".
      2. ACTIONS PHYSIQUES : Tu n'as aucun pouvoir physique sur l'appartement. Si un problème technique est signalé, ta seule réponse est : "Je transmets immédiatement votre demande à votre hôte pour qu'une intervention soit organisée au plus vite."
      3. CONCISION : Reste élégant mais efficace. 2 à 3 phrases maximum par réponse.
      4. INTERDICTION : Ne parle jamais de "chambre", de "réception" ou d'hôtel. Tu es dans un appartement privé. Ne mentionne jamais que tu es virtuel ou une IA.`
    };

    const chatResponse = await mistral.chat.complete({
      model: 'mistral-small-latest',
      messages: [systemMessage, ...messages],
    });

    res.status(200).json({ text: chatResponse.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ text: "Je vous prie de m'excuser, je rencontre un contretemps technique. Un instant s'il vous plaît." });
  }
}
