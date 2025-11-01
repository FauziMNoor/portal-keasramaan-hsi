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
    '/habit-tracker/form', // Form habit tracker musyrif bisa diakses tanpa login
    '/habit-tracker/laporan', // Dashboard wali santri bisa diakses tanpa login
  ];
  
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Jika belum login dan bukan public route, redirect ke login
  if (!session && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname); // Save redirect path
    return NextResponse.redirect(loginUrl);
  }

  // Jika sudah login dan akses /login, redirect ke home
  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
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
