import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const userEmail = request.cookies.get("user_email")?.value;
  const userRole = request.cookies.get("user_role")?.value;
  const isLoggedIn = Boolean(userEmail && userRole);

  if (!isLoggedIn) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/buynow/:path*"],
};
