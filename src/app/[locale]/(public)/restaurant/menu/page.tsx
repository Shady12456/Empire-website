import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { RestaurantMenu } from '@/components/features/restaurant/restaurant-menu';
import type { Locale } from '@/types';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'restaurant.menu' });
  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default async function MenuPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const supabase = await createClient();
  
  const [categoriesResult, menuResult] = await Promise.all([
    supabase
      .from('restaurant_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order'),
    supabase
      .from('menu_items')
      .select(`
        *,
        restaurant_categories (name_en, name_fr)
      `)
      .eq('is_available', true)
      .order('display_order'),
  ]);
  
  const categories = categoriesResult.data || [];
  const menuItems = menuResult.data || [];
  
  return (
    <div className="py-5">
      <div className="container">
        <div className="text-center mb-5">
          <h1 className="display-5 mb-3">
            <span className="neon-text">{t('brand.restaurant')}</span>
          </h1>
          <p className="lead text-muted">
            {t('restaurant.menu.subtitle')}
          </p>
        </div>
        
        <RestaurantMenu
          categories={categories}
          menuItems={menuItems}
          locale={locale as Locale}
        />
      </div>
    </div>
  );
}
