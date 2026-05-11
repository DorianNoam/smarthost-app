import Groq from 'groq-sdk';
import { supabase } from '../../lib/supabase';

// --- 1. FONCTION DE RECHERCHE LOCALE (COMPLÉMENTAIRE) ---
async function getGoogleLocalData(category, fullAddress, debugPath) {
  const apiKey = process.env.MAPS_API_KEY;
  
  // Requêtes simplifiées pour éviter les erreurs d'interprétation de l'API
  const queryMap = {
    transport: "station de transport public",
    food: "restaurant ou boulangerie",
    shopping: "supermarché ou épicerie",
    health: "pharmacie"
  };

  const techQuery = queryMap[category] || "point of interest";

  try {
    // A. Geocoding pour transformer l'adresse dynamique en point GPS
    const geoRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`);
    const geoData = await geoRes.json();
    if (!geoData.results?.[0]) return { data: "", trace: "❌ ADRESSE_NON_RECONNUE" };
    const { lat, lng } = geoData.results[0].geometry.location;

    // B. Recherche Places (New) - Rayon réduit à 500m pour éviter les pôles trop lointains
    const placesRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.shortFormattedAddress'
      },
      body: JSON.stringify({
        textQuery: techQuery,
        locationBias: {
          circle: { center: { latitude: lat, longitude: lng }, radius: 500.0 } 
        },
        languageCode: 'fr',
        maxResultCount: 5
      })
    });

    const data = await placesRes.json();
    
    if (data.error) {
      debugPath.push(`❌ ERREUR API : ${data.error.message}`);
      return { data: "", trace: "API_ERROR" };
    }

    const count = data.places?.length || 0;
    debugPath.push(`✅ Google a trouvé ${count} lieux pour "${techQuery}" dans un rayon de 500m`);
    
    return data.places?.map(p => `- ${p.displayName.text} (${p.shortFormattedAddress})`).join('\n') || "";
  } catch (e) { 
    return { data: "", trace: "FETCH_ERROR" }; 
  }
}

// --- 2. DÉTECTEUR D'INTENTION ---
function detectCategory(msg) {
  const m = msg.toLowerCase();
  if (['bus', 'tram', 'transport', 'aller', 'gare', 'train'].some(k => m.includes(k))) return 'transport';
  if (['manger', 'resto', 'faim', 'dîner', 'déjeuner', 'café', 'boulangerie', 'faim'].some(k => m.includes(k))) return 'food';
  if (['course', 'supermarché', 'magasin', 'achat', 'épicerie', 'provisions'].some(k => m.includes(k))) return 'shopping';
  return null;
}

// --- HANDLER PRINCIPAL ---
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Non autorisé');

  const { messagesHistory, propertyData } = req.body;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const lastUserMsg = messagesHistory[messagesHistory.length - 1]?.text || "";
  
  let debugPath = ["🚀 Analyse SaaS"];

  try {
    // Construction dynamique de l'adresse (valable pour n'importe quel pays/ville)
    const fullAddress = `${propertyData?.street_number || ''} ${propertyData?.address || ''}, ${propertyData?.city || ''}`.trim();
    const category = detectCategory(lastUserMsg);

    // 🎯 ÉTAPE 1 : EXTRACTION DE LA BASE DE CONNAISSANCES DE L'HÔTE (VÉRITÉ ABSOLUE)
    const { data: kb } = await supabase.from('knowledge_base').select('category, content').eq('property_id', propertyData.id);
    
    const ownerKB = kb?.map(item => `[${item.category}] : ${item.content}`).join('\n') || "";
    const propertyDirectInfo = `${propertyData.transport_info || ''} ${propertyData.local_shops || ''} ${propertyData.recommendations || ''}`.trim();
    const globalOwnerData = `${propertyDirectInfo}\n${ownerKB}`.trim();

    debugPath.push(globalOwnerData ? "📦 Infos Hôte chargées." : "⚠️ Base hôte vide.");

    // 🎯 ÉTAPE 2 : RECHERECHE GOOGLE MAPS (SI INTENTION DÉTECTÉE)
    let googleData = "";
    if (category) {
      debugPath.push(`🎯 Catégorie détectée : ${category}`);
      const result = await getGoogleLocalData(category, fullAddress, debugPath);
      googleData = typeof result === 'string' ? result : result.data;
    }

    // 🎯 ÉTAPE 3 : PROMPT AVEC HIÉRARCHIE DE DONNÉES
    const systemPrompt = `Tu es Marc, le majordome privé de la villa "${propertyData.name}".
Ton rôle est d'aider le voyageur avec une précision chirurgicale sur les environs.

ORDRE DE PRIORITÉ :
1. INFOS DE L'HÔTE (Priorité absolue) : 
${globalOwnerData || "L'hôte n'a pas encore rempli ses recommandations."}

2. INFOS GOOGLE MAPS (Complément local) :
${googleData || "Aucun lieu trouvé sur la carte à moins de 500m."}

CONSIGNES DE RÉPONSE :
- Si l'hôte a donné une recommandation, utilise-la EXCLUSIVEMENT.
- N'utilise Google Maps que si l'hôte n'a pas donné d'info ou pour ajouter une adresse précise.
- Ne cite JAMAIS de lieux situés à plus de 10 minutes à pied (ignore les centres-villes lointains).
- Sois bref, élégant et chaleureux. 2 à 3 phrases maximum.`;

    const chatResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: 'system', content: systemPrompt },
        ...messagesHistory.map(m => ({ 
          role: m.role === 'marc' ? 'assistant' : 'user', 
          content: m.text 
        }))
      ],
      temperature: 0,
    });

    const responseText = chatResponse.choices[0].message.content;
    
    // On garde la trace technique pour tes tests
    const finalResponse = `${responseText}\n\n**🔍 TRACE TECHNIQUE :**\n${debugPath.map(l => `> ${l}`).join('\n')}`;

    res.status(200).json({ answer: finalResponse });

  } catch (error) {
    console.error("❌ Erreur Handler:", error.message);
    res.status(200).json({ answer: "Je rencontre une petite difficulté technique, mais je reste à votre disposition." });
  }
}
