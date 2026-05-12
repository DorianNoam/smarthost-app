import Groq from 'groq-sdk';
import { supabase } from '../../lib/supabase';

// --- 1. RECHERCHE GOOGLE "SEARCH NEARBY" (STRICTE 500M) ---
async function getGoogleLocalData(category, fullAddress) {
  const apiKey = process.env.MAPS_API_KEY;
  
  const typeMap = {
    transport: ["bus_stop", "transit_station", "train_station", "light_rail_station"],
    food: ["restaurant", "bakery", "cafe", "meal_takeaway"],
    shopping: ["supermarket", "grocery_store", "convenience_store", "store"],
    health: ["pharmacy", "hospital"]
  };

  try {
    const geoRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`);
    const geoData = await geoRes.json();
    if (!geoData.results?.[0]) return "";
    const { lat, lng } = geoData.results[0].geometry.location;

    const placesRes = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.shortFormattedAddress'
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
    if (data.error || !data.places) return "";
    
    return data.places.map(p => `- ${p.displayName.text} (${p.shortFormattedAddress})`).join('\n');
  } catch (e) { return ""; }
}

// --- 2. DÉTECTEUR D'INTENTION ---
function detectCategory(msg) {
  const m = msg.toLowerCase();
  if (['bus', 'tram', 'transport', 'aller', 'gare', 'train', 'commun', 'navette'].some(k => m.includes(k))) return 'transport';
  if (['manger', 'resto', 'faim', 'dîner', 'déjeuner', 'café', 'boulangerie', 'pizza'].some(k => m.includes(k))) return 'food';
  if (['course', 'supermarché', 'magasin', 'achat', 'épicerie', 'provisions', 'market', 'shopping'].some(k => m.includes(k))) return 'shopping';
  return null;
}

// --- HANDLER PRINCIPAL ---
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Non autorisé');
  
  const { messagesHistory, propertyData } = req.body;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const lastUserMsg = messagesHistory[messagesHistory.length - 1]?.text || "";

  try {
    const fullAddress = `${propertyData?.street_number || ''} ${propertyData?.address || ''}, ${propertyData?.city || ''}`.trim();
    const category = detectCategory(lastUserMsg);

    // 🎯 ÉTAPE 1 : PRIORITÉ ABSOLUE À LA BASE DE DONNÉES (L'HÔTE)
    const { data: kb } = await supabase.from('knowledge_base').select('category, content').eq('property_id', propertyData.id);
    const ownerKB = kb?.map(item => `[${item.category}] : ${item.content}`).join('\n') || "";
    const propertyDirectInfo = `${propertyData.transport_info || ''} ${propertyData.local_shops || ''}`.trim();
    const globalOwnerData = `${propertyDirectInfo}\n${ownerKB}`.trim();

    // 🎯 ÉTAPE 2 : APPEL GOOGLE SEARCHNEARBY (SI BESOIN)
    let googleData = "";
    if (category) {
      googleData = await getGoogleLocalData(category, fullAddress);
    }

    // 🎯 ÉTAPE 3 : LE PROMPT DU MAJORDOME
    const systemPrompt = `Tu es Marc, le majordome de la villa "${propertyData.name}". 
Ton rôle est d'informer le voyageur sur les environs immédiats (moins de 5 min à pied).

INFOS HÔTE (Priorité absolue) :
${globalOwnerData || "L'hôte n'a pas donné d'instructions."}

INFOS GOOGLE MAPS :
${googleData || "Aucun résultat trouvé à proximité immédiate."}

CONSIGNES :
1. Si l'hôte a donné une info, utilise-la EXCLUSIVEMENT.
2. Si tu utilises Google Maps, sois affirmatif sur les lieux (ce sont des arrêts proches).
3. Ne cite jamais de lieux à plus de 10 min de marche.
4. Réponds en 2 sentences max, de façon chaleureuse.`;

    const chatResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: 'system', content: systemPrompt },
        ...messagesHistory.map(m => ({ role: m.role === 'marc' ? 'assistant' : 'user', content: m.text }))
      ],
      temperature: 0,
    });

    const responseText = chatResponse.choices[0].message.content;

    // SAUVEGARDE HISTORIQUE
    const newHistory = [...messagesHistory, { role: 'marc', text: responseText, timestamp: new Date().toISOString() }];
    await supabase.from('conversations').upsert({ 
        property_id: propertyData.id, 
        history: newHistory, 
        last_message_at: new Date().toISOString() 
    }, { onConflict: 'property_id' });

    res.status(200).json({ answer: responseText });

  } catch (error) {
    res.status(200).json({ answer: "Je reste à votre écoute pour vous aider." });
  }
}
