import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // In Next.js middleware, we can't use the full supabase-js client easily 
  // without auth helpers because of the cookie management.
  // However, we can check for the presence of the supabase auth cookie.
  
  // Note: Supabase auth cookie name usually starts with 'sb-' followed by the project ref.
  // A more robust way without helpers is to check any cookie starting with 'sb-'
  const allCookies = req.cookies.getAll();
  const hasAuthCookie = allCookies.some(cookie => cookie.name.includes('auth-token') || cookie.name.startsWith('sb-'));

  const url = req.nextUrl.clone();
  const path = url.pathname;

  const isAuthRoute = path === '/login' || path === '/signup';
  const isProtectedRoute = [
    '/dashboard',
    '/quotes',
    '/clients',
    '/settings',
    '/calendar',
    '/complete-profile'
  ].some(route => path.startsWith(route));

  // If no auth cookie and trying to access protected route
  if (!hasAuthCookie && isProtectedRoute) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If has auth cookie and trying to access login/signup
  if (hasAuthCookie && isAuthRoute) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/quotes/:path*',
    '/clients/:path*',
    '/settings/:path*',
    '/calendar/:path*',
    '/complete-profile/:path*',
    '/login',
    '/signup'
  ],
};
