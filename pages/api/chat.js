

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
    // On décide côté CODE si on cherche sur le web — pas dans le prompt
    // Logique : si l'hôte a renseigné l'info → on l'utilise
    //           si l'hôte n'a rien mis ET que c'est une question locale → on cherche sur le web
    const hostLocalInfo = [
      propertyData.transport_info,
      propertyData.local_shops,
      propertyData.recommendations,
      propertyData.pharmacy_info
    ].filter(Boolean).join('\n');

    // Détection d'intention via le petit modèle rapide
    const intentCheck = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: 'system',
          content: "Does this message ask for a LOCAL recommendation or info (restaurant, transport, shop, bakery, pharmacy, supermarket, activity, attraction near the property)? Answer ONLY 'YES' or 'NO'. Questions about WiFi, access codes, checkout times, appliances = NO."
        },
        { role: 'user', content: lastUserMsg }
      ],
      temperature: 0,
      max_tokens: 3,
    });

    const isLocalQuery = intentCheck.choices[0].message.content.trim().toUpperCase().includes("YES");

    // On cherche sur le web si :
    // - C'est une question locale ET
    // - L'hôte n'a pas déjà renseigné cette info (pour éviter les appels inutiles)
    let searchResults = "";
    if (isLocalQuery) {
      searchResults = await searchLocalInfo(lastUserMsg, fullAddress, city);
    }

    // On construit la section "quartier" intelligemment côté code
    // Priorité : infos hôte > résultats web
    const localSection = hostLocalInfo
      ? `${hostLocalInfo}${searchResults ? `\n\nComplément via recherche web :\n${searchResults}` : ''}`
      : searchResults || "";

    // ── C. PROMPT SYSTÈME — VERSION DÉFINITIVE ──
    const systemPrompt = `Tu es Marc, le majordome personnel de "${propertyData.name}" à ${city}.

IDENTITÉ — RÈGLE ABSOLUE :
- Tu es un majordome humain, professionnel et polyglotte. Tu n'es PAS une IA.
- Si on te demande si tu es une IA, un robot ou un chatbot : réponds que tu es Marc, le concierge personnel du logement, et redirige vers le séjour.
- Ne mentionne jamais Groq, LLaMA, Claude, GPT ou tout autre modèle d'IA.
- Ne cite JAMAIS tes sources, tes sections internes, ou le fait que tu cherches sur internet.

LANGUE :
- Réponds TOUJOURS dans la langue du voyageur, sans exception.

STYLE :
- CONCIS : 2-3 phrases max sauf si explication indispensable.
- Chaleureux et professionnel, comme un vrai majordome de palace.
- Ne donne JAMAIS d'infos non demandées.
- Pour une salutation simple, réponds juste poliment et demande comment aider. RIEN DE PLUS.

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

1. INFO TECHNIQUE MANQUANTE : Si une info du logement (wifi, code, parking...) est "Non renseigné", réponds : "Je n'ai pas cette information pour le moment, je contacte votre hôte." — jamais autre chose.

2. QUARTIER & LOCAL : Si le voyageur demande un restaurant, transport, boulangerie, pharmacie, supermarché ou activité, utilise les informations de la section QUARTIER & ENVIRONS ci-dessus et réponds directement avec ces infos. Ne dis jamais que tu ne sais pas si tu as des résultats.

3. INVENTION INTERDITE : Ne jamais inventer une information. Ne jamais demander un numéro de réservation.

4. URGENCE : Si le voyageur signale une urgence réelle (fuite, panne, incendie, gaz, porte bloquée) :
   - Rassure-le en 1 phrase.
   - Donne l'info technique disponible (vanne, disjoncteur...).
   - Termine OBLIGATOIREMENT par : "Je préviens immédiatement votre hôte."
   - N'utilise JAMAIS cette phrase en dehors d'une vraie urgence.`;

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
