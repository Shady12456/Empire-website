import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import type { RestaurantStatus } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createAdminClient();
    
    const { data: settings, error } = await supabase
      .from('business_settings')
      .select('*')
      .eq('is_active', true)
      .single();
    
    // Cast to any to avoid type inference issues
    const settingsData = (settings || {}) as any;
    
    if (error || !settingsData) {
      return NextResponse.json<RestaurantStatus>({
        is_open: false,
        is_ordering_open: false,
        closes_at: '17:30',
        reason: 'Business settings not configured',
      });
    }
    
    const timezone = settingsData.timezone || 'Africa/Douala';
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false,
      timeZone: timezone 
    });
    
    const opensAt = settingsData.restaurant_opens_at || '08:00';
    const closesAt = settingsData.restaurant_closes_at || '17:30';
    const orderOverride = settingsData.restaurant_order_override || false;
    
    const [openHour, openMin] = opensAt.split(':').map(Number);
    const [closeHour, closeMin] = closesAt.split(':').map(Number);
    const [currentHour, currentMin] = currentTime.split(':').map(Number);
    
    const openTimeMinutes = openHour * 60 + openMin;
    const closeTimeMinutes = closeHour * 60 + closeMin;
    const currentTimeMinutes = currentHour * 60 + currentMin;
    
    let isOpen = false;
    let isOrderingOpen = false;
    
    if (closeTimeMinutes < openTimeMinutes) {
      isOpen = currentTimeMinutes >= openTimeMinutes || currentTimeMinutes < closeTimeMinutes;
      isOrderingOpen = isOpen;
    } else {
      isOpen = currentTimeMinutes >= openTimeMinutes && currentTimeMinutes < closeTimeMinutes;
      isOrderingOpen = isOpen;
    }
    
    if (orderOverride) {
      isOrderingOpen = true;
    }
    
    const response: RestaurantStatus = {
      is_open: isOpen,
      is_ordering_open: isOrderingOpen,
      closes_at: closesAt,
      reason: isOpen ? undefined : 'Outside operating hours',
      override_active: orderOverride,
    };
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching business status:', error);
    return NextResponse.json<RestaurantStatus>({
      is_open: false,
      is_ordering_open: false,
      closes_at: '17:30',
      reason: 'Server error',
    }, { status: 500 });
  }
}
