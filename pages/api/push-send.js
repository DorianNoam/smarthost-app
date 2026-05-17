// pages/api/push-send.js
// Envoie une notification push à un hôte (appelé depuis telegram-webhook ou chat)

import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Configuration VAPID (à générer une seule fois)
webpush.setVapidDetails(
  'mailto:contact@alfredmajor.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { userId, title, body, url, urgent, propertyName } = req.body;

  if (!userId || !body) {
    return res.status(400).json({ error: 'userId et body requis' });
  }

  // Récupérer l'abonnement push de l'hôte
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('push_subscription')
    .eq('id', userId)
    .single();

  if (error || !profile?.push_subscription) {
    return res.status(404).json({ error: 'Aucun abonnement push trouvé' });
  }

  const payload = JSON.stringify({
    title: title || '🎩 Alfred Major — Urgence détectée',
    body,
    url: url || '/dashboard',
    urgent: urgent || false,
    propertyName: propertyName || '',
    tag: urgent ? 'urgence' : 'info',
    icon: '/icons/icon-192x192.png',
  });

  try {
    await webpush.sendNotification(profile.push_subscription, payload);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Erreur envoi push:', err);

    // Si l'abonnement est expiré, on le supprime
    if (err.statusCode === 410) {
      await supabaseAdmin
        .from('profiles')
        .update({ push_subscription: null })
        .eq('id', userId);
    }

    return res.status(500).json({ error: 'Erreur envoi notification' });
  }
}
