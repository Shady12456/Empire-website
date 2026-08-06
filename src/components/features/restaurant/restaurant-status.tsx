'use client';

import { useEffect, useState } from 'react';
import type { RestaurantStatus } from '@/types';
import styles from './restaurant-status.module.scss';

// Translation dictionary for client-side translations
const translations = {
  en: {
    loading: 'Loading...',
    restaurantOpen: 'Restaurant Open',
    closesIn: 'Closes in',
    orderingClosed: 'Ordering Closed',
    emergencyActive: 'Emergency ordering active',
  },
  fr: {
    loading: 'Chargement...',
    restaurantOpen: 'Restaurant ouvert',
    closesIn: 'Ferme dans',
    orderingClosed: 'Commandes fermées',
    emergencyActive: "Commande d'urgence activée",
  },
};

interface RestaurantStatusProps {
  locale: string;
}

export function RestaurantStatus({ locale }: RestaurantStatusProps) {
  const [status, setStatus] = useState<RestaurantStatus | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Get translations for current locale
  const t = translations[locale as keyof typeof translations] || translations.en;

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/business/status');
        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        }
      } catch (error) {
        console.error('Failed to fetch restaurant status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
    
    // Refresh status every minute
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!status?.is_ordering_open && status?.closes_at) {
      // Calculate time remaining until closing
      const updateCountdown = () => {
        const now = new Date();
        const [hours, minutes] = status.closes_at.split(':').map(Number);
        const closing = new Date();
        closing.setHours(hours, minutes, 0, 0);
        
        if (closing < now) {
          closing.setDate(closing.getDate() + 1);
        }
        
        const diff = closing.getTime() - now.getTime();
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        
        setTimeRemaining(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [status]);

  if (isLoading) {
    return (
      <div className={styles.statusBanner}>
        <div className="spinner-border spinner-border-sm" role="status">
          <span className="visually-hidden">{t.loading}</span>
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  if (status.is_ordering_open) {
    return (
      <div className={`${styles.statusBanner} ${styles.open}`}>
        <i className="bi bi-check-circle-fill me-2" />
        <span>{t.restaurantOpen}</span>
        {timeRemaining && (
          <span className={styles.countdown}>
            <span className="ms-3">{t.closesIn}</span>
            <strong className="ms-2">{timeRemaining}</strong>
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`${styles.statusBanner} ${styles.closed}`}>
      <i className="bi bi-clock me-2" />
      <div className={styles.closedContent}>
        <span>{t.orderingClosed}</span>
        {status.override_active && (
          <span className={styles.override}>
            <i className="bi bi-exclamation-triangle ms-2 me-1" />
            {t.emergencyActive}
          </span>
        )}
      </div>
    </div>
  );
}
