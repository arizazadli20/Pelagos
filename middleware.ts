import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Demo login requirement disabled for now — every route is open, no
// redirect to /login. To restore it, bring back the auth-cookie check
// that used to live here (see git history) along with the matcher below.
export function middleware(_request: NextRequest) {
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
