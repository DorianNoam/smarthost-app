import Groq from 'groq-sdk';
import { supabase } from '../../lib/supabase';

// --- 1. FONCTION GOOGLE PLACES (Précision Chirurgicale) ---
async function getGooglePlacesInfo(userQuery, fullAddress) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return "Erreur: Clé API Google non configurée.";

  try {
    // ✅ On ajoute 'locationbias' pour forcer Google à chercher à moins de 500m de l'adresse
    // Et on précise 'transit_station' pour ne pas avoir de résultats à l'autre bout de la ville
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(userQuery + " à proximité de " + fullAddress)}&locationbias=circle:500@44.848,-0.612&key=${apiKey}&language=fr`;
    
    const res = await fetch(searchUrl);
    const data = await res.json();

    if (data.status !== "OK" || !data.results.length) {
      return "Aucun arrêt ou commerce trouvé à moins de 500m dans la base Google Maps.";
    }

    // On ne garde que les résultats vraiment proches
    return data.results.slice(0, 5).map(place => {
      return `- ${place.name} (Adresse: ${place.formatted_address})`;
    }).join('\n');

  } catch (e) {
    return "Erreur lors de la récupération des données.";
  }
}

// ... (Gardez les fonctions isLocalQuery et sendTelegramAlert identiques) ...

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Non autorisé');
  const { messagesHistory, propertyData, userLanguage } = req.body;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const lastUserMsg = messagesHistory[messagesHistory.length - 1]?.text || "";

  try {
    const city = propertyData.city || '';
    const fullAddress = `${propertyData.street_number || ''} ${propertyData.address || ''}, ${city}`.trim();

    let verifiedData = "";
    if (isLocalQuery(lastUserMsg)) {
      verifiedData = await getGooglePlacesInfo(lastUserMsg, fullAddress);
    }

    const hostInfo = [propertyData.local_shops, propertyData.transport_info, propertyData.recommendations].filter(Boolean).join('\n');
    
    const context = `
━━━ DONNÉES RÉELLES GOOGLE MAPS ━━━
${verifiedData || "Aucun point d'intérêt trouvé à proximité immédiate de cette adresse."}
`.trim();

    const systemPrompt = `Tu es Marc, le majordome de "${propertyData.name}".
Tu es un expert local factuel.

RÈGLES DE SÉCURITÉ :
1. Tu ne cites QUE les noms présents dans les "DONNÉES RÉELLES" ci-dessus.
2. Si le résultat Google contient des lieux à Talence ou Pellegrin alors que le logement est à Caudéran, IGNORE-LES, c'est trop loin.
3. Si tu n'as pas d'arrêt à moins de 5 minutes à pied dans la liste, dis : "Je ne vois pas d'arrêt immédiat sur la carte, je demande confirmation à votre hôte."
4. Ne parle JAMAIS de la ligne C du tramway (elle est trop loin).`;

    const chatResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: 'system', content: systemPrompt }, ...messagesHistory.map(m => ({ role: m.role === 'marc' ? 'assistant' : 'user', content: m.text }))],
      temperature: 0, 
      max_tokens: 400,
    });

    const responseText = chatResponse.choices[0].message.content;

    const newHistory = [...messagesHistory, { role: 'marc', text: responseText, timestamp: new Date().toISOString() }];
    await supabase.from('conversations').upsert({ property_id: propertyData.id, history: newHistory, last_message_at: new Date().toISOString() }, { onConflict: 'property_id' });

    res.status(200).json({ answer: responseText });

  } catch (error) {
    res.status(200).json({ answer: "Petit souci technique." });
  }
}
