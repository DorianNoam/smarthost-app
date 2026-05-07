import { Mistral } from '@mistralai/mistralai';
import { supabase } from '../../lib/supabase';

// 1. Fonction d'alerte Telegram (Format Premium + Traduction conditionnelle)
async function sendTelegramAlert(originalMsg, translatedMsg, propertyData, lang) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('telegram_chat_id')
      .eq('id', propertyData.owner_id)
      .single();

    if (!profile?.telegram_chat_id) return;

    let text = `🚨 *ALERTE MAJOR MARC*\n\n` +
               `🏠 *Logement :* ${propertyData.name}\n` +
               `🌍 *Langue client :* ${lang}\n\n` +
               `💬 *Message Client :*\n"${originalMsg}"`;

    if (translatedMsg) {
      text += `\n\n🇫🇷 *Traduction Marc :*\n"${translatedMsg}"`;
    }

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: profile.telegram_chat_id, 
        text: text, 
        parse_mode: 'Markdown' 
      })
    });
  } catch (e) { console.error("Erreur Telegram:", e); }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Méthode non autorisée');

  const { messagesHistory, propertyData, userLanguage } = req.body;
  const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
  const langCode = userLanguage ? userLanguage.split('-')[0] : 'fr';

  try {
    const systemMessage = { 
      role: 'system', 
      content: `Tu es Marc, le majordome raffiné de "${propertyData.name}" situé à ${propertyData.city}. 

      RÈGLES DE STYLE (CRITIQUE) :
      - Utilise impérativement des **listes à puces** pour énumérer des informations.
      - Mets les informations clés en **gras** (codes, horaires, noms).
      - Saute une ligne entre chaque paragraphe pour aérer la lecture.
      - Ne fais jamais de gros blocs de texte.

      CONSIGNES DE VÉRITÉ :
      - Tu es à ${propertyData.city}. N'invente JAMAIS d'infos sur Paris ou la RATP si tu n'es pas à Paris.
      - Utilise UNIQUEMENT les infos ci-dessous. Si l'info manque, préviens l'hôte.

      INFOS DU LOGEMENT :
      - Adresse : ${propertyData.address}, ${propertyData.city}
      - Wifi : ${propertyData.wifi_name} / ${propertyData.wifi_password} 
      - Arrivée/Départ : ${propertyData.check_in_hour} / ${propertyData.check_out_hour}
      - Transports/Détails : ${propertyData.parking_info || 'Se référer au guide.'}

      INCIDENTS : Si le client a un problème, dis que tu préviens immédiatement son hôte.`
    };

    const formattedHistory = messagesHistory.map(msg => ({
      role: msg.role === 'marc' ? 'assistant' : 'user',
      content: msg.text || ''
    }));

    const chatResponse = await mistral.chat.complete({
      model: 'mistral-small-2506',
      messages: [systemMessage, ...formattedHistory],
    });

    const responseText = chatResponse.choices[0].message.content;

    // --- 💾 SAUVEGARDE DANS L'HISTORIQUE (JSONB) ---
    const newHistory = [
      ...messagesHistory,
      { role: 'marc', text: responseText, timestamp: new Date().toISOString() }
    ];

    await supabase.from('conversations').upsert({
      property_id: propertyData.id,
      history: newHistory,
      last_message_at: new Date().toISOString()
    }, { onConflict: 'property_id' });

    // --- 🔔 DÉTECTION ET ALERTE TELEGRAM ---
    const lastUserMsg = messagesHistory[messagesHistory.length - 1]?.text || "";
    
    const shouldAlert = responseText.toLowerCase().includes("hôte") || 
                        responseText.toLowerCase().includes("navré") || 
                        responseText.toLowerCase().includes("sorry") || 
                        responseText.toLowerCase().includes("lo siento");

    if (shouldAlert) {
      let translatedMsg = null;
      if (langCode !== 'fr') {
        const transRes = await mistral.chat.complete({
          model: 'mistral-small-2506',
          messages: [
            { role: 'system', content: "Traduis en Français simple pour l'hôte. Ne donne que la traduction." }, 
            { role: 'user', content: lastUserMsg }
          ],
        });
        translatedMsg = transRes.choices[0].message.content;
      }
      await sendTelegramAlert(lastUserMsg, translatedMsg, propertyData, langCode);
    }

    res.status(200).json({ answer: responseText });

  } catch (error) {
    console.error("Erreur API:", error);
    res.status(500).json({ answer: "Une difficulté technique est survenue." });
  }
}
