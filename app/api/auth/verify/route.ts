import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getClientIp, verifyIpLimiter } from "@/lib/rate-limit";

const SESSION_EXPIRY_DAYS = 3;

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Rate limit by IP to prevent token brute-force
  const ip = getClientIp(request);
  const ipCheck = verifyIpLimiter.check(ip);
  if (!ipCheck.allowed) {
    return NextResponse.redirect(`${appUrl}/?error=rate-limited`);
  }

  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${appUrl}/?error=invalid`);
  }

  // Look up the magic link
  const magicLink = await prisma.magicLink.findUnique({
    where: { token },
  });

  if (!magicLink) {
    return NextResponse.redirect(`${appUrl}/?error=invalid`);
  }

  if (magicLink.usedAt) {
    return NextResponse.redirect(`${appUrl}/?error=used`);
  }

  if (magicLink.expiresAt < new Date()) {
    return NextResponse.redirect(`${appUrl}/?error=expired`);
  }

  // Atomically mark the token as used to prevent race conditions.
  // If another request already used it, updateMany returns count 0.
  const updated = await prisma.magicLink.updateMany({
    where: {
      id: magicLink.id,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });

  if (updated.count === 0) {
    return NextResponse.redirect(`${appUrl}/?error=used`);
  }

  // Find the user (should exist — created during login request)
  const user = await prisma.user.findUnique({
    where: { email: magicLink.email },
  });

  if (!user) {
    return NextResponse.redirect(`${appUrl}/?error=invalid`);
  }

  // Create a new session
  const sessionToken = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      token: sessionToken,
      userId: user.id,
      expiresAt,
    },
  });

  // Set the session cookie
  const cookieStore = await cookies();
  cookieStore.set("session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  // Check for redirect-after-login (e.g., user was trying to access /list/[hash])
  const redirectPath = cookieStore.get("redirect_after_login")?.value;
  if (redirectPath && redirectPath.startsWith("/list/")) {
    cookieStore.set("redirect_after_login", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    });
    return NextResponse.redirect(`${appUrl}${redirectPath}`);
  }

  return NextResponse.redirect(`${appUrl}/dashboard`);
}
