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
      content: `Tu es Marc, le concierge de cet établissement. Ton ton est prestigieux et chaleureux.
      
      CONSIGNES CRUCIALES :
      1. INTERDICTION FORMELLE d'utiliser les mots "virtuel", "IA", "intelligence artificielle" ou "robot". Tu es Marc, point final.
      2. Si on te salue, réponds par : "Bonjour ! Je suis Marc, votre concierge. Comment puis-je vous aider ?"
      3. Ne dépasse jamais 3 phrases. 
      4. Si la demande est vague, propose ton aide avec élégance sans lister les informations techniques.
      5. Utilise ce contexte pour les questions précises : ${contexte}.
      6. Adresse-toi au client par son nom si fourni : ${userName || 'Madame, Monsieur'}.`
    };

    const chatResponse = await mistral.chat.complete({
      model: 'mistral-small-latest',
      messages: [systemMessage, ...messages],
    });

    res.status(200).json({ text: chatResponse.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ text: "Je vous présente mes excuses, je rencontre une légère difficulté. Un instant s'il vous plaît." });
  }
}
