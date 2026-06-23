import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "src/auth";

const LIMITED_ROLE_ALLOWED_PATHS = [
  "/admin/dashboard",
  "/admin/articles",
  "/admin/media",
  "/admin/profile",
];

function isPathWithin(pathname: string, basePath: string) {
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to the standalone login page
  if (pathname === "/tungkuaceh") {
    return NextResponse.next();
  }

  // Allow NextAuth API routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // For all other /admin/* routes, check session
  const session = await auth();
  if (!session) {
    const loginUrl = new URL("/tungkuaceh", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = session.user?.role;
  if (role === "PENULIS" && isPathWithin(pathname, "/admin/articles/trash")) {
    return NextResponse.redirect(new URL("/admin/articles", request.url));
  }

  if (
    role !== "ADMIN" &&
    !LIMITED_ROLE_ALLOWED_PATHS.some((allowedPath) =>
      isPathWithin(pathname, allowedPath)
    )
  ) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/tungkuaceh"],
};
