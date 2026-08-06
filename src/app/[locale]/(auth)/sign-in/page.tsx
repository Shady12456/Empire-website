import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { SignInForm } from './sign-in-form';
import type { Locale } from '@/types';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.signIn');
  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default async function SignInPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth.signIn' });
  
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="empire-card p-4 p-md-5">
              <div className="text-center mb-4">
                <h1 className="h3 mb-2">
                  <span className="neon-text">EMPIRE</span>
                </h1>
                <h2 className="h4 text-muted">{t('title')}</h2>
                <p className="text-muted small">{t('subtitle')}</p>
              </div>
              
              <SignInForm locale={locale as Locale} />
              
              <div className="text-center mt-4">
                <p className="text-muted mb-2">
                  {t('noAccount')}{' '}
                  <Link href={`/${locale}/auth/sign-up`} className="text-secondary">
                    {t('signUp')}
                  </Link>
                </p>
                <Link href={`/${locale}/auth/forgot-password`} className="text-muted small">
                  {t('forgotPassword')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
