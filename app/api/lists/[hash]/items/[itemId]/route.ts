import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { withListAccess, getItemInList } from "@/lib/queries";
import { itemSelect, toItemResponse } from "@/lib/responses";
import {
  validateTitle,
  validateDescription,
  validateProps,
  validationErrorResponse,
} from "@/lib/validation";
import type { ValidationError } from "@/lib/validation";

type Params = { params: Promise<{ hash: string; itemId: string }> };

/**
 * PATCH /api/lists/[hash]/items/[itemId]
 * Update a todo item (title, description, props, status).
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  const { hash, itemId } = await params;

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  return withListAccess(user.id, hash, async ({ list }) => {
    const existing = await getItemInList(itemId, list.id);
    if (!existing) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const errors: ValidationError[] = [];
    const data: Record<string, unknown> = {};

    if ("title" in body) {
      const title = validateTitle(body.title, errors);
      if (errors.length > 0) return validationErrorResponse(errors);
      data.title = title;
    }

    if ("description" in body) {
      const description = validateDescription(body.description, errors);
      if (errors.length > 0) return validationErrorResponse(errors);
      data.description = description;
    }

    if ("props" in body) {
      const props = validateProps(body.props, errors);
      if (errors.length > 0) return validationErrorResponse(errors);
      data.props = props ?? [];
    }

    if ("status" in body) {
      const validStatuses = ["OPEN", "COMPLETED", "ARCHIVED"];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: "Invalid status. Must be OPEN, COMPLETED, or ARCHIVED" },
          { status: 400 }
        );
      }
      data.status = body.status;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const updated = await prisma.todoItem.update({
      where: { id: itemId },
      data,
      select: itemSelect,
    });

    return NextResponse.json(toItemResponse(updated));
  });
}

/**
 * DELETE /api/lists/[hash]/items/[itemId]
 * Delete a todo item from the list.
 */
export async function DELETE(_request: Request, { params }: Params) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  const { hash, itemId } = await params;

  return withListAccess(user.id, hash, async ({ list }) => {
    const existing = await getItemInList(itemId, list.id);
    if (!existing) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    await prisma.todoItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ success: true });
  });
}
