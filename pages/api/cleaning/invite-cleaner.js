// pages/api/cleaning/invite-cleaner.js
// L'hôte invite un prestataire de ménage.
// Crée le profil cleaner dans Supabase + envoie email d'invitation via Resend.

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  // Vérifier la session de l'hôte
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Non authentifié' });

  const { data: { user: host }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !host) return res.status(401).json({ error: 'Session invalide' });

  const { cleanerName, cleanerEmail, propertyId } = req.body;
  if (!cleanerName || !cleanerEmail || !propertyId) {
    return res.status(400).json({ error: 'cleanerName, cleanerEmail et propertyId sont requis' });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.alfredmajor.com';

  try {
    // 1. Récupérer le logement pour l'afficher dans l'email
    const { data: property } = await supabaseAdmin
      .from('properties')
      .select('name, city')
      .eq('id', propertyId)
      .eq('owner_id', host.id)
      .single();

    if (!property) return res.status(404).json({ error: 'Logement introuvable' });

    // 2. Récupérer le profil de l'hôte
    const { data: hostProfile } = await supabaseAdmin
      .from('profiles')
      .select('full_name, email')
      .eq('id', host.id)
      .single();

    // 3. Générer un token d'invitation unique
    const invitationToken = crypto.randomUUID();

    // 4. Vérifier si un compte cleaner existe déjà avec cet email
    const { data: existingUser } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('email', cleanerEmail.toLowerCase())
      .maybeSingle();

    let cleanerProfileId;

    if (existingUser) {
      // Le compte existe déjà — mettre à jour le token et le rôle
      cleanerProfileId = existingUser.id;
      await supabaseAdmin
        .from('profiles')
        .update({
          role: 'cleaner',
          invited_by: host.id,
          invitation_token: invitationToken,
        })
        .eq('id', existingUser.id);
    } else {
      // Créer un compte Supabase Auth pour le cleaner
      const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: cleanerEmail.toLowerCase(),
        email_confirm: true, // Pas besoin de confirmation email (on envoie notre propre lien)
        user_metadata: { full_name: cleanerName, role: 'cleaner' },
      });

      if (createError) throw createError;

      cleanerProfileId = newAuthUser.user.id;

      // Créer le profil cleaner
      await supabaseAdmin.from('profiles').upsert({
        id: cleanerProfileId,
        full_name: cleanerName,
        email: cleanerEmail.toLowerCase(),
        role: 'cleaner',
        invited_by: host.id,
        invitation_token: invitationToken,
        active_licenses: 0,
      }, { onConflict: 'id' });
    }

    // 5. Créer ou mettre à jour le prestataire dans cleaning_providers
    const { data: existingProvider } = await supabaseAdmin
      .from('cleaning_providers')
      .select('id')
      .eq('email', cleanerEmail.toLowerCase())
      .eq('owner_id', host.id)
      .maybeSingle();

    let providerId;

    if (existingProvider) {
      providerId = existingProvider.id;
      await supabaseAdmin
        .from('cleaning_providers')
        .update({ name: cleanerName, profile_id: cleanerProfileId })
        .eq('id', providerId);
    } else {
      const { data: newProvider } = await supabaseAdmin
        .from('cleaning_providers')
        .insert({
          owner_id: host.id,
          name: cleanerName,
          email: cleanerEmail.toLowerCase(),
          profile_id: cleanerProfileId,
        })
        .select()
        .single();
      providerId = newProvider.id;
    }

    // 6. Assigner le prestataire au logement
    await supabaseAdmin
      .from('property_cleaning')
      .upsert({
        property_id: propertyId,
        provider_id: providerId,
      }, { onConflict: 'property_id' });

    // 7. Générer le lien d'invitation
    const inviteLink = `${siteUrl}/cleaner/register?token=${invitationToken}&email=${encodeURIComponent(cleanerEmail)}`;

    // 8. Envoyer l'email d'invitation via Resend
    await resend.emails.send({
      from: 'Alfred Major <noreply@alfredmajor.com>',
      to: cleanerEmail,
      subject: `🎩 ${hostProfile?.full_name || 'Un hôte'} vous invite sur Alfred Major`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#f8fafc;font-family:'Inter',Arial,sans-serif;">
          <div style="max-width:560px;margin:40px auto;padding:0 20px;">

            <!-- Header -->
            <div style="text-align:center;margin-bottom:32px;">
              <div style="font-size:48px;margin-bottom:8px;">🎩</div>
              <div style="font-size:22px;font-weight:900;color:#1a2a6c;">Alfred<span style="color:#d4af37;">Major</span></div>
            </div>

            <!-- Card -->
            <div style="background:white;border-radius:24px;padding:36px;border:1px solid #e2e8f0;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#1a2a6c;">Bonjour ${cleanerName} 👋</h1>
              <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">
                <strong style="color:#1e293b;">${hostProfile?.full_name || 'Un propriétaire'}</strong> vous invite à gérer les ménages de son logement <strong style="color:#1e293b;">${property.name}${property.city ? ` — ${property.city}` : ''}</strong> via Alfred Major.
              </p>

              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:18px;margin-bottom:24px;">
                <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:0.5px;">Ce que vous pourrez faire</p>
                <p style="margin:0;font-size:14px;color:#166534;line-height:1.7;">
                  ✅ Consulter votre planning de ménages<br>
                  📋 Suivre les checklists par logement<br>
                  📸 Confirmer les ménages avec photos<br>
                  🔔 Recevoir des rappels par email
                </p>
              </div>

              <a href="${inviteLink}" style="display:block;background:#1a2a6c;color:white;text-decoration:none;text-align:center;padding:16px;border-radius:14px;font-size:16px;font-weight:800;margin-bottom:16px;">
                Créer mon compte prestataire →
              </a>

              <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
                Ce lien est valable 7 jours. Si vous n'attendiez pas cet email, ignorez-le.
              </p>
            </div>

            <!-- Footer -->
            <p style="text-align:center;font-size:12px;color:#cbd5e1;margin-top:24px;">
              🎩 Alfred Major — L'excellence du service, à portée de clic
            </p>
          </div>
        </body>
        </html>
      `,
    });

    return res.status(200).json({ success: true, providerId, cleanerProfileId });

  } catch (error) {
    console.error('Erreur invite-cleaner:', error);
    return res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
}
