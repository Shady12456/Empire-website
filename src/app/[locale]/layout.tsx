import { Suspense } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { createClient } from '@/lib/supabase/client';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  return (
    <NextIntlClientProvider locale={locale}>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </NextIntlClientProvider>
  );
}

function PageLoader() {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">Loading...</p>
      </div>
    </div>
  );
}
