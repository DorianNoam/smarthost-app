import Groq from 'groq-sdk';
import { supabase } from '../../lib/supabase';

// --- 1. FONCTION GOOGLE PLACES (VERSION NEW - FILTRÉE) ---
async function getGooglePlacesInfo(userQuery, fullAddress) {
  const apiKey = process.env.MAPS_API_KEY;
  try {
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress'
      },
      body: JSON.stringify({
        // On force la recherche à être TRÈS spécifique au quartier
        textQuery: `arrêts de bus et transports transport public à moins de 500m de l'adresse ${fullAddress}`,
        languageCode: 'fr',
        maxResultCount: 10 // On en prend plus pour filtrer après
      })
    });

    const data = await response.json();
    if (!data.places || data.places.length === 0) return "Aucun arrêt trouvé dans un rayon immédiat.";

    // ON FILTRE : On ignore les résultats qui contiennent "Gare" ou "Aéroport" s'ils sont trop loin
    // (Sauf si l'utilisateur a spécifiquement demandé la gare)
    const filtered = data.places.filter(p => {
      const addr = p.formattedAddress.toLowerCase();
      // On s'assure que l'adresse de l'arrêt contient au moins le code postal ou la ville du logement
      return addr.includes("33200") || addr.includes("caudéran"); 
    });

    return filtered.slice(0, 4).map(p => `- ${p.displayName.text} (Adresse: ${p.formattedAddress})`).join('\n');
  } catch (e) {
    return "Erreur technique recherche.";
  }
}

// --- HANDLER ---
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Non autorisé');
  const { messagesHistory, propertyData } = req.body;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const lastUserMsg = messagesHistory[messagesHistory.length - 1]?.text || "";

  try {
    // 1. On construit l'adresse précise du logement
    const fullAddress = `${propertyData?.street_number || ''} ${propertyData?.address || ''}, ${propertyData?.city || ''}`.trim();

    // 2. On appelle Google
    const keywords = ['transport', 'bus', 'tram', 'gare', 'aller', 'proche'];
    let googleResults = "";
    if (keywords.some(k => lastUserMsg.toLowerCase().includes(k))) {
      googleResults = await getGooglePlacesInfo(lastUserMsg, fullAddress);
    }

    // 3. LE PROMPT QUI DONNE DES ORDRES FERMES
    const systemPrompt = `Tu es Marc, le majordome de la villa située au : ${fullAddress}.
Tu es un expert du quartier de CAUDÉRAN uniquement.

DONNÉES RÉELLES DE GOOGLE MAPS :
${googleResults}

CONSIGNES DE RÉPONSE :
1. Ne cite JAMAIS la Gare Saint-Jean, le Tram C ou les Quinconces, ils sont à plus de 20 minutes, ce n'est pas "proche".
2. Si la liste au-dessus contient des arrêts avec "33200" ou "Caudéran", donne-les.
3. Si tu n'as rien de local (33200) dans la liste, dis exactement ceci : "Je ne vois pas d'arrêt de bus immédiat sur la carte du quartier. Je vous conseille de prendre la Ligne 1 qui passe sur l'avenue principale ou de demander confirmation à votre hôte."
4. Sois très précis. Si tu donnes un nom d'arrêt, donne aussi le nom de la rue s'il est écrit.`;

    const chatResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: 'system', content: systemPrompt },
        ...messagesHistory.map(m => ({ role: m.role === 'marc' ? 'assistant' : 'user', content: m.text }))
      ],
      temperature: 0, // 0 pour qu'il arrête d'inventer
    });

    const responseText = chatResponse.choices[0].message.content;
    
    // Sauvegarde...
    const newHistory = [...messagesHistory, { role: 'marc', text: responseText, timestamp: new Date().toISOString() }];
    await supabase.from('conversations').upsert({ property_id: propertyData.id, history: newHistory, last_message_at: new Date().toISOString() }, { onConflict: 'property_id' });

    res.status(200).json({ answer: responseText });

  } catch (error) {
    res.status(200).json({ answer: "Petit souci technique." });
  }
}
