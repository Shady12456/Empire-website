import Link from 'next/link';
import { format } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import type { Event, TicketType } from '@/types';
import styles from './event-card.module.scss';

// Translation dictionary for client-side translations
const translations = {
  en: {
    featured: 'Featured',
    soldOut: 'Sold Out',
    from: 'From',
    ticketsLeft: '{{count}} tickets left',
    viewDetails: 'View Details',
    buyTickets: 'Buy Tickets',
  },
  fr: {
    featured: 'En Vedette',
    soldOut: 'Complet',
    from: 'À partir de',
    ticketsLeft: '{{count}} billets restants',
    viewDetails: 'Voir Détails',
    buyTickets: 'Acheter des Billets',
  },
};

interface EventCardProps {
  event: Event & { ticket_types?: TicketType[] };
  locale: string;
}

export function EventCard({ event, locale }: EventCardProps) {
  const dateLocale = locale === 'fr' ? fr : enUS;
  const eventName = locale === 'fr' ? event.title_fr : event.title_en;
  const t = translations[locale as keyof typeof translations] || translations.en;
  
  // Get lowest price
  const lowestPrice = event.ticket_types?.length
    ? Math.min(...event.ticket_types.map(t => t.price_xaf))
    : 0;
  
  // Calculate remaining tickets
  const totalInventory = event.ticket_types?.reduce((sum, t) => sum + t.total_inventory, 0) || 0;
  const totalSold = event.ticket_types?.reduce((sum, t) => sum + t.sold_inventory, 0) || 0;
  const remaining = totalInventory - totalSold;
  
  const isSoldOut = remaining <= 0;
  
  return (
    <div className={`empire-card ${styles.eventCard} ${event.is_featured ? styles.featured : ''}`}>
      {event.flyer_path && (
        <div className={styles.flyerContainer}>
          <img src={event.flyer_path} alt={eventName} className={styles.flyer} />
          {event.is_featured && (
            <span className={styles.featuredBadge}>
              <i className="bi bi-star-fill me-1" />
              {t.featured}
            </span>
          )}
        </div>
      )}
      
      <div className="card-body">
        <div className={styles.eventDate}>
          <i className="bi bi-calendar-event me-2" />
          {format(new Date(event.start_at), 'EEE, MMM d, yyyy', { locale: dateLocale })}
          <span className="mx-2">•</span>
          <i className="bi bi-clock me-1" />
          {event.doors_open_at}
        </div>
        
        <h3 className={styles.eventTitle}>{eventName}</h3>
        
        <p className={styles.eventVenue}>
          <i className="bi bi-geo-alt me-1" />
          {event.venue}
        </p>
        
        <div className={styles.eventMeta}>
          {isSoldOut ? (
            <span className={styles.soldOut}>
              <i className="bi bi-x-circle me-1" />
              {t.soldOut}
            </span>
          ) : (
            <span className={styles.price}>
              {t.from}{' '}
              <strong>{lowestPrice.toLocaleString()} XAF</strong>
            </span>
          )}
          
          {remaining > 0 && remaining <= 20 && (
            <span className={styles.limited}>
              <i className="bi bi-fire me-1" />
              {t.ticketsLeft.replace('{{count}}', remaining.toString())}
            </span>
          )}
        </div>
      </div>
      
      <div className={styles.cardFooter}>
        <Link 
          href={`/${locale}/events/${event.slug}`}
          className={`btn ${isSoldOut ? 'btn-outline-secondary' : 'btn-empire-primary'} flex-grow-1`}
        >
          {isSoldOut ? t.viewDetails : t.buyTickets}
        </Link>
      </div>
    </div>
  );
}
