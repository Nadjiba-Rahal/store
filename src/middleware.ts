import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

const ALLOWED_ROLES = new Set(['seller', 'admin']);

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !ALLOWED_ROLES.has(token.role as string)) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Protects both the seller dashboard and any admin-only routes. /admin
// doesn't exist yet in this app, but is matched here so it's locked down
// the moment it's added.
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};