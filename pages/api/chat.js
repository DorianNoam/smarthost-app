import Groq from 'groq-sdk';
import { supabase } from '../../lib/supabase';

// --- 1. RECHERCHE GOOGLE "SEARCH NEARBY" (STRICTE 500M) ---
async function getGoogleLocalData(category, fullAddress, debugPath) {
  const apiKey = process.env.MAPS_API_KEY;
  
  // Types officiels Google pour une recherche par proximité
  const typeMap = {
    transport: ["bus_stop", "transit_station", "train_station", "light_rail_station"],
    food: ["restaurant", "bakery", "cafe", "meal_takeaway"],
    shopping: ["supermarket", "grocery_store", "convenience_store", "store"],
    health: ["pharmacy", "hospital"]
  };

  try {
    // A. Geocoding : Traduction de l'adresse dynamique en point GPS
    const geoRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`);
    const geoData = await geoRes.json();
    if (!geoData.results?.[0]) return { data: "", trace: "❌ ADRESSE_NON_RECONNUE" };
    const { lat, lng } = geoData.results[0].geometry.location;

    // B. Recherche Nearby (Strictement limité au cercle de 500m)
    const placesRes = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.shortFormattedAddress,places.types'
      },
      body: JSON.stringify({
        includedTypes: typeMap[category] || ["point_of_interest"],
        locationRestriction: {
          circle: { center: { latitude: lat, longitude: lng }, radius: 500.0 }
        },
        languageCode: 'fr',
        maxResultCount: 8
      })
    });

    const data = await placesRes.json();
    
    if (data.error) {
      debugPath.push(`❌ ERREUR API : ${data.error.message}`);
      return { data: "", trace: "API_ERROR" };
    }

    const count = data.places?.length || 0;
    debugPath.push(`✅ Google Nearby a trouvé ${count} lieux pour "${category}"`);
    
    return data.places?.map(p => `- ${p.displayName.text} (${p.shortFormattedAddress})`).join('\n') || "";
  } catch (e) { 
    debugPath.push(`🔥 Erreur Fetch : ${e.message}`);
    return ""; 
  }
}

// --- 2. DÉTECTEUR D'INTENTION (SaaS READY) ---
function detectCategory(msg) {
  const m = msg.toLowerCase();
  if (['bus', 'tram', 'transport', 'aller', 'gare', 'train', 'commun', 'navette'].some(k => m.includes(k))) return 'transport';
  if (['manger', 'resto', 'faim', 'dîner', 'déjeuner', 'café', 'boulangerie', 'pizza', 'faim'].some(k => m.includes(k))) return 'food';
  if (['course', 'supermarché', 'magasin', 'achat', 'épicerie', 'provisions', 'market'].some(k => m.includes(k))) return 'shopping';
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
    // Construction de l'adresse dynamique
    const fullAddress = `${propertyData?.street_number || ''} ${propertyData?.address || ''}, ${propertyData?.city || ''}`.trim();
    const category = detectCategory(lastUserMsg);

    // 🎯 ÉTAPE 1 : PRIORITÉ ABSOLUE À LA BASE DE DONNÉES (L'HÔTE)
    const { data: kb } = await supabase.from('knowledge_base').select('category, content').eq('property_id', propertyData.id);
    
    const ownerKB = kb?.map(item => `[${item.category}] : ${item.content}`).join('\n') || "";
    const propertyDirectInfo = `${propertyData.transport_info || ''} ${propertyData.local_shops || ''}`.trim();
    const globalOwnerData = `${propertyDirectInfo}\n${ownerKB}`.trim();

    debugPath.push(globalOwnerData ? "📦 Infos Hôte trouvées." : "⚠️ Base hôte vide.");

    // 🎯 ÉTAPE 2 : APPEL GOOGLE SEARCHNEARBY (SI BESOIN)
    let googleData = "";
    if (category) {
      debugPath.push(`🎯 Catégorie détectée : ${category}`);
      googleData = await getGoogleLocalData(category, fullAddress, debugPath);
    }

    // 🎯 ÉTAPE 3 : LE PROMPT DU MAJORDOME (AUTORITAIRE ET PRÉCIS)
    const systemPrompt = `Tu es Marc, le majordome de la villa "${propertyData.name}". 
Ton rôle est d'informer le voyageur sur les environs immédiats (moins de 5 min à pied).

INFOS HÔTE (Priorité absolue) :
${globalOwnerData || "L'hôte n'a pas donné d'instructions."}

INFOS GOOGLE MAPS (À moins de 500m) :
${googleData || "Aucun résultat trouvé à proximité immédiate."}

CONSIGNES DE RÉPONSE :
1. Si l'hôte a donné une info, utilise-la EXCLUSIVEMENT.
2. Si tu utilises les infos Google Maps, sois affirmatif : les lieux listés dans la catégorie "transport" SONT des arrêts proches (bus, tram, etc.).
3. Ne cite jamais de lieux célèbres s'ils sont à plus de 10 min de marche (ex: Quinconces, Gare Saint-Jean).
4. Si la liste est vide, dis que tu ne vois pas d'option immédiate et suggère de voir avec l'hôte.
5. Sois chaleureux, pro et réponds en 2 phrases max.`;

    const chatResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: 'system', content: systemPrompt },
        ...messagesHistory.map(m => ({ role: m.role === 'marc' ? 'assistant' : 'user', content: m.text }))
      ],
      temperature: 0,
    });

    const responseText = chatResponse.choices[0].message.content;
    const finalResponse = `${responseText}\n\n**🔍 TRACE TECHNIQUE :**\n${debugPath.map(l => `> ${l}`).join('\n')}`;

    res.status(200).json({ answer: finalResponse });

  } catch (error) {
    console.error("❌ Erreur globale:", error.message);
    res.status(200).json({ answer: "Petit souci technique, mais je reste à votre écoute." });
  }
}
