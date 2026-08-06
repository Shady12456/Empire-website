import type { Metadata, Viewport } from 'next';
import '@/styles/bootstrap.scss';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Empire Lounge',
    template: '%s | Empire Lounge',
  },
  description: 'Fine Dining & Premium Nightlife - Experience the perfect blend of daytime culinary excellence and nighttime entertainment in Limbe, Cameroon.',
  keywords: ['restaurant', 'night club', 'Limbe', 'Cameroon', 'dining', 'events', 'nightlife'],
  authors: [{ name: 'Empire Lounge' }],
  creator: 'Empire Lounge',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['fr_FR'],
    siteName: 'Empire Lounge',
    title: 'Empire Lounge',
    description: 'Fine Dining & Premium Nightlife',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Empire Lounge',
    description: 'Fine Dining & Premium Nightlife',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0b0c10',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
