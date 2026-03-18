import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

/**
 * GET /api/auth/sessions — List all active sessions for the current user.
 */
export async function GET() {
  const result = await requireAuth();
  if (result instanceof NextResponse) return result;
  const user = result;

  const cookieStore = await cookies();
  const currentToken = cookieStore.get("session")?.value;

  const sessions = await prisma.session.findMany({
    where: {
      userId: user.id,
      expiresAt: { gt: new Date() },
    },
    select: {
      id: true,
      createdAt: true,
      lastUsedAt: true,
      token: true,
    },
    orderBy: { lastUsedAt: "desc" },
  });

  return NextResponse.json({
    sessions: sessions.map((s) => ({
      id: s.id,
      createdAt: s.createdAt.toISOString(),
      lastUsedAt: s.lastUsedAt.toISOString(),
      isCurrent: s.token === currentToken,
    })),
  });
}

/**
 * DELETE /api/auth/sessions — Log out all devices.
 * Use ?all=true to include the current session, otherwise keeps current session.
 */
export async function DELETE(request: Request) {
  const result = await requireAuth();
  if (result instanceof NextResponse) return result;
  const user = result;

  const url = new URL(request.url);
  const includeCurrentSession = url.searchParams.get("all") === "true";

  const cookieStore = await cookies();
  const currentToken = cookieStore.get("session")?.value;

  if (includeCurrentSession) {
    // Delete all sessions
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    // Clear the cookie
    cookieStore.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    });
  } else {
    // Delete all sessions except the current one
    await prisma.session.deleteMany({
      where: {
        userId: user.id,
        ...(currentToken ? { token: { not: currentToken } } : {}),
      },
    });
  }

  return NextResponse.json({ success: true });
}
