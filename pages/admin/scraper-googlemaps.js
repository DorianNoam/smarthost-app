import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─────────────────────────────────────────────
// TERMES DE RECHERCHE
// ─────────────────────────────────────────────
const SEARCH_QUERIES = [
  'conciergerie airbnb',
  'gestion location saisonnière',
  'conciergerie location courte durée',
  'gestionnaire airbnb',
  'property management airbnb',
];

const CITIES = [
  'Paris', 'Lyon', 'Bordeaux', 'Marseille', 'Nice',
  'Toulouse', 'Biarritz', 'Annecy', 'Strasbourg', 'Nantes'
];

// ─────────────────────────────────────────────
// RECHERCHE GOOGLE MAPS (Places API)
// ─────────────────────────────────────────────
async function searchGoogleMaps(query, city) {
  const apiKey = process.env.MAPS_API_KEY;
  if (!apiKey) throw new Error('MAPS_API_KEY manquante');

  try {
    // Geocoder la ville d'abord
    const geoRes = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)},France&key=${apiKey}`
    );
    const geoData = await geoRes.json();
    if (!geoData.results?.[0]) return [];
    
    const { lat, lng } = geoData.results[0].geometry.location;

    // Chercher les établissements
    const placesRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query + ' ' + city)}&location=${lat},${lng}&radius=10000&key=${apiKey}&language=fr`
    );
    const placesData = await placesRes.json();
    
    if (!placesData.results?.length) return [];

    // Pour chaque lieu, récupérer les détails (email, site web, téléphone)
    const results = [];
    for (const place of placesData.results.slice(0, 5)) {
      await new Promise(r => setTimeout(r, 500)); // Délai API

      const detailRes = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_phone_number,website,formatted_address&key=${apiKey}`
      );
      const detailData = await detailRes.json();
      const detail = detailData.result;

      if (!detail) continue;

      // Récupérer l'email depuis le site web si disponible
      let email = null;
      if (detail.website) {
        email = await extractEmailFromWebsite(detail.website);
      }

      if (!email) continue;

      results.push({
        source: 'googlemaps',
        name: detail.name || place.name,
        email: email.toLowerCase(),
        phone: detail.formatted_phone_number || null,
        city: city,
        property_type: 'conciergerie',
        listing_url: detail.website || null,
        status: 'new'
      });
    }

    return results;
  } catch (e) {
    console.error(`Erreur Google Maps ${query} ${city}:`, e.message);
    return [];
  }
}

// ─────────────────────────────────────────────
// EXTRAIRE EMAIL DEPUIS UN SITE WEB
// ─────────────────────────────────────────────
async function extractEmailFromWebsite(websiteUrl) {
  try {
    const response = await fetch(websiteUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(5000) // Timeout 5 secondes
    });
    
    if (!response.ok) return null;
    const html = await response.text();
    
    // Chercher tous les emails dans le HTML
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = html.match(emailRegex) || [];
    
    // Filtrer les emails valides
    const validEmail = emails.find(email =>
      !email.includes('example') &&
      !email.includes('sentry') &&
      !email.includes('wix') &&
      !email.includes('.png') &&
      !email.includes('.jpg') &&
      email.length < 80
    );

    return validEmail || null;
  } catch (e) {
    return null;
  }
}

// ─────────────────────────────────────────────
// HANDLER PRINCIPAL
// ─────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  // Sécurité
  const { secret } = req.body;
  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  const { cities = CITIES.slice(0, 3) } = req.body;

  let totalFound = 0;
  let totalSaved = 0;

  try {
    for (const city of cities) {
      for (const query of SEARCH_QUERIES.slice(0, 2)) {
        console.log(`🗺️ Google Maps — "${query}" à ${city}`);
        
        const results = await searchGoogleMaps(query, city);
        
        for (const result of results) {
          totalFound++;

          const { error } = await supabaseAdmin
            .from('prospects')
            .upsert(result, { onConflict: 'email', ignoreDuplicates: true });

          if (!error) {
            totalSaved++;
            console.log(`  ✅ ${result.email} — ${result.name} (${city})`);
          }
        }

        // Pause entre les requêtes
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    return res.status(200).json({
      success: true,
      stats: {
        villes_scrapées: cities.length,
        emails_trouvés: totalFound,
        emails_sauvegardés: totalSaved,
        doublons_ignorés: totalFound - totalSaved
      }
    });

  } catch (error) {
    console.error('Erreur scraper Google Maps:', error);
    return res.status(500).json({ error: error.message });
  }
}
