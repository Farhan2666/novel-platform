import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const authRoutes = ["/auth/login", "/auth/register"];
  const protectedRoutes = ["/profile", "/author", "/admin"];
  const isAuthRoute = authRoutes.some(r => pathname.startsWith(r));
  const isProtected = protectedRoutes.some(r => pathname.startsWith(r));

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isProtected && !token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/author/:path*", "/admin/:path*", "/auth/:path*"],
};
