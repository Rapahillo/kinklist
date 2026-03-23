import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorizeListAccess, type ListAccess } from "@/lib/auth";
import {
  itemSelect,
  tagSelect,
  collaboratorSelectOwner,
  collaboratorSelectCollaborator,
} from "@/lib/responses";

/**
 * Higher-order helper that combines authentication check with list authorization.
 * Prevents IDOR by always scoping operations to an authorized list.
 *
 * Usage:
 *   return withListAccess(user.id, hash, async ({ list, role }) => {
 *     // list is verified accessible, all queries should scope to list.id
 *     return NextResponse.json({ ... });
 *   });
 */
export async function withListAccess(
  userId: string,
  listHash: string,
  handler: (access: ListAccess) => Promise<NextResponse>
): Promise<NextResponse> {
  const access = await authorizeListAccess(userId, listHash);
  if (!access) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return handler(access);
}

// --- Scoped query helpers ---
// All queries use compound where clauses to prevent IDOR.
// Never query by entity ID alone — always scope to the parent list.

export async function getItemInList(itemId: string, listId: string) {
  return prisma.todoItem.findFirst({
    where: { id: itemId, listId },
    select: itemSelect,
  });
}

export async function getItemsInList(
  listId: string,
  filters?: {
    status?: string;
  }
) {
  return prisma.todoItem.findMany({
    where: {
      listId,
      ...(filters?.status ? { status: filters.status as never } : {}),
    },
    select: itemSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function getTagInList(tagId: string, listId: string) {
  return prisma.tag.findFirst({
    where: { id: tagId, listId },
    select: tagSelect,
  });
}

export async function getTagsInList(listId: string) {
  return prisma.tag.findMany({
    where: { listId },
    select: tagSelect,
    orderBy: { name: "asc" },
  });
}

export async function getCollaboratorsInList(
  listId: string,
  viewerRole: "owner" | "collaborator"
) {
  if (viewerRole === "owner") {
    return prisma.collaborator.findMany({
      where: { listId },
      select: collaboratorSelectOwner,
      orderBy: { addedAt: "asc" },
    });
  }
  return prisma.collaborator.findMany({
    where: { listId },
    select: collaboratorSelectCollaborator,
    orderBy: { addedAt: "asc" },
  });
}

export async function getCollaboratorInList(
  collaboratorId: string,
  listId: string
) {
  return prisma.collaborator.findFirst({
    where: { id: collaboratorId, listId },
    select: collaboratorSelectOwner,
  });
}
