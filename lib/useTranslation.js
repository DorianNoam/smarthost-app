// lib/useTranslation.js
// Hook pour récupérer les traductions selon la locale active Next.js

import { useRouter } from 'next/router';
import fr from '../locales/fr';
import en from '../locales/en';
import es from '../locales/es';

const translations = { fr, en, es };

export function useTranslation() {
  const router = useRouter();
  const locale = router.locale || 'fr';
  const t = translations[locale] || translations['fr'];
  return { t, locale };
}
