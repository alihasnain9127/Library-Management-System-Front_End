// proxy.js (Root directory)
import { NextResponse } from 'next/server';

export function proxy(request) {
  const { pathname } = request.nextUrl;
  
  // Extract token and user role from cookies
  const token = request.cookies.get('token')?.value;
  const userRole = request.cookies.get('role')?.value; // 'admin' or 'user'

  // Define route protection rules
  const isAdminRoute = pathname.startsWith('/admin');
  const isUserRoute = pathname.startsWith('/user');
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');

  // 1. If trying to access protected dashboards without a token
  if ((isAdminRoute || isUserRoute) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Role Enforcement: Block standard users from administrative routing
  if (isAdminRoute && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // 3. Reverse Protection: Redirect authenticated users away from login/register pages
  if (isAuthRoute && token) {
    const targetDashboard = userRole === 'admin' ? '/admin/dashboard' : '/user/dashboard';
    return NextResponse.redirect(new URL(targetDashboard, request.url));
  }

  return NextResponse.next();
}

// Limit proxy tracking to application dashboard and authentication matrices
export const config = {
  matcher: ['/admin/:path*', '/user/:path*', '/login', '/register'],
};