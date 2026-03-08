import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const allCookies = req.cookies.getAll();
  
  // كنقلبو على أي كوكيز ديال Supabase
  const hasAuthCookie = allCookies.some(c => 
    c.name.includes('auth-token') || 
    c.name.startsWith('sb-')
  );

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isProtectedRoute = ['/dashboard', '/quotes', '/clients', '/settings', '/calendar', '/complete-profile'].some(route => pathname.startsWith(route));

  // إيلا ما كاينش كوكيز وحاول يدخل لصفحة محمية
  if (!hasAuthCookie && isProtectedRoute) {
    // كنزيدو هاد الشرط: إيلا كان جاي من صفحة Login يلاه دابا، نعطيوه فرصة
    const referer = req.headers.get('referer') || '';
    if (referer.includes('/login')) {
       return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // إيلا كاين الكوكيز وحاول يدخل لـ Login صيفطو لـ Dashboard
  if (hasAuthCookie && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/quotes/:path*', '/clients/:path*', '/settings/:path*', '/calendar/:path*', '/complete-profile/:path*', '/login', '/signup'],
};