import { Mistral } from '@mistralai/mistralai';
import { createClient } from '@supabase/supabase-js';

const TELEGRAM_TOKEN = "8231931843:AAGO21Yr7sZ3n1mZGBj1ragKQApTKL81YSs";
const TELEGRAM_CHAT_ID = "1539843263"; 

async function sendTelegramAlert(userQuery, userName) {
  const text = `🚨 *ALERTE CONCIERGERIE*\n\n*Client :* ${userName || 'Inconnu'}\n*Demande :* "${userQuery}"`;
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'Markdown' })
    });
  } catch (e) { console.error("Erreur Telegram:", e); }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Interdit' });

  const { messages, userName } = req.body;
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

  try {
    // 1. On récupère les infos
    const { data: info } = await supabase
      .from('knowledge_base')
      .select('content')
      .eq('property_id', '11111111-1111-1111-1111-111111111111');

    const contexte = info?.map(i => i.content).join("\n") || "Aucune consigne particulière.";

    // 2. ON INJECTE LE CONTEXTE ICI (C'était l'erreur !)
    const systemMessage = { 
      role: 'system', 
      content: `Tu es Marc, concierge de luxe. 
      UTILISE CES INFORMATIONS POUR RÉPONDRE : 
      ${contexte}

      SI L'INFO N'EST PAS CI-DESSUS OU SI C'EST UNE PANNE :
      Réponds exactement : "Je me renseigne immédiatement auprès de votre hôte."
      
      TON : Prestigieux, max 2 phrases.` 
    };

    const chatResponse = await mistral.chat.complete({
      model: 'mistral-small-latest',
      messages: [systemMessage, ...messages],
    });

    const responseText = chatResponse.choices[0].message.content;

    // 3. Alerte si besoin
    if (responseText.includes("hôte") || responseText.includes("renseigne")) {
      const lastUserQuery = messages[messages.length - 1].content;
      await sendTelegramAlert(lastUserQuery, userName);
    }

    res.status(200).json({ text: responseText });
  } catch (error) {
    res.status(500).json({ text: "Erreur technique, je reviens vers vous." });
  }
}
