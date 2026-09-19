import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookieOpts, ACCESS_TTL, REFRESH_TTL, getJwtExpiry } from './lib/auth/jwt';
import { isPublicStorefrontPath } from './lib/share-links';

const PUBLIC_PATHS = [
  '/merchant',
  '/merchant/sign_in',
  '/merchant/sign_up',
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Shared customer-facing pages must not require a merchant account, nor
  // redirect signed-in recipients back to their merchant dashboard.
  if (isPublicStorefrontPath(pathname)) return NextResponse.next();

  // 1. Exclude public static files and API routes we shouldn't intercept
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('/favicon.ico') ||
    pathname.startsWith('/api/auth/logout') ||
    pathname.startsWith('/api/')
  ) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_PATHS.includes(pathname) || pathname === '/merchant/';

  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  // 2. Check if we need to refresh the token
  // Refresh if we have a refresh token, and either no access token or the access token is expired/expiring soon
  const needsRefresh =
    refreshToken &&
    (!accessToken || (getJwtExpiry(accessToken) ?? 0) < Date.now() + 10000);

  if (needsRefresh) {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.simulatech.org/api/v1';
      const refreshRes = await fetch(`${apiBase}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
        cache: 'no-store',
      });

      if (refreshRes.ok) {
        const tokens = await refreshRes.json();

        // Sync request cookies so downstream server components/actions see them
        request.cookies.set('access_token', tokens.access_token);
        request.cookies.set('refresh_token', tokens.refresh_token);

        const cookieString = request.cookies
          .getAll()
          .map((c) => `${c.name}=${c.value}`)
          .join('; ');

        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('cookie', cookieString);

        // Redirect if visiting sign_in / sign_up via GET to avoid rendering them for authenticated user
        let response: NextResponse;
        if (isPublic && pathname !== '/merchant' && request.method === 'GET') {
          response = NextResponse.redirect(new URL('/merchant/dashboard', request.url));
        } else {
          response = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
        }

        // Set the cookies in the response headers for the browser
        response.cookies.set('access_token', tokens.access_token, cookieOpts(ACCESS_TTL));
        response.cookies.set('refresh_token', tokens.refresh_token, cookieOpts(REFRESH_TTL));

        return response;
      } else {
        console.error('Refresh token is invalid or expired');
        const response = isPublic
          ? NextResponse.next()
          : NextResponse.redirect(new URL('/merchant/sign_in', request.url));
        response.cookies.delete('access_token');
        response.cookies.delete('refresh_token');
        response.cookies.delete('active_merchant_id');
        return response;
      }
    } catch (err) {
      console.error('Error during token refresh in middleware:', err);
      // Fallback: continue and let downstream handle errors
      return NextResponse.next();
    }
  }

  // 3. For protected paths, if there's no refresh token, redirect to sign_in
  if (!isPublic && !refreshToken) {
    return NextResponse.redirect(new URL('/merchant/sign_in', request.url));
  }

  // 4. If visiting login/signup and already have a valid session, auto-redirect to dashboard (GET only)
  if (isPublic && refreshToken && accessToken && (getJwtExpiry(accessToken) ?? 0) >= Date.now() + 10000) {
    if (pathname !== '/merchant' && request.method === 'GET') {
      return NextResponse.redirect(new URL('/merchant/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, logos)
     */
    '/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg).*)',
  ],
};
