import { prisma } from "@/lib/prisma";
import type { ListRole } from "@/lib/auth";

/**
 * Resolve a createdByUserId to a safe display name based on the viewer's role.
 * - If the creator is the viewer: "You"
 * - If the viewer is the owner: show the creator's email
 * - If the viewer is a collaborator: show the creator's nickname or "Collaborator"
 */
export async function resolveDisplayName(
  createdByUserId: string,
  viewerUserId: string,
  viewerRole: ListRole,
  listId: string
): Promise<string> {
  if (createdByUserId === viewerUserId) {
    return "You";
  }

  if (viewerRole === "owner") {
    const user = await prisma.user.findUnique({
      where: { id: createdByUserId },
      select: { email: true },
    });
    return user?.email ?? "Unknown";
  }

  // Viewer is a collaborator — check if creator is the list owner
  const list = await prisma.todoList.findUnique({
    where: { id: listId },
    select: { ownerId: true },
  });

  if (list && createdByUserId === list.ownerId) {
    return "List owner";
  }

  // Creator is another collaborator — show their nickname
  const collaborator = await prisma.collaborator.findUnique({
    where: { listId_userId: { listId, userId: createdByUserId } },
    select: { nickname: true },
  });

  return collaborator?.nickname || "Collaborator";
}

/**
 * Batch resolve display names for multiple item creators.
 * More efficient than calling resolveDisplayName individually.
 */
export async function resolveDisplayNames(
  createdByUserIds: string[],
  viewerUserId: string,
  viewerRole: ListRole,
  listId: string
): Promise<Map<string, string>> {
  const uniqueIds = [...new Set(createdByUserIds)];
  const result = new Map<string, string>();

  // Resolve "You" first
  if (uniqueIds.includes(viewerUserId)) {
    result.set(viewerUserId, "You");
  }

  const remainingIds = uniqueIds.filter((id) => !result.has(id));
  if (remainingIds.length === 0) return result;

  if (viewerRole === "owner") {
    // Owner can see emails
    const users = await prisma.user.findMany({
      where: { id: { in: remainingIds } },
      select: { id: true, email: true },
    });
    for (const user of users) {
      result.set(user.id, user.email);
    }
    // Fill unknowns
    for (const id of remainingIds) {
      if (!result.has(id)) result.set(id, "Unknown");
    }
  } else {
    // Collaborator view — get list owner and collaborator nicknames
    const list = await prisma.todoList.findUnique({
      where: { id: listId },
      select: { ownerId: true },
    });

    const collaborators = await prisma.collaborator.findMany({
      where: { listId, userId: { in: remainingIds } },
      select: { userId: true, nickname: true },
    });

    const nicknameMap = new Map(
      collaborators.map((c) => [c.userId, c.nickname])
    );

    for (const id of remainingIds) {
      if (list && id === list.ownerId) {
        result.set(id, "List owner");
      } else {
        result.set(id, nicknameMap.get(id) || "Collaborator");
      }
    }
  }

  return result;
}
