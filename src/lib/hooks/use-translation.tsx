'use client';

import { useTranslations as useNextIntlTranslations } from 'next-intl';

export function useTranslation(namespace?: string) {
  const t = useNextIntlTranslations(namespace || 'common');
  
  return {
    t,
    locale: 'en' // This will be provided by NextIntlClientProvider
  };
}
