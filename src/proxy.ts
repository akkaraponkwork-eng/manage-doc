import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Allow auth-related routes
  if (pathname.startsWith('/api/auth') || pathname === '/login') {
    return NextResponse.next();
  }

  // Allow seed and debug APIs
  if (pathname === '/api/seed' || pathname === '/api/debug-user') {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
