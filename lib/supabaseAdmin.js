// Client Supabase ADMIN — service_role.
// ⚠️ À IMPORTER UNIQUEMENT DEPUIS DES API ROUTES (pages/api/*) OU DU CODE SERVEUR.
// ⚠️ NE JAMAIS importer depuis un composant front, une page, ou un useEffect.
// La clé service_role bypass TOUTES les RLS — son exposition côté navigateur serait une faille critique.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('⚠️ SUPABASE_SERVICE_ROLE_KEY est manquante dans les variables d\'environnement');
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
