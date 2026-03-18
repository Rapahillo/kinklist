import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { User, TodoList } from "@/app/generated/prisma/client";

export type ListRole = "owner" | "collaborator";

export interface ListAccess {
  list: TodoList;
  role: ListRole;
}

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

/**
 * Check if a user is authorized to access a specific list.
 * Returns the list and the user's role, or null if unauthorized.
 */
export async function authorizeListAccess(
  userId: string,
  listHash: string
): Promise<ListAccess | null> {
  const list = await prisma.todoList.findUnique({
    where: { hash: listHash },
  });

  if (!list) return null;

  if (list.ownerId === userId) {
    return { list, role: "owner" };
  }

  const collaborator = await prisma.collaborator.findUnique({
    where: { listId_userId: { listId: list.id, userId } },
  });

  if (collaborator) {
    return { list, role: "collaborator" };
  }

  return null;
}

/**
 * For protected API routes: returns list access or a 403 response.
 * Usage:
 *   const access = await requireListAccess(user.id, hash);
 *   if (access instanceof NextResponse) return access;
 *   const { list, role } = access;
 */
export async function requireListAccess(
  userId: string,
  listHash: string
): Promise<ListAccess | NextResponse> {
  const access = await authorizeListAccess(userId, listHash);
  if (!access) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return access;
}
