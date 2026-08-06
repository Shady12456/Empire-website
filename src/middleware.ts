// Middleware for locale detection and session management
import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Update session for all requests
  const response = await updateSession(request);
  
  // Get the pathname
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and API routes that don't need locale
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/images') ||
    pathname.includes('.') // Static files
  ) {
    return response;
  }
  
  // Check if pathname already has a locale
  const pathnameHasLocale = ['en', 'fr'].some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  if (pathnameHasLocale) {
    return response;
  }
  
  // Redirect to locale-prefixed path
  // Try to detect locale from cookie first, then accept-language header
  const locale = 'en'; // Default locale
  const redirectUrl = new URL(`/${locale}${pathname}`, request.url);
  
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon. icon, apple-icon icon
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|icons|images|.*\\..*).*)',
  ],
};
