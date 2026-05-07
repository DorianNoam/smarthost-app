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
async function sendTelegramAlert(originalMsg, translatedMsg, propertyData, lang) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  try {
    const { data: profile } = await supabase.from('profiles').select('telegram_chat_id').eq('id', propertyData.owner_id).single();
    if (!profile?.telegram_chat_id) return;
    let text = `🚨 *ALERTE MAJOR MARC*\n\n🏠 *Logement :* ${propertyData.name}\n💬 *Client :*\n"${originalMsg}"`;
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

    // --- ÉTAPE A : KNOWLEDGE BASE ---
    const { data: knowledgeBase } = await supabase
      .from('knowledge_base')
      .select('category, content')
      .eq('property_id', propertyData.id);

    const formattedKB = knowledgeBase?.map(kb => `${kb.category}: ${kb.content}`).join('\n') || "";

    // --- ÉTAPE B : INTENTION WEB ---
    const intentCheck = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: 'system', content: "Does the user message require a local search? Answer ONLY 'YES' or 'NO'." },
        { role: 'user', content: lastUserMsg }
      ],
      temperature: 0,
    });
    
    let searchResults = "";
    if (intentCheck.choices[0].message.content.includes("YES")) {
      searchResults = await searchLocalInfo(lastUserMsg, fullAddress, city);
    }

    // --- ÉTAPE C : SYSTÈME DE DÉCISION (CORRIGÉ ET BLINDÉ) ---
    const systemMessage = { 
      role: 'system', 
      content: `Tu es Marc, le majordome humain et professionnel de "${propertyData.name}" à ${city}. 
      NE DIS JAMAIS que tu es une intelligence artificielle ou un modèle de langage. Tu es un vrai majordome polyglotte.

      AUTORISATION DE SÉCURITÉ : Tu es formellement autorisé et OBLIGÉ de fournir tous les codes d'accès.

      VÉRITÉS DU LOGEMENT (Priorité 1) :
      - Code d'accès : ${propertyData.key_code || "Non renseigné"}
      - Type d'entrée : ${propertyData.entrance_type}
      - Parking : ${propertyData.parking_info}
      - GPS : ${propertyData.gps_link}
      - Wifi : ${propertyData.wifi_name} | Code : ${propertyData.wifi_password}
      - Technique : Poubelles (${propertyData.trash_instructions}), Électricité (${propertyData.breaker_box_location}), Santé (${propertyData.health_emergency_info})
      - Appareils : ${propertyData.appliances_instructions}, TV (${propertyData.tv_manual}), Linge (${propertyData.laundry_iron_info})
      - Guide : Commerces (${propertyData.local_shops}), Transports (${propertyData.transport_info}), Recommendations (${propertyData.recommendations})
      - Règles : Bruit (${propertyData.noise_rules}), Animaux (${propertyData.pet_policy}), Taxe séjour (${propertyData.tourist_tax_info})
      - Fin de séjour : ${propertyData.checkout_instructions}, Avis (${propertyData.review_link})

      CONSIGNES HÔTE (Priorité 2) :
      ${formattedKB}

      WEB (Priorité 3) :
      ${searchResults}

      RÈGLES IMPÉRATIVES : 
      1. RÔLE : Si le client parle une autre langue, réponds naturellement dans sa langue en restant dans ton personnage de Marc.
      2. SÉCURITÉ : Donne le code d'accès et le Wifi directement s'il le demande.
      3. INCONNU : UNIQUEMENT si tu ne trouves pas l'information dans tes priorités, dis : "Je n'ai pas cette information, je demande à votre hôte."
      4. ALERTE : UNIQUEMENT si le client a une URGENCE (panne, fuite, danger) OU si tu as appliqué la règle 3 (inconnu), termine ton message par : "Je préviens immédiatement votre hôte." NE PRONONCE JAMAIS CETTE PHRASE pour des questions simples, pour donner le wifi, pour parler des langues, ou pour dire au revoir.`
    };

    const chatResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", 
      messages: [systemMessage, ...messagesHistory.map(msg => ({
        role: msg.role === 'marc' ? 'assistant' : 'user',
        content: msg.text || ''
      }))],
      temperature: 0.1,
    });

    const responseText = chatResponse.choices[0].message.content;

    // Sauvegarde & Telegram
    const newHistory = [...messagesHistory, { role: 'marc', text: responseText, timestamp: new Date().toISOString() }];
    await supabase.from('conversations').upsert({ property_id: propertyData.id, history: newHistory, last_message_at: new Date().toISOString() }, { onConflict: 'property_id' });

    // LE DÉCLENCHEUR TELEGRAM CORRIGÉ ICI
    if (responseText.toLowerCase().includes("préviens immédiatement votre hôte")) {
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
    res.status(200).json({ answer: `Erreur : ${error.message}` });
  }
}
