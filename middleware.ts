import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

// Paths that require authentication
const protectedRoutes = ['/admin', '/admin/events', '/ambulance-dashboard', '/user-dashboard'];
// Paths restricted strictly to admins
const adminRoutes = ['/admin', '/admin/events'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Check if current path requires authentication
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (!isProtected) return NextResponse.next();

  // Get session token
  const sessionCookie = req.cookies.get('session')?.value;
  
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const session = await decrypt(sessionCookie);
    
    // Check role-based access for Admin pages
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
    if (isAdminRoute && session.role !== 'MAIN_ADMIN' && session.role !== 'DISTRICT_ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    return NextResponse.next();
  } catch (error) {
    // Invalid token
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
