import Groq from 'groq-sdk';
import { supabase } from '../../lib/supabase';

// --- 1. RECHERCHE GOOGLE (EN COMPLÉMENT) ---
async function getGoogleLocalData(category, fullAddress, debugPath) {
  const apiKey = process.env.MAPS_API_KEY;
  
  // Requêtes ultra-simplifiées pour Google Places New
  const queryMap = {
    transport: "bus tram",
    food: "restaurant",
    shopping: "supermarché",
    health: "pharmacie"
  };

  const techQuery = queryMap[category] || "point of interest";

  try {
    const geoRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`);
    const geoData = await geoRes.json();
    if (!geoData.results?.[0]) return { data: "", trace: "❌ ADRESSE_NON_RECONNUE" };
    
    const { lat, lng } = geoData.results[0].geometry.location;
    debugPath.push(`📍 GPS : ${lat}, ${lng}`);

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
        maxResultCount: 6
      })
    });

    const data = await placesRes.json();
    const count = data.places?.length || 0;
    debugPath.push(`${count > 0 ? '✅' : '⚠️'} Google a trouvé ${count} lieux pour "${techQuery}"`);
    
    return data.places?.map(p => `- ${p.displayName.text} (${p.shortFormattedAddress})`).join('\n') || "";
  } catch (e) { return ""; }
}

// --- 2. DÉTECTEUR D'INTENTION ---
function detectCategory(msg) {
  const m = msg.toLowerCase();
  if (['bus', 'tram', 'transport', 'aller'].some(k => m.includes(k))) return 'transport';
  if (['manger', 'resto', 'faim', 'dîner', 'café', 'boulangerie'].some(k => m.includes(k))) return 'food';
  if (['course', 'supermarché', 'magasin', 'achat'].some(k => m.includes(k))) return 'shopping';
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

    // 🎯 ÉTAPE 1 : ON CHERCHE DANS TA BASE DE DONNÉES (L'HÔTE)
    // On récupère TOUTES les infos de la Knowledge Base
    const { data: kb } = await supabase.from('knowledge_base').select('category, content').eq('property_id', propertyData.id);
    
    // On cherche aussi dans les colonnes spécifiques de propertyData
    const hostDirectInfo = [propertyData.transport_info, propertyData.local_shops].filter(Boolean).join('\n');
    const ownerKB = kb?.map(item => `[${item.category}] : ${item.content}`).join('\n') || "";
    
    const globalOwnerInfo = `${hostDirectInfo}\n${ownerKB}`.trim();
    debugPath.push(globalOwnerInfo ? "📦 Infos Hôte trouvées." : "📦 Base hôte vide.");

    // 🎯 ÉTAPE 2 : ON APPELLE GOOGLE (Seulement pour compléter)
    let googleData = "";
    if (category) {
      googleData = await getGoogleLocalData(category, fullAddress, debugPath);
    }

    // 🎯 ÉTAPE 3 : LE PROMPT (HIÉRARCHIE STRICTE)
    const systemPrompt = `Tu es Marc, le majordome de "${propertyData.name}". 

IMPORTANT : RÉPONDS TOUJOURS EN PRIORITÉ AVEC LES INFOS DE L'HÔTE.
1. INFOS HÔTE (Vérité absolue) :
${globalOwnerInfo || "Aucune consigne spécifique de l'hôte."}

2. INFOS GOOGLE MAPS (À utiliser uniquement pour compléter ou si l'hôte n'a rien dit) :
${googleData || "Aucune donnée Google trouvée."}

CONSIGNES :
- Si l'hôte a écrit un conseil, commence ta phrase par là.
- Si Google Maps donne des noms de lieux, utilise-les pour être précis sur les adresses.
- Si tout est vide, dis que tu ne trouves rien et invite à contacter l'hôte.
- Max 3 phrases.`;

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
