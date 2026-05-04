import { Mistral } from '@mistralai/mistralai';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { messages } = req.body;
  if (!messages) return res.status(400).json({ text: "Conversation manquante." });

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
      content: `Tu es Marc, concierge virtuel de luxe. Raffiné, efficace et HONNÊTE. 
      
      TON STATUT : 
      - Tu es un assistant numérique. Tu n'as AUCUN accès physique au logement.
      - Tu ne peux PAS redémarrer de box, ouvrir de porte, ou régler le chauffage toi-même.

      PROTOCOLE DE RÉPONSE :
      1. Aide le client uniquement avec les infos suivantes : ${contexte}.
      2. INTERDICTION d'inventer des solutions techniques ou de prétendre agir physiquement.
      3. Si une action physique est requise (ex: "ça ne marche toujours pas", "il n'y a plus d'eau chaude"), dis : "Je transmets immédiatement votre demande à votre hôte pour qu'une intervention soit organisée au plus vite."
      4. Ne dépasse jamais 3 phrases. Reste très courtois.`
    };

    const chatResponse = await mistral.chat.complete({
      model: 'mistral-small-latest',
      messages: [systemMessage, ...messages],
    });

    res.status(200).json({ text: chatResponse.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ text: "Je m'excuse, un petit souci technique m'empêche de vous répondre. Un instant..." });
  }
}
