// pages/api/lead.js
//
// Route API Next.js — reçoit le formulaire de /guida et :
//  1. Ajoute le contact à ta liste Brevo (et déclenche l'automation
//     "Guida Estiva" configurée dans Brevo qui envoie le PDF)
//  2. Sauvegarde le lead localement dans rapports/leads.json pour que
//     le dashboard Alfred Major puisse l'afficher
//
// ── CONFIGURATION ──
// Dans ton fichier .env.local (jamais commité sur GitHub) :
//   BREVO_API_KEY=xkeysib-xxxxxxxxxxxx
//   BREVO_LIST_ID=2          ← l'ID de ta liste "Leads Guida Estiva" dans Brevo
//
// Comment trouver ton BREVO_LIST_ID :
//   Brevo → Contacts → Listes → clique sur ta liste → l'ID est dans l'URL
//
// Comment créer l'automation Brevo qui envoie le PDF :
//   Brevo → Automatisations → Créer un workflow
//   Déclencheur : "Contact ajouté à la liste [ta liste]"
//   Action : Envoyer un email avec le PDF en pièce jointe (ou lien de téléchargement)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nome, email, utm } = req.body;

  if (!nome || !email) {
    return res.status(400).json({ error: 'Nome ed email sono obbligatori' });
  }

  // Validation basique du format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Email non valida' });
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const BREVO_LIST_ID = process.env.BREVO_LIST_ID;

  if (!BREVO_API_KEY || !BREVO_LIST_ID) {
    console.error('BREVO_API_KEY ou BREVO_LIST_ID manquant dans .env.local');
    return res.status(500).json({ error: 'Configuration serveur incomplète' });
  }

  try {
    // ── 1. Ajout du contact à Brevo ──
    const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        email: email,
        attributes: {
          NOME: nome,
          UTM_SOURCE: utm?.source || '',
          UTM_MEDIUM: utm?.medium || '',
          UTM_CAMPAIGN: utm?.campaign || '',
          UTM_CONTENT: utm?.content || '',
          SIGNUP_DATE: new Date().toISOString(),
        },
        listIds: [parseInt(BREVO_LIST_ID, 10)],
        updateEnabled: true, // si le contact existe déjà, on met juste à jour
      }),
    });

    // Brevo renvoie 201 (créé) ou 204 (déjà existant, mis à jour)
    if (!brevoRes.ok && brevoRes.status !== 400) {
      const errText = await brevoRes.text();
      console.error('Erreur Brevo:', brevoRes.status, errText);
      return res.status(502).json({ error: 'Erreur lors de l\'inscription' });
    }

    // Si 400, c'est probablement "contact already exists" → on continue quand même
    // (Brevo renvoie parfois 400 même avec updateEnabled selon config du compte)

    // ── 2. Log local pour le dashboard ──
    // Note : sur Vercel/serverless, le système de fichiers est éphémère.
    // Si tu déploies sur Vercel, remplace cette partie par un appel à une
    // base de données (Supabase, Airtable...) ou ignore cette étape :
    // Brevo reste ta source de vérité pour la liste de leads.
    try {
      const fs = require('fs');
      const path = require('path');
      const logPath = path.join(process.cwd(), 'rapports', 'leads.json');

      let leads = [];
      if (fs.existsSync(logPath)) {
        leads = JSON.parse(fs.readFileSync(logPath, 'utf-8'));
      }

      leads.push({
        nome,
        email,
        utm,
        date: new Date().toISOString(),
      });

      fs.mkdirSync(path.dirname(logPath), { recursive: true });
      fs.writeFileSync(logPath, JSON.stringify(leads, null, 2));
    } catch (logErr) {
      // Non bloquant : si le log local échoue, le lead est déjà dans Brevo
      console.warn('Impossible d\'écrire rapports/leads.json:', logErr.message);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Erreur route /api/lead:', err);
    return res.status(500).json({ error: 'Errore del server' });
  }
}
