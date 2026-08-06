import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { EventCard } from '@/components/features/events/event-card';
import type { Locale } from '@/types';
import styles from './events.module.scss';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'events' });
  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const supabase = await createClient();
  
  // Fetch published events
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .eq('is_cancelled', false)
    .gte('start_at', new Date().toISOString())
    .order('start_at', { ascending: true });
  
  const { data: featuredEvents } = await supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .eq('is_featured', true)
    .eq('is_cancelled', false)
    .gte('start_at', new Date().toISOString())
    .order('start_at', { ascending: true })
    .limit(3);
  
  // Cast to any to avoid type inference issues
  const typedEvents = (events || []) as any[];
  const typedFeatured = (featuredEvents || []) as any[];
  
  return (
    <div className="py-5">
      <div className="container">
        <div className="text-center mb-5">
          <h1 className="display-5 mb-3">
            <span className="neon-text">{t('brand.club')}</span>
          </h1>
          <p className="lead text-muted">
            {t('events.subtitle')}
          </p>
        </div>
        
        {/* Featured Events */}
        {typedFeatured.length > 0 && (
          <section className="mb-5">
            <h2 className="h4 mb-4">
              <i className="bi bi-star-fill text-warning me-2" />
              {t('events.featured')}
            </h2>
            <div className="row g-4">
              {typedFeatured.map((event: any) => (
                <div key={event.id} className="col-md-6 col-lg-4">
                  <EventCard event={event} locale={locale} />
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* All Events */}
        <section>
          <h2 className="h4 mb-4">{t('events.title')}</h2>
          {typedEvents.length > 0 ? (
            <div className="row g-4">
              {typedEvents.map((event: any) => (
                <div key={event.id} className="col-md-6 col-lg-4">
                  <EventCard event={event} locale={locale} />
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-5 ${styles.emptyState}`}>
              <i className="bi bi-calendar-x fs-1 text-muted mb-3" />
              <h3 className="h5">{t('events.noEvents')}</h3>
              <p className="text-muted">
                {t('events.checkBackSoon')}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
