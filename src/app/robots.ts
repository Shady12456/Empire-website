import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/en',
          '/fr',
          '/en/restaurant',
          '/en/restaurant/menu',
          '/en/events',
          '/en/contact',
          '/en/faq',
          '/en/privacy',
          '/en/terms',
          '/en/refund-policy',
          '/fr/restaurant',
          '/fr/restaurant/menu',
          '/fr/events',
          '/fr/contact',
          '/fr/faq',
          '/fr/privacy',
          '/fr/terms',
          '/fr/refund-policy',
        ],
        disallow: [
          '/api/',
          '/dashboard',
          '/admin',
          '/checkout',
          '/verify-pass',
          '/auth/',
          '/callback',
          '*.json$',
        ],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://empire-hybrid-lounge.com'}/sitemap.xml`,
  };
}
