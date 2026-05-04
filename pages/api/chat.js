import { Mistral } from '@mistralai/mistralai';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  // On récupère la liste des messages
  const { messages } = req.body;

  // Sécurité si messages est absent
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ text: "Une erreur de transmission a eu lieu." });
  }

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
      content: `Tu es Marc, concierge de luxe. Sois poli, raffiné et efficace. 
      RÈGLES : 3 phrases max. Utilise cet historique pour te souvenir de ce que le client a dit. 
      Voici tes infos : ${contexte}.`
    };

    const chatResponse = await mistral.chat.complete({
      model: 'mistral-small-latest',
      messages: [systemMessage, ...messages],
    });

    res.status(200).json({ text: chatResponse.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ text: "Ma mémoire me fait défaut, un instant s'il vous plaît." });
  }
}
