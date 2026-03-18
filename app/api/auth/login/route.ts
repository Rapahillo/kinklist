import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import {
  getClientIp,
  loginEmailLimiter,
  loginIpLimiter,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAGIC_LINK_EXPIRY_MINUTES = 15;

export async function POST(request: NextRequest) {
  // Rate limit by IP first
  const ip = getClientIp(request);
  const ipCheck = loginIpLimiter.check(ip);
  if (!ipCheck.allowed) {
    return rateLimitResponse(ipCheck.retryAfterSeconds);
  }

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    // Return success response to prevent email enumeration
    return NextResponse.json(
      { message: "Magic link sent" },
      { status: 200 }
    );
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || !EMAIL_REGEX.test(email)) {
    // Return same response to prevent email enumeration
    return NextResponse.json(
      { message: "Magic link sent" },
      { status: 200 }
    );
  }

  // Rate limit by email
  const emailCheck = loginEmailLimiter.check(email);
  if (!emailCheck.allowed) {
    // Same response body as success to prevent email enumeration
    return rateLimitResponse(emailCheck.retryAfterSeconds);
  }

  // Create user if they don't exist (implicit registration)
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  // Generate a cryptographically secure token (32 bytes, URL-safe base64)
  const token = randomBytes(32).toString("base64url");

  // Store the magic link
  const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRY_MINUTES * 60 * 1000);
  await prisma.magicLink.create({
    data: { token, email, expiresAt },
  });

  // Build the verification URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const magicLinkUrl = `${appUrl}/api/auth/verify?token=${token}`;

  // Send email or log to console in development
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "KinkList <onboarding@resend.dev>",
      to: email,
      subject: "Your login link",
      html: `
        <h2>Sign in to KinkList</h2>
        <p>Click the link below to sign in. This link expires in ${MAGIC_LINK_EXPIRY_MINUTES} minutes.</p>
        <p><a href="${magicLinkUrl}">Sign in to KinkList</a></p>
        <p>If you didn't request this link, you can safely ignore this email.</p>
      `,
    });
  } else {
    console.log(`\n[DEV] Magic link for ${email}: ${magicLinkUrl}\n`);
  }

  void logAudit({ action: "magic_link.request", metadata: { ip, email } });

  return NextResponse.json(
    { message: "Magic link sent" },
    { status: 200 }
  );
}
