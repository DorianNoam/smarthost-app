import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { email } = req.query;

  if (!email) {
    return res.status(400).send('Email manquant');
  }

  try {
    await supabaseAdmin
      .from('prospects')
      .update({ status: 'unsubscribed' })
      .eq('email', decodeURIComponent(email));

    // Page de confirmation simple
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Désabonnement — Alfred Major</title>
      </head>
      <body style="font-family:sans-serif;text-align:center;padding:60px;background:#f8fafc;">
        <div style="max-width:400px;margin:0 auto;background:white;border-radius:12px;padding:40px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          <div style="font-size:40px;margin-bottom:16px;">✅</div>
          <h2 style="color:#1a2a6c;margin:0 0 12px;">Désabonnement confirmé</h2>
          <p style="color:#64748b;font-size:15px;line-height:1.6;">
            Vous avez bien été retiré de notre liste de contacts.<br>
            Vous ne recevrez plus d'emails de notre part.
          </p>
          <div style="margin-top:24px;font-size:13px;color:#94a3b8;">
            🎩 Alfred Major
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    return res.status(500).send('Erreur lors du désabonnement');
  }
}
