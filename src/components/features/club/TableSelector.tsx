'use client';

import { useState, useCallback, useMemo } from 'react';
import styles from './TableSelector.module.scss';

interface Table {
  id: string;
  tableCode: string;
  displayName: string;
  type: 'restaurant_standard' | 'club_regular' | 'club_vip' | 'club_vvip';
  section: string;
  capacity: number;
  priceXaf: number;
  depositXaf: number;
  status: 'available' | 'locked' | 'reserved' | 'occupied' | 'unavailable';
  mapX: number;
  mapY: number;
  width: number;
  height: number;
}

interface TableSelectorProps {
  tables: Table[];
  locale: string;
  selectedTables: string[];
  onSelectionChange: (tableIds: string[]) => void;
  maxTables?: number;
  showMap?: boolean;
}

export function TableSelector({
  tables,
  locale,
  selectedTables,
  onSelectionChange,
  maxTables = 5,
  showMap = true,
}: TableSelectorProps) {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  const translations = {
    en: {
      selectTables: 'Select Tables',
      selectedCount: '{{count}} table(s) selected',
      maxSelect: 'Maximum {{max}} tables',
      tableCode: 'Table',
      capacity: 'Capacity',
      guests: 'guests',
      deposit: 'Deposit',
      price: 'Price',
      section: 'Section',
      available: 'Available',
      reserved: 'Reserved',
      occupied: 'Occupied',
      locked: 'Locked',
      unavailable: 'Unavailable',
      viewMap: 'View Map',
      viewList: 'View List',
      typeStandard: 'Standard',
      typeRegular: 'Regular',
      typeVIP: 'VIP',
      typeVVIP: 'VVIP',
    },
    fr: {
      selectTables: 'Sélectionner des Tables',
      selectedCount: '{{count}} table(s) sélectionnée(s)',
      maxSelect: 'Maximum {{max}} tables',
      tableCode: 'Table',
      capacity: 'Capacité',
      guests: 'invités',
      deposit: 'Acompte',
      price: 'Prix',
      section: 'Section',
      available: 'Disponible',
      reserved: 'Réservée',
      occupied: 'Occupée',
      locked: 'Vérouillée',
      unavailable: 'Indisponible',
      viewMap: 'Voir Carte',
      viewList: 'Voir Liste',
      typeStandard: 'Standard',
      typeRegular: 'Régulier',
      typeVIP: 'VIP',
      typeVVIP: 'VVIP',
    },
  };

  const t = translations[locale as keyof typeof translations] || translations.en;

  const availableTables = useMemo(
    () => tables.filter((t) => t.status === 'available'),
    [tables]
  );

  const groupedBySection = useMemo(() => {
    const groups: Record<string, Table[]> = {};
    availableTables.forEach((table) => {
      if (!groups[table.section]) {
        groups[table.section] = [];
      }
      groups[table.section].push(table);
    });
    return groups;
  }, [availableTables]);

  const handleTableClick = useCallback(
    (tableId: string) => {
      const isSelected = selectedTables.includes(tableId);
      let newSelection: string[];

      if (isSelected) {
        newSelection = selectedTables.filter((id) => id !== tableId);
      } else {
        if (selectedTables.length >= maxTables) return;
        newSelection = [...selectedTables, tableId];
      }

      onSelectionChange(newSelection);
    },
    [selectedTables, maxTables, onSelectionChange]
  );

  const getTableTypeLabel = (type: Table['type']) => {
    const labels: Record<string, string> = {
      restaurant_standard: t.typeStandard,
      club_regular: t.typeRegular,
      club_vip: t.typeVIP,
      club_vvip: t.typeVVIP,
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status: Table['status']) => {
    const labels: Record<string, string> = {
      available: t.available,
      reserved: t.reserved,
      occupied: t.occupied,
      locked: t.locked,
      unavailable: t.unavailable,
    };
    return labels[status] || status;
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Calculate map dimensions based on table positions
  const mapWidth = 400;
  const mapHeight = 400;
  const scale = 1;

  return (
    <div className={styles.tableSelector}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3>{t.selectTables}</h3>
          <p>
            {selectedTables.length > 0
              ? t.selectedCount.replace('{{count}}', selectedTables.length.toString())
              : t.maxSelect.replace('{{max}}', maxTables.toString())}
          </p>
        </div>
        <div className={styles.viewToggle}>
          <button
            type="button"
            className={`${styles.toggleBtn} ${viewMode === 'map' ? styles.active : ''}`}
            onClick={() => setViewMode('map')}
          >
            <i className="bi bi-grid-3x3-gap" />
            {t.viewMap}
          </button>
          <button
            type="button"
            className={`${styles.toggleBtn} ${viewMode === 'list' ? styles.active : ''}`}
            onClick={() => setViewMode('list')}
          >
            <i className="bi bi-list" />
            {t.viewList}
          </button>
        </div>
      </div>

      {viewMode === 'map' && showMap && (
        <div className={styles.mapContainer}>
          <div className={styles.map} style={{ width: mapWidth, height: mapHeight }}>
            {/* Section labels */}
            <div className={styles.sectionLabels}>
              {Object.keys(groupedBySection).map((section) => (
                <div key={section} className={styles.sectionLabel}>
                  {section}
                </div>
              ))}
            </div>

            {/* Tables */}
            {tables.map((table) => {
              const isSelected = selectedTables.includes(table.id);
              const isAvailable = table.status === 'available';

              return (
                <button
                  key={table.id}
                  type="button"
                  className={`${styles.tableItem} ${styles[table.status]} ${
                    isSelected ? styles.selected : ''
                  } ${!isAvailable ? styles.disabled : ''}`}
                  style={{
                    left: table.mapX * scale,
                    top: table.mapY * scale,
                    width: table.width,
                    height: table.height,
                  }}
                  onClick={() => isAvailable && handleTableClick(table.id)}
                  disabled={!isAvailable}
                  title={`${table.displayName} - ${getStatusLabel(table.status)}`}
                >
                  <span className={styles.tableCode}>{table.tableCode}</span>
                  <span className={styles.tableCapacity}>{table.capacity}</span>
                  {isSelected && (
                    <span className={styles.checkmark}>
                      <i className="bi bi-check-lg" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.available}`} />
              {t.available}
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.selected}`} />
              {locale === 'fr' ? 'Sélectionné' : 'Selected'}
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.reserved}`} />
              {t.reserved}
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.locked}`} />
              {t.locked}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'list' && (
        <div className={styles.listContainer}>
          {Object.entries(groupedBySection).map(([section, sectionTables]) => (
            <div key={section} className={styles.sectionGroup}>
              <h4 className={styles.sectionTitle}>
                <i className="bi bi-geo-alt" />
                {section}
              </h4>
              <div className={styles.tableList}>
                {sectionTables.map((table) => {
                  const isSelected = selectedTables.includes(table.id);
                  const isVVIP = table.type === 'club_vvip';
                  const isVIP = table.type === 'club_vip';

                  return (
                    <button
                      key={table.id}
                      type="button"
                      className={`${styles.tableListItem} ${isSelected ? styles.selected : ''} ${
                        isVVIP ? styles.vvip : isVIP ? styles.vip : ''
                      }`}
                      onClick={() => handleTableClick(table.id)}
                    >
                      <div className={styles.tableInfo}>
                        <span className={styles.tableName}>
                          {table.tableCode}
                          {isVVIP && <i className="bi bi-gem-fill" />}
                          {isVIP && <i className="bi bi-star-fill" />}
                        </span>
                        <span className={styles.tableType}>
                          {getTableTypeLabel(table.type)}
                        </span>
                      </div>
                      <div className={styles.tableCapacity}>
                        <i className="bi bi-people" />
                        {table.capacity} {t.guests}
                      </div>
                      <div className={styles.tablePrice}>
                        <span className={styles.priceValue}>{formatPrice(table.priceXaf)}</span>
                        {table.depositXaf > 0 && (
                          <span className={styles.deposit}>
                            {t.deposit}: {formatPrice(table.depositXaf)}
                          </span>
                        )}
                      </div>
                      <div className={styles.selectIndicator}>
                        <i className={`bi ${isSelected ? 'bi-check-circle-fill' : 'bi-circle'}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selection Summary */}
      {selectedTables.length > 0 && (
        <div className={styles.selectionSummary}>
          <h4>
            {t.selectedCount.replace('{{count}}', selectedTables.length.toString())}
          </h4>
          <div className={styles.selectedTables}>
            {selectedTables.map((tableId) => {
              const table = tables.find((t) => t.id === tableId);
              if (!table) return null;
              return (
                <span key={tableId} className={styles.selectedTag}>
                  {table.tableCode}
                  <button
                    type="button"
                    onClick={() => handleTableClick(tableId)}
                    aria-label="Remove"
                  >
                    <i className="bi bi-x" />
                  </button>
                </span>
              );
            })}
          </div>
          <div className={styles.totalDeposit}>
            <span>
              {locale === 'fr' ? 'Total acompte:' : 'Total deposit:'}
            </span>
            <strong>
              {formatPrice(
                selectedTables.reduce((sum, id) => {
                  const table = tables.find((t) => t.id === id);
                  return sum + (table?.depositXaf || 0);
                }, 0)
              )}
            </strong>
          </div>
        </div>
      )}
    </div>
  );
}
