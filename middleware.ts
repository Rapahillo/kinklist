import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware to protect routes that require authentication.
 * Checks for the presence of a session cookie — full DB validation
 * happens in getAuthenticatedUser() within server components/route handlers.
 */
export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("session")?.value;

  if (!sessionToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
