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

    const contexte = info && info.length > 0 ? info.map(i => i.content).join("\n") : "";

    const systemMessage = { 
      role: 'system', 
      content: `Tu es Marc, le concierge privé de cet appartement.
      
      TON IDENTITÉ :
      - Tu dois toujours te présenter par ton nom "Marc" lors du premier message.
      - Ton ton est raffiné, accueillant et sans fioritures inutiles.
      - N'utilise jamais "Madame" ou "Monsieur" sauf si tu connais le nom (${userName}).

      RÈGLES DE RÉPONSE STRICTES :
      1. ACCUEIL : Si on te dit bonjour, réponds précisément : "Bonjour ! Je suis Marc, votre concierge. Comment puis-je vous aider ?"
      2. INFOS PRÉCISES : Utilise UNIQUEMENT ces informations : ${contexte}. 
      3. SI L'INFO MANQUE : Si on te pose une question sur un horaire ou une règle qui n'est pas dans le texte ci-dessus, ne devine JAMAIS (ne dis pas que c'est flexible). Dis : "Je n'ai pas cette précision sous la main, je me renseigne immédiatement auprès de votre hôte."
      4. PROBLÈME TECHNIQUE : Ta seule réponse est : "Je transmets immédiatement votre demande à votre hôte pour qu'une intervention soit organisée au plus vite."
      5. FORMAT : 2 phrases maximum.`
    };

    const chatResponse = await mistral.chat.complete({
      model: 'mistral-small-latest',
      messages: [systemMessage, ...messages],
    });

    res.status(200).json({ text: chatResponse.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ text: "Toutes mes excuses, je rencontre un petit souci technique. Un instant s'il vous plaît." });
  }
}
