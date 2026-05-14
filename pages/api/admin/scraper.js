import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SEARCH_QUERIES = [
  'conciergerie airbnb',
  'gestion location saisonnière',
  'conciergerie location courte durée',
  'gestionnaire airbnb',
];

const CITIES = [
  'Paris', 'Lyon', 'Bordeaux', 'Marseille', 'Nice',
  'Toulouse', 'Biarritz', 'Annecy', 'Strasbourg', 'Nantes',
  'Montpellier', 'Rennes', 'Bayonne', 'Saint-Malo', 'La Rochelle'
];

// ─────────────────────────────────────────────
// EXTRAIRE EMAIL DEPUIS UN SITE WEB
// ─────────────────────────────────────────────
async function extractEmailFromWebsite(websiteUrl) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(websiteUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) return null;
    const html = await response.text();

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = html.match(emailRegex) || [];

    return emails.find(email =>
      !email.includes('example') &&
      !email.includes('sentry') &&
      !email.includes('wix') &&
      !email.includes('wordpress') &&
      !email.includes('.png') &&
      !email.includes('.jpg') &&
      !email.includes('noreply') &&
      email.length < 80
    ) || null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// SCRAPER GOOGLE MAPS POUR UNE VILLE
// ─────────────────────────────────────────────
async function scrapeCity(query, city, apiKey) {
  const results = [];

  try {
    // 1. Geocoder la ville
    const geoRes = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city + ', France')}&key=${apiKey}`
    );
    const geoData = await geoRes.json();
    if (!geoData.results?.[0]) return [];
    const { lat, lng } = geoData.results[0].geometry.location;

    // 2. Chercher les établissements
    const placesRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query + ' ' + city)}&location=${lat},${lng}&radius=15000&key=${apiKey}&language=fr`
    );
    const placesData = await placesRes.json();
    if (!placesData.results?.length) return [];

    // 3. Récupérer les détails de chaque lieu (max 5)
    for (const place of placesData.results.slice(0, 5)) {
      const detailRes = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_phone_number,website,formatted_address&key=${apiKey}`
      );
      const detailData = await detailRes.json();
      const detail = detailData.result;
      if (!detail?.website) continue;

      // 4. Extraire l'email depuis le site web
      const email = await extractEmailFromWebsite(detail.website);
      if (!email) continue;

      results.push({
        source: 'googlemaps',
        name: detail.name || place.name,
        email: email.toLowerCase(),
        phone: detail.formatted_phone_number || null,
        city: city,
        property_type: 'conciergerie',
        listing_url: detail.website,
        status: 'new'
      });
    }
  } catch (e) {
    console.error(`Erreur ${query} ${city}:`, e.message);
  }

  return results;
}

// ─────────────────────────────────────────────
// HANDLER PRINCIPAL
// ─────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  // Sécurité
  const { secret, cityIndex = 0 } = req.body;
  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  const apiKey = process.env.MAPS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'MAPS_API_KEY manquante' });

  // On traite UNE ville à la fois pour rester sous le timeout Vercel
  const city = CITIES[cityIndex];
  if (!city) return res.status(200).json({ success: true, message: 'Toutes les villes traitées !' });

  let totalFound = 0;
  let totalSaved = 0;

  try {
    for (const query of SEARCH_QUERIES.slice(0, 2)) {
      const results = await scrapeCity(query, city, apiKey);

      for (const result of results) {
        totalFound++;
        const { error } = await supabaseAdmin
          .from('prospects')
          .upsert(result, { onConflict: 'email', ignoreDuplicates: true });
        if (!error) totalSaved++;
      }
    }

    return res.status(200).json({
      success: true,
      city,
      cityIndex,
      nextCityIndex: cityIndex + 1,
      hasMore: cityIndex + 1 < CITIES.length,
      stats: {
        emails_trouvés: totalFound,
        emails_sauvegardés: totalSaved,
        doublons_ignorés: totalFound - totalSaved
      }
    });

  } catch (error) {
    console.error('Erreur scraper:', error);
    return res.status(500).json({ error: error.message });
  }
}
