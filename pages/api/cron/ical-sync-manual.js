// pages/api/ical-sync-manual.js
// Version du sync iCal déclenchée depuis le dashboard hôte.
// Sécurisée par session Supabase (pas de CRON_SECRET exposé au navigateur).
// Synchronise uniquement les logements de l'hôte connecté.

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─────────────────────────────────────────────
// PARSER iCAL
// ─────────────────────────────────────────────
function parseIcal(icalText) {
  const events = [];
  const lines = icalText
    .replace(/\r\n /g, '')
    .replace(/\r\n\t/g, '')
    .split(/\r\n|\n/);

  let current = null;

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') { current = {}; continue; }
    if (line === 'END:VEVENT')   { if (current) events.push(current); current = null; continue; }
    if (!current) continue;

    if (line.startsWith('UID:'))     current.uid     = line.slice(4).trim();
    if (line.startsWith('DTSTART')) current.dtstart = extractDate(line);
    if (line.startsWith('DTEND'))   current.dtend   = extractDate(line);
    if (line.startsWith('SUMMARY:')) current.summary = line.slice(8).trim();
    if (line.startsWith('STATUS:'))  current.status  = line.slice(7).trim().toLowerCase();
  }

  return events;
}

function extractDate(line) {
  const match = line.match(/(\d{8})/);
  if (!match) return null;
  const d = match[1];
  return `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`;
}

function detectPlatform(uid = '', summary = '') {
  const u = uid.toLowerCase();
  const s = summary.toLowerCase();
  if (u.includes('airbnb') || s.includes('airbnb')) return 'airbnb';
  if (u.includes('booking') || s.includes('booking')) return 'booking';
  if (u.includes('vrbo') || s.includes('vrbo') || s.includes('homeaway')) return 'vrbo';
  if (s.includes('reserved') || s.includes('not available') || s.includes('bloqué')) return 'airbnb';
  return 'unknown';
}

function extractGuestName(summary = '') {
  if (!summary) return null;
  const cleaned = summary
    .replace(/^reserved\s*[-–]\s*/i, '')
    .replace(/^réservé\s*[-–]\s*/i, '')
    .replace(/^closed\s*[-–]\s*/i, '')
    .replace(/^airbnb\s*[-–]?\s*/i, '')
    .replace(/^booking\.com\s*[-–]?\s*/i, '')
    .replace(/not available/i, '')
    .trim();
  if (['reserved','réservé','blocked','bloqué','unavailable',''].includes(cleaned.toLowerCase())) return null;
  return cleaned || null;
}

// ─────────────────────────────────────────────
// HANDLER
// ─────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  // Vérifier la session Supabase depuis le header Authorization
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Non authentifié' });

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Session invalide' });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.alfredmajor.com';

  try {
    // Récupérer uniquement les logements actifs de cet hôte avec iCal
    const { data: properties } = await supabaseAdmin
      .from('properties')
      .select('id, owner_id, name, ical_url')
      .eq('owner_id', user.id)
      .eq('is_active', true)
      .not('ical_url', 'is', null)
      .neq('ical_url', '');

    if (!properties || properties.length === 0) {
      return res.status(200).json({ success: true, synced: 0, new_reservations: 0 });
    }

    const results = { synced: 0, new_reservations: 0, new_jobs: 0, errors: [] };

    // Sync en parallèle
    await Promise.allSettled(
      properties.map(property => syncProperty(property, siteUrl, results))
    );

    return res.status(200).json({ success: true, ...results });

  } catch (error) {
    console.error('❌ Erreur ical-sync-manual:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ─────────────────────────────────────────────
// SYNC UN LOGEMENT
// ─────────────────────────────────────────────
async function syncProperty(property, siteUrl, results) {
  try {
    const response = await fetch(property.ical_url, {
      headers: { 'User-Agent': 'AlfredMajor/1.0 (Calendar Sync)' },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      results.errors.push({ property: property.name, error: `HTTP ${response.status}` });
      return;
    }

    const icalText = await response.text();
    const events = parseIcal(icalText);
    const validEvents = events.filter(e => e.uid && e.dtstart && e.dtend);

    if (validEvents.length === 0) { results.synced++; return; }

    // UIDs déjà connus
    const { data: existing } = await supabaseAdmin
      .from('reservations')
      .select('ical_uid')
      .eq('property_id', property.id);

    const existingUids = new Set((existing || []).map(r => r.ical_uid));

    // Upsert
    const toUpsert = validEvents.map(event => ({
      property_id: property.id,
      owner_id:    property.owner_id,
      ical_uid:    event.uid,
      platform:    detectPlatform(event.uid, event.summary),
      guest_name:  extractGuestName(event.summary),
      check_in:    event.dtstart,
      check_out:   event.dtend,
      status:      event.status === 'cancelled' ? 'cancelled' : 'confirmed',
      raw_summary: event.summary || null,
    }));

    const { data: upserted, error: upsertError } = await supabaseAdmin
      .from('reservations')
      .upsert(toUpsert, { onConflict: 'property_id,ical_uid', ignoreDuplicates: false })
      .select('id, ical_uid, check_in, check_out, guest_name, status');

    if (upsertError) {
      results.errors.push({ property: property.name, error: upsertError.message });
      return;
    }

    // Nouvelles réservations
    const newReservations = (upserted || []).filter(r =>
      !existingUids.has(r.ical_uid) && r.status !== 'cancelled'
    );

    results.new_reservations += newReservations.length;
    results.synced++;

    // Déclencher les jobs ménage pour les nouvelles réservations
    for (const reservation of newReservations) {
      await triggerCleaningJob(property, reservation, siteUrl, results);
    }

  } catch (error) {
    results.errors.push({ property: property.name, error: error.message });
  }
}

// ─────────────────────────────────────────────
// DÉCLENCHER UNE MISSION MÉNAGE
// ─────────────────────────────────────────────
async function triggerCleaningJob(property, reservation, siteUrl, results) {
  try {
    const { data: cleaningConfig } = await supabaseAdmin
      .from('property_cleaning')
      .select('*, cleaning_providers(id, name, email, telegram_chat_id)')
      .eq('property_id', property.id)
      .single();

    if (!cleaningConfig?.cleaning_providers) return;

    const provider = cleaningConfig.cleaning_providers;

    // Vérifier qu'un job n'existe pas déjà
    const { data: existingJob } = await supabaseAdmin
      .from('cleaning_jobs')
      .select('id')
      .eq('reservation_id', reservation.id)
      .maybeSingle();

    if (existingJob) return;

    const checkoutDateTime   = `${reservation.check_out}T${cleaningConfig.default_checkout_time || '11:00'}:00`;
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

    if (jobError) return;

    results.new_jobs++;

    // Notifier le prestataire par email
    if (provider.email) {
      await fetch(`${siteUrl}/api/cleaning/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-cron-secret': process.env.CRON_SECRET,
        },
        body: JSON.stringify({
          jobId:           job.id,
          propertyId:      property.id,
          checkoutTime:    checkoutDateTime,
          nextCheckinTime: nextCheckinDateTime,
          guestName:       reservation.guest_name,
          fromCron:        true,
        }),
      });
    }

  } catch (error) {
    console.error('❌ Erreur trigger cleaning job:', error.message);
  }
}
