import { Mistral } from '@mistralai/mistralai';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION TELEGRAM ---
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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { messages, userName } = req.body;
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

  try {
    // 1. Récupération des infos dans Supabase
    const { data: info } = await supabase
      .from('knowledge_base')
      .select('content')
      .eq('property_id', '11111111-1111-1111-1111-111111111111');

    const contexte = info?.map(i => i.content).join("\n") || "";

    // 2. Instructions pour Marc
    const systemMessage = { 
      role: 'system', 
      content: `Tu es Marc, concierge de luxe pour cet appartement. 
      Si tu ne connais pas la réponse (horaire, code, règle manquante) ou si c'est un problème technique, dis obligatoirement : "Je me renseigne immédiatement auprès de votre hôte." 
      Ne dépasse jamais 2 phrases.` 
    };

    // 3. Appel à Mistral
    const chatResponse = await mistral.chat.complete({
      model: 'mistral-small-latest',
      messages: [systemMessage, ...messages],
    });

    const responseText = chatResponse.choices[0].message.content;

    // 4. --- DÉTECTION ET ENVOI DE L'ALERTE ---
    const motsClesAlerte = ["hôte", "transmets", "renseigne", "désagrément"];
    if (motsClesAlerte.some(mot => responseText.toLowerCase().includes(mot))) {
      const lastUserQuery = messages[messages.length - 1].content;
      await sendTelegramAlert(lastUserQuery, userName);
    }

    res.status(200).json({ text: responseText });
  } catch (error) {
    res.status(500).json({ text: "Désolé, j'ai rencontré un petit souci technique." });
  }
}
