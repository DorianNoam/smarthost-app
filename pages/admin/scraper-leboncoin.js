import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─────────────────────────────────────────────
// VILLES CIBLES
// ─────────────────────────────────────────────
const CITIES = [
  'paris', 'lyon', 'bordeaux', 'marseille', 'nice',
  'toulouse', 'biarritz', 'annecy', 'strasbourg', 'nantes',
  'montpellier', 'rennes', 'bayonne', 'saint-malo', 'la-rochelle'
];

// ─────────────────────────────────────────────
// SCRAPER UNE PAGE LEBONCOIN
// ─────────────────────────────────────────────
async function scrapeLeboncoinPage(city, page = 1) {
  const url = `https://www.leboncoin.fr/locations_saisonnieres/offres/${city}/?page=${page}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
      }
    });

    if (!response.ok) return [];
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const listings = [];

    // Extraire les liens des annonces
    $('a[href*="/locations_saisonnieres/"]').each((i, el) => {
      const href = $(el).attr('href');
      if (href && href.includes('/ad/') && !listings.find(l => l.url === href)) {
        listings.push({ url: `https://www.leboncoin.fr${href}` });
      }
    });

    return listings.slice(0, 10); // Max 10 annonces par page
  } catch (e) {
    console.error(`Erreur scraping ${city} page ${page}:`, e.message);
    return [];
  }
}

// ─────────────────────────────────────────────
// SCRAPER UNE ANNONCE INDIVIDUELLE
// ─────────────────────────────────────────────
async function scrapeListingDetail(listingUrl) {
  try {
    // Délai aléatoire pour éviter la détection (2-4 secondes)
    await new Promise(r => setTimeout(r, 2000 + Math.random() * 2000));

    const response = await fetch(listingUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'fr-FR,fr;q=0.9',
      }
    });

    if (!response.ok) return null;
    const html = await response.text();
    const $ = cheerio.load(html);

    // Extraire les données
    const title = $('h1').first().text().trim();
    const description = $('[data-qa-id="adview_description_container"]').text().trim();
    
    // Chercher email dans la description
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const allText = $('body').text();
    const emails = allText.match(emailRegex) || [];
    
    // Filtrer les emails valides (exclure images, scripts, etc.)
    const validEmail = emails.find(email => 
      !email.includes('leboncoin') && 
      !email.includes('example') &&
      !email.includes('.png') &&
      !email.includes('.jpg') &&
      email.length < 100
    );

    // Extraire la ville
    const cityMatch = listingUrl.match(/offres\/([^/]+)\//);
    const city = cityMatch ? cityMatch[1] : '';

    // Extraire le téléphone si visible
    const phoneRegex = /(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}/g;
    const phones = allText.match(phoneRegex) || [];

    if (!validEmail) return null;

    return {
      source: 'leboncoin',
      name: title || null,
      email: validEmail.toLowerCase(),
      phone: phones[0] || null,
      city: city,
      property_type: title?.toLowerCase().includes('villa') ? 'villa' :
                     title?.toLowerCase().includes('maison') ? 'maison' :
                     title?.toLowerCase().includes('appartement') ? 'appartement' : 'location',
      listing_url: listingUrl,
      status: 'new'
    };
  } catch (e) {
    console.error(`Erreur détail annonce:`, e.message);
    return null;
  }
}

// ─────────────────────────────────────────────
// HANDLER PRINCIPAL
// ─────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  // Sécurité : vérifier que c'est bien vous
  const { secret } = req.body;
  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  const { cities = CITIES.slice(0, 3), pages = 1 } = req.body;
  
  let totalFound = 0;
  let totalSaved = 0;
  const errors = [];

  try {
    for (const city of cities) {
      console.log(`🔍 Scraping Leboncoin — ${city}...`);
      
      for (let page = 1; page <= pages; page++) {
        // Récupérer les annonces de la page
        const listings = await scrapeLeboncoinPage(city, page);
        console.log(`  → ${listings.length} annonces trouvées page ${page}`);

        // Scraper chaque annonce
        for (const listing of listings) {
          const detail = await scrapeListingDetail(listing.url);
          
          if (!detail) continue;
          totalFound++;

          // Sauvegarder dans Supabase (ignorer si email déjà existant)
          const { error } = await supabaseAdmin
            .from('prospects')
            .upsert(detail, { onConflict: 'email', ignoreDuplicates: true });

          if (!error) {
            totalSaved++;
            console.log(`  ✅ ${detail.email} (${detail.city})`);
          }
        }

        // Pause entre les pages (3-5 secondes)
        if (page < pages) {
          await new Promise(r => setTimeout(r, 3000 + Math.random() * 2000));
        }
      }

      // Pause entre les villes (5-8 secondes)
      await new Promise(r => setTimeout(r, 5000 + Math.random() * 3000));
    }

    return res.status(200).json({
      success: true,
      message: `Scraping terminé !`,
      stats: {
        villes_scrapées: cities.length,
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
