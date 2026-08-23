import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const TOKEN_COOKIE_NAME = 'ersa_auth_token';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedAdmin = pathname.startsWith('/admin');
  const isProtectedCustomer = pathname.startsWith('/hesap');

  if (!isProtectedAdmin && !isProtectedCustomer) {
    return NextResponse.next();
  }

  const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value;

  // If no auth token cookie is present, redirect to login immediately
  if (!token) {
    const loginUrl = new URL('/giris', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Basic Edge token payload inspection for admin role
  if (isProtectedAdmin) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
        const payload = JSON.parse(payloadJson);
        if (payload.role !== 'ADMIN' && payload.role !== 'STAFF') {
          return NextResponse.redirect(new URL('/hesap', request.url));
        }
      }
    } catch {
      // If malformed token, redirect to login
      const loginUrl = new URL('/giris', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/hesap/:path*'],
};
