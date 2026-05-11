import Groq from 'groq-sdk';
import { supabase } from '../../lib/supabase';

// --- 1. RECHERCHE GOOGLE MAPS GÉOLOCALISÉE (RAYON 800M) ---
async function getGooglePlacesInfo(userQuery, fullAddress) {
  const apiKey = process.env.MAPS_API_KEY;
  if (!apiKey) return "Configuration API manquante.";

  try {
    // ÉTAPE A : Convertir l'adresse en coordonnées GPS (Geocoding)
    const geocodeRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`);
    const geocodeData = await geocodeRes.json();
    
    if (!geocodeData.results || geocodeData.results.length === 0) {
      console.log("🚩 Geocoding : Adresse introuvable.");
      return "Localisation du logement impossible.";
    }

    const { lat, lng } = geocodeData.results[0].geometry.location;

    // ÉTAPE B : Chercher les lieux uniquement dans un rayon de 800m (API Places New)
    const placesRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.shortFormattedAddress'
      },
      body: JSON.stringify({
        textQuery: userQuery, // Ex: "arrêt de bus", "boulangerie", etc.
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: 800.0 // 🎯 STRICTEMENT limité à 800 mètres autour de la villa
          }
        },
        languageCode: 'fr',
        maxResultCount: 6
      })
    });

    const placesData = await placesRes.json();

    if (!placesData.places || placesData.places.length === 0) {
      return "Aucun résultat trouvé à moins de 10 minutes à pied.";
    }

    return placesData.places.map(p => `- ${p.displayName.text} (${p.shortFormattedAddress})`).join('\n');

  } catch (e) {
    console.error("❌ Erreur Google :", e.message);
    return "Erreur lors de la recherche locale.";
  }
}

// --- 2. DÉTECTION D'INTENTION ---
function isLocalQuery(msg) {
  const keywords = ['transport', 'bus', 'tram', 'gare', 'boulangerie', 'restaurant', 'manger', 'proche', 'où est', 'commerce'];
  return keywords.some(k => msg.toLowerCase().includes(k));
}

// --- HANDLER PRINCIPAL ---
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Non autorisé');
  
  const { messagesHistory, propertyData } = req.body;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const lastUserMsg = messagesHistory[messagesHistory.length - 1]?.text || "";

  try {
    // 1. On prépare l'adresse exacte du logement
    const fullAddress = `${propertyData?.street_number || ''} ${propertyData?.address || ''}, ${propertyData?.city || ''}`.trim();
    console.log("🚩 Traitement pour :", fullAddress);

    // 2. On récupère les données Google si besoin
    let googleData = "";
    if (isLocalQuery(lastUserMsg)) {
      googleData = await getGooglePlacesInfo(lastUserMsg, fullAddress);
    }

    // 3. On récupère la base de connaissances de l'hôte (Supabase)
    const { data: kb } = await supabase.from('knowledge_base').select('category, content').eq('property_id', propertyData.id);
    const formattedKB = kb?.map(item => `${item.category}: ${item.content}`).join('\n') || "";

    // 4. LE PROMPT MAJORDOME (SANS HARDCODING)
    const systemPrompt = `Tu es Marc, le majordome privé du logement "${propertyData.name}". 
Ton but est d'être l'expert absolu du quartier immédiat.

CONSIGNES DE RÉPONSE :
1. Utilise les "DONNÉES LOCALES" ci-dessous pour répondre. Ce sont des lieux situés à moins de 10 min à pied.
2. Si la liste contient des résultats, cite-les précisément.
3. Si la liste est vide ou ne contient rien de pertinent, dis honnêtement que tu ne vois pas d'option immédiate sur la carte et suggère de demander à l'hôte pour ses pépites secrètes.
4. INTERDICTION : N'invente jamais de lieux et ne cite pas de monuments célèbres s'ils ne sont pas dans la liste.
5. Sois pro, chaleureux et concis (3 phrases max).

DONNÉES LOCALES (GOOGLE MAPS) :
${googleData || "Aucune donnée trouvée dans le périmètre immédiat."}

INFOS COMPLÉMENTAIRES DE L'HÔTE :
${formattedKB}
${propertyData.transport_info || ''}`;

    // 5. APPEL IA
    const chatResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: 'system', content: systemPrompt },
        ...messagesHistory.map(m => ({ role: m.role === 'marc' ? 'assistant' : 'user', content: m.text }))
      ],
      temperature: 0, 
    });

    const responseText = chatResponse.choices[0].message.content;

    // 6. SAUVEGARDE ET RÉPONSE
    const newHistory = [...messagesHistory, { role: 'marc', text: responseText, timestamp: new Date().toISOString() }];
    await supabase.from('conversations').upsert({ 
        property_id: propertyData.id, 
        history: newHistory, 
        last_message_at: new Date().toISOString() 
    }, { onConflict: 'property_id' });

    res.status(200).json({ answer: responseText });

  } catch (error) {
    console.error("❌ ERREUR :", error.message);
    res.status(200).json({ answer: "Je rencontre une petite difficulté technique, mais je suis toujours là." });
  }
}
