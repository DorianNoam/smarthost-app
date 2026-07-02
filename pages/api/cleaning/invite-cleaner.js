// pages/api/cleaning/invite-cleaner.js
// L'hôte invite un prestataire de ménage.
// Crée le profil cleaner dans Supabase + envoie email d'invitation via Resend.
// CORRECTIF : gestion du provider existant sans email + vérification profil avant FK.

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import crypto from 'crypto';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Non authentifié' });

  const { data: { user: host }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !host) return res.status(401).json({ error: 'Session invalide' });

  const { cleanerName, cleanerEmail, propertyId } = req.body;
  if (!cleanerName || !cleanerEmail || !propertyId) {
    return res.status(400).json({ error: 'cleanerName, cleanerEmail et propertyId sont requis' });
  }

  const emailNormalized = cleanerEmail.toLowerCase().trim();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.alfredmajor.com';

  try {
    // 1. Récupérer le logement
    const { data: property, error: propertyError } = await supabaseAdmin
      .from('properties')
      .select('name, city')
      .eq('id', propertyId)
      .eq('owner_id', host.id)
      .single();

    if (propertyError || !property) return res.status(404).json({ error: 'Logement introuvable' });

    // 2. Récupérer le profil de l'hôte
    const { data: hostProfile } = await supabaseAdmin
      .from('profiles')
      .select('full_name, email')
      .eq('id', host.id)
      .single();

    // 3. Générer un token d'invitation unique
    const invitationToken = crypto.randomUUID();

    // 4. Créer ou récupérer le compte cleaner (Auth + Profile)
    let cleanerProfileId = null;

    // Vérifier si un profil existe déjà avec cet email
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('email', emailNormalized)
      .maybeSingle();

    if (existingProfile) {
      // Le profil existe — mettre à jour en rôle cleaner
      cleanerProfileId = existingProfile.id;
      await supabaseAdmin
        .from('profiles')
        .update({
          role: 'cleaner',
          full_name: cleanerName,
          invited_by: host.id,
          invitation_token: invitationToken,
        })
        .eq('id', existingProfile.id);
    } else {
      // Pas de profil → vérifier si un Auth user existe déjà
      const { data: authList } = await supabaseAdmin.auth.admin.listUsers();
      const existingAuth = authList?.users?.find(u => u.email === emailNormalized);

      if (existingAuth) {
        cleanerProfileId = existingAuth.id;
      } else {
        // Créer le user Auth
        const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: emailNormalized,
          email_confirm: true,
          user_metadata: { full_name: cleanerName, role: 'cleaner' },
        });

        if (createError) throw createError;
        if (!newAuthUser?.user) throw new Error("Impossible de créer le compte");
        cleanerProfileId = newAuthUser.user.id;
      }

      // Attendre un court instant pour laisser le trigger éventuel s'exécuter
      await new Promise(resolve => setTimeout(resolve, 500));

      // Vérifier si le profil a été créé par un trigger
      const { data: autoProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', cleanerProfileId)
        .maybeSingle();

      if (autoProfile) {
        // Le trigger a créé le profil — on met à jour
        await supabaseAdmin
          .from('profiles')
          .update({
            role: 'cleaner',
            full_name: cleanerName,
            email: emailNormalized,
            invited_by: host.id,
            invitation_token: invitationToken,
          })
          .eq('id', cleanerProfileId);
      } else {
        // Pas de trigger — créer le profil manuellement
        const { error: insertProfileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: cleanerProfileId,
            full_name: cleanerName,
            email: emailNormalized,
            role: 'cleaner',
            invited_by: host.id,
            invitation_token: invitationToken,
            active_licenses: 0,
          });

        if (insertProfileError) throw insertProfileError;
      }
    }

    // 5. Vérification finale : le profil DOIT exister avant de toucher cleaning_providers
    const { data: profileCheck } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', cleanerProfileId)
      .maybeSingle();

    if (!profileCheck) {
      throw new Error('Le profil prestataire n\'a pas pu être créé. Veuillez réessayer.');
    }

    // 6. Créer ou mettre à jour le prestataire dans cleaning_providers
    // Chercher d'abord par email, puis par owner_id + logement (provider existant sans email)
    let providerId = null;

    const { data: providerByEmail } = await supabaseAdmin
      .from('cleaning_providers')
      .select('id')
      .eq('email', emailNormalized)
      .eq('owner_id', host.id)
      .maybeSingle();

    if (providerByEmail) {
      providerId = providerByEmail.id;
      await supabaseAdmin
        .from('cleaning_providers')
        .update({ name: cleanerName, profile_id: cleanerProfileId })
        .eq('id', providerId);
    } else {
      // Chercher un provider existant sans email (créé manuellement via le dashboard)
      const { data: existingAssignment } = await supabaseAdmin
        .from('property_cleaning')
        .select('provider_id')
        .eq('property_id', propertyId)
        .maybeSingle();

      if (existingAssignment?.provider_id) {
        // Il y a déjà un provider assigné à ce logement — le mettre à jour
        providerId = existingAssignment.provider_id;
        await supabaseAdmin
          .from('cleaning_providers')
          .update({
            name: cleanerName,
            email: emailNormalized,
            profile_id: cleanerProfileId,
          })
          .eq('id', providerId);
      } else {
        // Aucun provider existant — en créer un nouveau
        const { data: newProvider, error: newProviderError } = await supabaseAdmin
          .from('cleaning_providers')
          .insert({
            owner_id: host.id,
            name: cleanerName,
            email: emailNormalized,
            profile_id: cleanerProfileId,
          })
          .select()
          .single();

        if (newProviderError) throw newProviderError;
        providerId = newProvider.id;
      }
    }

    // 7. Assigner le prestataire au logement
    const { error: assignError } = await supabaseAdmin
      .from('property_cleaning')
      .upsert({
        property_id: propertyId,
        provider_id: providerId,
      }, { onConflict: 'property_id' });

    if (assignError) throw assignError;

    // 8. Générer le lien d'invitation
    const inviteLink = `${siteUrl}/cleaner/register?token=${invitationToken}&email=${encodeURIComponent(emailNormalized)}`;

    // 9. Envoyer l'email d'invitation via Resend
    await resend.emails.send({
      from: 'Alfred Major <noreply@alfredmajor.com>',
      to: emailNormalized,
      subject: `🎩 ${hostProfile?.full_name || 'Un hôte'} vous invite sur Alfred Major`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#f8fafc;font-family:'Inter',Arial,sans-serif;">
          <div style="max-width:560px;margin:40px auto;padding:0 20px;">

            <div style="text-align:center;margin-bottom:32px;">
              <div style="font-size:48px;margin-bottom:8px;">🎩</div>
              <div style="font-size:22px;font-weight:900;color:#1a2a6c;">Alfred<span style="color:#d4af37;">Major</span></div>
            </div>

            <div style="background:white;border-radius:24px;padding:36px;border:1px solid #e2e8f0;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#1a2a6c;">Bonjour ${cleanerName} 👋</h1>
              <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">
                <strong style="color:#1e293b;">${hostProfile?.full_name || 'Un propriétaire'}</strong> vous invite a gerer les menages de son logement <strong style="color:#1e293b;">${property.name}${property.city ? ` — ${property.city}` : ''}</strong> via Alfred Major.
              </p>

              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:18px;margin-bottom:24px;">
                <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:0.5px;">Ce que vous pourrez faire</p>
                <p style="margin:0;font-size:14px;color:#166534;line-height:1.7;">
                  ✅ Consulter votre planning de menages<br>
                  📋 Suivre les checklists par logement<br>
                  📸 Confirmer les menages avec photos<br>
                  🔔 Recevoir des rappels par email
                </p>
              </div>

              <a href="${inviteLink}" style="display:block;background:#1a2a6c;color:white;text-decoration:none;text-align:center;padding:16px;border-radius:14px;font-size:16px;font-weight:800;margin-bottom:16px;">
                Creer mon compte prestataire →
              </a>

              <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
                Ce lien est valable 7 jours. Si vous n'attendiez pas cet email, ignorez-le.
              </p>
            </div>

            <p style="text-align:center;font-size:12px;color:#cbd5e1;margin-top:24px;">
              🎩 Alfred Major — L'excellence du service, a portee de clic
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
