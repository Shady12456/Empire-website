'use client';

import { useState, useMemo } from 'react';
import type { ClubPackage } from '@/types/database';
import styles from './PackageSelector.module.scss';

interface PackageSelectorProps {
  packages: ClubPackage[];
  locale: string;
  selectedPackages: Map<string, number>;
  onSelectionChange: (packages: Map<string, number>) => void;
  maxTables?: number;
}

const categoryLabels = {
  en: {
    drinks: 'Drink Packages',
    champagne: 'Champagne',
    bottles: 'Bottle Service',
    vip_gold: 'VIP Gold',
    custom: 'Custom',
  },
  fr: {
    drinks: 'Formules Boissons',
    champagne: 'Champagne',
    bottles: 'Service Bouteilles',
    vip_gold: 'VIP Or',
    custom: 'Personnalisé',
  },
};

export function PackageSelector({
  packages,
  locale,
  selectedPackages,
  onSelectionChange,
  maxTables = 1,
}: PackageSelectorProps) {
  const labels = categoryLabels[locale as keyof typeof categoryLabels] || categoryLabels.en;

  const groupedPackages = useMemo(() => {
    const groups: Record<string, ClubPackage[]> = {};
    packages.forEach((pkg) => {
      if (!groups[pkg.category]) {
        groups[pkg.category] = [];
      }
      groups[pkg.category].push(pkg);
    });
    return groups;
  }, [packages]);

  const handleQuantityChange = (packageId: string, delta: number) => {
    const newSelection = new Map(selectedPackages);
    const currentQty = newSelection.get(packageId) || 0;
    const newQty = Math.max(0, currentQty + delta);
    
    // Calculate total tables selected
    let totalTables = 0;
    newSelection.forEach((qty, id) => {
      if (id !== packageId) {
        totalTables += qty;
      }
    });
    totalTables += newQty;
    
    // Don't allow more tables than available
    if (totalTables > maxTables && delta > 0) {
      return;
    }

    if (newQty === 0) {
      newSelection.delete(packageId);
    } else {
      newSelection.set(packageId, newQty);
    }
    onSelectionChange(newSelection);
  };

  const parseIncludes = (includesJson: string | null, lang: 'en' | 'fr'): string[] => {
    if (!includesJson) return [];
    try {
      return JSON.parse(includesJson);
    } catch {
      return [];
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const totalSelected = Array.from(selectedPackages.values()).reduce((a, b) => a + b, 0);

  return (
    <div className={styles.packageSelector}>
      <div className={styles.header}>
        <h3>{locale === 'fr' ? 'Choisir un Forfait' : 'Choose a Package'}</h3>
        <p className={styles.subtitle}>
          {locale === 'fr'
            ? `${totalSelected}/${maxTables} table(s) sélectionnée(s)`
            : `${totalSelected}/${maxTables} table(s) selected`}
        </p>
      </div>

      {Object.entries(groupedPackages).map(([category, pkgs]) => (
        <div key={category} className={styles.categorySection}>
          <h4 className={styles.categoryTitle}>
            <i className={`bi ${getCategoryIcon(category)} ${styles.categoryIcon}`} />
            {labels[category as keyof typeof labels] || category}
          </h4>

          <div className={styles.packageGrid}>
            {pkgs.map((pkg) => {
              const qty = selectedPackages.get(pkg.id) || 0;
              const includes = parseIncludes(
                locale === 'fr' ? pkg.includes_fr : pkg.includes_en,
                locale === 'fr' ? 'fr' : 'en'
              );

              return (
                <div
                  key={pkg.id}
                  className={`${styles.packageCard} ${qty > 0 ? styles.selected : ''} ${
                    pkg.is_vip ? styles.vip : ''
                  }`}
                >
                  {pkg.is_featured && (
                    <div className={styles.featuredBadge}>
                      {locale === 'fr' ? 'Populaire' : 'Popular'}
                    </div>
                  )}

                  {pkg.is_vip && (
                    <div className={styles.vipBadge}>
                      <i className="bi bi-star-fill" />
                      {locale === 'fr' ? 'VIP Or' : 'VIP Gold'}
                    </div>
                  )}

                  <div className={styles.packageHeader}>
                    <h5>{locale === 'fr' ? pkg.name_fr : pkg.name_en}</h5>
                    <p className={styles.description}>
                      {locale === 'fr' ? pkg.description_fr : pkg.description_en}
                    </p>
                  </div>

                  <div className={styles.packageIncludes}>
                    <h6>{locale === 'fr' ? 'Inclus:' : 'Includes:'}</h6>
                    <ul>
                      {includes.map((item, idx) => (
                        <li key={idx}>
                          <i className="bi bi-check-circle-fill" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.packageDetails}>
                    <div className={styles.priceSection}>
                      <span className={styles.price}>{formatPrice(pkg.price_xaf)}</span>
                      <span className={styles.perTable}>
                        {locale === 'fr' ? '/ table' : '/ table'}
                      </span>
                    </div>

                    {pkg.deposit_xaf > 0 && (
                      <div className={styles.deposit}>
                        {locale === 'fr' ? 'Acompte:' : 'Deposit:'} {formatPrice(pkg.deposit_xaf)}
                      </div>
                    )}

                    {pkg.minimum_spend_xaf > 0 && (
                      <div className={styles.minSpend}>
                        {locale === 'fr' ? 'Minimum:' : 'Min spend:'} {formatPrice(pkg.minimum_spend_xaf)}
                      </div>
                    )}

                    {pkg.capacity > 1 && (
                      <div className={styles.capacity}>
                        {locale === 'fr' ? `${pkg.capacity} tables incluses` : `${pkg.capacity} tables included`}
                      </div>
                    )}
                  </div>

                  <div className={styles.quantityControl}>
                    <button
                      type="button"
                      className={styles.qtyBtn}
                      onClick={() => handleQuantityChange(pkg.id, -1)}
                      disabled={qty === 0}
                      aria-label={locale === 'fr' ? 'Diminuer' : 'Decrease'}
                    >
                      <i className="bi bi-dash" />
                    </button>
                    <span className={styles.qtyValue}>{qty}</span>
                    <button
                      type="button"
                      className={styles.qtyBtn}
                      onClick={() => handleQuantityChange(pkg.id, 1)}
                      disabled={totalSelected >= maxTables}
                      aria-label={locale === 'fr' ? 'Augmenter' : 'Increase'}
                    >
                      <i className="bi bi-plus" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    drinks: 'bi-cup-straw',
    champagne: 'bi-wine',
    bottles: 'bi-drop',
    vip_gold: 'bi-star-fill',
    custom: 'bi-gem',
  };
  return icons[category] || 'bi-box';
}
