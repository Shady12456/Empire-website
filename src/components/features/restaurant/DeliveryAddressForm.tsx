'use client';

import { useState, useEffect } from 'react';
import type { DeliveryZone } from '@/types/database';
import styles from './DeliveryForm.module.scss';

interface DeliveryAddressFormProps {
  zones: DeliveryZone[];
  locale: string;
  address: {
    address: string;
    landmark: string;
    instructions: string;
    zoneId: string;
  };
  onAddressChange: (address: {
    address: string;
    landmark: string;
    instructions: string;
    zoneId: string;
  }) => void;
}

export function DeliveryAddressForm({
  zones,
  locale,
  address,
  onAddressChange,
}: DeliveryAddressFormProps) {
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const translations = {
    en: {
      deliveryAddress: 'Delivery Address',
      selectZone: 'Select your area',
      streetAddress: 'Street Address',
      streetPlaceholder: 'Enter your street address',
      landmark: 'Nearby Landmark',
      landmarkPlaceholder: 'e.g., Near the market, Opposite church',
      instructions: 'Delivery Instructions',
      instructionsPlaceholder: 'Any special instructions for the delivery person...',
      useLocation: 'Use my current location',
      gettingLocation: 'Getting location...',
      locationError: 'Could not get location',
      minOrder: 'Min. order',
      deliveryFee: 'Delivery fee',
      estimatedTime: 'Est. delivery time',
      minutes: 'min',
    },
    fr: {
      deliveryAddress: 'Adresse de Livraison',
      selectZone: 'Sélectionnez votre zone',
      streetAddress: 'Adresse',
      streetPlaceholder: 'Entrez votre adresse',
      landmark: 'Point de Repère',
      landmarkPlaceholder: 'ex: Près du marché, Face à l\'église',
      instructions: 'Instructions de Livraison',
      instructionsPlaceholder: 'Instructions spéciales pour le livreur...',
      useLocation: 'Utiliser ma position',
      gettingLocation: 'Localisation...',
      locationError: 'Position introuvable',
      minOrder: 'Commande min.',
      deliveryFee: 'Frais de livraison',
      estimatedTime: 'Délai estimé',
      minutes: 'min',
    },
  };

  const t = translations[locale as keyof typeof translations] || translations.en;

  const handleZoneChange = (zoneId: string) => {
    onAddressChange({ ...address, zoneId });
  };

  const handleFieldChange = (field: 'address' | 'landmark' | 'instructions', value: string) => {
    onAddressChange({ ...address, [field]: value });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(locale === 'fr' ? 'Géolocalisation non supportée' : 'Geolocation not supported');
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Store coordinates for map display
        onAddressChange({
          ...address,
          instructions: `${address.instructions}\nGPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`.trim(),
        });
        
        setUseCurrentLocation(true);
        setIsGettingLocation(false);
        
        // Try to get address from coordinates using reverse geocoding
        fetchAddressFromCoordinates(latitude, longitude);
      },
      (error) => {
        setLocationError(t.locationError);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  };

  const fetchAddressFromCoordinates = async (lat: number, lon: number) => {
    try {
      // Use a free geocoding service (Nominatim)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'EmpireLounge/1.0',
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.display_name) {
          // Simplify the address
          const parts = data.display_name.split(', ');
          const shortAddress = parts.slice(0, 3).join(', ');
          onAddressChange({
            ...address,
            address: shortAddress,
          });
        }
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }
  };

  const selectedZone = zones.find((z) => z.id === address.zoneId);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className={styles.deliveryForm}>
      <div className={styles.header}>
        <h4>
          <i className="bi bi-geo-alt-fill" />
          {t.deliveryAddress}
        </h4>
      </div>

      {/* Zone Selection */}
      <div className={styles.zoneSelection}>
        <label className={styles.label}>{t.selectZone}</label>
        <div className={styles.zoneGrid}>
          {zones.map((zone) => (
            <button
              key={zone.id}
              type="button"
              className={`${styles.zoneCard} ${address.zoneId === zone.id ? styles.selected : ''}`}
              onClick={() => handleZoneChange(zone.id)}
            >
              <span className={styles.zoneName}>
                {locale === 'fr' ? zone.name_fr : zone.name_en}
              </span>
              <span className={styles.zoneFee}>{formatPrice(zone.delivery_fee_xaf)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Zone Details */}
      {selectedZone && (
        <div className={styles.zoneDetails}>
          <div className={styles.detailItem}>
            <i className="bi bi-clock" />
            <span>
              {t.estimatedTime}: {selectedZone.estimated_minutes}-{selectedZone.estimated_max_minutes} {t.minutes}
            </span>
          </div>
          <div className={styles.detailItem}>
            <i className="bi bi-currency-dollar" />
            <span>
              {t.deliveryFee}: {formatPrice(selectedZone.delivery_fee_xaf)}
            </span>
          </div>
          {selectedZone.min_order_xaf > 0 && (
            <div className={styles.detailItem}>
              <i className="bi bi-bag" />
              <span>
                {t.minOrder}: {formatPrice(selectedZone.min_order_xaf)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Location Button */}
      <div className={styles.locationSection}>
        <button
          type="button"
          className={styles.locationBtn}
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
        >
          <i className={`bi ${isGettingLocation ? 'bi-hourglass-split' : 'bi-crosshair'}`} />
          {isGettingLocation ? t.gettingLocation : t.useLocation}
        </button>
        {locationError && (
          <p className={styles.locationError}>{locationError}</p>
        )}
        {useCurrentLocation && !locationError && (
          <p className={styles.locationSuccess}>
            <i className="bi bi-check-circle-fill" />
            {locale === 'fr' ? 'Position utilisée' : 'Location used'}
          </p>
        )}
      </div>

      {/* Address Fields */}
      <div className={styles.formFields}>
        <div className={styles.fieldGroup}>
          <label htmlFor="street" className={styles.label}>
            {t.streetAddress} *
          </label>
          <input
            type="text"
            id="street"
            className={styles.input}
            placeholder={t.streetPlaceholder}
            value={address.address}
            onChange={(e) => handleFieldChange('address', e.target.value)}
            required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="landmark" className={styles.label}>
            {t.landmark}
          </label>
          <input
            type="text"
            id="landmark"
            className={styles.input}
            placeholder={t.landmarkPlaceholder}
            value={address.landmark}
            onChange={(e) => handleFieldChange('landmark', e.target.value)}
          />
          <p className={styles.hint}>
            {locale === 'fr'
              ? 'Cela aide notre livreur à vous trouver facilement'
              : 'This helps our delivery person find you easily'}
          </p>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="instructions" className={styles.label}>
            {t.instructions}
          </label>
          <textarea
            id="instructions"
            className={styles.textarea}
            placeholder={t.instructionsPlaceholder}
            value={address.instructions}
            onChange={(e) => handleFieldChange('instructions', e.target.value)}
            rows={3}
          />
        </div>
      </div>

      {/* Map Preview */}
      {address.zoneId && (
        <div className={styles.mapPreview}>
          <div className={styles.mapPlaceholder}>
            <i className="bi bi-map" />
            <p>
              {locale === 'fr'
                ? 'Carte de livraison pour'
                : 'Delivery map for'}{' '}
              {selectedZone && (locale === 'fr' ? selectedZone.name_fr : selectedZone.name_en)}
            </p>
            <span>
              {locale === 'fr'
                ? 'Entrez votre adresse pour voir la position exacte'
                : 'Enter your address to see exact position'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
