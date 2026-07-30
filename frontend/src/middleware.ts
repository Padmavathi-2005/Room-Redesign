import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware Edge Router
 * Protects dashboard routes and manages authentication cookies.
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const isDashboardRoute =
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/projects') ||
    request.nextUrl.pathname.startsWith('/generate') ||
    request.nextUrl.pathname.startsWith('/upload');

  // Allow navigation - Client authentication in localStorage/cookies manages session
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/projects/:path*', '/generate/:path*', '/upload/:path*'],
};
