import Groq from 'groq-sdk';
import formidable from 'formidable';
import fs from 'fs';

// ── Désactiver le bodyParser Next.js (on gère le multipart manuellement) ──
export const config = { api: { bodyParser: false } };

// ── Liste de tous les champs à détecter ──────────────────────────────────
const FIELDS_TO_EXTRACT = {
  // Identité
  name: "Nom du logement ou de l'établissement",
  city: "Ville",
  address: "Rue / Adresse",
  street_number: "Numéro de rue",
  // Accès
  check_in_hour: "Heure d'arrivée / check-in (format HH:MM)",
  check_out_hour: "Heure de départ / check-out (format HH:MM)",
  key_code: "Code de la boîte à clés ou code d'accès (chiffres uniquement)",
  checkin_instructions: "Instructions détaillées pour l'arrivée et l'accès",
  entrance_type: "Type d'entrée (Boîte à clés, Serrure Connectée, Digicode)",
  parking_info: "Informations sur le parking",
  gps_link: "Lien GPS ou Google Maps",
  // WiFi
  wifi_name: "Nom du réseau WiFi (SSID)",
  wifi_password: "Mot de passe WiFi",
  // Confort
  heating_cooling_info: "Instructions chauffage et climatisation",
  tv_manual: "Instructions TV et streaming",
  appliances_instructions: "Instructions électroménager",
  // Sécurité
  breaker_box_location: "Emplacement du tableau électrique / disjoncteur",
  water_shutoff_location: "Emplacement de la vanne d'eau principale",
  health_emergency_info: "Numéros d'urgence et informations santé",
  // Départ
  checkout_instructions: "Consignes de départ",
  key_return_details: "Instructions retour des clés",
  // Règles
  noise_rules: "Règles de bruit et de vie",
  pet_policy: "Politique animaux (Oui / Non / Sur demande)",
  tourist_tax_info: "Taxe de séjour",
  // Local
  recommendations: "Recommandations de restaurants et bonnes adresses",
  transport_info: "Informations transports",
  local_shops: "Commerces à proximité",
  // Petit-déjeuner
  breakfast_hours: "Horaires du petit-déjeuner",
  breakfast_location: "Lieu de service du petit-déjeuner",
  breakfast_details: "Composition / description du petit-déjeuner",
  // Services
  housekeeping_frequency: "Fréquence du ménage",
  // Gîte / Rural
  bbq_info: "Informations sur le barbecue",
  pool_info: "Informations sur la piscine",
  nearest_bakery: "Boulangerie la plus proche",
  nearest_supermarket: "Supermarché le plus proche",
  // Médina / Riad
  medina_directions: "Instructions pour trouver le logement dans la médina",
  trusted_taxi: "Numéro de taxi de confiance",
  // Divers
  property_quirks: "Particularités ou spécificités du logement à savoir",
  neighborhood_nuisances: "Nuisances du quartier",
  baby_equipment: "Équipements bébé disponibles",
};

// ── Extraction texte PDF ─────────────────────────────────────────────────
async function extractPdfText(filePath) {
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  } catch (e) {
    console.error("Erreur PDF:", e);
    return null;
  }
}

// ── Extraction texte DOCX ────────────────────────────────────────────────
async function extractDocxText(filePath) {
  try {
    const mammoth = (await import('mammoth')).default;
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (e) {
    console.error("Erreur DOCX:", e);
    return null;
  }
}

// ── Extraction texte TXT ─────────────────────────────────────────────────
function extractTxtText(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (e) {
    return null;
  }
}

// ── Analyse IA avec Groq ─────────────────────────────────────────────────
async function analyzeWithGroq(text) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const fieldDescriptions = Object.entries(FIELDS_TO_EXTRACT)
    .map(([key, desc]) => `- "${key}" : ${desc}`)
    .join('\n');

  const prompt = `Tu es un assistant spécialisé dans l'extraction d'informations sur des logements touristiques.

Voici un document (guide de bienvenue, email, description de logement) :

---
${text.slice(0, 6000)}
---

Extrais UNIQUEMENT les informations clairement présentes dans ce document et retourne-les sous forme de JSON valide.

Champs à extraire (utilise EXACTEMENT ces noms de clés) :
${fieldDescriptions}

RÈGLES STRICTES :
- Retourne UNIQUEMENT un objet JSON valide, sans aucun texte avant ou après.
- N'inclus PAS les clés si l'information est absente ou incertaine.
- Ne jamais inventer ou déduire une information qui n'est pas explicitement écrite.
- Pour check_in_hour et check_out_hour : format HH:MM uniquement (ex: "15:00").
- Pour key_code : chiffres uniquement, pas de lettres.
- Pour pet_policy : uniquement "Oui", "Non" ou "Sur demande".

Exemple de réponse attendue :
{"wifi_name": "MonReseau", "wifi_password": "monmdp123", "check_in_hour": "15:00", "check_out_hour": "11:00"}`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.1,
    max_tokens: 1500,
  });

  const raw = response.choices[0].message.content.trim();

  // Nettoyage des backticks markdown si présents
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    const parsed = JSON.parse(cleaned);

    // Calcul du résumé : champs remplis vs manquants
    const filled = Object.keys(parsed).length;
    const total = Object.keys(FIELDS_TO_EXTRACT).length;
    const missing = total - filled;

    return {
      fields: parsed,
      summary: { filled, missing, total },
    };
  } catch (e) {
    console.error("Erreur parsing JSON Groq:", e, "Raw:", raw);
    return { fields: {}, summary: { filled: 0, missing: Object.keys(FIELDS_TO_EXTRACT).length, total: Object.keys(FIELDS_TO_EXTRACT).length } };
  }
}

// ── HANDLER PRINCIPAL ────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const contentType = req.headers['content-type'] || '';

    // ── CAS 1 : Texte collé (JSON body) ──────────────────────────────────
    if (contentType.includes('application/json')) {
      // bodyParser est désactivé, on lit manuellement
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const body = JSON.parse(Buffer.concat(chunks).toString());
      const text = body.text || '';

      if (!text.trim()) {
        return res.status(400).json({ error: 'Texte vide' });
      }

      const result = await analyzeWithGroq(text);
      return res.status(200).json(result);
    }

    // ── CAS 2 : Fichier uploadé (multipart/form-data) ────────────────────
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10 Mo max
      keepExtensions: true,
    });

    const [, files] = await form.parse(req);
    const file = files.file?.[0];

    if (!file) {
      return res.status(400).json({ error: 'Aucun fichier reçu' });
    }

    const ext = file.originalFilename?.split('.').pop()?.toLowerCase();
    let text = null;

    if (ext === 'pdf') {
      text = await extractPdfText(file.filepath);
    } else if (ext === 'docx') {
      text = await extractDocxText(file.filepath);
    } else if (ext === 'txt') {
      text = extractTxtText(file.filepath);
    } else {
      // Format non supporté
      return res.status(400).json({ error: `Format .${ext} non supporté. Utilisez PDF, Word (.docx) ou texte (.txt).` });
    }

    // Nettoyage du fichier temporaire
    try { fs.unlinkSync(file.filepath); } catch (_) {}

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Impossible d\'extraire le texte de ce fichier.' });
    }

    const result = await analyzeWithGroq(text);
    return res.status(200).json(result);

  } catch (error) {
    console.error("Erreur parse-document:", error);
    return res.status(500).json({ error: 'Erreur lors de l\'analyse du document.' });
  }
}
