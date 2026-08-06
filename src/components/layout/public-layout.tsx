import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/types';
import styles from './public-layout.module.scss';

interface PublicLayoutProps {
  children: React.ReactNode;
  locale: Locale;
  user?: {
    id: string;
    email?: string;
    role?: string;
  } | null;
}

export async function PublicLayout({ children, locale, user }: PublicLayoutProps) {
  const t = await getTranslations();
  
  return (
    <div className={styles.layout}>
      <a href="#main-content" className="skip-link">
        {t('accessibility.skipToContent')}
      </a>
      
      <Header locale={locale} user={user} />
      
      <main id="main-content" className={styles.main}>
        {children}
      </main>
      
      <Footer locale={locale} />
    </div>
  );
}

async function Header({
  locale,
  user,
}: {
  locale: Locale;
  user?: { id: string; email?: string; role?: string } | null;
}) {
  const t = await getTranslations();
  
  return (
    <header className={`navbar navbar-expand-lg navbar-empire ${styles.header}`}>
      <div className="container">
        <Link href={`/${locale}`} className="navbar-brand">
          <span className="neon-text fw-bold">{t('brand.name').toUpperCase()}</span>
        </Link>
        
        <button 
          className="navbar-toggler border-0" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        
        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav ms-auto me-3">
            <li className="nav-item">
              <Link href={`/${locale}`} className="nav-link">{t('nav.home')}</Link>
            </li>
            <li className="nav-item dropdown">
              <a 
                className="nav-link dropdown-toggle" 
                href="#" 
                role="button" 
                data-bs-toggle="dropdown"
              >
                {t('nav.restaurant')}
              </a>
              <ul className="dropdown-menu">
                <li>
                  <Link href={`/${locale}/restaurant`} className="dropdown-item">
                    {t('nav.restaurant')}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/restaurant/menu`} className="dropdown-item">
                    {t('nav.menu')}
                  </Link>
                </li>
              </ul>
            </li>
            <li className="nav-item">
              <Link href={`/${locale}/events`} className="nav-link">{t('nav.events')}</Link>
            </li>
            <li className="nav-item">
              <Link href={`/${locale}/contact`} className="nav-link">{t('nav.contact')}</Link>
            </li>
          </ul>
          
          <div className="d-flex align-items-center gap-2">
            <Link href={`/${locale === 'en' ? 'fr' : 'en'}`} className="btn btn-sm btn-outline-secondary">
              {locale === 'en' ? 'FR' : 'EN'}
            </Link>
            
            {user ? (
              <div className="dropdown">
                <button 
                  className="btn btn-empire-primary dropdown-toggle" 
                  type="button" 
                  data-bs-toggle="dropdown"
                >
                  <i className="bi bi-person-circle me-1" />
                  {user.role === 'super_admin' || user.role === 'restaurant_manager' || user.role === 'club_manager' 
                    ? t('nav.admin') 
                    : t('nav.dashboard')
                  }
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link href={`/${locale}/dashboard`} className="dropdown-item">
                      {t('nav.dashboard')}
                    </Link>
                  </li>
                  {(user.role === 'super_admin' || user.role === 'restaurant_manager' || user.role === 'club_manager') && (
                    <li>
                      <Link href={`/${locale}/admin`} className="dropdown-item">
                        {t('nav.admin')}
                      </Link>
                    </li>
                  )}
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link href={`/${locale}/auth/sign-out`} className="dropdown-item">
                      {t('nav.signOut')}
                    </Link>
                  </li>
                </ul>
              </div>
            ) : (
              <>
                <Link href={`/${locale}/auth/sign-in`} className="btn btn-outline-secondary">
                  {t('nav.signIn')}
                </Link>
                <Link href={`/${locale}/auth/sign-up`} className="btn btn-empire-primary">
                  {t('nav.signUp')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

async function Footer({ locale }: { locale: Locale }) {
  const t = await getTranslations();
  
  return (
    <footer className={`footer-empire ${styles.footer}`}>
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4">
            <h5 className="footer-brand mb-3">{t('brand.name')}</h5>
            <p className="text-muted small">
              {t('brand.tagline')}<br />
              Sappa Road, Opposite Limbe Community Field, Limbe, Cameroon.
            </p>
          </div>
          
          <div className="col-lg-2 col-md-4">
            <h6 className="text-uppercase fw-bold mb-3">Navigation</h6>
            <ul className="list-unstyled footer-links">
              <li><Link href={`/${locale}`}>{t('nav.home')}</Link></li>
              <li><Link href={`/${locale}/restaurant`}>{t('nav.restaurant')}</Link></li>
              <li><Link href={`/${locale}/events`}>{t('nav.events')}</Link></li>
              <li><Link href={`/${locale}/contact`}>{t('nav.contact')}</Link></li>
            </ul>
          </div>
          
          <div className="col-lg-2 col-md-4">
            <h6 className="text-uppercase fw-bold mb-3">{t('footer.hours')}</h6>
            <ul className="list-unstyled text-muted small">
              <li>Restaurant: 8:00 - 17:30</li>
              <li>Night Club: 20:00 - 06:00</li>
            </ul>
          </div>
          
          <div className="col-lg-4 col-md-4">
            <h6 className="text-uppercase fw-bold mb-3">{t('footer.followUs')}</h6>
            <div className="d-flex gap-3">
              <a href="#" className="text-secondary fs-5" aria-label="Facebook">
                <i className="bi bi-facebook" />
              </a>
              <a href="#" className="text-secondary fs-5" aria-label="Instagram">
                <i className="bi bi-instagram" />
              </a>
              <a href="#" className="text-secondary fs-5" aria-label="Twitter">
                <i className="bi bi-twitter-x" />
              </a>
              <a href="#" className="text-secondary fs-5" aria-label="WhatsApp">
                <i className="bi bi-whatsapp" />
              </a>
            </div>
            
            <div className="mt-3">
              <a href="tel:+237600000000" className="text-muted small d-block">
                <i className="bi bi-telephone me-2" />
                +237 6 00 00 00 00
              </a>
              <a href="mailto:info@empire-lounge.com" className="text-muted small d-block">
                <i className="bi bi-envelope me-2" />
                info@empire-lounge.com
              </a>
            </div>
          </div>
        </div>
        
        <hr className="my-4" style={{ borderColor: 'rgba(0, 240, 255, 0.1)' }} />
        
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
          <p className="text-muted small mb-2 mb-md-0">
            © {new Date().getFullYear()} {t('brand.name')}. {t('footer.rights')}
          </p>
          <div className="d-flex gap-3">
            <Link href={`/${locale}/privacy`} className="text-muted small">
              {t('footer.privacy')}
            </Link>
            <Link href={`/${locale}/terms`} className="text-muted small">
              {t('footer.terms')}
            </Link>
            <Link href={`/${locale}/refund-policy`} className="text-muted small">
              {t('footer.refund')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
