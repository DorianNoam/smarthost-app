import Groq from 'groq-sdk';
import { supabase } from '../../lib/supabase';

async function getGooglePlacesInfo(userMsg, fullAddress) {
  const apiKey = process.env.MAPS_API_KEY;
  if (!apiKey) return "Clé API manquante.";

  // On transforme la demande en mots-clés simples pour Google
  let techQuery = "transit station";
  const msg = userMsg.toLowerCase();
  if (msg.includes('manger') || msg.includes('restau')) techQuery = "restaurant";
  if (msg.includes('course') || msg.includes('magasin')) techQuery = "supermarket";

  try {
    // 1. On trouve où se trouve la Villa (GPS)
    const geoRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`);
    const geoData = await geoRes.json();
    
    if (!geoData.results[0]) return "Localisation impossible.";

    const { lat, lng } = geoData.results[0].geometry.location;

    // 2. On demande à Google ce qu'il y a à 800m autour de ce point PRÉCIS
    const placesRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.shortFormattedAddress'
      },
      body: JSON.stringify({
        textQuery: techQuery, 
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: 800.0 // Rayon de 800m autour de la villa
          }
        },
        languageCode: 'fr',
        maxResultCount: 5
      })
    });

    const placesData = await placesRes.json();

    if (!placesData.places || placesData.places.length === 0) {
      return "Aucun résultat trouvé à proximité immédiate.";
    }

    return placesData.places.map(p => `- ${p.displayName.text} (${p.shortFormattedAddress})`).join('\n');

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
    const fullAddress = `${propertyData?.street_number || ''} ${propertyData?.address || ''}, ${propertyData?.city || ''}`.trim();

    // On n'appelle Google que si la question est locale
    const keywords = ['transport', 'bus', 'tram', 'gare', 'manger', 'proche', 'où est'];
    let googleResults = "";
    if (keywords.some(k => lastUserMsg.toLowerCase().includes(k))) {
      googleResults = await getGooglePlacesInfo(lastUserMsg, fullAddress);
    }

    const systemPrompt = `Tu es Marc, le majordome de la villa située au : ${fullAddress}.
Utilise UNIQUEMENT les données fournies ci-dessous pour répondre.

DONNÉES RÉELLES (Moins de 10 min à pied) :
${googleResults || "Aucune donnée trouvée."}

CONSIGNES :
1. Sois un expert local : cite les noms des arrêts ou commerces trouvés.
2. Si la liste est vide, dis simplement que tu n'as pas de confirmation visuelle sur la carte et suggère de demander à l'hôte.
3. Ne cite JAMAIS de lieux éloignés (Gare, Centre-ville) s'ils ne sont pas dans la liste.
4. Réponds en 3 phrases maximum, de façon chaleureuse.`;

    const chatResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: 'system', content: systemPrompt }, ...messagesHistory.map(m => ({ role: m.role === 'marc' ? 'assistant' : 'user', content: m.text }))],
      temperature: 0,
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
