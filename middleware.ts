import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Keep in sync with AUTH_COOKIE_NAME in lib/auth.ts */
const AUTH_COOKIE_NAME = "peykgoz-auth";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/incidents",
  "/vessels",
  "/ai-analysis",
  "/response",
  "/reports",
  "/account",
];

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authed = request.cookies.get(AUTH_COOKIE_NAME)?.value === "1";
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isProtected(pathname) && !authed) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && authed) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/incidents/:path*",
    "/vessels/:path*",
    "/ai-analysis/:path*",
    "/response/:path*",
    "/reports/:path*",
    "/account/:path*",
    "/login",
    "/register",
  ],
};
