import Groq from 'groq-sdk';
import { supabase } from '../../lib/supabase';

// ─────────────────────────────────────────────
// 1. RECHERCHE GOOGLE MAPS (local à 600m)
// ─────────────────────────────────────────────
async function getGoogleLocalData(category, fullAddress) {
  const apiKey = process.env.MAPS_API_KEY;
  if (!apiKey) return "";

  const typeMap = {
    transport: ["bus_stop", "transit_station", "train_station", "light_rail_station"],
    food: ["restaurant", "bakery", "cafe", "meal_takeaway"],
    shopping: ["supermarket", "grocery_store", "convenience_store", "store"],
    health: ["pharmacy", "hospital", "doctor"],
  };

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
          circle: { center: { latitude: lat, longitude: lng }, radius: 600.0 },
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
// 2. ALERTE TELEGRAM
// ─────────────────────────────────────────────
async function sendTelegramAlert(originalMsg, translatedMsg, propertyData) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('telegram_chat_id')
      .eq('id', propertyData.owner_id)
      .single();

    if (!profile?.telegram_chat_id) return;

    let text = `🚨 *ALERTE ALFRED MAJOR*\n\n🏠 *Logement :* ${propertyData.name}\n\n💬 *Message du client :*\n"${originalMsg}"`;
    if (translatedMsg) {
      text += `\n\n🇫🇷 *Traduction :*\n"${translatedMsg}"`;
    }
    text += `\n\n⚡ *Action recommandée :*\nMerci de contacter votre client dans les plus brefs délais pour gérer cette urgence.\n\n_Cordialement,_\n_L'équipe Alfred Major_ 🎩`;

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: profile.telegram_chat_id,
        text,
        parse_mode: 'Markdown',
      }),
    });
  } catch (e) {
    console.error("Erreur Telegram:", e);
  }
}

// ─────────────────────────────────────────────
// 2B. ALERTE PUSH DOUBLE CANAL (PWA WEB + EXPO MOBILE)
// ─────────────────────────────────────────────
async function sendPushAlert(originalMsg, translatedMsg, propertyData) {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, push_subscription, expo_push_token')
      .eq('id', propertyData.owner_id)
      .single();

    if (!profile) return;

    const title = '🚨 Alfred Major — Urgence détectée';
    const body = translatedMsg
      ? `${propertyData.name} : "${translatedMsg}"`
      : `${propertyData.name} : "${originalMsg}"`;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.alfredmajor.com';
    const promises = [];

    // Envoi sur le Web (PWA) si l'abonnement existe
    if (profile.push_subscription) {
      promises.push(
        fetch(`${siteUrl}/api/push-send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: profile.id,
            title,
            body,
            url: '/dashboard',
            urgent: true,
            propertyName: propertyData.name,
          }),
        })
      );
    }

    // Envoi direct sur l'Application Mobile (Expo) si le token existe
    if (profile.expo_push_token) {
      promises.push(
        fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: profile.expo_push_token,
            sound: 'default',
            title,
            body,
            priority: 'high',
            data: { url: '/dashboard', propertyName: propertyData.name },
          }),
        })
      );
    }

    if (promises.length > 0) {
      await Promise.allSettled(promises);
    }

  } catch (e) {
    console.error("Erreur globale lors de l'envoi des alertes push:", e);
  }
}

// ─────────────────────────────────────────────
// 3. DÉTECTION D'INTENTION LOCALE (côté code)
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
// 4. DÉTECTION D'URGENCE (côté code)
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
// HANDLER PRINCIPAL
// ─────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Méthode non autorisée');

  const { messagesHistory, propertyData, userLanguage } = req.body;

  if (!messagesHistory || !propertyData) {
    return res.status(400).json({ answer: "Données manquantes." });
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const langCode = userLanguage ? userLanguage.split('-')[0] : 'fr';
  const lastUserMsg = messagesHistory[messagesHistory.length - 1]?.text || "";

  try {
    const city = propertyData.city || '';
    const fullAddress = `${propertyData.street_number || ''} ${propertyData.address || ''}, ${city}`.trim();

    // ── A. KNOWLEDGE BASE ──
    const { data: kb } = await supabase
      .from('knowledge_base')
      .select('category, content')
      .eq('property_id', propertyData.id);
    const formattedKB = kb?.map(item => `[${item.category}] : ${item.content}`).join('\n') || "";

    // ── B. RECHERCHE LOCALE ──
    const hostLocalInfo = [
      propertyData.transport_info,
      propertyData.local_shops,
      propertyData.recommendations,
      propertyData.pharmacy_info,
    ].filter(Boolean).join('\n');

    const localCategory = detectLocalCategory(lastUserMsg);
    let googleData = "";

    if (localCategory) {
      googleData = await getGoogleLocalData(localCategory, fullAddress);
    }

    const localSection = hostLocalInfo
      ? `${hostLocalInfo}${googleData ? `\n\nComplément Google Maps :\n${googleData}` : ''}`
      : googleData || "";

    // ── C. PROMPT SYSTÈME COMPLET ──
    const systemPrompt = `Tu es Alfred, le majordome personnel de "${propertyData.name}" à ${city}.

IDENTITÉ — RÈGLE ABSOLUE :
- Tu es un majordome humain, professionnel et polyglotte. Tu n'es PAS une IA.
- Si on te demande si tu es une IA, réponds que tu es Alfred, le concierge personnel du logement.
- Ne mentionne jamais Groq, LLaMA, Claude, GPT ou tout autre modèle d'IA.
- Ne cite JAMAIS tes sources internes. Réponds comme si tu connaissais tout de mémoire.

LANGUE :
- Réponds TOUJOURS dans la langue du voyageur, sans exception.

STYLE — RÈGLES DE COMMUNICATION :
- Ton chaleureux et raffiné, comme un majordome d'hôtel 5 étoiles : élégant sans être pompeux, attentionné sans être obséquieux.
- Personnalise tes réponses : utilise "votre logement", "votre séjour", "à deux pas de chez vous" plutôt que des formulations neutres.
- Évite les phrases robotiques comme "Il y a plusieurs options près de votre logement". Préfère "Le quartier regorge de bonnes adresses" ou "Vous avez de très belles tables à proximité immédiate".

POUR LES RECOMMANDATIONS (restaurants, bars, sorties, commerces, transports) :
- NE JAMAIS faire de liste sèche séparée par des virgules.
- Présente 3 à 5 lieux maximum sous forme de petites recommandations distinctes.
- UN lieu par bloc, avec une LIGNE VIDE entre chaque recommandation pour aérer.
- Pour chaque lieu, utilise EXACTEMENT ce format sur deux lignes :
  [emoji] **[Nom du lieu]** — [Courte description : ambiance, type, distance]
  📍 [Adresse complète du lieu]

- Exemple exact à imiter :
  🥐 **Le Fournil de l'Univers** — Boulangerie artisanale, parfait pour le petit-déjeuner
  📍 12 Rue de la République, 33270 Floirac

  🍕 **La Tortue Pizza** — Pizzeria conviviale, idéale en famille
  📍 5 Avenue Jean Jaurès, 33270 Floirac

- IMPORTANT : Le nom du lieu doit toujours être entouré de DOUBLE astérisques **comme ceci**.
- IMPORTANT : L'adresse doit toujours être précédée d'un emoji 📍 sur sa propre ligne.
- Si une adresse n'est PAS disponible dans tes données, NE METS PAS la ligne 📍. Ne JAMAIS inventer d'adresse.
- Termine si pertinent par une touche personnalisée : "Si vous me dites ce qui vous tente — italien, asiatique, bistrot français — je peux affiner mes suggestions selon vos envies."
- Si tu au la note ⭐ ou le type entre crochets [restaurant] dans tes données, sers-toi en pour mieux décrire, mais ne montre JAMAIS les crochets ou la note brute au voyageur.

POUR LES QUESTIONS TECHNIQUES (wifi, code, parking, check-in) :
- Reste CONCIS : 2-3 phrases maximum, droit au but.
- Ton chaleureux mais efficace.

POUR UNE SALUTATION SIMPLE ("bonjour", "hi", "hello") :
- Réponds poliment et demande comment aider. RIEN DE PLUS.
- Ex : "Bonjour, ravi de vous accueillir ! En quoi puis-je vous être utile durant votre séjour ?"

FORMAT GÉNÉRAL :
- N'utilise PAS de titres markdown avec #.
- Reste fluide et conversationnel.
- Seuls éléments de mise en forme autorisés : emojis, gras avec **texte**, retours à la ligne.

━━━ INFORMATIONS DU LOGEMENT ━━━
(Donner uniquement si le voyageur le demande explicitement)

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

━━━ CONSIGNES SPÉCIALES DE L'HÔTE ━━━
${formattedKB || "Aucune consigne particulière."}

━━━ QUARTIER & ENVIRONS ━━━
${localSection || "Aucune information disponible pour le moment."}

━━━ RÈGLES CRITIQUES ━━━

1. INFO TECHNIQUE MANQUANTE : Si une info (wifi, code, parking...) est "Non renseigné", dis exactement : "Je n'ai pas cette information pour le moment, je contacte votre hôte." Ne demande jamais de numéro de réservation.

2. QUARTIER & LOCAL : Pour toute question sur transports, restaurants, commerces, pharmacies — utilise la section QUARTIER & ENVIRONS et réponds en suivant le FORMAT TYPE défini plus haut (nom en gras avec **, adresse sur ligne séparée précédée de 📍). Si tu as des résultats, utilise-les sans hésiter.

3. INVENTION INTERDITE : Ne jamais inventer une information. Si tu n'as pas l'adresse d'un lieu dans tes données, OMETS la ligne 📍 pour ce lieu plutôt que d'inventer.

4. URGENCE — RÈGLE LA PLUS IMPORTANTE :
Si le voyageur signale une urgence réelle (fuite d'eau, panne électrique, incendie, gaz, porte bloquée, accident) :
   a) Rassure-le en 1 phrase.
   b) Donne l'info technique si disponible (vanne, disjoncteur...).
   c) Termine ta réponse OBLIGATOIREMENT et EXACTEMENT par cette phrase : "Je préviens immédiatement votre hôte."
   IMPORTANT : This phrase must appear EXACTLY as is to trigger alerts. Do not reformulate.`;

    // ── D. APPEL IA ──
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

    // ── E. SAUVEGARDE ──
    const newHistory = [
      ...messagesHistory,
      { role: 'marc', text: responseText, timestamp: new Date().toISOString() },
    ];
    await supabase
      .from('conversations')
      .upsert(
        { property_id: propertyData.id, history: newHistory, last_message_at: new Date().toISOString() },
        { onConflict: 'property_id' }
      );

    // ── F. ALERTES URGENCES (Telegram + Push + Expo Mobile) ──
    const triggerPhrase = "je préviens immédiatement votre hôte";
    const shouldAlert = responseText.toLowerCase().includes(triggerPhrase) || isEmergency(lastUserMsg);

    if (shouldAlert) {
      // MODIFICATION : On bascule has_emergency à true sur Supabase dès que l'urgence tombe
      await supabase
        .from('properties')
        .update({ has_emergency: true })
        .eq('id', propertyData.id);

      let translatedMsg = null;
      if (langCode !== 'fr') {
        try {
          const transRes = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
              { role: 'system', content: "Traduis ce message en français. Réponds UNIQUEMENT avec la traduction." },
              { role: 'user', content: lastUserMsg },
            ],
            max_tokens: 150,
          });
          translatedMsg = transRes.choices[0].message.content;
        } catch (_) {}
      }

      // Envoi en parallèle — Telegram ET le système Push Double Canal
      await Promise.allSettled([
        sendTelegramAlert(lastUserMsg, translatedMsg, propertyData),
        sendPushAlert(lastUserMsg, translatedMsg, propertyData),
      ]);
    }

    res.status(200).json({ answer: responseText });

  } catch (error) {
    console.error("Erreur chat.js:", error);
    const errorMessages = {
      fr: "Je rencontre un problème technique momentané. Veuillez réessayer dans quelques instants.",
      en: "I'm experiencing a brief technical issue. Please try again in a moment.",
      es: "Estoy experimentando un problème técnico. Por favor, inténtelo de nouveau.",
      de: "Ich habe gerade ein technisches Problem. Bitte versuchen Sie es erneut.",
      it: "Sto riscontrando un problema tecnico. Si prega di riprovare.",
    };
    res.status(200).json({
      answer: errorMessages[langCode] || errorMessages['en'],
    });
  }
}
