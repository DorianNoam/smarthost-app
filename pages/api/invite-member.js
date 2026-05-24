// pages/api/invite-member.js
// Crée un enregistrement team_member et envoie un email d'invitation

import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_HOST,
  port: parseInt(process.env.EMAIL_SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const ROLE_LABELS = {
  manager: 'Gestionnaire',
  operator: "Opérateur d'urgence",
};

const ROLE_DESCRIPTIONS = {
  manager: 'Vous pourrez gérer les logements qui vous sont assignés, consulter les conversations voyageurs et modifier les configurations.',
  operator: 'Vous recevrez les alertes urgences (Telegram / notification push) pour les logements qui vous sont assignés.',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { invited_email, role, property_ids, owner_id } = req.body;

  // ── Validation ──────────────────────────────────────────
  if (!invited_email || !owner_id) {
    return res.status(400).json({ error: 'Email et owner_id requis' });
  }
  if (!['manager', 'operator'].includes(role)) {
    return res.status(400).json({ error: 'Rôle invalide' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(invited_email)) {
    return res.status(400).json({ error: 'Email invalide' });
  }

  try {
    // ── Récupérer le profil du propriétaire ──────────────
    const { data: ownerProfile, error: ownerError } = await supabaseAdmin
      .from('profiles')
      .select('full_name, email')
      .eq('id', owner_id)
      .single();

    if (ownerError || !ownerProfile) {
      return res.status(404).json({ error: 'Propriétaire introuvable' });
    }

    // ── Vérifier si une invitation existe déjà ──────────
    const { data: existing } = await supabaseAdmin
      .from('team_members')
      .select('id, status')
      .eq('account_owner_id', owner_id)
      .eq('invited_email', invited_email.toLowerCase())
      .single();

    if (existing && existing.status === 'active') {
      return res.status(409).json({ error: 'Ce membre est déjà actif dans votre équipe.' });
    }

    // ── Créer ou mettre à jour l'entrée team_member ──────
    let memberId;
    if (existing) {
      // Renvoi de l'invitation
      const { data: updated, error: updateError } = await supabaseAdmin
        .from('team_members')
        .update({
          role,
          property_ids: property_ids?.length ? property_ids : null,
          status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (updateError) throw updateError;
      memberId = updated.id;
    } else {
      const { data: newMember, error: insertError } = await supabaseAdmin
        .from('team_members')
        .insert({
          account_owner_id: owner_id,
          invited_email: invited_email.toLowerCase(),
          role,
          property_ids: property_ids?.length ? property_ids : null,
          status: 'pending',
        })
        .select()
        .single();

      if (insertError) throw insertError;
      memberId = newMember.id;
    }

    // ── Construire le lien d'activation ─────────────────
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.alfredmajor.com';
    const activationLink = `${siteUrl}/register?invite=${memberId}&email=${encodeURIComponent(invited_email)}`;

    const ownerName = ownerProfile.full_name || 'Un hôte Alfred Major';
    const roleLabel = ROLE_LABELS[role] || role;
    const roleDesc = ROLE_DESCRIPTIONS[role] || '';

    // ── Envoi de l'email d'invitation ────────────────────
    await transporter.sendMail({
      from: `"Alfred Major 🎩" <${process.env.EMAIL_USER}>`,
      to: invited_email,
      subject: `${ownerName} vous invite à rejoindre son équipe Alfred Major 🎩`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Inter',sans-serif;">
  <div style="max-width:600px;margin:20px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <div style="background:#1a2a6c;padding:30px;text-align:center;">
      <div style="font-size:32px;margin-bottom:8px;">🎩</div>
      <span style="color:white;font-size:24px;font-weight:900;">Alfred</span>
      <span style="color:#d4af37;font-size:24px;font-weight:900;">Major</span>
      <div style="color:rgba(255,255,255,0.6);font-size:13px;margin-top:6px;font-style:italic;">Le majordome IA pour la location courte durée</div>
    </div>

    <!-- Corps -->
    <div style="padding:36px 40px;">
      <p style="color:#1e293b;font-size:16px;line-height:1.7;margin:0 0 20px;">
        Bonjour,
      </p>

      <p style="color:#1e293b;font-size:16px;line-height:1.7;margin:0 0 20px;">
        <strong>${ownerName}</strong> vous invite à rejoindre son équipe sur <strong>Alfred Major</strong> 
        en tant que <strong style="color:#1a2a6c;">${roleLabel}</strong>.
      </p>

      <!-- Badge rôle -->
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
        <div style="font-size:14px;font-weight:800;color:#1a2a6c;margin-bottom:6px;">
          🔑 Votre rôle : ${roleLabel}
        </div>
        <div style="font-size:14px;color:#64748b;line-height:1.6;">
          ${roleDesc}
        </div>
      </div>

      <p style="color:#1e293b;font-size:16px;line-height:1.7;margin:0 0 28px;">
        Cliquez sur le bouton ci-dessous pour accepter l'invitation et créer votre compte 
        (ou vous connecter si vous en avez déjà un).
      </p>

      <!-- CTA -->
      <div style="text-align:center;margin:32px 0;">
        <a href="${activationLink}" 
           style="background:#d4af37;color:#1a2a6c;padding:16px 36px;border-radius:30px;text-decoration:none;font-weight:900;font-size:16px;display:inline-block;">
          ✅ Accepter l'invitation →
        </a>
      </div>

      <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:0 0 20px;text-align:center;">
        Ce lien est valable 7 jours. Si vous ne souhaitez pas rejoindre cette équipe, ignorez cet email.
      </p>

      <p style="color:#1e293b;font-size:15px;margin:0;">
        Cordialement,<br>
        <strong>L'équipe Alfred Major</strong><br>
        <a href="https://www.alfredmajor.com" style="color:#1a2a6c;font-size:13px;">www.alfredmajor.com</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;padding:20px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="color:#94a3b8;font-size:12px;margin:0;">
        Vous recevez cet email car <strong>${ownerName}</strong> vous a invité sur Alfred Major.<br>
        Si c'est une erreur, ignorez simplement cet email.
      </p>
    </div>

  </div>
</body>
</html>
      `,
    });

    return res.status(200).json({ success: true, member_id: memberId });

  } catch (error) {
    console.error('Erreur invite-member:', error);
    return res.status(500).json({ error: error.message });
  }
}
