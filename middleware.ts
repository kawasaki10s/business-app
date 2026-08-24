import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// ------------------------------------------------------------
// Route protection layer (first line of defense).
// This does NOT replace the requireAdmin()/requirePermission()
// checks inside API routes/server actions - it just stops
// unauthenticated/unauthorized users from ever reaching the page.
// ------------------------------------------------------------

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');

    if (isAdminRoute && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/investors/:path*',
    '/investments/:path*',
    '/loans/:path*',
    '/cards/:path*',
    '/history/:path*',
    '/notifications/:path*',
    '/settings/:path*',
    '/admin/:path*',
  ],
};
