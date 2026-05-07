import Groq from 'groq-sdk';
import { supabase } from '../../lib/supabase';

// --- 1. RECHERCHE WEB (Utilisée en dernier recours) ---
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
async function sendTelegramAlert(originalMsg, translatedMsg, propertyData, lang) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  try {
    const { data: profile } = await supabase.from('profiles').select('telegram_chat_id').eq('id', propertyData.owner_id).single();
    if (!profile?.telegram_chat_id) return;
    let text = `🚨 *ALERTE MAJOR MARC*\n\n🏠 *Logement :* ${propertyData.name}\n🌍 *Langue client :* ${lang}\n\n💬 *Message :*\n"${originalMsg}"`;
    if (translatedMsg) { text += `\n\n🇫🇷 *Traduction :*\n"${translatedMsg}"`; }
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: profile.telegram_chat_id, text, parse_mode: 'Markdown' })
    });
  } catch (e) { console.error("Erreur Telegram:", e); }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Méthode non autorisée');
  
  const { messagesHistory, propertyData, userLanguage } = req.body;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const langCode = userLanguage ? userLanguage.split('-')[0] : 'fr';

  try {
    const city = propertyData.city || '';
    const fullAddress = `${propertyData.street_number || ''} ${propertyData.address || ''}, ${city}`;
    const lastUserMsg = messagesHistory[messagesHistory.length - 1]?.text || "";

    // --- ÉTAPE A : RÉCUPÉRATION DE LA KNOWLEDGE BASE PERSONNALISÉE ---
    const { data: knowledgeBase } = await supabase
      .from('knowledge_base')
      .select('category, content')
      .eq('property_id', propertyData.id);

    const formattedKB = knowledgeBase?.map(kb => `${kb.category}: ${kb.content}`).join('\n') || "Aucune consigne supplémentaire.";

    // --- ÉTAPE B : DÉTECTION D'INTENTION INTERNATIONALE (Groq 8B) ---
    // On utilise l'IA pour savoir si on doit chercher sur le web (gère toutes les langues)
    const intentCheck = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: 'system', content: "Does the user message require a local search for shops, restaurants, transport, health, or tourism? Answer ONLY 'YES' or 'NO'." },
        { role: 'user', content: lastUserMsg }
      ],
      temperature: 0,
    });
    const needsSearch = intentCheck.choices[0].message.content.includes("YES");
    
    let searchResults = "";
    if (needsSearch) {
      searchResults = await searchLocalInfo(lastUserMsg, fullAddress, city);
    }

    // --- ÉTAPE C : CONSTRUCTION DU CERVEAU DE MARC (Hiérarchie de vérité) ---
    const systemMessage = { 
      role: 'system', 
      content: `Tu es Marc, le majordome de "${propertyData.name}" à ${city}.

      PRIORITÉ 1 : INFOS DU LOGEMENT (Base de données)
      - Adresse : ${fullAddress}
      - Wifi : ${propertyData.wifi_name} | Code : ${propertyData.wifi_password}
      - Check-in/out : ${propertyData.check_in_hour} / ${propertyData.check_out_hour}
      - Entrée : ${propertyData.entrance_type} (Code: ${propertyData.key_code})
      - Instructions : ${propertyData.checkin_instructions}
      - Confort : ${propertyData.heating_cooling_info}
      - Technique : Poubelles (${propertyData.trash_instructions}), Électricité (${propertyData.breaker_box_location}), Eau (${propertyData.water_shutoff_location})
      - Sortie : ${propertyData.checkout_instructions} | Clés : ${propertyData.key_return_details}
      - Services : ${propertyData.tv_manual}, ${propertyData.music_system}, ${propertyData.baby_equipment}
      - Guide Local : Transports (${propertyData.transport_info}), Commerces (${propertyData.local_shops}), Recommendations (${propertyData.recommendations})

      PRIORITÉ 2 : BASE DE CONNAISSANCES PERSONNALISÉE
      ${formattedKB}

      PRIORITÉ 3 : RÉSULTATS WEB (Seulement pour l'extérieur)
      ${searchResults || "Pas d'infos web disponibles."}

      CONSIGNES :
      1. Si l'info est dans la PRIORITÉ 1 ou 2, utilise-la exclusivement.
      2. Si tu ne trouves rien, dis : "Je n'ai pas cette information, je demande à votre hôte."
      3. Si le client signale un problème ou si tu dis contacter l'hôte, ajoute : "Je préviens immédiatement votre hôte."

      STYLE : Majordome de luxe, poli, efficace. Double saut de ligne.`
    };

    // --- ÉTAPE D : RÉPONSE FINALE ---
    const chatResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", 
      messages: [systemMessage, ...messagesHistory.map(msg => ({
        role: msg.role === 'marc' ? 'assistant' : 'user',
        content: msg.text || ''
      }))],
      temperature: 0.1,
    });

    const responseText = chatResponse.choices[0].message.content;

    // Sauvegarde History
    const newHistory = [...messagesHistory, { role: 'marc', text: responseText, timestamp: new Date().toISOString() }];
    await supabase.from('conversations').upsert({ property_id: propertyData.id, history: newHistory, last_message_at: new Date().toISOString() }, { onConflict: 'property_id' });

    // Alerte Telegram
    if (responseText.toLowerCase().includes("préviens") || responseText.toLowerCase().includes("votre hôte")) {
      let translatedMsg = null;
      if (langCode !== 'fr') {
        const transRes = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [{ role: 'system', content: "Traduis en FR." }, { role: 'user', content: lastUserMsg }],
        });
        translatedMsg = transRes.choices[0].message.content;
      }
      await sendTelegramAlert(lastUserMsg, translatedMsg, propertyData, langCode);
    }

    res.status(200).json({ answer: responseText });
  } catch (error) {
    res.status(200).json({ answer: `Désolé, Marc a un souci : ${error.message}` });
  }
}
