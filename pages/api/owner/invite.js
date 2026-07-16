// pages/api/owner/invite.js
// Invite un proprietaire par email pour un logement.

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import crypto from 'crypto';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Methode non autorisee' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Non authentifie' });

  const { data: { user: host }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !host) return res.status(401).json({ error: 'Session invalide' });

  const { ownerName, ownerEmail, propertyId, commissionRate } = req.body;
  if (!ownerName || !ownerEmail || !propertyId) {
    return res.status(400).json({ error: 'ownerName, ownerEmail et propertyId requis' });
  }

  const emailNormalized = ownerEmail.toLowerCase().trim();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.alfredmajor.com';

  try {
    // 1. Verifier que le logement appartient a cet hote
    const { data: property } = await supabaseAdmin
      .from('properties')
      .select('id, name, city, owner_id')
      .eq('id', propertyId)
      .eq('owner_id', host.id)
      .single();

    if (!property) return res.status(404).json({ error: 'Logement introuvable' });

    // 2. Recuperer le profil de l'hote
    const { data: hostProfile } = await supabaseAdmin
      .from('profiles')
      .select('full_name, email')
      .eq('id', host.id)
      .single();

    // 3. Generer un token d'invitation
    const invitationToken = crypto.randomUUID();

    // 4. Creer ou recuperer le profil du proprietaire
    let ownerProfileId = null;

    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('email', emailNormalized)
      .maybeSingle();

    if (existingProfile) {
      ownerProfileId = existingProfile.id;
      await supabaseAdmin
        .from('profiles')
        .update({
          role: existingProfile.role === 'cleaner' ? existingProfile.role : 'owner',
          full_name: ownerName,
          invitation_token: invitationToken,
          invited_by: host.id,
        })
        .eq('id', existingProfile.id);
    } else {
      // Verifier si un user Auth existe deja
      const { data: authList } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      const existingAuth = authList?.users?.find(u => u.email === emailNormalized);

      if (existingAuth) {
        ownerProfileId = existingAuth.id;
      } else {
        const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: emailNormalized,
          email_confirm: true,
          user_metadata: { full_name: ownerName, role: 'owner' },
        });

        if (createError) throw createError;
        ownerProfileId = newAuthUser.user.id;
      }

      // Attendre le trigger eventuel
      await new Promise(resolve => setTimeout(resolve, 500));

      const { data: autoProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', ownerProfileId)
        .maybeSingle();

      if (autoProfile) {
        await supabaseAdmin
          .from('profiles')
          .update({
            role: 'owner',
            full_name: ownerName,
            email: emailNormalized,
            invitation_token: invitationToken,
            invited_by: host.id,
          })
          .eq('id', ownerProfileId);
      } else {
        await supabaseAdmin
          .from('profiles')
          .insert({
            id: ownerProfileId,
            full_name: ownerName,
            email: emailNormalized,
            role: 'owner',
            invitation_token: invitationToken,
            invited_by: host.id,
            active_licenses: 0,
          });
      }
    }

    // 5. Verification finale
    const { data: profileCheck } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', ownerProfileId)
      .maybeSingle();

    if (!profileCheck) {
      throw new Error('Le profil proprietaire n\'a pas pu etre cree.');
    }

    // 6. Creer la liaison property_owners
    const { error: linkError } = await supabaseAdmin
      .from('property_owners')
      .upsert({
        property_id: propertyId,
        owner_profile_id: ownerProfileId,
        invited_by: host.id,
        commission_rate: commissionRate || 20.00,
      }, { onConflict: 'property_id,owner_profile_id' });

    if (linkError) throw linkError;

    // 7. Generer le lien d'invitation
    const inviteLink = `${siteUrl}/owner/register?token=${invitationToken}&email=${encodeURIComponent(emailNormalized)}`;

    // 8. Envoyer l'email
    await resend.emails.send({
      from: 'Alfred Major <noreply@alfredmajor.com>',
      to: emailNormalized,
      subject: `🎩 ${hostProfile?.full_name || 'Un partenaire'} vous invite sur Alfred Major`,
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
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#1a2a6c;">Bonjour ${ownerName} 👋</h1>
              <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">
                <strong style="color:#1e293b;">${hostProfile?.full_name || 'Une conciergerie partenaire'}</strong> vous invite a acceder a votre espace proprietaire pour suivre la gestion de <strong style="color:#1e293b;">${property.name}${property.city ? ` — ${property.city}` : ''}</strong>.
              </p>
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:18px;margin-bottom:24px;">
                <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:0.5px;">Depuis votre espace vous pourrez</p>
                <p style="margin:0;font-size:14px;color:#166534;line-height:1.7;">
                  📅 Consulter le calendrier de vos reservations<br>
                  💰 Suivre vos revenus locatifs<br>
                  📄 Acceder aux documents partages<br>
                  🏠 Voir l'activite de votre bien en temps reel
                </p>
              </div>
              <a href="${inviteLink}" style="display:block;background:#1a2a6c;color:white;text-decoration:none;text-align:center;padding:16px;border-radius:14px;font-size:16px;font-weight:800;margin-bottom:16px;">
                Creer mon espace proprietaire →
              </a>
              <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
                Ce lien est valable 7 jours. Si vous n'attendiez pas cet email, ignorez-le.
              </p>
            </div>
            <p style="text-align:center;font-size:12px;color:#cbd5e1;margin-top:24px;">
              🎩 Alfred Major
            </p>
          </div>
        </body>
        </html>
      `,
    });

    return res.status(200).json({ success: true, ownerProfileId });
  } catch (error) {
    console.error('Erreur invite owner:', error);
    return res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
}
