import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { withListAccess, getItemInList, getTagInList } from "@/lib/queries";
import { itemSelect, toItemResponse } from "@/lib/responses";

type Params = { params: Promise<{ hash: string; itemId: string }> };

/**
 * POST /api/lists/[hash]/items/[itemId]/tags
 * Add a tag to a todo item. Body: { tagId: string }
 */
export async function POST(request: NextRequest, { params }: Params) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  const { hash, itemId } = await params;

  const body = await request.json().catch(() => null);
  if (!body || typeof body.tagId !== "string") {
    return NextResponse.json({ error: "tagId is required" }, { status: 400 });
  }

  return withListAccess(user.id, hash, async ({ list }) => {
    const item = await getItemInList(itemId, list.id);
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const tag = await getTagInList(body.tagId, list.id);
    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    const updated = await prisma.todoItem.update({
      where: { id: itemId },
      data: { tags: { connect: { id: body.tagId } } },
      select: itemSelect,
    });

    return NextResponse.json(toItemResponse(updated));
  });
}
