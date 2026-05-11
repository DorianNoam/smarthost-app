import Groq from 'groq-sdk';
import { supabase } from '../../lib/supabase';

// --- 1. RECHERCHE GOOGLE AVEC LOGS D'ERREUR RÉELS ---
async function getGoogleLocalData(category, fullAddress, debugPath) {
  const apiKey = process.env.MAPS_API_KEY;
  
  // Requêtes optimisées pour la Places API (New)
  const queryMap = {
    transport: "station de transport public",
    food: "restaurant",
    shopping: "supermarché",
    health: "pharmacie"
  };

  const techQuery = queryMap[category] || "point of interest";

  try {
    // A. Geocoding
    const geoRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`);
    const geoData = await geoRes.json();
    if (!geoData.results?.[0]) return { data: "", trace: "❌ Adresse non géocodable" };
    const { lat, lng } = geoData.results[0].geometry.location;

    // B. Recherche Places (New)
    const placesRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.shortFormattedAddress'
      },
      body: JSON.stringify({
        textQuery: techQuery,
        locationRestriction: { circle: { center: { latitude: lat, longitude: lng }, radius: 1000.0 } },
        languageCode: 'fr',
        maxResultCount: 10
      })
    });

    const data = await placesRes.json();

    // 🕵️‍♂️ DIAGNOSTIC CRUCIAL : Si Google renvoie une erreur au lieu de lieux
    if (data.error) {
      debugPath.push(`❌ ERREUR GOOGLE : ${data.error.status} - ${data.error.message}`);
      return { data: "", trace: `GOOGLE_ERROR: ${data.error.status}` };
    }

    const count = data.places?.length || 0;
    debugPath.push(`✅ Google a trouvé ${count} lieux pour "${techQuery}"`);
    
    return data.places?.map(p => `- ${p.displayName.text} (${p.shortFormattedAddress})`).join('\n') || "";
  } catch (e) { 
    debugPath.push(`🔥 Crash Fetch : ${e.message}`);
    return ""; 
  }
}

// --- 2. DÉTECTEUR D'INTENTION ---
function detectCategory(msg) {
  const m = msg.toLowerCase();
  if (['bus', 'tram', 'transport', 'aller', 'gare'].some(k => m.includes(k))) return 'transport';
  if (['manger', 'resto', 'faim', 'dîner', 'déjeuner', 'café', 'boulangerie', 'croissant', 'petit dejeuner'].some(k => m.includes(k))) return 'food';
  if (['course', 'supermarché', 'magasin', 'achat', 'courses'].some(k => m.includes(k))) return 'shopping';
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
    
    // On récupère tout ce que l'hôte a écrit
    const ownerInfo = kb?.map(item => `[${item.category}] : ${item.content}`).join('\n') || "";
    const propertyDirectInfo = `${propertyData.transport_info || ''} ${propertyData.local_shops || ''}`.trim();
    const globalOwnerData = `${propertyDirectInfo}\n${ownerInfo}`.trim();

    debugPath.push(globalOwnerData ? "📦 Infos Hôte trouvées." : "⚠️ Base hôte vide.");

    // 🎯 ÉTAPE 2 : APPEL GOOGLE (Pour boucher les trous)
    let googleData = "";
    if (category) {
      debugPath.push(`🎯 Catégorie détectée : ${category}`);
      googleData = await getGoogleLocalData(category, fullAddress, debugPath);
    }

    // 🎯 ÉTAPE 3 : PROMPT
    const systemPrompt = `Tu es Marc, le majordome. 
RÈGLE D'OR : Utilise en priorité les infos de l'HÔTE.

INFOS HÔTE (Priorité 1) :
${globalOwnerData || "Aucune consigne de l'hôte."}

INFOS GOOGLE MAPS (Priorité 2) :
${googleData || "Rien trouvé sur Google."}

CONSIGNES :
- Si l'hôte a donné une info, commence par là.
- Cite les noms et adresses de Google Maps si tu en as.
- Sois bref et chaleureux.`;

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
