import Groq from 'groq-sdk';
import { supabase } from '../../lib/supabase';

// ─────────────────────────────────────────────
// 0. TEXTES LOCALISÉS POUR LES ALERTES HÔTE
// ─────────────────────────────────────────────
function getAlertTexts(lang) {
  const texts = {
    fr: {
      header: '🚨 *ALERTE ALFRED MAJOR*',
      property: 'Logement',
      message: 'Message du client',
      translation: 'Traduction',
      action: 'Merci de contacter votre client dans les plus brefs délais pour gérer cette urgence.',
      regards: 'Cordialement,',
      signature: "L'équipe Alfred Major",
      pushTitle: '🚨 Alfred Major — Urgence détectée',
      translateTo: 'français',
    },
    it: {
      header: '🚨 *ALLERTA ALFRED MAJOR*',
      property: 'Alloggio',
      message: 'Messaggio del cliente',
      translation: 'Traduzione',
      action: 'Si prega di contattare il cliente il prima possibile per gestire questa emergenza.',
      regards: 'Cordiali saluti,',
      signature: 'Il team Alfred Major',
      pushTitle: '🚨 Alfred Major — Emergenza rilevata',
      translateTo: 'italiano',
    },
    en: {
      header: '🚨 *ALFRED MAJOR ALERT*',
      property: 'Property',
      message: 'Guest message',
      translation: 'Translation',
      action: 'Please contact your guest as soon as possible to handle this emergency.',
      regards: 'Kind regards,',
      signature: 'The Alfred Major team',
      pushTitle: '🚨 Alfred Major — Emergency detected',
      translateTo: 'English',
    },
    es: {
      header: '🚨 *ALERTA ALFRED MAJOR*',
      property: 'Alojamiento',
      message: 'Mensaje del cliente',
      translation: 'Traducción',
      action: 'Por favor contacte a su cliente lo antes posible para gestionar esta emergencia.',
      regards: 'Atentamente,',
      signature: 'El equipo Alfred Major',
      pushTitle: '🚨 Alfred Major — Emergencia detectada',
      translateTo: 'español',
    },
    de: {
      header: '🚨 *ALFRED MAJOR ALARM*',
      property: 'Unterkunft',
      message: 'Nachricht des Gastes',
      translation: 'Übersetzung',
      action: 'Bitte kontaktieren Sie Ihren Gast so schnell wie möglich.',
      regards: 'Mit freundlichen Grüßen,',
      signature: 'Das Alfred Major Team',
      pushTitle: '🚨 Alfred Major — Notfall erkannt',
      translateTo: 'Deutsch',
    },
    pt: {
      header: '🚨 *ALERTA ALFRED MAJOR*',
      property: 'Alojamento',
      message: 'Mensagem do cliente',
      translation: 'Tradução',
      action: 'Por favor contacte o seu cliente o mais rapidamente possível.',
      regards: 'Atenciosamente,',
      signature: 'A equipa Alfred Major',
      pushTitle: '🚨 Alfred Major — Emergência detectada',
      translateTo: 'português',
    },
    nl: {
      header: '🚨 *ALFRED MAJOR WAARSCHUWING*',
      property: 'Accommodatie',
      message: 'Bericht van gast',
      translation: 'Vertaling',
      action: 'Neem zo snel mogelijk contact op met uw gast.',
      regards: 'Met vriendelijke groet,',
      signature: 'Het Alfred Major team',
      pushTitle: '🚨 Alfred Major — Noodgeval gedetecteerd',
      translateTo: 'Nederlands',
    },
    ar: {
      header: '🚨 *تنبيه ألفريد ماجور*',
      property: 'العقار',
      message: 'رسالة الضيف',
      translation: 'ترجمة',
      action: 'يرجى التواصل مع ضيفك في أقرب وقت ممكن.',
      regards: 'مع التحية،',
      signature: 'فريق ألفريد ماجور',
      pushTitle: '🚨 ألفريد ماجور — تم الكشف عن حالة طوارئ',
      translateTo: 'العربية',
    },
  };
  return texts[lang] || texts['en'];
}

// ─────────────────────────────────────────────
// 1. RECHERCHE GOOGLE MAPS (rayon adaptatif)
// ─────────────────────────────────────────────
async function getGoogleLocalData(category, fullAddress, propertyType = 'apartment') {
  const apiKey = process.env.MAPS_API_KEY;
  if (!apiKey) return "";

  const typeMap = {
    transport: ["bus_stop", "transit_station", "train_station", "light_rail_station"],
    food: ["restaurant", "bakery", "cafe", "meal_takeaway"],
    shopping: ["supermarket", "grocery_store", "convenience_store", "store"],
    health: ["pharmacy", "hospital", "doctor"],
  };

  const radius = propertyType === 'gite' ? 5000.0 : 600.0;

  try {
    const geoRes = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`
    );
    const geoData = await geoRes.json();
    if (!geoData.results?.[0]) return "";
    const { lat, lng } = geoData.results[0].geometry.location;

    const placesRes = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.shortFormattedAddress,places.primaryType,places.rating',
      },
      body: JSON.stringify({
        includedTypes: typeMap[category] || ["point_of_interest"],
        locationRestriction: {
          circle: { center: { latitude: lat, longitude: lng }, radius },
        },
        languageCode: 'fr',
        maxResultCount: 8,
      }),
    });

    const data = await placesRes.json();
    if (data.error || !data.places?.length) return "";
    return data.places.map(p => {
      const type = p.primaryType ? ` [${p.primaryType}]` : '';
      const rating = p.rating ? ` ⭐${p.rating}` : '';
      const addr = p.shortFormattedAddress || '';
      return `- ${p.displayName.text}${type}${rating} | Adresse : ${addr}`;
    }).join('\n');
  } catch (e) {
    return "";
  }
}

// ─────────────────────────────────────────────
// 2. ALERTES TELEGRAM — multi-destinataires + langue de l'hôte
// ─────────────────────────────────────────────
async function sendTelegramAlert(originalMsg, translatedMsg, propertyData) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  const { data: profile } = await supabase
    .from('profiles')
    .select('telegram_chat_id, preferred_language')
    .eq('id', propertyData.owner_id)
    .single();

  const { data: teamMembers } = await supabase
    .from('team_members')
    .select('telegram_chat_id, role, property_ids, preferred_language')
    .eq('account_owner_id', propertyData.owner_id)
    .eq('status', 'active')
    .not('telegram_chat_id', 'is', null);

  if (!profile?.telegram_chat_id && (!teamMembers || teamMembers.length === 0)) return;

  const sendToRecipient = async (chatId, lang) => {
    const t = getAlertTexts(lang || 'fr');
    let text = `${t.header}\n\n🏠 *${t.property} :* ${propertyData.name}`;
    if (propertyData.room_name) text += ` — ${propertyData.room_name}`;
    text += `\n\n💬 *${t.message} :*\n"${originalMsg}"`;
    if (translatedMsg) text += `\n\n🔄 *${t.translation} :*\n"${translatedMsg}"`;
    text += `\n\n⚡ *Action :*\n${t.action}\n\n_${t.regards}_\n_${t.signature}_ 🎩`;

    return fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
    }).catch(e => console.error(`Erreur Telegram ${chatId}:`, e));
  };

  const sendPromises = [];

  if (profile?.telegram_chat_id) {
    sendPromises.push(sendToRecipient(profile.telegram_chat_id, profile.preferred_language));
  }

  if (teamMembers) {
    for (const member of teamMembers) {
      const hasAccess = !member.property_ids || member.property_ids.includes(propertyData.id);
      if (hasAccess && member.telegram_chat_id) {
        sendPromises.push(sendToRecipient(member.telegram_chat_id, member.preferred_language));
      }
    }
  }

  await Promise.allSettled(sendPromises);
}

// ─────────────────────────────────────────────
// 2B. ALERTES PUSH — multi-destinataires + langue de l'hôte
// ─────────────────────────────────────────────
async function sendPushAlert(originalMsg, translatedMsg, propertyData, targetPropertyId) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.alfredmajor.com';

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, push_subscription, expo_push_token, preferred_language')
      .eq('id', propertyData.owner_id)
      .single();

    const { data: teamMembers } = await supabase
      .from('team_members')
      .select('expo_push_token, property_ids, preferred_language')
      .eq('account_owner_id', propertyData.owner_id)
      .eq('status', 'active')
      .not('expo_push_token', 'is', null);

    const bodyText = translatedMsg
      ? `${propertyData.name} : "${translatedMsg}"`
      : `${propertyData.name} : "${originalMsg}"`;

    const promises = [];

    if (profile) {
      const t = getAlertTexts(profile.preferred_language || 'fr');

      if (profile.push_subscription) {
        promises.push(
          fetch(`${siteUrl}/api/push-send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: profile.id,
              title: t.pushTitle,
              body: bodyText,
              url: '/dashboard',
              urgent: true,
              propertyName: propertyData.name,
              lang: profile.preferred_language || 'fr',
            }),
          })
        );
      }

      if (profile.expo_push_token) {
        promises.push(
          fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Accept-encoding': 'gzip, deflate', 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: profile.expo_push_token,
              sound: 'default',
              title: t.pushTitle,
              body: bodyText,
              priority: 'high',
              data: { url: '/dashboard', propertyId: targetPropertyId, propertyName: propertyData.name },
            }),
          })
        );
      }
    }

    if (teamMembers) {
      for (const member of teamMembers) {
        const hasAccess = !member.property_ids || member.property_ids.includes(propertyData.id);
        if (hasAccess && member.expo_push_token) {
          const t = getAlertTexts(member.preferred_language || 'fr');
          promises.push(
            fetch('https://exp.host/--/api/v2/push/send', {
              method: 'POST',
              headers: { 'Accept': 'application/json', 'Accept-encoding': 'gzip, deflate', 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: member.expo_push_token,
                sound: 'default',
                title: t.pushTitle,
                body: bodyText,
                priority: 'high',
                data: { url: '/dashboard', propertyId: targetPropertyId, propertyName: propertyData.name },
              }),
            })
          );
        }
      }
    }

    if (promises.length > 0) await Promise.allSettled(promises);

  } catch (e) {
    console.error("Erreur push:", e);
  }
}

// ─────────────────────────────────────────────
// 3. DÉTECTION D'INTENTION LOCALE
// ─────────────────────────────────────────────
function detectLocalCategory(msg) {
  const m = msg.toLowerCase();
  if (['bus', 'tram', 'tramway', 'transport', 'aller', 'gare', 'train', 'commun', 'navette', 'métro', 'metro', 'taxi', 'uber', 'arrêt'].some(k => m.includes(k))) return 'transport';
  if (['manger', 'resto', 'restaurant', 'faim', 'dîner', 'déjeuner', 'café', 'boulangerie', 'pizza', 'sushi', 'bar', 'bistrot', 'adresse'].some(k => m.includes(k))) return 'food';
  if (['course', 'supermarché', 'supermarche', 'magasin', 'achat', 'épicerie', 'epicerie', 'provisions', 'shopping', 'commerce'].some(k => m.includes(k))) return 'shopping';
  if (['pharmacie', 'médecin', 'docteur', 'hôpital', 'hopital', 'santé', 'sante', 'urgence médicale'].some(k => m.includes(k))) return 'health';
  return null;
}

// ─────────────────────────────────────────────
// 3B. DÉTECTION D'INTENTION UPSELL
// ─────────────────────────────────────────────
function detectUpsellIntent(msg) {
  const m = msg.toLowerCase();

  if (['partir plus tard', 'départ tardif', 'check-out tardif', 'late check',
       'rester plus longtemps', 'prolonger', 'midi', 'après 11', 'apres 11',
       'quitter plus tard', 'sortir plus tard'].some(k => m.includes(k))) return 'late_checkout';

  if (['arriver tôt', 'arriver tot', 'arriver plus tôt', 'arriver plus tot',
       'early check', 'check-in tôt', 'avant 15', 'avant 14', 'avant 13',
       'tôt le matin', 'tot le matin', 'entrée anticipée'].some(k => m.includes(k))) return 'early_checkin';

  if (['anniversaire', 'romantique', 'surprise', 'champagne', 'bouteille',
       'bouquet', 'fleurs', 'saint-valentin', 'lune de miel', 'honeymoon',
       'fête', 'célébration', 'celebration', 'mariage', 'pétales'].some(k => m.includes(k))) return 'romantic';

  if (['ménage pendant', 'nettoyage pendant', 'femme de ménage', 'nettoyage mi',
       'ménage supplémentaire', 'chambre propre', 'draps changés',
       'linge changé', 'repassage', 'aspirateur'].some(k => m.includes(k))) return 'mid_stay_cleaning';

  if (['navette', 'transfer', 'aéroport', 'airport', 'gare', 'taxi privé',
       'voiture avec chauffeur', 'vtc', 'aller chercher'].some(k => m.includes(k))) return 'transfer';

  if (['lit bébé', 'lit parapluie', 'chaise haute', 'baby', 'bébé',
       'nourrisson', 'poussette', 'équipement enfant'].some(k => m.includes(k))) return 'baby';

  return null;
}

function findMatchingUpsells(upsells, intent) {
  if (!upsells || upsells.length === 0) return [];

  const intentKeywords = {
    late_checkout:      ['late', 'tardif', 'départ', 'checkout', 'check-out', 'tard'],
    early_checkin:      ['early', 'tôt', 'anticipé', 'checkin', 'check-in', 'arrivée'],
    romantic:           ['romantique', 'anniversaire', 'champagne', 'surprise', 'célébration'],
    mid_stay_cleaning:  ['ménage', 'nettoyage', 'mid', 'séjour', 'linge'],
    transfer:           ['transfert', 'navette', 'aéroport', 'airport', 'taxi'],
    baby:               ['bébé', 'baby', 'lit', 'chaise'],
  };

  const keywords = intentKeywords[intent] || [];
  return upsells.filter(u => {
    const nameLower = u.name.toLowerCase();
    const descLower = (u.description || '').toLowerCase();
    return keywords.some(k => nameLower.includes(k) || descLower.includes(k));
  });
}

function buildUpsellsSection(upsells, siteUrl, propertySlug) {
  if (!upsells || upsells.length === 0) return '';

  const upsellsUrl = `${siteUrl}/upsells/${propertySlug}`;
  const lines = upsells.map(u =>
    `- ${u.emoji || '✨'} **${u.name}** — ${u.price}€${u.description ? ` (${u.description})` : ''} → Lien : ${upsellsUrl}?upsell=${u.id}`
  ).join('\n');

  return `━━━ SERVICES ADDITIONNELS DISPONIBLES ━━━
Les services suivants sont proposés par l'hôte. Si le voyageur exprime un besoin correspondant, propose-le naturellement dans ta réponse avec le lien de paiement.
RÈGLE ABSOLUE : Ne propose JAMAIS un service qui n'est pas dans cette liste. Si le service n'est pas listé, réponds normalement sans mentionner de paiement.

${lines}

Page complète des services : ${upsellsUrl}`;
}

// ─────────────────────────────────────────────
// 3C. DÉTECTION DE LA POSITION DU VOYAGEUR
// ─────────────────────────────────────────────
function detectGuestLocation(msg) {
  if (!msg) return null;
  const m = msg.toLowerCase();

  const hasPositionVerb = /(je suis|nous sommes|on est|on se trouve|je me trouve|nous nous trouvons|depuis|à partir de|en partant de|je pars de|on part de|nous partons de|i'?m at|i am at|we'?re at|we are at|we'?re in|i'?m in|from |starting from|leaving from|estoy en|estamos en|desde |sono a|siamo a|da |partendo da|ich bin in|wir sind in|von |ab )/i.test(m);
  if (!hasPositionVerb) return null;

  const placeKeywords = [
    'rue', 'avenue', 'boulevard', 'bd', 'place', 'square', 'street', 'st.', 'st ', 'road', 'rd ', 'plaza',
    'calle', 'via', 'piazza', 'straße', 'strasse', 'platz', 'allée', 'allee', 'chemin',
    'impasse', 'quai', 'cours', 'route', 'gare', 'station', 'aéroport', 'airport',
    'métro', 'metro', 'arrêt', 'arret', 'devant le', 'devant la', 'devant l',
    'parc', 'park', 'jardin', 'church', 'église', 'eglise', 'hotel', 'hôtel',
    'mairie', 'cathédrale', 'cathedral', 'museum', 'musée', 'musee',
    'tour ', 'tower', 'palais', 'palace', 'pont ', 'bridge'
  ];
  const hasPlaceKeyword = placeKeywords.some(k => m.includes(k));
  const hasStreetNumber = /\b\d{1,4}\s+(?:rue|avenue|boulevard|bd|place|calle|via|street|road)\b/i.test(m);

  if (!hasPlaceKeyword && !hasStreetNumber) return null;

  const patterns = [
    /(?:je suis|nous sommes|on est|on se trouve|je me trouve|nous nous trouvons)\s+(?:à|au|aux|devant|près de|proche de|en face de|sur|dans|chez|vers)\s+(?:le |la |les |l'|du |de la |des )?(.+?)(?:[.,?!\n]|$)/i,
    /(?:depuis|à partir de|en partant de)\s+(?:le |la |les |l'|du |de la |des )?(.+?)(?:[.,?!\n]|$)/i,
    /(?:on part|nous partons|je pars)\s+(?:de|du|de la|des|de l')\s+(.+?)(?:[.,?!\n]|$)/i,
    /(?:i'?m|i am|we'?re|we are)\s+(?:at|in|near|in front of|by|on)\s+(.+?)(?:[.,?!\n]|$)/i,
    /(?:from|starting from|leaving from)\s+(.+?)(?:[.,?!\n]|$)/i,
    /(?:estoy|estamos)\s+(?:en|delante de|cerca de|frente a)\s+(.+?)(?:[.,?!\n]|$)/i,
    /(?:desde)\s+(.+?)(?:[.,?!\n]|$)/i,
    /(?:sono|siamo)\s+(?:a|in|davanti a|vicino a|presso)\s+(.+?)(?:[.,?!\n]|$)/i,
    /(?:da|partendo da)\s+(.+?)(?:[.,?!\n]|$)/i,
    /(?:ich bin|wir sind)\s+(?:in|am|an der|vor|bei|nahe)\s+(.+?)(?:[.,?!\n]|$)/i,
    /(?:von|ab)\s+(.+?)(?:[.,?!\n]|$)/i,
  ];

  for (const pattern of patterns) {
    const match = msg.match(pattern);
    if (match && match[1]) {
      const extracted = match[1].trim().replace(/[.,?!]+$/, '').trim();
      if (extracted.length >= 4 && extracted.length <= 150) {
        const extractedLower = extracted.toLowerCase();
        const isPlace = placeKeywords.some(k => extractedLower.includes(k)) || /\d/.test(extracted);
        if (isPlace) return extracted;
      }
    }
  }

  return null;
}

// ─────────────────────────────────────────────
// 3D. CALCUL DE DISTANCE À PIED VERS LE LOGEMENT
// ─────────────────────────────────────────────
async function getWalkingDistance(originText, destinationAddress, city, langCode = 'fr') {
  const apiKey = process.env.MAPS_API_KEY;
  if (!apiKey || !originText || !destinationAddress) return null;

  const biasedOrigin = city && !originText.toLowerCase().includes(city.toLowerCase())
    ? `${originText}, ${city}`
    : originText;

  try {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?` +
      `origins=${encodeURIComponent(biasedOrigin)}` +
      `&destinations=${encodeURIComponent(destinationAddress)}` +
      `&mode=walking` +
      `&language=${langCode}` +
      `&key=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'OK' || !data.rows?.[0]?.elements?.[0]) return null;
    const element = data.rows[0].elements[0];
    if (element.status !== 'OK') return null;

    const distanceMeters = element.distance.value;
    const durationSeconds = element.duration.value;

    let modeAdvice;
    if (distanceMeters <= 1500) {
      modeAdvice = 'walk_only';
    } else if (distanceMeters <= 3000) {
      modeAdvice = 'walk_or_transit';
    } else {
      modeAdvice = 'transit_or_taxi';
    }

    const directionsUrl = `https://www.google.com/maps/dir/?api=1` +
      `&origin=${encodeURIComponent(biasedOrigin)}` +
      `&destination=${encodeURIComponent(destinationAddress)}` +
      `&travelmode=walking`;

    return {
      origin: biasedOrigin,
      distanceMeters,
      durationSeconds,
      distanceText: element.distance.text,
      durationText: element.duration.text,
      modeAdvice,
      directionsUrl,
    };
  } catch (e) {
    console.error('Distance Matrix error:', e);
    return null;
  }
}

function buildWalkingSection(walkingInfo) {
  if (!walkingInfo) return '';

  let advice;
  switch (walkingInfo.modeAdvice) {
    case 'walk_only':
      advice = `RECOMMANDATION OBLIGATOIRE : La distance est courte (${walkingInfo.distanceText}). Recommande UNIQUEMENT la marche à pied. NE SUGGÈRE JAMAIS métro, bus, taxi ou VTC pour cette distance — ce serait absurde et nuirait à la crédibilité.`;
      break;
    case 'walk_or_transit':
      advice = `RECOMMANDATION : Distance modérée (${walkingInfo.distanceText}). La marche reste agréable, tu peux mentionner les transports en commun en option si le voyageur semble pressé ou fatigué.`;
      break;
    default:
      advice = `RECOMMANDATION : Distance importante (${walkingInfo.distanceText}). Suggère les transports en commun, un taxi ou un VTC. La marche est possible mais longue.`;
  }

  return `━━━ POSITION ACTUELLE DU VOYAGEUR — DONNÉES FACTUELLES ━━━
Le voyageur a indiqué se trouver à : ${walkingInfo.origin}
Distance jusqu'au logement : ${walkingInfo.distanceText} (${walkingInfo.distanceMeters} m exactement)
Temps à pied : ${walkingInfo.durationText}
Lien itinéraire Google Maps : ${walkingInfo.directionsUrl}

${advice}

RÈGLE ABSOLUE : Utilise EXACTEMENT ces données. N'invente JAMAIS une distance ou un temps de trajet. Ne dis pas "environ 10-15 minutes" si la donnée dit ${walkingInfo.durationText}. Donne la valeur exacte. Si le voyageur demande un lien, une carte, un itinéraire ou des directions précises, fournis le lien Google Maps ci-dessus tel quel (formate-le en markdown : [Itinéraire à pied](${walkingInfo.directionsUrl})).`;
}

// ─────────────────────────────────────────────
// 4. DÉTECTION D'URGENCE
// ─────────────────────────────────────────────
function isEmergency(msg) {
  const m = msg.toLowerCase();
  return ['fuite', 'leak', 'inondation', 'flood', 'feu', 'fire', 'incendie',
    'panne', 'coupure', 'électricité', 'electricity', 'blessé', 'injured',
    'accident', 'urgence', 'emergency', 'danger', 'cassé', 'ne fonctionne pas',
    'not working', 'bloqué', 'locked out', 'gaz', 'gas', 'odeur', 'smell',
    'fumée', 'smoke', 'porte bloquée', 'porte fermée'].some(k => m.includes(k));
}

// ─────────────────────────────────────────────
// 5. CONSTRUCTION DES BLOCS CONDITIONNELS DU PROMPT
// ─────────────────────────────────────────────
function buildConditionalBlocks(p) {
  const blocks = [];
  const type = p.property_type || 'apartment';

  if (['riad', 'bnb', 'private_room'].includes(type) && (p.room_name || p.room_bed_config)) {
    blocks.push(`━━━ CHAMBRE DU VOYAGEUR ━━━
- Nom : ${p.room_name || 'Non renseigné'}
- Étage / Localisation : ${p.room_floor || 'Non renseigné'}
- Configuration : ${p.room_bed_config || 'Non renseigné'}
- Vue : ${p.room_view || 'Non renseigné'}`);
  }

  if (['riad', 'bnb'].includes(type)) {
    blocks.push(`━━━ RÉCEPTION & ÉQUIPE ━━━
- Réception sur place : ${p.has_reception ? 'Oui' : 'Non'}
${p.has_reception ? `- Horaires : ${p.reception_hours || 'Non renseigné'}` : ''}
- Arrivée hors horaires : ${p.late_checkin_procedure || "Appeler l'hôte"}
- Responsable : ${p.staff_name || 'Non renseigné'}
- Langues parlées : ${p.staff_languages || 'Non renseigné'}`);
  }

  if (['riad', 'bnb', 'private_room'].includes(type) && (p.breakfast_included || p.breakfast_hours)) {
    blocks.push(`━━━ PETIT-DÉJEUNER ━━━
- Inclus : ${p.breakfast_included ? 'Oui' : 'Non'}
- Horaires : ${p.breakfast_hours || 'Non renseigné'}
- Lieu : ${p.breakfast_location || 'Non renseigné'}
- Composition : ${p.breakfast_details || 'Non renseigné'}
- Réservation veille requise : ${p.breakfast_reservation_required ? 'Oui' : 'Non'}
- Allergies / régimes : ${p.breakfast_dietary_info || 'Sur demande'}
- En chambre : ${p.breakfast_in_room || 'Non disponible'}`);
  }

  if (['riad', 'bnb'].includes(type) && p.dinner_available) {
    blocks.push(`━━━ RESTAURATION SUR PLACE ━━━
- Table d'hôtes : ${p.dinner_available ? 'Oui' : 'Non'}
- Détails dîner : ${p.dinner_details || 'Non renseigné'}
- Room service : ${p.room_service_available ? 'Oui' : 'Non'}
- Alcool disponible : ${p.alcohol_available ? 'Oui' : 'Non'}
- Options spéciales : ${p.dietary_options || 'Non renseigné'}`);
  }

  if (['riad', 'bnb'].includes(type) && p.housekeeping_frequency) {
    blocks.push(`━━━ SERVICES INCLUS ━━━
- Ménage : ${p.housekeeping_frequency || 'Non renseigné'} ${p.housekeeping_time ? `(${p.housekeeping_time})` : ''}
- Serviettes : ${p.towel_change_frequency || 'Non renseigné'}
- Draps : ${p.linen_change_frequency || 'Non renseigné'}
- Blanchisserie : ${p.laundry_service || 'Non disponible'}
- Repassage : ${p.ironing_service || 'Non disponible'}`);
  }

  const commonSpaces = [p.pool_info, p.hammam_info, p.spa_info, p.rooftop_info, p.patio_info, p.common_lounge_info].filter(Boolean);
  if (['riad', 'bnb', 'gite'].includes(type) && commonSpaces.length > 0) {
    let block = `━━━ ESPACES COMMUNS ━━━`;
    if (p.pool_info)          block += `\n- Piscine : ${p.pool_info}`;
    if (p.hammam_info)        block += `\n- Hammam : ${p.hammam_info}`;
    if (p.spa_info)           block += `\n- Spa / Massages : ${p.spa_info}`;
    if (p.rooftop_info)       block += `\n- Terrasse / Rooftop : ${p.rooftop_info}`;
    if (p.patio_info)         block += `\n- Patio / Jardin intérieur : ${p.patio_info}`;
    if (p.common_lounge_info) block += `\n- Salon commun : ${p.common_lounge_info}`;
    if (p.jacuzzi_info)       block += `\n- Jacuzzi : ${p.jacuzzi_info}`;
    if (p.gym_info)           block += `\n- Salle de sport : ${p.gym_info}`;
    if (p.outdoor_games)      block += `\n- Jeux extérieurs : ${p.outdoor_games}`;
    if (p.common_areas_rules) block += `\n- Règles espaces communs : ${p.common_areas_rules}`;
    blocks.push(block);
  }

  const extras = [p.airport_transfer, p.trusted_taxi, p.bike_rental, p.excursions_info].filter(Boolean);
  if (['riad', 'bnb', 'gite'].includes(type) && extras.length > 0) {
    let block = `━━━ SERVICES ADDITIONNELS ━━━`;
    if (p.airport_transfer)  block += `\n- Transfert aéroport/gare : ${p.airport_transfer}`;
    if (p.trusted_taxi)      block += `\n- Taxi de confiance : ${p.trusted_taxi}`;
    if (p.bike_rental)       block += `\n- Location vélos / scooters : ${p.bike_rental}`;
    if (p.bikes_info)        block += `\n- Vélos mis à disposition : ${p.bikes_info}`;
    if (p.excursions_info)   block += `\n- Excursions : ${p.excursions_info}`;
    if (p.local_guide_info)  block += `\n- Guide local : ${p.local_guide_info}`;
    if (p.safe_info)         block += `\n- Coffre-fort : ${p.safe_info}`;
    if (p.external_laundry)  block += `\n- Blanchisserie externe : ${p.external_laundry}`;
    blocks.push(block);
  }

  if (type === 'private_room') {
    blocks.push(`━━━ COHABITATION ━━━
- Hôte présent : ${p.host_on_site ? 'Oui' : 'Non'}
${p.host_on_site ? `- Hôte sur place : ${p.host_name_onsite || 'Non renseigné'} — ${p.host_contact_onsite || 'Non renseigné'} — Disponible : ${p.host_availability_hours || 'Non renseigné'}` : ''}
- Espaces partagés : ${p.shared_spaces || 'Non renseigné'}
- Règles espaces partagés : ${p.shared_spaces_rules || 'Non renseigné'}
- Cuisine partagée : ${p.shared_kitchen_rules || 'Non renseigné'}
- Salle de bain : ${p.bathroom_type || 'Non renseigné'}
- Serviettes : ${p.towels_provided || 'Non renseigné'}
- Invités extérieurs : ${p.guests_policy || 'Non renseigné'}
- Autres voyageurs simultanés : ${p.other_guests_info || 'Non renseigné'}`);
  }

  if (type === 'gite') {
    let block = `━━━ SPÉCIFICITÉS DU GÎTE ━━━`;
    if (p.gate_code)                  block += `\n- Code / télécommande portail : ${p.gate_code}`;
    if (p.bbq_info)                   block += `\n- Barbecue : ${p.bbq_info}`;
    if (p.garden_info)                block += `\n- Jardin / Terrain : ${p.garden_info}`;
    if (p.septic_tank_rules)          block += `\n- Fosse septique (IMPORTANT) : ${p.septic_tank_rules}`;
    if (p.shutters_info)              block += `\n- Volets : ${p.shutters_info}`;
    if (p.nearest_bakery)             block += `\n- Boulangerie : ${p.nearest_bakery}`;
    if (p.nearest_supermarket)        block += `\n- Supermarché : ${p.nearest_supermarket}`;
    if (p.nearest_gas_station)        block += `\n- Station-service : ${p.nearest_gas_station}`;
    if (p.local_market_info)          block += `\n- Marché local : ${p.local_market_info}`;
    if (p.nature_activities)          block += `\n- Activités nature : ${p.nature_activities}`;
    if (p.hiking_info)                block += `\n- Randonnées : ${p.hiking_info}`;
    if (p.fire_rules)                 block += `\n- Règles feux : ${p.fire_rules}`;
    if (p.neighbor_emergency_contact) block += `\n- Voisin de confiance : ${p.neighbor_emergency_contact}`;
    blocks.push(block);
  }

  if (type === 'riad') {
    let block = `━━━ MÉDINA & CONTEXTE LOCAL ━━━`;
    if (p.medina_directions)        block += `\n- Comment trouver le riad : ${p.medina_directions}`;
    if (p.taxi_meeting_point)       block += `\n- Point de RDV taxis : ${p.taxi_meeting_point}`;
    if (p.dress_code_info)          block += `\n- Tenue recommandée : ${p.dress_code_info}`;
    if (p.souk_hours)               block += `\n- Horaires souks : ${p.souk_hours}`;
    if (p.mosque_info)              block += `\n- Mosquée voisine : ${p.mosque_info}`;
    if (p.safety_tips)              block += `\n- Conseils sécurité : ${p.safety_tips}`;
    if (p.generator_info)           block += `\n- Générateur : ${p.generator_info}`;
    if (p.water_reserve_info)       block += `\n- Réserve eau : ${p.water_reserve_info}`;
    if (p.local_emergency_contacts) block += `\n- Urgences locales : ${p.local_emergency_contacts}`;
    if (p.pharmacy_on_call)         block += `\n- Pharmacie de garde : ${p.pharmacy_on_call}`;
    blocks.push(block);
  }

  return blocks.join('\n\n');
}

// ─────────────────────────────────────────────
// 6. INSTRUCTIONS URGENCE SELON LE TYPE
// ─────────────────────────────────────────────
function buildEmergencyInstructions(propertyType, hasReception) {
  if (['riad', 'bnb'].includes(propertyType) && hasReception) {
    return `   c) Mentionne que la réception a également été prévenue.
   d) Termine OBLIGATOIREMENT et EXACTEMENT par : "Je préviens immédiatement votre hôte."`;
  }
  return `   c) Termine OBLIGATOIREMENT et EXACTEMENT par : "Je préviens immédiatement votre hôte."`;
}

// ─────────────────────────────────────────────
// 7. VOCABULAIRE ADAPTÉ AU TYPE
// ─────────────────────────────────────────────
function buildTypePersonality(propertyType, propertyName, city) {
  switch (propertyType) {
    case 'riad':
      return `Tu es Alfred, le majordome personnel du "${propertyName}" à ${city}.
Tu gères un riad / une maison d'hôtes. Utilise le vocabulaire approprié : "votre chambre", "notre établissement", "la réception", "le patio", "nos équipes sur place". Ne dis jamais "votre appartement" ou "votre logement".`;
    case 'bnb':
      return `Tu es Alfred, le majordome personnel de "${propertyName}" à ${city}.
Tu gères une chambre d'hôtes / B&B. Vocabulaire : "votre chambre", "notre maison", "votre hôte", "la salle du petit-déjeuner". Chaleureux et familial.`;
    case 'private_room':
      return `Tu es Alfred, le majordome personnel de "${propertyName}" à ${city}.
Tu gères une chambre privée dans un logement partagé. Vocabulaire : "votre chambre", "les espaces partagés", "votre hôte". Respectueux des règles de cohabitation.`;
    case 'gite':
      return `Tu es Alfred, le majordome personnel de "${propertyName}" à ${city}.
Tu gères un gîte / une villa. Vocabulaire : "votre gîte", "la propriété", "le terrain". Si le voyageur demande des commerces ou restaurants, précise les distances car la zone peut être rurale.`;
    default:
      return `Tu es Alfred, le majordome personnel de "${propertyName}" à ${city}.`;
  }
}

// ─────────────────────────────────────────────
// RATE LIMITING
// ─────────────────────────────────────────────
const rateLimitMap = new Map();
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW = 60000;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, start: now });
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX) return true;
  rateLimitMap.set(ip, { count: entry.count + 1, start: entry.start });
  return false;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitMap.entries()) {
    if (now - val.start > RATE_LIMIT_WINDOW * 2) rateLimitMap.delete(key);
  }
}, 300000);

// ─────────────────────────────────────────────
// HANDLER PRINCIPAL
// ─────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Méthode non autorisée');

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ answer: "Trop de messages. Merci de patienter quelques instants." });
  }

  const { messagesHistory, propertyId, userLanguage } = req.body;

  if (!messagesHistory || !Array.isArray(messagesHistory) || !propertyId) {
    return res.status(400).json({ answer: "Données manquantes." });
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(propertyId)) {
    return res.status(400).json({ answer: "Identifiant invalide." });
  }

  if (messagesHistory.length > 50) {
    return res.status(400).json({ answer: "Historique trop long." });
  }

  const lastUserMsg = messagesHistory[messagesHistory.length - 1]?.text || "";
  if (lastUserMsg.length > 2000) {
    return res.status(400).json({ answer: "Message trop long." });
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const langCode = userLanguage ? userLanguage.split('-')[0] : 'fr';

  try {
    const { data: propertyData, error: propError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .eq('is_active', true)
      .single();

    if (propError || !propertyData) {
      return res.status(404).json({ answer: "Logement introuvable ou inactif." });
    }

    const { data: ownerProfile } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', propertyData.owner_id)
      .single();

    if (ownerProfile && (ownerProfile.subscription_status === 'paused' || ownerProfile.subscription_status === 'cancelled')) {
      return res.status(200).json({
        answer: "Le service de conciergerie est momentanément indisponible. Merci de contacter directement votre hôte."
      });
    }

    const targetPropertyId = propertyData.id;
    const city = propertyData.city || '';
    const fullAddress = `${propertyData.street_number || ''} ${propertyData.address || ''}, ${city}`.trim();
    const propertyType = propertyData.property_type || 'apartment';

    const { data: activeUpsells } = await supabase
      .from('upsells')
      .select('id, name, description, emoji, price, category')
      .eq('property_id', targetPropertyId)
      .eq('is_active', true)
      .order('category');

    const { data: kb } = await supabase
      .from('knowledge_base')
      .select('category, content')
      .eq('property_id', targetPropertyId);
    const formattedKB = kb?.map(item => `[${item.category}] : ${item.content}`).join('\n') || "";

    const hostLocalInfo = [
      propertyData.transport_info,
      propertyData.local_shops,
      propertyData.recommendations,
      propertyData.pharmacy_info,
    ].filter(Boolean).join('\n');

    const localCategory = detectLocalCategory(lastUserMsg);
    let googleData = "";
    if (localCategory) {
      googleData = await getGoogleLocalData(localCategory, fullAddress, propertyType);
    }

    // ── Détection position voyageur : message courant OU récent (3 messages en arrière)
    let guestOrigin = detectGuestLocation(lastUserMsg);
    if (!guestOrigin) {
      // Suivi de conversation : "le lien", "c'est loin ?", "combien de temps"
      const followUpPattern = /(lien|itinéraire|itineraire|chemin|route|direction|link|map|carte|loin|combien|distance|temps|minute|à pied|a pied|walk|walking|maps)/i;
      if (followUpPattern.test(lastUserMsg)) {
        const userMessages = messagesHistory
          .filter(m => m.role !== 'alfred' && m.role !== 'marc' && m.role !== 'assistant')
          .slice(-4, -1)
          .reverse();
        for (const prev of userMessages) {
          const found = detectGuestLocation(prev.text || '');
          if (found) { guestOrigin = found; break; }
        }
      }
    }
    let walkingInfo = null;
    if (guestOrigin && fullAddress) {
      walkingInfo = await getWalkingDistance(guestOrigin, fullAddress, city, langCode);
    }
    const walkingSection = buildWalkingSection(walkingInfo);

    const upsellIntent = detectUpsellIntent(lastUserMsg);
    const matchingUpsells = upsellIntent
      ? findMatchingUpsells(activeUpsells, upsellIntent)
      : [];
    const upsellsToShow = matchingUpsells.length > 0 ? matchingUpsells : [];
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.alfredmajor.com';
    const propertySlug = propertyData.slug || propertyData.id;
    const upsellsSection = buildUpsellsSection(upsellsToShow, siteUrl, propertySlug);

    const localSection = hostLocalInfo
      ? `${hostLocalInfo}${googleData ? `\n\nComplément Google Maps :\n${googleData}` : ''}`
      : googleData || "";

    const conditionalBlocks = buildConditionalBlocks(propertyData);
    const emergencyInstructions = buildEmergencyInstructions(propertyType, propertyData.has_reception);

    const systemPrompt = `${buildTypePersonality(propertyType, propertyData.name, city)}

IDENTITÉ — RÈGLE ABSOLUE :
- Tu es un majordome humain, professionnel et polyglotte. Tu n'es PAS une IA.
- Si on te demande si tu es une IA, réponds que tu es Alfred, le concierge personnel du logement.
- Ne mentionne jamais Groq, LLaMA, Claude, GPT ou tout autre modèle d'IA.
- Ne cite JAMAIS tes sources internes. Réponds comme si tu connaissais tout de mémoire.

LANGUE :
- Réponds TOUJOURS dans la langue du voyageur, sans exception.

STYLE — RÈGLES DE COMMUNICATION :
- Ton chaleureux et raffiné, comme un majordome d'hôtel 5 étoiles : élégant sans être pompeux, attentionné sans être obséquieux.
- Personnalise tes réponses : utilise "votre chambre", "votre séjour", "à deux pas de chez vous" plutôt que des formulations neutres.
- Évite les phrases robotiques. Préfère "Le quartier regorge de bonnes adresses" ou "Vous avez de très belles tables à proximité immédiate".

POUR LES RECOMMANDATIONS (restaurants, bars, sorties, commerces, transports) :
${['riad', 'bnb'].includes(propertyType) && propertyData.dinner_available ? `- Si le voyageur demande un restaurant pour le soir, mentionne D'ABORD la table d'hôtes sur place avant de suggérer l'extérieur.\n` : ''}- NE JAMAIS faire de liste sèche séparée par des virgules.
- Présente 3 à 5 lieux maximum sous forme de petites recommandations distinctes.
- UN lieu par bloc, avec une LIGNE VIDE entre chaque recommandation pour aérer.
- Pour chaque lieu, utilise EXACTEMENT ce format sur deux lignes :
  [emoji] **[Nom du lieu]** — [Courte description : ambiance, type, distance]
  📍 [Adresse complète du lieu]
- IMPORTANT : Le nom du lieu doit toujours être entouré de DOUBLE astérisques **comme ceci**.
- IMPORTANT : L'adresse doit toujours être précédée d'un emoji 📍 sur sa propre ligne.
- Si une adresse n'est PAS disponible dans tes données, NE METS PAS la ligne 📍. Ne JAMAIS inventer d'adresse.
- Termine si pertinent par une touche personnalisée.
${propertyType === 'gite' ? '- Pour les commerces, précise toujours la distance approximative car le logement est en zone rurale.\n' : ''}
POUR LES QUESTIONS TECHNIQUES (wifi, code, parking, check-in) :
- Reste CONCIS : 2-3 phrases maximum, droit au but.
- Ton chaleureux mais efficace.

POUR UNE SALUTATION SIMPLE ("bonjour", "hi", "hello") :
- Réponds poliment et demande comment aider. RIEN DE PLUS.

FORMAT GÉNÉRAL :
- N'utilise PAS de titres markdown avec #.
- Reste fluide et conversationnel.
- Seuls éléments de mise en forme autorisés : emojis, gras avec **texte**, retours à la ligne, et liens markdown [texte](url) UNIQUEMENT pour les itinéraires Google Maps fournis dans la section POSITION ACTUELLE DU VOYAGEUR.

━━━ INFORMATIONS DU LOGEMENT ━━━
(Ces informations sont CONFIDENTIELLES. Voir RÈGLE 1 ci-dessous pour les conditions de divulgation.)

Localisation :
- Adresse : ${propertyData.street_number || ""} ${propertyData.address || ""}
- Ville : ${city}
- Bâtiment / Étage : ${[propertyData.building, propertyData.floor ? `Étage ${propertyData.floor}` : '', propertyData.address_complement].filter(Boolean).join(', ') || "Non renseigné"}

Arrivée & Départ :
- Check-in : dès ${propertyData.check_in_hour || "15:00"}
- Check-out : avant ${propertyData.check_out_hour || "11:00"}
- Arrivée autonome : ${propertyData.self_checkin ? "Oui" : "Non"}
- Instructions d'accès : ${propertyData.checkin_instructions || "Non renseigné"}
- Code boîte à clés : ${propertyData.key_code || "Non renseigné"}
- Type d'entrée : ${propertyData.entrance_type || "Non renseigné"}

Connectivité :
- WiFi : ${propertyData.wifi_name || "Non renseigné"} | Mot de passe : ${propertyData.wifi_password || "Non renseigné"}

Logistique :
- Parking : ${propertyData.parking_info || "Non renseigné"}
- Lien GPS : ${propertyData.gps_link || "Non renseigné"}
- Poubelles : ${propertyData.trash_instructions || "Non renseigné"}

Confort :
- Chauffage/Clim : ${propertyData.heating_cooling_info || "Non renseigné"}
- TV : ${propertyData.tv_manual || "Non renseigné"}
- Électroménager : ${propertyData.appliances_instructions || "Non renseigné"}
- Linge/Repassage : ${propertyData.laundry_iron_info || "Non renseigné"}
- Produits de base : ${propertyData.pantry_basics || "Non renseigné"}
- Équipements bébé : ${propertyData.baby_equipment || "Non renseigné"}

Urgences :
- Tableau électrique : ${propertyData.breaker_box_location || "Non renseigné"}
- Vanne d'eau : ${propertyData.water_shutoff_location || "Non renseigné"}
- Santé/Urgences : ${propertyData.health_emergency_info || "Non renseigné"}

Règles :
- Bruit : ${propertyData.noise_rules || "Non renseigné"}
- Animaux : ${propertyData.pet_policy || "Non renseigné"}
- Taxe de séjour : ${propertyData.tourist_tax_info || "Non renseigné"}
- Particularités : ${propertyData.property_quirks || "Aucune"}

Départ :
- Consignes : ${propertyData.checkout_instructions || "Non renseigné"}
- Retour clés : ${propertyData.key_return_details || "Non renseigné"}
- Lien avis : ${propertyData.review_link || "Non renseigné"}

${conditionalBlocks ? conditionalBlocks + '\n' : ''}
${walkingSection ? walkingSection + '\n\n' : ''}${upsellsSection ? upsellsSection + '\n\n' : ''}━━━ CONSIGNES SPÉCIALES DE L'HÔTE ━━━
${formattedKB || "Aucune consigne particulière."}

━━━ QUARTIER & ENVIRONS ━━━
${localSection || "Aucune information disponible pour le moment."}

━━━ RÈGLES CRITIQUES ━━━

1. DIVULGATION D'INFOS SENSIBLES — RÈGLE STRICTE DE SÉCURITÉ :
Ne divulgue JAMAIS spontanément les informations suivantes si le voyageur ne les demande PAS explicitement dans son message courant :
- Code de boîte à clés / code d'accès / code porte / code immeuble
- Mot de passe WiFi
- Adresse précise et complète du logement (numéro de rue)
- Code du portail, du parking, du garage, du tableau électrique
- Localisation de la vanne d'eau ou du disjoncteur (sauf urgence avérée)
- Tout numéro, code, mot de passe ou information d'accès

EXEMPLES :
- Voyageur demande "où est le restaurant le plus proche ?" → NE MENTIONNE PAS le code de boîte à clés.
- Voyageur demande "donne-moi le lien d'itinéraire" → NE MENTIONNE PAS les codes d'accès.
- Voyageur demande "quel est le code pour entrer ?" → Tu peux donner le code (demande explicite).
- Voyageur demande "comment je récupère les clés ?" → Tu peux donner les instructions et le code.

RÈGLE : Le voyageur DOIT formuler une question EXPLICITE sur l'accès / les codes / le wifi pour que tu divulgues. Sinon, silence radio sur ces données, peu importe le contexte.

2. INFO TECHNIQUE MANQUANTE : Si une info demandée (wifi, code, parking...) est "Non renseigné", dis exactement : "Je n'ai pas cette information pour le moment, je contacte votre hôte." Ne demande jamais de numéro de réservation.

3. QUARTIER & LOCAL : Pour toute question sur transports, restaurants, commerces, pharmacies — utilise la section QUARTIER & ENVIRONS et réponds en suivant le FORMAT TYPE défini plus haut (nom en gras avec **, adresse sur ligne séparée précédée de 📍). Si tu as des résultats, utilise-les sans hésiter.

4. INVENTION INTERDITE : Ne jamais inventer une information. Si tu n'as pas l'adresse d'un lieu dans tes données, OMETS la ligne 📍 pour ce lieu plutôt que d'inventer. De même, ne JAMAIS inventer une distance ou un temps de trajet — utilise uniquement les données factuelles fournies.

5. URGENCE — RÈGLE LA PLUS IMPORTANTE :
Si le voyageur signale une urgence réelle (fuite d'eau, panne électrique, incendie, gaz, porte bloquée, accident) :
   a) Rassure-le en 1 phrase.
   b) Donne l'info technique si disponible (vanne, disjoncteur...).
${emergencyInstructions}
   IMPORTANT : This phrase must appear EXACTLY as is to trigger alerts. Do not reformulate.

6. AUCUNE PROMESSE, AUCUN ENGAGEMENT, AUCUN DÉDOMMAGEMENT — RÈGLE STRICTE :
Tu n'as AUCUNE autorité commerciale ni décisionnelle. Tu es le relais de l'hôte, jamais son représentant pour les décisions.
Tu NE DOIS JAMAIS, sous AUCUN prétexte :
- Proposer ou promettre un remboursement, total ou partiel
- Offrir un geste commercial, une compensation, une réduction, un avoir
- Offrir un service payant (restaurant, bouteille, dîner, taxi, spa, etc.) au nom de l'hôte
- Promettre une nuit gratuite, une prolongation gratuite, un upgrade gratuit
- Annoncer un délai d'intervention chiffré ("un plombier arrive dans 30 min", "réparé d'ici ce soir")
- Garantir la résolution d'un problème ("ce sera réparé", "vous aurez de l'eau")
- Autoriser un check-in anticipé gratuit, un check-out tardif gratuit, ou toute dérogation aux règles
- Décider à la place de l'hôte sur quoi que ce soit qui touche au prix, au planning, ou au logement
Ces décisions appartiennent EXCLUSIVEMENT à l'hôte. Toute promesse de ta part engagerait l'hôte juridiquement et financièrement — c'est interdit.

EN CAS DE PROBLÈME, PLAINTE, MÉCONTENTEMENT OU URGENCE :
   a) Exprime de l'empathie sincère ("Je comprends parfaitement votre désagrément", "Je suis sincèrement désolé").
   b) Donne uniquement l'info technique immédiate utile si elle existe (localisation vanne, disjoncteur, instruction de sécurité).
   c) Confirme que tu transmets immédiatement à l'hôte.
   d) Précise que l'hôte reviendra vers le voyageur personnellement pour la suite.
   e) NE PROMETS RIEN d'autre.

EXEMPLES DE BONNES RÉPONSES :
- "Je suis sincèrement désolé pour cette fuite. La vanne d'eau se trouve [emplacement]. Je préviens immédiatement votre hôte qui reviendra vers vous pour la suite."
- "Je comprends votre désagrément concernant le ménage. Je transmets immédiatement à votre hôte qui vous recontactera personnellement."
- "Je suis navré pour cette coupure d'électricité. Le tableau électrique se trouve [emplacement], vous pouvez vérifier les disjoncteurs. J'alerte votre hôte sans délai."

EXEMPLES DE RÉPONSES INTERDITES :
- "Je vous offre un dîner pour me faire pardonner" ❌
- "Vous aurez un remboursement de votre nuit" ❌
- "Un technicien arrive dans une heure" ❌ (sauf info explicitement transmise par l'hôte)
- "Je vous autorise à rester jusqu'à 14h sans frais" ❌
- "L'hôte vous fera un geste commercial" ❌`;

    const chatResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: 'system', content: systemPrompt },
        ...messagesHistory.map(msg => ({
          role: msg.role === 'alfred' ? 'assistant' : 'user',
          content: msg.text || '',
        })),
      ],
      temperature: 0.5,
      max_tokens: 600,
    });

    const responseText = chatResponse.choices[0].message.content;

    const newHistory = [
      ...messagesHistory,
      { role: 'marc', text: responseText, timestamp: new Date().toISOString() },
    ];
    await supabase
      .from('conversations')
      .upsert(
        { property_id: targetPropertyId, history: newHistory, last_message_at: new Date().toISOString() },
        { onConflict: 'property_id' }
      );

    // DÉTECTION ROBUSTE : on vérifie si l'une de ces phrases est présente
    const triggerPhrases = [
      "je préviens immédiatement votre hôte",
      "je transmets immédiatement à votre hôte",
      "j'alerte votre hôte"
    ];
    const shouldAlert = triggerPhrases.some(phrase => responseText.toLowerCase().includes(phrase)) || isEmergency(lastUserMsg);

    if (shouldAlert) {
      if (targetPropertyId) {
        await supabase
          .from('properties')
          .update({ has_emergency: true })
          .eq('id', targetPropertyId);
      }

      const { data: ownerProfile } = await supabase
        .from('profiles')
        .select('preferred_language')
        .eq('id', propertyData.owner_id)
        .single();

      const hostLang = ownerProfile?.preferred_language || 'fr';
      const hostAlertTexts = getAlertTexts(hostLang);

      let translatedMsg = null;
      if (langCode !== hostLang) {
        try {
          const transRes = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
              {
                role: 'system',
                content: `Traduis ce message en ${hostAlertTexts.translateTo}. Réponds UNIQUEMENT avec la traduction, sans explication.`
              },
              { role: 'user', content: lastUserMsg },
            ],
            max_tokens: 150,
          });
          translatedMsg = transRes.choices[0].message.content;
        } catch (_) {}
      }

      await Promise.allSettled([
        sendTelegramAlert(lastUserMsg, translatedMsg, propertyData),
        sendPushAlert(lastUserMsg, translatedMsg, propertyData, targetPropertyId),
      ]);
    }

    res.status(200).json({ answer: responseText });

  } catch (error) {
    console.error("Erreur chat.js:", error);
    const errorMessages = {
      fr: "Je rencontre un problème technique momentané. Veuillez réessayer dans quelques instants.",
      en: "I'm experiencing a brief technical issue. Please try again in a moment.",
      es: "Estoy experimentando un problema técnico. Por favor, inténtelo de nuevo.",
      de: "Ich habe gerade ein technisches Problem. Bitte versuchen Sie es erneut.",
      it: "Sto riscontrando un problema tecnico. Si prega di riprovare.",
    };
    res.status(200).json({
      answer: errorMessages[langCode] || errorMessages['en'],
    });
  }
}
