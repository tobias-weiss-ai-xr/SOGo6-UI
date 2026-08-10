import { getDefaultLocale, getLocales, routing } from '@/lib/i18n/config'
import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { isUsingFakeApi } from '@/lib/api/router'

export const config = {
  matcher: [
    // Exclude api (proxied to SOGo back), fakeApi, env, and static assets
    '/((?!_next|api|fakeApi|env|.*\\.(?:js|css|png|jpg|jpeg|svg|gif|ico|webp|woff|woff2|ttf|eot)$).*)',
  ],
}

// Function to generate a dynamic regex to test if pathname begins with one of the locales
export function generateLocaleRegex(locales: readonly string[]): RegExp {
  const localePattern = locales.join('|')
  return new RegExp(`^/(${localePattern})(/|$)`)
}

/** Strip port from host header before domain comparison. */
export function normalizeHostname(hostname: string): string {
  return hostname.split(':')[0].toLowerCase()
}

/** Strict hostname equality (no substring match). */
export function hostnameMatchesAdminDomain(
  hostname: string,
  domain: string
): boolean {
  const normalizedDomain = domain.trim().toLowerCase()
  if (!normalizedDomain) {
    return false
  }
  return normalizeHostname(hostname) === normalizedDomain
}

// Function to check if the request is from the admin domain
export function isAdminDomain(hostname: string): boolean {
  const adminDomains = process.env.NEXT_PUBLIC_ADMIN_DOMAINS?.split(',') || []
  return adminDomains.some((domain) =>
    hostnameMatchesAdminDomain(hostname, domain)
  )
}

// Function to check if the path is admin panel (including all sub-routes)
export function isAdminPanelPath(pathname: string): boolean {
  const locales = getLocales()
  const localePattern = locales.join('|')
  // This regex matches /[locale]/admin_panel and all its sub-routes
  const adminPathRegex = new RegExp(`^/(${localePattern})/admin_panel(/.*)?$`)
  return adminPathRegex.test(pathname)
}

// Function to check if the path is just the locale root (e.g., /en, /fr)
export function isLocaleRootPath(pathname: string): boolean {
  const locales = getLocales()
  const localePattern = locales.join('|')
  const localeRootRegex = new RegExp(`^/(${localePattern})/?$`)
  return localeRootRegex.test(pathname)
}

// Function to check if the path is auth-related (login/signup)
export function isAuthPath(pathname: string): boolean {
  const locales = getLocales()
  const localePattern = locales.join('|')
  const authPathRegex = new RegExp(`^/(${localePattern})/auth(/|$)`)
  return authPathRegex.test(pathname)
}

const intlMiddleware = createMiddleware(routing)

/**
 * Handle API proxy requests
 * Forwards /api/v1/* requests to the backend server
 */
async function handleApiProxy(req: NextRequest): Promise<NextResponse | null> {
  const pathname = req.nextUrl.pathname;
  
  // Check if this is an API request
  if (!pathname.startsWith('/api/v1/')) {
    return null;
  }
  
  // If using fake API, let Next.js handle it (fakeApi is at /fakeApi)
  if (isUsingFakeApi()) {
    return null;
  }
  
  // Proxy to backend
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
  
  try {
    const apiPath = pathname.replace(/^\/api\/v1/, '');
    const targetUrl = new URL(apiPath, backendUrl);
    
    // Copy headers, removing Next.js specific ones
    const headers = new Headers(req.headers);
    headers.delete('host');
    headers.delete('x-forwarded-host');
    headers.delete('x-forwarded-proto');
    
    // Forward the request
    const response = await fetch(targetUrl.toString(), {
      method: req.method,
      headers: headers as HeadersInit,
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : req.body,
      // Note: For streaming responses, we need to handle them specially
      ...(req.method !== 'GET' && req.method !== 'HEAD' && { body: req.body }),
    });
    
    // Clone the response and pipe it back
    const apiResponse = new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
    
    return apiResponse;
  } catch (error) {
    console.error('API Proxy Error:', error);
    return NextResponse.json(
      { error: 'API Proxy Error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 502 }
    );
  }
}

/**
 * Handle fake API requests
 * Serves mock data for development
 */
function handleFakeApi(req: NextRequest): NextResponse | null {
  const pathname = req.nextUrl.pathname;
  
  // Check if this is a fake API request
  if (!pathname.startsWith('/fakeApi/') && !pathname.startsWith('/api/v1/')) {
    return null;
  }
  
  // fakeApi routes are handled by Next.js directly
  return null;
}

export default async function proxy(req: NextRequest) {
  const hostname = req.headers.get('host') || ''
  const pathname = req.nextUrl.pathname
  const locales = getLocales()
  const defaultLocale = getDefaultLocale()
  const localeRegex = generateLocaleRegex(locales)

  const isAdmin = isAdminDomain(hostname)
  const isAdminPanelRoute = isAdminPanelPath(pathname)
  const isAuthRoute = isAuthPath(pathname)
  const isLocaleRoot = isLocaleRootPath(pathname)

  // Check if this is an API request - handle proxy or fake API
  if (pathname.startsWith('/api/') || pathname.startsWith('/fakeApi/')) {
    // Try to handle API proxy
    const apiResponse = await handleApiProxy(req);
    if (apiResponse) {
      return apiResponse;
    }
    
    // Fall through to fakeApi handling
    const fakeApiResponse = handleFakeApi(req);
    if (fakeApiResponse) {
      return fakeApiResponse;
    }
    
    // If neither handled it, continue with normal routing
  }

  // Check if the pathname matches the locale regex
  if (!localeRegex.test(pathname)) {
    // Redirect to the default locale
    const queryParams = req.nextUrl.search
    const url = new URL(`/${defaultLocale}${pathname}${queryParams}`, req.url)
    return NextResponse.redirect(url)
  }

  // Domain-based routing logic
  // Allow auth routes on both domains
  if (isAuthRoute) {
    return await intlMiddleware(req)
  }

  // Admin domain - ONLY allow admin_panel routes
  if (isAdmin) {
    // If accessing locale root (e.g., /en), redirect to admin_panel
    if (isLocaleRoot) {
      const locale = pathname.split('/')[1]
      const url = new URL(`/${locale}/admin_panel`, req.url)
      return NextResponse.redirect(url)
    }

    // If NOT on admin_panel route, redirect to admin_panel
    if (!isAdminPanelRoute) {
      const locale = pathname.split('/')[1]
      const url = new URL(`/${locale}/admin_panel`, req.url)
      return NextResponse.redirect(url)
    }
  }

  // User domain - block admin_panel routes
  if (!isAdmin && isAdminPanelRoute) {
    // Allow admin routes in development mode
    if (process.env.NODE_ENV !== 'development') {
      // Redirect to home page if trying to access admin routes from user domain
      const url = new URL(`/${defaultLocale}`, req.url)
      return NextResponse.redirect(url)
    }
  }

  const res = await intlMiddleware(req)
  return res
}
