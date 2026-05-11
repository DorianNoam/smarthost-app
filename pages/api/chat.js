import Groq from 'groq-sdk';
import { supabase } from '../../lib/supabase';

// --- 1. FONCTION GOOGLE PLACES (VERSION NEW) ---
async function getGooglePlacesInfo(userQuery, fullAddress) {
  const apiKey = process.env.MAPS_API_KEY;
  if (!apiKey) return "Clé API manquante.";

  try {
    console.log("🚩 3. Appel Google Places API (New)...");

    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        // Le FieldMask est OBLIGATOIRE avec l'API New
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.types'
      },
      body: JSON.stringify({
        textQuery: `${userQuery} proche de ${fullAddress}`,
        languageCode: 'fr',
        maxResultCount: 5
      })
    });

    const data = await response.json();

    // Si Google renvoie une erreur
    if (data.error) {
      console.error("❌ Erreur Google API (New) :", data.error.message);
      return "Erreur lors de la recherche sur la carte.";
    }

    if (!data.places || data.places.length === 0) {
      console.log("⚠️ Aucun lieu trouvé par Google (New).");
      return "Aucun résultat trouvé sur la carte officielle.";
    }

    // On formate les résultats
    return data.places.map(place => {
      const name = place.displayName.text;
      const address = place.formattedAddress;
      return `- ${name} (Adresse : ${address})`;
    }).join('\n');

  } catch (e) {
    console.error("❌ Crash lors de l'appel Google :", e.message);
    return "Erreur technique recherche.";
  }
}

// --- 2. DÉTECTION D'INTENTION ---
function isLocalQuery(msg) {
  const keywords = ['transport', 'bus', 'tram', 'gare', 'boulangerie', 'restaurant', 'manger', 'proche', 'où est'];
  return keywords.some(k => msg.toLowerCase().includes(k));
}

// --- HANDLER PRINCIPAL ---
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Non autorisé');
  const { messagesHistory, propertyData } = req.body;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const lastUserMsg = messagesHistory[messagesHistory.length - 1]?.text || "";

  try {
    console.log("🚩 1. Début du traitement.");

    const city = propertyData?.city || '';
    const fullAddress = `${propertyData?.street_number || ''} ${propertyData?.address || ''}, ${city}`.trim();
    console.log("🚩 2. Recherche autour de :", fullAddress);

    let verifiedData = "";
    if (isLocalQuery(lastUserMsg)) {
      verifiedData = await getGooglePlacesInfo(lastUserMsg, fullAddress);
      console.log("🚩 4. Résultats Google reçus.");
    }

    const context = `
VOICI LES DONNÉES RÉELLES DE GOOGLE MAPS POUR CE QUARTIER :
${verifiedData || "Aucune information trouvée."}
`.trim();

    const systemPrompt = `Tu es Marc, le majordome de "${propertyData.name}". 
Tu dois aider le voyageur en utilisant UNIQUEMENT les données réelles fournies.

DONNÉES RÉELLES :
${context}

CONSIGNES :
1. Si des lieux (bus, commerces) sont listés ci-dessus, cite-les pour aider le voyageur.
2. Si la liste est vide ou ne contient rien de pertinent, dis honnêtement : "Je ne trouve pas d'information précise sur la carte pour ce lieu, je vous conseille de demander à l'hôte."
3. Ne dépasse pas 3 phrases.`;

    console.log("🚩 5. Envoi à Groq...");

    const chatResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: 'system', content: systemPrompt },
        ...messagesHistory.map(m => ({ role: m.role === 'marc' ? 'assistant' : 'user', content: m.text }))
      ],
      temperature: 0,
    });

    const responseText = chatResponse.choices[0].message.content;
    console.log("🚩 6. Réponse finale envoyée.");

    // Sauvegarde historique
    const newHistory = [...messagesHistory, { role: 'marc', text: responseText, timestamp: new Date().toISOString() }];
    await supabase.from('conversations').upsert({ property_id: propertyData.id, history: newHistory, last_message_at: new Date().toISOString() }, { onConflict: 'property_id' });

    res.status(200).json({ answer: responseText });

  } catch (error) {
    console.error("❌ ERREUR GLOBALE :", error.message);
    res.status(200).json({ answer: "Petit souci technique." });
  }
}
