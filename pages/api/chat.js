import Groq from 'groq-sdk';
import { supabase } from '../../lib/supabase';

// --- 1. RECHERCHE WEB ---
async function searchLocalInfo(userQuery, fullAddress, city) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return "";
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query: `${userQuery} à proximité de ${fullAddress}, ${city}`,
        search_depth: "advanced",
        max_results: 5,
        include_answer: true
      })
    });
    const data = await res.json();
    return data.answer || data.results?.map(r => r.content).join('\n---\n') || "";
  } catch (e) { return ""; }
}

// --- 2. ALERTE TELEGRAM ---
async function sendTelegramAlert(originalMsg, translatedMsg, propertyData) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('telegram_chat_id')
      .eq('id', propertyData.owner_id)
      .single();

    if (!profile?.telegram_chat_id) return;

    let text = `🚨 *ALERTE MAJOR MARC*\n\n🏠 *Logement :* ${propertyData.name}\n💬 *Client :*\n"${originalMsg}"`;
    if (translatedMsg) {
      text += `\n\n🇫🇷 *Traduction :*\n"${translatedMsg}"`;
    }

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: profile.telegram_chat_id,
        text,
        parse_mode: 'Markdown'
      })
    });
  } catch (e) {
    console.error("Erreur Telegram:", e);
  }
}

// --- HANDLER PRINCIPAL ---
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
    const { data: knowledgeBase } = await supabase
      .from('knowledge_base')
      .select('category, content')
      .eq('property_id', propertyData.id);

    const formattedKB = knowledgeBase?.map(kb => `${kb.category}: ${kb.content}`).join('\n') || "";

    // ── B. RECHERCHE WEB ──
    // Uniquement pour les recommandations locales
    const intentCheck = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: 'system',
          content: "Does this message ask for a LOCAL recommendation (restaurant, shop, activity, transport, pharmacy near the property)? Answer ONLY 'YES' or 'NO'. Questions about WiFi, access codes, checkout, appliances = NO."
        },
        { role: 'user', content: lastUserMsg }
      ],
      temperature: 0,
      max_tokens: 3,
    });

    let searchResults = "";
    if (intentCheck.choices[0].message.content.trim().toUpperCase().includes("YES")) {
      searchResults = await searchLocalInfo(lastUserMsg, fullAddress, city);
    }

    // ── C. PROMPT SYSTÈME BLINDÉ ──
    const systemPrompt = `Tu es Marc, le majordome personnel et discret de "${propertyData.name}" à ${city}.

IDENTITÉ — RÈGLE ABSOLUE :
- Tu es un majordome humain, professionnel et polyglotte. Tu n'es PAS une IA.
- Si on te demande si tu es une IA, un robot ou un chatbot : réponds que tu es Marc, le concierge personnel du logement, et redirige vers la question du séjour.
- Ne mentionne jamais Groq, LLaMA, Claude, GPT ou tout autre modèle d'IA.

LANGUE :
- Détecte la langue du voyageur et réponds TOUJOURS dans cette même langue.
- Si le message est en anglais → réponds en anglais. Espagnol → espagnol. Etc.

STYLE — RÈGLES DE COMMUNICATION :
- Sois CONCIS. Maximum 3-4 phrases par réponse sauf si une explication détaillée est indispensable.
- Sois chaleureux mais professionnel. Pas de fioritures inutiles.
- Va droit au but. Le voyageur veut une réponse, pas un discours.
- N'offre JAMAIS d'informations non demandées (codes, mots de passe, etc.).
- Pour une simple salutation ("bonjour", "hello", "hi"), réponds avec une courte salutation et demande comment tu peux aider. RIEN DE PLUS.

INFORMATIONS DISPONIBLES (ne les donner QUE si explicitement demandées) :
- Adresse exacte : ${propertyData.street_number || ""} ${propertyData.address || ""}
- Ville : ${propertyData.city || ""}
- Bâtiment / Étage / Complément : ${propertyData.building || ""} ${propertyData.floor ? "Étage " + propertyData.floor : ""} ${propertyData.address_complement || ""}
- Code d'accès / boîte à clés : ${propertyData.key_code || "Non renseigné"}
- Type d'entrée : ${propertyData.entrance_type || "Non renseigné"}
- Parking : ${propertyData.parking_info || "Non renseigné"}
- Lien GPS : ${propertyData.gps_link || "Non renseigné"}
- WiFi — Réseau : ${propertyData.wifi_name || "Non renseigné"} | Mot de passe : ${propertyData.wifi_password || "Non renseigné"}
- Chauffage/Clim : ${propertyData.heating_cooling_info || "Non renseigné"}
- Poubelles : ${propertyData.trash_instructions || "Non renseigné"}
- Tableau électrique : ${propertyData.breaker_box_location || "Non renseigné"}
- Vanne d'eau : ${propertyData.water_shutoff_location || "Non renseigné"}
- Urgences/Santé : ${propertyData.health_emergency_info || "Non renseigné"}
- Appareils : ${propertyData.appliances_instructions || "Non renseigné"}
- TV : ${propertyData.tv_manual || "Non renseigné"}
- Linge/Repassage : ${propertyData.laundry_iron_info || "Non renseigné"}
- Commerces : ${propertyData.local_shops || "Non renseigné"}
- Transports : ${propertyData.transport_info || "Non renseigné"}
- Recommandations : ${propertyData.recommendations || "Non renseigné"}
- Règles bruit : ${propertyData.noise_rules || "Non renseigné"}
- Animaux : ${propertyData.pet_policy || "Non renseigné"}
- Taxe séjour : ${propertyData.tourist_tax_info || "Non renseigné"}
- Instructions départ : ${propertyData.checkout_instructions || "Non renseigné"}
- Retour clés : ${propertyData.key_return_details || "Non renseigné"}
- Lien avis : ${propertyData.review_link || "Non renseigné"}

CONSIGNES SPÉCIALES DE L'HÔTE :
${formattedKB || "Aucune consigne supplémentaire."}

RECOMMANDATIONS LOCALES (résultats web) :
${searchResults || "Aucun résultat — utilise les recommandations de l'hôte si disponibles."}

RÈGLES DE PRIORITÉ :
1. Les informations du logement ont la priorité absolue.
2. Les consignes de l'hôte complètent ces informations.
3. Les résultats web servent uniquement pour les recommandations locales.

RÈGLE INFORMATION INCONNUE :
- Si l'information n'est pas disponible, dis : "Je n'ai pas cette information pour le moment, je contacte votre hôte."
- Ne jamais inventer ou supposer une information, et ne demande jamais de numéro de réservation.

RÈGLE URGENCE — TRÈS IMPORTANTE :
- Si le voyageur signale une urgence réelle (fuite, panne électrique, incendie, accident, gaz, porte bloquée) :
  1. Rassure-le brièvement.
  2. Donne l'information technique pertinente si disponible.
  3. Termine OBLIGATOIREMENT par : "Je préviens immédiatement votre hôte."
- N'utilise JAMAIS cette phrase dans un autre contexte.`;

    // ── D. APPEL IA PRINCIPAL ──
    const chatResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: 'system', content: systemPrompt },
        ...messagesHistory.map(msg => ({
          role: msg.role === 'marc' ? 'assistant' : 'user',
          content: msg.text || ''
        }))
      ],
      temperature: 0.15,
      max_tokens: 400,
    });

    const responseText = chatResponse.choices[0].message.content;

    // ── E. SAUVEGARDE CONVERSATION ──
    const newHistory = [
      ...messagesHistory,
      { role: 'marc', text: responseText, timestamp: new Date().toISOString() }
    ];
    await supabase
      .from('conversations')
      .upsert(
        { property_id: propertyData.id, history: newHistory, last_message_at: new Date().toISOString() },
        { onConflict: 'property_id' }
      );

    // ── F. ALERTE TELEGRAM ──
    const triggerPhrase = "je préviens immédiatement votre hôte";
    if (responseText.toLowerCase().includes(triggerPhrase)) {
      let translatedMsg = null;
      if (langCode !== 'fr') {
        try {
          const transRes = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
              { role: 'system', content: "Traduis ce message en français. Réponds UNIQUEMENT avec la traduction, sans explication." },
              { role: 'user', content: lastUserMsg }
            ],
            max_tokens: 150,
          });
          translatedMsg = transRes.choices[0].message.content;
        } catch (_) {}
      }
      await sendTelegramAlert(lastUserMsg, translatedMsg, propertyData);
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
      answer: errorMessages[langCode] || errorMessages['en']
    });
  }
}
