import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, rotateSessionToken } from "@/lib/auth";
import { withListAccess, getCollaboratorsInList } from "@/lib/queries";
import { toCollaboratorResponse } from "@/lib/responses";
import { logAudit } from "@/lib/audit";

/**
 * GET /api/lists/[hash]/collaborators
 * List all collaborators on a list.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  const { hash } = await params;

  return withListAccess(user.id, hash, async ({ list, role }) => {
    const collaborators = await getCollaboratorsInList(list.id, role);

    const shaped = collaborators.map((c) =>
      role === "owner"
        ? toCollaboratorResponse(c as Parameters<typeof toCollaboratorResponse>[0] & { user: { email: string } }, "owner")
        : toCollaboratorResponse(c as Parameters<typeof toCollaboratorResponse>[0], "collaborator")
    );

    return NextResponse.json({
      collaborators: shaped,
      role,
      ownerId: list.ownerId,
    });
  });
}

/**
 * POST /api/lists/[hash]/collaborators
 * Join a list as a collaborator. The authenticated user adds themselves.
 * The hash URL serves as the invitation — no email-based invites.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  const { hash } = await params;

  // Look up list directly — cannot use withListAccess because
  // the caller is not yet a collaborator
  const list = await prisma.todoList.findUnique({
    where: { hash },
    select: { id: true, ownerId: true },
  });

  if (!list) {
    return NextResponse.json({ error: "List not found" }, { status: 404 });
  }

  if (list.ownerId === user.id) {
    return NextResponse.json(
      { error: "You already own this list" },
      { status: 400 }
    );
  }

  const existing = await prisma.collaborator.findUnique({
    where: {
      listId_userId: { listId: list.id, userId: user.id },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Already a collaborator" },
      { status: 400 }
    );
  }

  const collaborator = await prisma.collaborator.create({
    data: {
      listId: list.id,
      userId: user.id,
    },
    select: {
      id: true,
      userId: true,
      nickname: true,
      addedAt: true,
    },
  });

  void logAudit({
    userId: user.id,
    action: "collaborator.join",
    targetType: "list",
    targetId: list.id,
  });

  await rotateSessionToken();

  return NextResponse.json(
    toCollaboratorResponse(collaborator, "collaborator"),
    { status: 201 }
  );
}
