import { Mistral } from '@mistralai/mistralai';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { question, userName } = req.body;
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

  try {
    const { data: info } = await supabase
      .from('knowledge_base')
      .select('content')
      .eq('property_id', '11111111-1111-1111-1111-111111111111');

    const contexte = info && info.length > 0 ? info.map(i => i.content).join("\n") : "Pas d'infos.";

    const chatResponse = await mistral.chat.complete({
      model: 'mistral-small-latest',
      messages: [
        { 
          role: 'system', 
          content: `Tu es Marc, un concierge de luxe. Ton ton est raffiné, chaleureux mais EFFICACE. 
          
          DIRECTIVES DE STYLE :
          1. Ne dépasse JAMAIS 3 ou 4 phrases par réponse. Le luxe, c'est la clarté.
          2. Si on te dit "Bonjour" ou "Peux-tu m'aider", salue élégamment (en utilisant ${userName || 'Madame, Monsieur'}) et demande simplement en quoi tu peux être utile. Ne liste rien à ce stade.
          3. Pour les questions précises, utilise ce contexte : ${contexte}.
          4. Sois chaleureux mais évite les envolées lyriques trop longues.
          5. Termine par une phrase courte et bienveillante.`
        },
        { role: 'user', content: question }
      ],
    });

    res.status(200).json({ text: chatResponse.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ text: "Toutes mes excuses, je rencontre une petite difficulté. Un instant je vous prie." });
  }
}
