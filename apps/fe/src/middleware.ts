import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

const intlMiddleware = createIntlMiddleware({
  locales: ['en', 'ko'],
  defaultLocale: 'en'
});

// Pages that don't need a Supabase session refresh on every request.
// i18n routing still runs for all paths.
const PUBLIC_PATHS = ['/terms', '/privacy', '/contact'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(p => pathname.includes(p));
}

export async function middleware(request: NextRequest) {
  // i18n middleware always runs for locale routing
  const response = intlMiddleware(request);

  // Skip Supabase session refresh for static public pages
  if (isPublicPath(request.nextUrl.pathname)) {
    return response;
  }

  // Refresh the session for all other routes
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files, _next, and auth routes
    '/((?!_next|_vercel|auth/callback|auth/redirect|.*\\..*).*)'
  ]
};
