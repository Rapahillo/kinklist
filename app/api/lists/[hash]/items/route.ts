import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { withListAccess, getItemsInList } from "@/lib/queries";
import { itemSelect, toItemResponse } from "@/lib/responses";
import { validateTitle, validationErrorResponse } from "@/lib/validation";
import { queueItemNotification } from "@/lib/notifications";
import type { ValidationError } from "@/lib/validation";

/**
 * GET /api/lists/[hash]/items
 * Fetch all non-archived items in a list.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  const { hash } = await params;

  return withListAccess(user.id, hash, async ({ list }) => {
    const items = await getItemsInList(list.id, {
      status: undefined,
    });

    return NextResponse.json({
      items: items.map(toItemResponse),
    });
  });
}

/**
 * POST /api/lists/[hash]/items
 * Add a new todo item to the list.
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
  const title = validateTitle(body.title, errors);
  if (errors.length > 0) {
    return validationErrorResponse(errors);
  }

  return withListAccess(user.id, hash, async ({ list }) => {
    const item = await prisma.todoItem.create({
      data: {
        title: title!,
        status: "OPEN",
        listId: list.id,
        createdByUserId: user.id,
      },
      select: itemSelect,
    });

    queueItemNotification(list.id, hash, title!, user.id);

    return NextResponse.json(toItemResponse(item), { status: 201 });
  });
}
