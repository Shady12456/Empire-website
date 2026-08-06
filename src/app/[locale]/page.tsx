import { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { RestaurantStatus } from '@/components/features/restaurant/restaurant-status';
import { EventCard } from '@/components/features/events/event-card';
import styles from './page.module.scss';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'brand' });
  
  return {
    title: t('tagline'),
    description: 'Experience the perfect blend of daytime culinary excellence and nighttime entertainment at Empire Lounge in Limbe, Cameroon.',
    alternates: {
      canonical: '/',
      languages: {
        'en': '/en',
        'fr': '/fr',
      },
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  const supabase = await createClient();

  // Fetch featured events
  const { data: featuredEvents } = await supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .eq('is_featured', true)
    .gte('start_at', new Date().toISOString())
    .order('start_at', { ascending: true })
    .limit(3);

  // Fetch featured menu items
  const { data: featuredItems } = await supabase
    .from('menu_items')
    .select('*')
    .eq('is_available', true)
    .eq('is_featured', true)
    .order('display_order', { ascending: true })
    .limit(4);

  // Cast to any to avoid type inference issues
  const typedEvents = (featuredEvents || []) as any[];
  const typedItems = (featuredItems || []) as any[];

  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <div className={styles.heroOverlay} />
        </div>
        <div className="container">
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              <span className="neon-text">{t('brand.name')}</span>
            </h1>
            <p className={styles.heroSubtitle}>
              {t('home.hero.subtitle')}
            </p>
            <div className={styles.heroActions}>
              <Link href={`/${locale}/restaurant/menu`} className="btn btn-empire-primary btn-lg me-3">
                {t('home.hero.orderNow')}
              </Link>
              <Link href={`/${locale}/events`} className="btn btn-empire-outline btn-lg">
                {t('home.hero.viewEvents')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Restaurant Section */}
      <section className={`${styles.section} ${styles.sectionRestaurant}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {t('home.restaurant.title')}
            </h2>
            <p className={styles.sectionSubtitle}>
              {t('home.restaurant.subtitle')}
            </p>
          </div>

          <RestaurantStatus locale={locale} />

          {typedItems.length > 0 && (
            <div className={styles.featuredGrid}>
              <h3 className={styles.featuredTitle}>
                {t('home.restaurant.featured')}
              </h3>
              <div className="row g-4">
                {typedItems.map((item: any) => (
                  <div key={item.id} className="col-md-6 col-lg-3">
                    <div className="empire-card h-100">
                      {item.image_path && (
                        <div className={styles.cardImage}>
                          <img src={item.image_path} alt={locale === 'fr' ? item.name_fr : item.name_en} />
                        </div>
                      )}
                      <div className="card-body">
                        <h5 className="card-title">
                          {locale === 'fr' ? item.name_fr : item.name_en}
                        </h5>
                        <p className="card-text text-muted small">
                          {(locale === 'fr' ? item.description_fr : item.description_en)?.substring(0, 80)}...
                        </p>
                        <div className={styles.cardFooter}>
                          <span className={styles.price}>
                            {item.price_xaf.toLocaleString()} XAF
                          </span>
                          <Link
                            href={`/${locale}/restaurant/menu`}
                            className="btn btn-sm btn-empire-secondary"
                          >
                            {t('home.restaurant.viewMenu')}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.sectionAction}>
            <Link href={`/${locale}/restaurant/menu`} className="btn btn-empire-secondary btn-lg">
              {t('home.restaurant.viewMenu')}
            </Link>
          </div>
        </div>
      </section>

      {/* Club Section */}
      <section className={`${styles.section} ${styles.sectionClub}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={`${styles.sectionTitle} neon-text`}>
              {t('home.club.title')}
            </h2>
            <p className={styles.sectionSubtitle}>
              {t('home.club.subtitle')}
            </p>
          </div>

          {typedEvents.length > 0 ? (
            <div className="row g-4 mb-5">
              {typedEvents.map((event: any) => (
                <div key={event.id} className="col-md-6 col-lg-4">
                  <EventCard event={event} locale={locale} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-calendar-x fs-1 text-muted mb-3" />
              <h3 className="h5">{t('home.club.noEvents')}</h3>
              <p className="text-muted">{t('home.club.checkBackSoon')}</p>
            </div>
          )}

          <div className={styles.sectionAction}>
            <Link href={`/${locale}/events`} className="btn btn-empire-primary btn-lg me-3">
              {t('home.club.viewEvents')}
            </Link>
            <Link href={`/${locale}/events`} className="btn btn-empire-vip btn-lg">
              {t('home.club.bookTable')}
            </Link>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {t('home.location.title')}
            </h2>
          </div>
          <div className={styles.locationContent}>
            <div className={styles.locationInfo}>
              <p className={styles.address}>
                {t('brand.name')}<br />
                {t('home.location.address')}
              </p>
              <a
                href="https://maps.google.com/?q=Limbe+Cameroon"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-empire-outline"
              >
                <i className="bi bi-geo-alt me-2" />
                {t('home.location.directions')}
              </a>
            </div>
            <div className={styles.locationMap}>
              <div className={styles.mapPlaceholder}>
                <i className="bi bi-map" />
                <p>{t('home.location.mapLoading')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
