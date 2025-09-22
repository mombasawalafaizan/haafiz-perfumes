// middleware.ts (at project root)
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Only run on admin routes (except login)
  const pathname = request.nextUrl.pathname;
  const isAuthenticated =
    request.cookies.get("admin-authenticated")?.value === "true";
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!isAuthenticated)
      return NextResponse.redirect(new URL("/admin/login", request.url));
    if (pathname === "/admin")
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  } else if (pathname.startsWith("/admin/login")) {
    if (isAuthenticated)
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*", // Only process admin routes
};
