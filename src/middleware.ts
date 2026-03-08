import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // جلب الكوكيز ديال Supabase (السمية الافتراضية)
  const supabaseToken = request.cookies.get('sb-access-token') || request.cookies.get('sb-refresh-token');

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isProtectedRoute = pathname.startsWith('/dashboard');

  if (!supabaseToken && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (supabaseToken && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
};