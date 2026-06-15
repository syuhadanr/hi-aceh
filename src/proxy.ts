import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "src/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to the standalone login page
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // Allow NextAuth API routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Allow /admin/login redirect (it just redirects to /login)
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // For all other /admin/* routes, check session
  const session = await auth();
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
