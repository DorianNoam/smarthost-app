// pages/api/cleaning/notify.js
// Envoie une notification au prestataire de ménage via Telegram

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { propertyId, checkoutTime, nextCheckinTime } = req.body;

  if (!propertyId) return res.status(400).json({ error: 'propertyId requis' });

  try {
    // 1. Récupérer le logement
    const { data: property } = await supabaseAdmin
      .from('properties')
      .select('name, city, owner_id')
      .eq('id', propertyId)
      .single();

    if (!property) return res.status(404).json({ error: 'Logement introuvable' });

    // 2. Récupérer la config ménage du logement
    const { data: cleaningConfig } = await supabaseAdmin
      .from('property_cleaning')
      .select('*, cleaning_providers(*)')
      .eq('property_id', propertyId)
      .single();

    if (!cleaningConfig?.cleaning_providers) {
      return res.status(404).json({ error: 'Aucun prestataire configuré pour ce logement' });
    }

    const provider = cleaningConfig.cleaning_providers;

    // 3. Créer le job de ménage
    const { data: job } = await supabaseAdmin
      .from('cleaning_jobs')
      .insert({
        property_id: propertyId,
        provider_id: provider.id,
        checkout_time: checkoutTime || new Date().toISOString(),
        next_checkin: nextCheckinTime || null,
        status: 'pending',
        notified_at: new Date().toISOString(),
      })
      .select()
      .single();

    // 4. Construire le lien de confirmation prestataire
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.alfredmajor.com';
    const confirmLink = `${siteUrl}/cleaning/${job.id}`;

    // 5. Construire la checklist
    const checklist = cleaningConfig.checklist || [];
    const checklistText = checklist.length > 0
      ? '\n\n📋 *Checklist :*\n' + checklist.map(item => `• ${item}`).join('\n')
      : '';

    // 6. Formater les horaires
    const formatTime = (iso) => {
      if (!iso) return 'Non précisé';
      return new Date(iso).toLocaleString('fr-FR', {
        day: '2-digit', month: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });
    };

    // 7. Envoyer la notification Telegram
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (token && provider.telegram_chat_id) {
      const text = `🧹 *MÉNAGE À EFFECTUER*\n\n🏠 *Logement :* ${property.name}${property.city ? ` — ${property.city}` : ''}\n\n🕐 *Départ voyageur :* ${formatTime(checkoutTime)}\n📅 *Prochain voyageur :* ${formatTime(nextCheckinTime)}${checklistText}\n\n👉 [Confirmer le ménage ici](${confirmLink})\n\n_Alfred Major 🎩_`;

      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: provider.telegram_chat_id,
          text,
          parse_mode: 'Markdown',
        }),
      });
    }

    return res.status(200).json({ success: true, jobId: job.id });

  } catch (error) {
    console.error('Erreur notify cleaning:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
        }
