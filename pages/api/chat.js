import Groq from 'groq-sdk';
import { supabase } from '../../lib/supabase';

// --- 1. FONCTION DE RECHERCHE AVEC TRACEUR ---
async function getGooglePlacesInfo(fullAddress, debugPath) {
  const apiKey = process.env.MAPS_API_KEY;
  if (!apiKey) return { data: "Clé API manquante", trace: "❌ API_KEY_MISSING" };

  try {
    // ÉTAPE A : Geocoding
    debugPath.push(`🔍 Geocoding de l'adresse : "${fullAddress}"`);
    const geoRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`);
    const geoData = await geoRes.json();
    
    if (!geoData.results?.[0]) {
      debugPath.push(`❌ Geocoding échoué : Google n'a pas trouvé cette adresse.`);
      return { data: "", trace: "GEOCODING_NOT_FOUND" };
    }

    const { lat, lng } = geoData.results[0].geometry.location;
    debugPath.push(`📍 Coordonnées GPS trouvées : ${lat}, ${lng}`);

    // ÉTAPE B : Places API (New)
    const query = "bus stop OR transit station";
    debugPath.push(`📡 Envoi requête Places : "${query}" dans un rayon de 1000m`);

    const placesRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.shortFormattedAddress'
      },
      body: JSON.stringify({
        textQuery: query,
        locationRestriction: {
          circle: { center: { latitude: lat, longitude: lng }, radius: 1000.0 }
        },
        languageCode: 'fr',
        maxResultCount: 5
      })
    });

    const placesData = await placesRes.json();
    
    if (!placesData.places || placesData.places.length === 0) {
      debugPath.push(`⚠️ Google Places : 0 résultat trouvé autour de ce point GPS.`);
      return { data: "", trace: "ZERO_RESULTS_AT_COORDINATES" };
    }

    const resultList = placesData.places.map(p => `- ${p.displayName.text} (${p.shortFormattedAddress})`).join('\n');
    debugPath.push(`✅ Google Places a trouvé ${placesData.places.length} résultats.`);
    
    return { data: resultList, trace: "SUCCESS" };

  } catch (e) {
    debugPath.push(`🔥 Erreur technique : ${e.message}`);
    return { data: "", trace: "CRASH_DURING_FETCH" };
  }
}

// --- HANDLER PRINCIPAL ---
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Non autorisé');
  
  const { messagesHistory, propertyData } = req.body;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const lastUserMsg = messagesHistory[messagesHistory.length - 1]?.text || "";
  
  // Initialisation du cheminement de test
  let debugPath = ["🚀 Démarrage du diagnostic"];

  try {
    const fullAddress = `${propertyData?.street_number || ''} ${propertyData?.address || ''}, ${propertyData?.city || ''}`.trim();
    debugPath.push(`🏠 Villa : ${propertyData?.name} | Adresse compilée : ${fullAddress}`);

    // 1. Priorité Hôte (DB)
    const { data: kb } = await supabase.from('knowledge_base').select('category, content').eq('property_id', propertyData.id);
    const ownerInfo = kb?.map(item => `${item.category}: ${item.content}`).join('\n') || "";
    debugPath.push(kb?.length > 0 ? `📦 DB Hôte : ${kb.length} infos trouvées.` : `📦 DB Hôte : Vide.`);

    // 2. Appel Google Maps
    let googleResults = "";
    if (['transport', 'bus', 'tram', 'gare', 'proche'].some(k => lastUserMsg.toLowerCase().includes(k))) {
      const { data, trace } = await getGooglePlacesInfo(fullAddress, debugPath);
      googleResults = data;
    }

    // 3. Prompt avec consigne de transparence
    const systemPrompt = `Tu es Marc, le majordome. 
Tu dois répondre au voyageur.
PRIORITÉ : Utilise les infos de l'HÔTE d'abord, puis GOOGLE MAPS.

INFOS HÔTE : ${ownerInfo}
GOOGLE MAPS : ${googleResults || "Rien trouvé"}

CONSIGNE TEST : À la fin de ta réponse, ajoute TOUJOURS une section "--- CHEMINEMENT TECHNIQUE ---" et recopie les étapes du debug que je vais te donner.`;

    const chatResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'system', content: `DEBUG_LOGS : ${debugPath.join(' | ')}` },
        ...messagesHistory.map(m => ({ role: m.role === 'marc' ? 'assistant' : 'user', content: m.text }))
      ],
      temperature: 0,
    });

    let responseText = chatResponse.choices[0].message.content;
    
    // On s'assure que le debug est visible pour nous
    const finalResponse = `${responseText}\n\n**🔍 TRACE DE TEST :**\n${debugPath.map(line => `> ${line}`).join('\n')}`;

    res.status(200).json({ answer: finalResponse });

  } catch (error) {
    res.status(200).json({ answer: `Erreur : ${error.message}` });
  }
}
