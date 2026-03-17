import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * Returns the authenticated user from the session cookie, or null if not authenticated.
 */
export async function getAuthenticatedUser() {
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
