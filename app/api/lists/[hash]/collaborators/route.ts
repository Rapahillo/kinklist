import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { withListAccess, getCollaboratorsInList } from "@/lib/queries";
import { toCollaboratorResponse } from "@/lib/responses";
import {
  validateEmail,
  validationErrorResponse,
} from "@/lib/validation";
import { logAudit } from "@/lib/audit";
import { rotateSessionToken } from "@/lib/auth";
import type { ValidationError } from "@/lib/validation";

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
 * Add a collaborator by email. Only the list owner can add collaborators.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  const { hash } = await params;

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const errors: ValidationError[] = [];
  const email = validateEmail(body.email, errors);
  if (errors.length > 0) {
    return validationErrorResponse(errors);
  }

  return withListAccess(user.id, hash, async ({ list, role }) => {
    if (role !== "owner") {
      return NextResponse.json(
        { error: "Only the list owner can add collaborators" },
        { status: 403 }
      );
    }

    // Check if the email is the owner's own
    if (email === user.email) {
      return NextResponse.json(
        { error: "You already own this list" },
        { status: 400 }
      );
    }

    // Find or create the user
    const collaboratorUser = await prisma.user.upsert({
      where: { email: email! },
      update: {},
      create: { email: email! },
    });

    // Check if already a collaborator
    const existing = await prisma.collaborator.findUnique({
      where: {
        listId_userId: { listId: list.id, userId: collaboratorUser.id },
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
        userId: collaboratorUser.id,
      },
      select: {
        id: true,
        userId: true,
        nickname: true,
        addedAt: true,
        user: { select: { email: true } },
      },
    });

    void logAudit({
      userId: user.id,
      action: "collaborator.add",
      targetType: "list",
      targetId: list.id,
      metadata: { collaboratorUserId: collaboratorUser.id },
    });

    await rotateSessionToken();

    return NextResponse.json(
      toCollaboratorResponse(collaborator, "owner"),
      { status: 201 }
    );
  });
}
