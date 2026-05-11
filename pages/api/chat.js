import Groq from 'groq-sdk';
import { supabase } from '../../lib/supabase';

// --- 1. RECHERCHE GOOGLE (FONCTION UNIVERSELLE) ---
async function getGoogleLocalData(category, fullAddress, debugPath) {
  const apiKey = process.env.MAPS_API_KEY;
  
  const queryMap = {
    transport: "station de transport public",
    food: "restaurant",
    shopping: "supermarché ou épicerie",
    health: "pharmacie"
  };

  const techQuery = queryMap[category] || "point of interest";

  try {
    // A. Geocoding : On trouve le point GPS
    const geoRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`);
    const geoData = await geoRes.json();
    if (!geoData.results?.[0]) return { data: "", trace: "❌ ADRESSE_NON_RECONNUE" };
    const { lat, lng } = geoData.results[0].geometry.location;

    // B. Recherche Places (New) avec locationBias (qui accepte le cercle)
    const placesRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.shortFormattedAddress'
      },
      body: JSON.stringify({
        textQuery: techQuery,
        // On utilise locationBias au lieu de locationRestriction pour que le cercle soit accepté
        locationBias: {
          circle: { center: { latitude: lat, longitude: lng }, radius: 1000.0 }
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
    debugPath.push(`✅ Google a trouvé ${count} lieux pour "${techQuery}"`);
    
    return data.places?.map(p => `- ${p.displayName.text} (${p.shortFormattedAddress})`).join('\n') || "";
  } catch (e) { return { data: "", trace: "FETCH_ERROR" }; }
}

// --- 2. DÉTECTEUR D'INTENTION (SaaS READY) ---
function detectCategory(msg) {
  const m = msg.toLowerCase();
  if (['bus', 'tram', 'transport', 'aller', 'gare'].some(k => m.includes(k))) return 'transport';
  if (['manger', 'resto', 'faim', 'dîner', 'déjeuner', 'café', 'boulangerie'].some(k => m.includes(k))) return 'food';
  if (['course', 'supermarché', 'magasin', 'achat', 'épicerie'].some(k => m.includes(k))) return 'shopping';
  return null;
}

// --- HANDLER PRINCIPAL ---
export default async function handler(req, res) {
  const { messagesHistory, propertyData } = req.body;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const lastUserMsg = messagesHistory[messagesHistory.length - 1]?.text || "";
  
  let debugPath = ["🚀 Analyse SaaS"];

  try {
    const fullAddress = `${propertyData?.street_number || ''} ${propertyData?.address || ''}, ${propertyData?.city || ''}`.trim();
    const category = detectCategory(lastUserMsg);

    // 🎯 ÉTAPE 1 : PRIORITÉ ABSOLUE À TA BASE DE DONNÉES
    const { data: kb } = await supabase.from('knowledge_base').select('category, content').eq('property_id', propertyData.id);
    
    // On récupère tout ce que l'hôte a écrit pour que l'IA puisse piocher dedans
    const ownerKB = kb?.map(item => `[${item.category}] : ${item.content}`).join('\n') || "";
    const propertyDirectInfo = `${propertyData.transport_info || ''} ${propertyData.local_shops || ''}`.trim();
    const globalOwnerData = `${propertyDirectInfo}\n${ownerKB}`.trim();

    debugPath.push(globalOwnerData ? "📦 Infos Hôte trouvées." : "⚠️ Base hôte vide.");

    // 🎯 ÉTAPE 2 : APPEL GOOGLE (Si catégorie détectée)
    let googleData = "";
    if (category) {
      debugPath.push(`🎯 Catégorie détectée : ${category}`);
      const result = await getGoogleLocalData(category, fullAddress, debugPath);
      googleData = typeof result === 'string' ? result : result.data;
    }

    // 🎯 ÉTAPE 3 : PROMPT DU MAJORDOME
    const systemPrompt = `Tu es Marc, le majordome de la villa "${propertyData.name}".

IMPORTANT : TU DOIS RÉPONDRE EN PRIORITÉ AVEC LES INFOS DE L'HÔTE.
1. INFOS HÔTE (Vérité absolue) :
${globalOwnerData || "L'hôte n'a pas donné de consignes."}

2. INFOS GOOGLE MAPS (À utiliser si l'hôte n'a rien dit ou pour compléter) :
${googleData || "Aucune donnée Google trouvée."}

CONSIGNES :
- Si l'hôte a donné un conseil, cite-le en premier.
- Utilise Google pour donner des adresses précises si l'hôte est resté vague.
- Si tout est vide, propose de demander à l'hôte.
- Sois bref (3 phrases max).`;

    const chatResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: 'system', content: systemPrompt }, ...messagesHistory.map(m => ({ role: m.role === 'marc' ? 'assistant' : 'user', content: m.text }))],
      temperature: 0,
    });

    const responseText = chatResponse.choices[0].message.content;
    const finalResponse = `${responseText}\n\n**🔍 TRACE TECHNIQUE :**\n${debugPath.map(l => `> ${l}`).join('\n')}`;

    res.status(200).json({ answer: finalResponse });
  } catch (e) {
    res.status(200).json({ answer: "Petit souci technique." });
  }
}
