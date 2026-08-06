'use client';

import { useState, useMemo } from 'react';
import type { MenuItem, RestaurantCategory } from '@/types';
import { useCart } from '@/lib/hooks/use-cart';
import styles from './restaurant-menu.module.scss';

interface RestaurantMenuProps {
  categories: (RestaurantCategory & { name_en: string; name_fr: string })[];
  menuItems: MenuItem[];
  locale: string;
}

export function RestaurantMenu({ categories, menuItems, locale }: RestaurantMenuProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { addItem, items: cartItems } = useCart();
  
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory = !activeCategory || item.category_id === activeCategory;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        item.name_en.toLowerCase().includes(searchLower) ||
        item.name_fr.toLowerCase().includes(searchLower) ||
        (item.description_en?.toLowerCase().includes(searchLower)) ||
        (item.description_fr?.toLowerCase().includes(searchLower));
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, activeCategory, searchQuery]);
  
  const handleAddToCart = (item: MenuItem) => {
    addItem({
      menu_item: item,
      quantity: 1,
    });
  };
  
  const getCartQuantity = (itemId: string) => {
    const cartItem = cartItems.find(ci => ci.menu_item.id === itemId);
    return cartItem?.quantity || 0;
  };
  
  const t = (key: string) => key; // Placeholder
  
  return (
    <div className={styles.menuContainer}>
      <div className={styles.menuControls}>
        <div className="input-group mb-3">
          <span className="input-group-text bg-transparent border-end-0">
            <i className="bi bi-search text-muted" />
          </span>
          <input
            type="search"
            className="form-control border-start-0"
            placeholder={locale === 'fr' ? 'Rechercher...' : 'Search...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className={styles.categoryTabs}>
          <button
            className={`btn ${!activeCategory ? 'btn-empire-secondary' : 'btn-outline-secondary'} me-2 mb-2`}
            onClick={() => setActiveCategory(null)}
          >
            {locale === 'fr' ? 'Tous' : 'All Items'}
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`btn ${activeCategory === category.id ? 'btn-empire-secondary' : 'btn-outline-secondary'} me-2 mb-2`}
              onClick={() => setActiveCategory(category.id)}
            >
              {locale === 'fr' ? category.name_fr : category.name_en}
            </button>
          ))}
        </div>
      </div>
      
      <div className="row g-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="col-md-6 col-lg-4">
            <div className={`empire-card ${styles.menuItem} ${!item.is_available ? styles.unavailable : ''}`}>
              {item.image_path && (
                <div className={styles.itemImage}>
                  <img src={item.image_path} alt={locale === 'fr' ? item.name_fr : item.name_en} />
                </div>
              )}
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className={styles.itemName}>
                    {locale === 'fr' ? item.name_fr : item.name_en}
                  </h5>
                  {item.is_featured && (
                    <span className={styles.featuredBadge}>
                      <i className="bi bi-star-fill" />
                    </span>
                  )}
                </div>
                <p className={styles.itemDescription}>
                  {locale === 'fr' ? item.description_fr : item.description_en}
                </p>
                <div className={styles.itemMeta}>
                  <span className={styles.price}>
                    {item.price_xaf.toLocaleString()} XAF
                  </span>
                  <span className={styles.prepTime}>
                    <i className="bi bi-clock me-1" />
                    {item.preparation_time_minutes} min
                  </span>
                </div>
              </div>
              <div className={styles.itemActions}>
                {item.is_available ? (
                  <>
                    <button
                      className="btn btn-empire-primary flex-grow-1"
                      onClick={() => handleAddToCart(item)}
                    >
                      <i className="bi bi-plus-lg me-2" />
                      {locale === 'fr' ? 'Ajouter' : 'Add to Cart'}
                    </button>
                    {getCartQuantity(item.id) > 0 && (
                      <span className={styles.cartBadge}>
                        {getCartQuantity(item.id)}
                      </span>
                    )}
                  </>
                ) : (
                  <button className="btn btn-secondary w-100" disabled>
                    {locale === 'fr' ? 'Indisponible' : 'Unavailable'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredItems.length === 0 && (
        <div className="text-center py-5">
          <i className="bi bi-search fs-1 text-muted mb-3" />
          <p className="text-muted">No items found matching your search.</p>
        </div>
      )}
    </div>
  );
}
