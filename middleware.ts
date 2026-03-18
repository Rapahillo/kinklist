import { NextRequest, NextResponse } from "next/server";

/**
 * Apply security headers to all responses.
 */
function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
  );
  response.headers.set("X-Frame-Options", "DENY");
  return response;
}

/**
 * Routes that require an authenticated session cookie.
 */
const PROTECTED_PREFIXES = ["/dashboard", "/list"];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Auth guard for protected routes
  if (isProtectedRoute(pathname)) {
    const sessionToken = request.cookies.get("session")?.value;
    if (!sessionToken) {
      const redirectUrl = new URL("/", request.url);
      const response = NextResponse.redirect(redirectUrl);

      // Store intended destination so user is redirected back after login
      if (pathname.startsWith("/list/")) {
        response.cookies.set("redirect_after_login", pathname, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 15, // 15 minutes
        });
      }

      return applySecurityHeaders(response);
    }
  }

  const response = NextResponse.next();
  return applySecurityHeaders(response);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
