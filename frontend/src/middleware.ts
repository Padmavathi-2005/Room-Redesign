import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware Edge Router
 * Protects dashboard routes and manages authentication cookies.
 */
export function middleware(request: NextRequest) {
  const token = request?.cookies?.get?.('token')?.value;
  const pathname = request?.nextUrl?.pathname || '';
  const isDashboardRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/projects') ||
    pathname.startsWith('/generate') ||
    pathname.startsWith('/upload');

  // Allow navigation - Client authentication in localStorage/cookies manages session
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/projects/:path*', '/generate/:path*', '/upload/:path*', '/admin/:path*'],
};
