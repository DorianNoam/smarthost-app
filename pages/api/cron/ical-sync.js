// pages/api/cron/ical-sync.js
// Parse les calendriers iCal Airbnb/Booking, stocke les réservations,
// et déclenche automatiquement les missions de ménage.
// Appelé toutes les heures par Vercel Cron.

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─────────────────────────────────────────────
// PARSER iCAL — extrait les VEVENT du fichier .ics
// Compatible Airbnb, Booking.com, Vrbo, Abritel
// ─────────────────────────────────────────────
function parseIcal(icalText) {
  const events = [];
  const lines = icalText
    .replace(/\r\n /g, '') // unfold les lignes continues
    .replace(/\r\n\t/g, '')
    .split(/\r\n|\n/);

  let current = null;

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      current = {};
      continue;
    }
    if (line === 'END:VEVENT') {
      if (current) events.push(current);
      current = null;
      continue;
    }
    if (!current) continue;

    // Extraction des champs clés
    if (line.startsWith('UID:'))         current.uid     = line.slice(4).trim();
    if (line.startsWith('DTSTART'))      current.dtstart = extractDate(line);
    if (line.startsWith('DTEND'))        current.dtend   = extractDate(line);
    if (line.startsWith('SUMMARY:'))     current.summary = line.slice(8).trim();
    if (line.startsWith('STATUS:'))      current.status  = line.slice(7).trim().toLowerCase();
    if (line.startsWith('DESCRIPTION:')) current.description = line.slice(12).trim();
  }

  return events;
}

// Extrait une date depuis DTSTART;VALUE=DATE:20240115 ou DTSTART:20240115T150000Z
function extractDate(line) {
  const match = line.match(/(\d{8})/);
  if (!match) return null;
  const d = match[1];
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
}

// Détecte la plateforme depuis l'UID ou le SUMMARY
function detectPlatform(uid = '', summary = '') {
  const u = uid.toLowerCase();
  const s = summary.toLowerCase();
  if (u.includes('airbnb') || s.includes('airbnb')) return 'airbnb';
  if (u.includes('booking') || s.includes('booking')) return 'booking';
  if (u.includes('vrbo') || s.includes('vrbo') || s.includes('homeaway')) return 'vrbo';
  if (s.includes('reserved') || s.includes('not available') || s.includes('bloqué')) return 'airbnb'; // Airbnb bloque souvent avec ces termes
  return 'unknown';
}

// Extrait le nom du voyageur depuis le SUMMARY
// Airbnb format: "John D." ou "Réservé - John D."
// Booking format: "CLOSED - Booking.com" ou nom direct
function extractGuestName(summary = '') {
  if (!summary) return null;
  // Supprimer les préfixes connus
  const cleaned = summary
    .replace(/^reserved\s*[-–]\s*/i, '')
    .replace(/^réservé\s*[-–]\s*/i, '')
    .replace(/^closed\s*[-–]\s*/i, '')
    .replace(/^airbnb\s*[-–]?\s*/i, '')
    .replace(/^booking\.com\s*[-–]?\s*/i, '')
    .replace(/not available/i, '')
    .trim();

  // Si c'est juste un mot générique, pas de nom
  if (['reserved', 'réservé', 'blocked', 'bloqué', 'unavailable', ''].includes(cleaned.toLowerCase())) {
    return null;
  }
  return cleaned || null;
}

// ─────────────────────────────────────────────
// HANDLER PRINCIPAL
// ─────────────────────────────────────────────
export default async function handler(req, res) {
  // Sécurité : seul Vercel Cron peut appeler cette route
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.alfredmajor.com';

  try {
    // 1. Récupérer tous les logements actifs avec une URL iCal
    const { data: properties, error: propError } = await supabaseAdmin
      .from('properties')
      .select('id, owner_id, name, ical_url')
      .eq('is_active', true)
      .not('ical_url', 'is', null)
      .neq('ical_url', '');

    if (propError) throw propError;
    if (!properties || properties.length === 0) {
      return res.status(200).json({ success: true, message: 'Aucun logement avec iCal', synced: 0 });
    }

    const results = {
      total: properties.length,
      synced: 0,
      new_reservations: 0,
      new_jobs: 0,
      errors: [],
    };

    // 2. Traiter chaque logement en parallèle (max 5 à la fois)
    const chunks = chunkArray(properties, 5);
    for (const chunk of chunks) {
      await Promise.allSettled(
        chunk.map(property => syncProperty(property, siteUrl, results))
      );
    }

    console.log(`✅ iCal sync terminé :`, results);
    return res.status(200).json({ success: true, ...results });

  } catch (error) {
    console.error('❌ Erreur iCal sync global:', error);
    return res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
}

// ─────────────────────────────────────────────
// SYNC UN LOGEMENT
// ─────────────────────────────────────────────
async function syncProperty(property, siteUrl, results) {
  try {
    // 1. Télécharger le fichier iCal
    const response = await fetch(property.ical_url, {
      headers: { 'User-Agent': 'AlfredMajor/1.0 (Calendar Sync)' },
      signal: AbortSignal.timeout(10000), // timeout 10s
    });

    if (!response.ok) {
      results.errors.push({ property: property.name, error: `HTTP ${response.status}` });
      return;
    }

    const icalText = await response.text();
    const events = parseIcal(icalText);

    if (events.length === 0) {
      results.synced++;
      return;
    }

    // 2. Filtrer les événements valides (avec dates)
    const validEvents = events.filter(e => e.uid && e.dtstart && e.dtend);

    // 3. Récupérer les UIDs déjà connus pour ce logement
    const { data: existingReservations } = await supabaseAdmin
      .from('reservations')
      .select('ical_uid, id')
      .eq('property_id', property.id);

    const existingUids = new Set((existingReservations || []).map(r => r.ical_uid));

    // 4. Préparer les upserts
    const toUpsert = validEvents.map(event => ({
      property_id:  property.id,
      owner_id:     property.owner_id,
      ical_uid:     event.uid,
      platform:     detectPlatform(event.uid, event.summary),
      guest_name:   extractGuestName(event.summary),
      check_in:     event.dtstart,
      check_out:    event.dtend,
      status:       event.status === 'cancelled' ? 'cancelled' : 'confirmed',
      raw_summary:  event.summary || null,
    }));

    // 5. Upsert en base (conflits sur property_id + ical_uid)
    const { data: upserted, error: upsertError } = await supabaseAdmin
      .from('reservations')
      .upsert(toUpsert, { onConflict: 'property_id,ical_uid', ignoreDuplicates: false })
      .select('id, ical_uid, check_in, check_out, guest_name, status');

    if (upsertError) {
      results.errors.push({ property: property.name, error: upsertError.message });
      return;
    }

    // 6. Identifier les NOUVELLES réservations (pas encore dans existingUids)
    const newReservations = (upserted || []).filter(r =>
      !existingUids.has(r.ical_uid) && r.status !== 'cancelled'
    );

    results.new_reservations += newReservations.length;
    results.synced++;

    // 7. Pour chaque nouvelle réservation → vérifier si un prestataire ménage est configuré
    for (const reservation of newReservations) {
      await triggerCleaningJob(property, reservation, siteUrl, results);
    }

  } catch (error) {
    results.errors.push({ property: property.name, error: error.message });
    console.error(`❌ Erreur sync ${property.name}:`, error.message);
  }
}

// ─────────────────────────────────────────────
// DÉCLENCHER UNE MISSION MÉNAGE
// ─────────────────────────────────────────────
async function triggerCleaningJob(property, reservation, siteUrl, results) {
  try {
    // 1. Vérifier si un prestataire est configuré pour ce logement
    const { data: cleaningConfig } = await supabaseAdmin
      .from('property_cleaning')
      .select('*, cleaning_providers(id, name, email, telegram_chat_id)')
      .eq('property_id', property.id)
      .single();

    if (!cleaningConfig?.cleaning_providers) return; // Pas de prestataire → on skip

    const provider = cleaningConfig.cleaning_providers;

    // 2. Vérifier qu'un job n'existe pas déjà pour cette réservation
    const { data: existingJob } = await supabaseAdmin
      .from('cleaning_jobs')
      .select('id')
      .eq('property_id', property.id)
      .eq('reservation_id', reservation.id)
      .single();

    if (existingJob) return; // Job déjà créé → on skip

    // 3. Créer le job de ménage
    // Le ménage se fait à la date de check_out (départ du voyageur)
    const checkoutDateTime = `${reservation.check_out}T${cleaningConfig.default_checkout_time || '11:00'}:00`;
    const nextCheckinDateTime = `${reservation.check_in}T${cleaningConfig.default_checkin_time || '15:00'}:00`;

    const { data: job, error: jobError } = await supabaseAdmin
      .from('cleaning_jobs')
      .insert({
        property_id:    property.id,
        provider_id:    provider.id,
        reservation_id: reservation.id,
        checkout_time:  checkoutDateTime,
        next_checkin:   nextCheckinDateTime,
        status:         'pending',
        notified_at:    new Date().toISOString(),
      })
      .select()
      .single();

    if (jobError) {
      console.error(`❌ Erreur création job ménage:`, jobError.message);
      return;
    }

    results.new_jobs++;

    // 4. Envoyer la notification email au prestataire via l'API notify
    if (provider.email) {
      await fetch(`${siteUrl}/api/cleaning/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-cron-secret': process.env.CRON_SECRET,
        },
        body: JSON.stringify({
          jobId:          job.id,
          propertyId:     property.id,
          providerId:     provider.id,
          checkoutTime:   checkoutDateTime,
          nextCheckinTime: nextCheckinDateTime,
          guestName:      reservation.guest_name,
          fromCron:       true,
        }),
      });
    }

  } catch (error) {
    console.error(`❌ Erreur trigger cleaning job:`, error.message);
  }
}

// ─────────────────────────────────────────────
// UTILITAIRE — découper un tableau en chunks
// ─────────────────────────────────────────────
function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
