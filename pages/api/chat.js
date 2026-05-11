import Groq from 'groq-sdk';
import { supabase } from '../../lib/supabase';

// --- 1. RECHERCHE GOOGLE MAPS (VERSION LARGE & GPS) ---
async function getGooglePlacesInfo(userMsg, fullAddress) {
  const apiKey = process.env.MAPS_API_KEY;
  if (!apiKey) return "Clé API absente.";

  try {
    // ÉTAPE A : Geocoding (On trouve le point GPS précis)
    const geoRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`);
    const geoData = await geoRes.json();
    
    if (!geoData.results || geoData.results.length === 0) {
      console.error("🚩 Erreur : Adresse non reconnue par Google.");
      return "";
    }

    const { lat, lng } = geoData.results[0].geometry.location;
    console.log(`🚩 Localisation Villa : ${lat}, ${lng}`);

    // ÉTAPE B : Recherche ultra-large (Transit + Bus + Tram)
    const placesRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.shortFormattedAddress'
      },
      body: JSON.stringify({
        // On demande tous les types de transports possibles dans la zone
        textQuery: "arrêt de bus, station de tram, transports publics",
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: 1000.0 // On élargit à 1km pour être SÛR de capter Pellegrin
          }
        },
        languageCode: 'fr',
        maxResultCount: 10
      })
    });

    const placesData = await placesRes.json();

    if (!placesData.places || placesData.places.length === 0) {
      console.log("🚩 Google ne renvoie AUCUN transport dans le rayon de 1km.");
      return "";
    }

    // On crée la liste pour l'IA
    const list = placesData.places.map(p => `- ${p.displayName.text} (${p.shortFormattedAddress})`).join('\n');
    console.log("🚩 Données envoyées à l'IA :\n", list);
    return list;

  } catch (e) {
    console.error("❌ Erreur technique Google :", e.message);
    return "";
  }
}

// --- HANDLER PRINCIPAL ---
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Non autorisé');
  
  const { messagesHistory, propertyData } = req.body;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const lastUserMsg = messagesHistory[messagesHistory.length - 1]?.text || "";

  try {
    // On s'assure que l'adresse est complète
    const fullAddress = `${propertyData?.street_number || ''} ${propertyData?.address || ''}, ${propertyData?.city || ''}`.trim();
    
    let googleData = "";
    const isTransportQuery = ['transport', 'bus', 'tram', 'aller', 'proche', 'gare'].some(k => lastUserMsg.toLowerCase().includes(k));

    if (isTransportQuery) {
      googleData = await getGooglePlacesInfo(lastUserMsg, fullAddress);
    }

    const systemPrompt = `Tu es Marc, le majordome de la villa située au ${fullAddress}.
Tu es un expert local qui aide les voyageurs.

DONNÉES RÉELLES GOOGLE MAPS :
${googleData || "AUCUN RÉSULTAT TROUVÉ À PROXIMITÉ."}

CONSIGNES :
1. Si les "DONNÉES RÉELLES" contiennent des arrêts (ex: Pellegrin, Barrière d'Ornano, etc.), cite-les impérativement.
2. Si la liste est vide, dis : "Je ne vois pas d'arrêt de bus immédiat sur la carte du quartier, je vous conseille de demander confirmation à votre hôte."
3. Ne cite JAMAIS de lieux qui ne sont pas dans la liste ci-dessus.
4. Réponds de façon concise et élégante (3 phrases max).`;

    const chatResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: 'system', content: systemPrompt },
        ...messagesHistory.map(m => ({ role: m.role === 'marc' ? 'assistant' : 'user', content: m.text }))
      ],
      temperature: 0,
    });

    const responseText = chatResponse.choices[0].message.content;

    // Sauvegarde historique...
    const newHistory = [...messagesHistory, { role: 'marc', text: responseText, timestamp: new Date().toISOString() }];
    await supabase.from('conversations').upsert({ 
        property_id: propertyData.id, 
        history: newHistory, 
        last_message_at: new Date().toISOString() 
    }, { onConflict: 'property_id' });

    res.status(200).json({ answer: responseText });

  } catch (error) {
    res.status(200).json({ answer: "Petit souci technique." });
  }
}
