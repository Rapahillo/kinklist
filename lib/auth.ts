import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { User } from "@/app/generated/prisma/client";

/**
 * Returns the authenticated user from the session cookie, or null if not authenticated.
 * Use in server components and route handlers.
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) return null;

  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) return null;

  return session.user;
}

/**
 * For protected API routes: returns the authenticated user or a 401 response.
 * Usage:
 *   const result = await requireAuth();
 *   if (result instanceof NextResponse) return result;
 *   const user = result;
 */
export async function requireAuth(): Promise<User | NextResponse> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return user;
}
