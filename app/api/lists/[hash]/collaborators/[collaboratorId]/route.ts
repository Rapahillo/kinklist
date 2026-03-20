import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, rotateSessionToken } from "@/lib/auth";
import { withListAccess, getCollaboratorInList } from "@/lib/queries";
import { toCollaboratorResponse } from "@/lib/responses";
import { validateNickname, validationErrorResponse } from "@/lib/validation";
import { logAudit } from "@/lib/audit";
import type { ValidationError } from "@/lib/validation";

type Params = { params: Promise<{ hash: string; collaboratorId: string }> };

/**
 * PATCH /api/lists/[hash]/collaborators/[collaboratorId]
 * Update a collaborator's nickname. Owner only.
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  const { hash, collaboratorId } = await params;

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  return withListAccess(user.id, hash, async ({ list, role }) => {
    if (role !== "owner") {
      return NextResponse.json(
        { error: "Only the list owner can edit nicknames" },
        { status: 403 }
      );
    }

    const existing = await getCollaboratorInList(collaboratorId, list.id);
    if (!existing) {
      return NextResponse.json(
        { error: "Collaborator not found" },
        { status: 404 }
      );
    }

    const data: { nickname?: string | null } = {};

    if ("nickname" in body) {
      if (body.nickname === null || body.nickname === "") {
        data.nickname = null;
      } else {
        const errors: ValidationError[] = [];
        const nickname = validateNickname(body.nickname, errors);
        if (errors.length > 0) return validationErrorResponse(errors);
        data.nickname = nickname;
      }
    } else {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const updated = await prisma.collaborator.update({
      where: { id: collaboratorId },
      data,
      select: {
        id: true,
        userId: true,
        nickname: true,
        addedAt: true,
        user: { select: { email: true } },
      },
    });

    return NextResponse.json(toCollaboratorResponse(updated, "owner"));
  });
}

/**
 * DELETE /api/lists/[hash]/collaborators/[collaboratorId]
 * Remove a collaborator. Owner only.
 */
export async function DELETE(_request: Request, { params }: Params) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  const { hash, collaboratorId } = await params;

  return withListAccess(user.id, hash, async ({ list, role }) => {
    if (role !== "owner") {
      return NextResponse.json(
        { error: "Only the list owner can remove collaborators" },
        { status: 403 }
      );
    }

    const existing = await getCollaboratorInList(collaboratorId, list.id);
    if (!existing) {
      return NextResponse.json(
        { error: "Collaborator not found" },
        { status: 404 }
      );
    }

    await prisma.collaborator.delete({
      where: { id: collaboratorId },
    });

    void logAudit({
      userId: user.id,
      action: "collaborator.remove",
      targetType: "list",
      targetId: list.id,
      metadata: { collaboratorId },
    });

    await rotateSessionToken();

    return NextResponse.json({ success: true });
  });
}
