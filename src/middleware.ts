import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("auth-token")?.value;
  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register");
  const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");

  // If trying to access auth pages while logged in, redirect to dashboard
  if (isAuthPage && authToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If trying to access dashboard while not logged in, redirect to login
  if (isDashboardPage && !authToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
