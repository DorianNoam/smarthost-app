// pages/api/push-send.js
// Envoie une notification push à un hôte (Web Push + Expo Mobile)

import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Configuration VAPID (Pour le Web)
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

  // 1. Récupérer l'abonnement Web ET le token Expo Mobile de l'hôte
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('push_subscription, expo_push_token')
    .eq('id', userId)
    .single();

  if (error) {
    return res.status(504).json({ error: 'Erreur lors de la récupération du profil' });
  }

  const finalTitle = title || '🎩 Alfred Major — Urgence détectée';
  let webPushSuccess = false;
  let expoPushSuccess = false;

  // --- CANAL A : WEB PUSH (Navigateur / PWA) ---
  if (profile?.push_subscription) {
    const payload = JSON.stringify({
      title: finalTitle,
      body,
      url: url || '/dashboard',
      urgent: urgent || false,
      propertyName: propertyName || '',
      tag: urgent ? 'urgence' : 'info',
      icon: '/icons/icon-192x192.png',
    });

    try {
      await webpush.sendNotification(profile.push_subscription, payload);
      webPushSuccess = true;
    } catch (err) {
      console.error('Erreur envoi web push:', err);
      if (err.statusCode === 410) {
        await supabaseAdmin
          .from('profiles')
          .update({ push_subscription: null })
          .eq('id', userId);
      }
    }
  }

  // --- CANAL B : EXPO PUSH (Application Mobile Android / iOS) ---
  if (profile?.expo_push_token) {
    try {
      const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: profile.expo_push_token,
          sound: 'default',
          title: finalTitle,
          body: body,
          priority: urgent ? 'high' : 'normal',
          data: { url: url || '/dashboard', propertyName: propertyName || '' },
        }),
      });

      const expoData = await expoResponse.json();
      console.log('Retour API Expo:', expoData);
      expoPushSuccess = true;
    } catch (err) {
      console.error('Erreur envoi Expo push:', err);
    }
  }

  // Si aucun des deux canaux n'est configuré pour cet utilisateur
  if (!profile?.push_subscription && !profile?.expo_push_token) {
    return res.status(444).json({ error: 'Aucun canal de notification push actif trouvé' });
  }

  return res.status(200).json({ 
    success: true, 
    channels: { webPush: webPushSuccess, expoPush: expoPushSuccess } 
  });
}
