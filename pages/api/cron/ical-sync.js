// pages/api/cron/ical-sync.js
// Parse les calendriers iCal Airbnb/Booking, stocke les réservations,
// déclenche les missions ménage, et vérifie les alertes ménage non confirmés.
// Appelé toutes les heures par Vercel Cron.

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─────────────────────────────────────────────
// PARSER iCAL
// Compatible Airbnb, Booking.com, Vrbo, Abritel
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

    if (line.startsWith('UID:'))         current.uid     = line.slice(4).trim();
    if (line.startsWith('DTSTART'))      current.dtstart = extractDate(line);
    if (line.startsWith('DTEND'))        current.dtend   = extractDate(line);
    if (line.startsWith('SUMMARY:'))     current.summary = line.slice(8).trim();
    if (line.startsWith('STATUS:'))      current.status  = line.slice(7).trim().toLowerCase();
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

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

// ─────────────────────────────────────────────
// HANDLER PRINCIPAL
// ─────────────────────────────────────────────
export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.alfredmajor.com';

  try {
    // ── ÉTAPE 1 : iCal sync ──────────────────────────────────
    const { data: properties, error: propError } = await supabaseAdmin
      .from('properties')
      .select('id, owner_id, name, ical_url')
      .eq('is_active', true)
      .not('ical_url', 'is', null)
      .neq('ical_url', '');

    if (propError) throw propError;

    const results = {
      total: properties?.length || 0,
      synced: 0,
      new_reservations: 0,
      new_jobs: 0,
      alerts_sent: 0,
      errors: [],
    };

    if (properties && properties.length > 0) {
      const chunks = chunkArray(properties, 5);
      for (const chunk of chunks) {
        await Promise.allSettled(
          chunk.map(property => syncProperty(property, siteUrl, results))
        );
      }
    }

    // ── ÉTAPE 2 : Alertes ménages non confirmés ─────────────
    // Remplace le cron /api/cleaning/alert (limité sur Vercel Free)
    const alertsResult = await checkUnconfirmedCleanings();
    results.alerts_sent = alertsResult;

    console.log(`✅ iCal sync + alertes terminés :`, results);
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
      .select('ical_uid, id')
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

    // Nouvelles réservations uniquement
    const newReservations = (upserted || []).filter(r =>
      !existingUids.has(r.ical_uid) && r.status !== 'cancelled'
    );

    results.new_reservations += newReservations.length;
    results.synced++;

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
    const { data: cleaningConfig } = await supabaseAdmin
      .from('property_cleaning')
      .select('*, cleaning_providers(id, name, email, telegram_chat_id)')
      .eq('property_id', property.id)
      .single();

    if (!cleaningConfig?.cleaning_providers) return;

    const provider = cleaningConfig.cleaning_providers;

    // Vérifier qu'un job n'existe pas déjà pour cette réservation
    const { data: existingJob } = await supabaseAdmin
      .from('cleaning_jobs')
      .select('id')
      .eq('reservation_id', reservation.id)
      .single();

    if (existingJob) return;

    const checkoutDateTime  = `${reservation.check_out}T${cleaningConfig.default_checkout_time || '11:00'}:00`;
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

    if (jobError) { console.error('❌ Erreur création job:', jobError.message); return; }

    results.new_jobs++;

    // Email au prestataire via /api/cleaning/notify
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

// ─────────────────────────────────────────────
// ALERTES MÉNAGES NON CONFIRMÉS
// Remplace /api/cleaning/alert (cron séparé impossible sur Vercel Free)
// ─────────────────────────────────────────────
async function checkUnconfirmedCleanings() {
  try {
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const { data: jobs } = await supabaseAdmin
      .from('cleaning_jobs')
      .select('*, properties(name, owner_id)')
      .eq('status', 'pending')
      .not('next_checkin', 'is', null)
      .lte('next_checkin', twoHoursLater.toISOString())
      .gte('next_checkin', now.toISOString());

    if (!jobs || jobs.length === 0) return 0;

    const token = process.env.TELEGRAM_BOT_TOKEN;
    let alertCount = 0;

    for (const job of jobs) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('telegram_chat_id, expo_push_token')
        .eq('id', job.properties.owner_id)
        .single();

      const checkinTime = new Date(job.next_checkin).toLocaleString('fr-FR', {
        hour: '2-digit', minute: '2-digit'
      });

      // Telegram à l'hôte
      if (token && profile?.telegram_chat_id) {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: profile.telegram_chat_id,
            text: `⚠️ *MÉNAGE NON CONFIRMÉ*\n\n🏠 *Logement :* ${job.properties.name}\n📅 *Arrivée prévue à :* ${checkinTime}\n\n❗ Le ménage n'a pas encore été confirmé. Veuillez vérifier.\n\n_Alfred Major 🎩_`,
            parse_mode: 'Markdown',
          }),
        });
      }

      // Push Expo à l'hôte
      if (profile?.expo_push_token) {
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: profile.expo_push_token,
            sound: 'default',
            title: '⚠️ Ménage non confirmé',
            body: `${job.properties.name} — Arrivée à ${checkinTime} et ménage non confirmé`,
            priority: 'high',
          }),
        });
      }

      alertCount++;
    }

    return alertCount;
  } catch (error) {
    console.error('❌ Erreur check unconfirmed cleanings:', error.message);
    return 0;
  }
}
