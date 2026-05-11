import Groq from 'groq-sdk';
import { supabase } from '../../lib/supabase';

// --- 1. LE MOTEUR DE RECHERCHE UNIVERSEL ---
async function getGoogleLocalData(category, fullAddress, debugPath) {
  const apiKey = process.env.MAPS_API_KEY;
  
  // Mapping intelligent : On traduit la catégorie en mots-clés optimaux pour Google
  const queryMap = {
    transport: "station de transport public, arrêt de bus, tramway",
    food: "restaurant, boulangerie, café, restaurant ouvert",
    shopping: "supermarché, épicerie, commerce de proximité",
    health: "pharmacie, hôpital, médecin"
  };

  const techQuery = queryMap[category] || "point of interest";

  try {
    // A. Point GPS de la villa
    const geoRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`);
    const geoData = await geoRes.json();
    if (!geoData.results?.[0]) return { data: "", trace: "❌ ADRESSE_NON_RECONNUE" };
    const { lat, lng } = geoData.results[0].geometry.location;

    // B. Recherche Places (New) avec la catégorie détectée
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
    debugPath.push(`✅ Google a trouvé ${data.places?.length || 0} résultats pour "${category}"`);
    
    return data.places?.map(p => `- ${p.displayName.text} (${p.shortFormattedAddress})`).join('\n') || "";
  } catch (e) { return ""; }
}

// --- 2. DÉTECTEUR D'INTENTION ---
function detectCategory(msg) {
  const m = msg.toLowerCase();
  if (['bus', 'tram', 'gare', 'transport', 'aller'].some(k => m.includes(k))) return 'transport';
  if (['manger', 'resto', 'faim', 'dîner', 'déjeuner', 'café', 'boulangerie'].some(k => m.includes(k))) return 'food';
  if (['course', 'supermarché', 'magasin', 'achat', 'épicerie'].some(k => m.includes(k))) return 'shopping';
  if (['pharmacie', 'docteur', 'santé', 'urgence'].some(k => m.includes(k))) return 'health';
  return null;
}

// --- HANDLER PRINCIPAL ---
export default async function handler(req, res) {
  const { messagesHistory, propertyData } = req.body;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const lastUserMsg = messagesHistory[messagesHistory.length - 1]?.text || "";
  
  let debugPath = ["🚀 Analyse d'intention"];

  try {
    const fullAddress = `${propertyData?.street_number || ''} ${propertyData?.address || ''}, ${propertyData?.city || ''}`.trim();
    const category = detectCategory(lastUserMsg);

    // 🎯 1. RECHERCHE EN BASE DE DONNÉES (Propriétaire)
    // On cherche toutes les infos de l'hôte, l'IA fera le tri
    const { data: kb } = await supabase.from('knowledge_base').select('category, content').eq('property_id', propertyData.id);
    const ownerInfo = kb?.map(item => `[${item.category}] : ${item.content}`).join('\n') || "";

    // 🎯 2. RECHERCHE GOOGLE (Seulement si une catégorie est détectée)
    let googleData = "";
    if (category) {
      debugPath.push(`🎯 Catégorie détectée : ${category}`);
      googleData = await getGoogleLocalData(category, fullAddress, debugPath);
    } else {
      debugPath.push("ℹ️ Question générale (pas de recherche locale requise)");
    }

    // 🎯 3. PROMPT DE CONCIERGERIE SANS LIMITE
    const systemPrompt = `Tu es Marc, le majordome de la villa "${propertyData.name}".
Ton rôle est de fournir des recommandations locales (restaurants, transports, commerces).

HIÉRARCHIE DES INFOS :
1. INFOS HÔTE (Priorité absolue) :
${ownerInfo}

2. INFOS GOOGLE MAPS (Complément en temps réel) :
${googleData || "Aucune donnée Google trouvée pour cette demande."}

RÈGLES :
- Si l'hôte a donné une adresse ou un conseil, utilise-le en priorité.
- Utilise Google Maps pour donner des options supplémentaires ou confirmer que c'est ouvert/proche.
- Si tu ne trouves rien, propose de demander à l'hôte.
- Sois pro, chaleureux et précis. Jamais plus de 3-4 phrases.`;

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
  } catch (e) {
    res.status(200).json({ answer: "Petit souci technique." });
  }
}
