import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');
  const { question } = req.body;
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const { data: info } = await supabase
    .from('knowledge_base')
    .select('content')
    .eq('property_id', '11111111-1111-1111-1111-111111111111');
  const contexte = info ? info.map(i => i.content).join("\n") : "Pas d'informations disponibles.";
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Tu es le concierge de l'appartement. Voici les infos : ${contexte}. Un voyageur demande : ${question}`;
  const result = await model.generateContent(prompt);
  res.status(200).json({ text: result.response.text() });
}
