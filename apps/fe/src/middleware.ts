import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

const intlMiddleware = createIntlMiddleware({
  locales: ['en', 'ko'],
  defaultLocale: 'en'
});

export async function middleware(request: NextRequest) {
  // First, run the intl middleware
  let response = intlMiddleware(request);
  
  // Create a Supabase client with the request/response
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

  // This will refresh the session if needed
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files, _next, and auth routes
    '/((?!_next|_vercel|auth/callback|auth/redirect|.*\\..*).*)' 
  ]
};