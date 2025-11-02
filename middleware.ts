import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl;

  // Public routes yang tidak perlu login
  const publicRoutes = [
    '/login',
    '/api/auth/login',
  ];
  
  // Dynamic routes yang tidak perlu login (dengan parameter)
  const publicDynamicRoutes = [
    /^\/habit-tracker\/form\/[^/]+$/, // Form musyrif: /habit-tracker/form/[token]
    /^\/habit-tracker\/laporan\/[^/]+$/, // Input NIS wali santri: /habit-tracker/laporan/[token]
    /^\/habit-tracker\/laporan\/[^/]+\/[^/]+$/, // Dashboard wali santri: /habit-tracker/laporan/[token]/[nis]
    /^\/catatan-perilaku\/form\/[^/]+$/, // Form catatan perilaku: /catatan-perilaku/form/[token] (akan cek require_auth di page)
  ];
  
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route)) ||
                        publicDynamicRoutes.some(pattern => pattern.test(pathname));

  // Jika belum login dan bukan public route, redirect ke login
  if (!session && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname); // Save redirect path
    return NextResponse.redirect(loginUrl);
  }

  // Jika sudah login dan akses /login, redirect ke home atau URL yang diminta
  if (session && pathname === '/login') {
    // Check if there's a redirect parameter
    const redirectUrl = request.nextUrl.searchParams.get('redirect') || 
                       request.nextUrl.searchParams.get('from') || 
                       '/';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
