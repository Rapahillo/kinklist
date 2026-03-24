import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { withListAccess, getItemInList, getTagInList } from "@/lib/queries";
import { itemSelect, toItemResponse } from "@/lib/responses";

type Params = { params: Promise<{ hash: string; itemId: string; tagId: string }> };

/**
 * DELETE /api/lists/[hash]/items/[itemId]/tags/[tagId]
 * Remove a tag from a todo item.
 */
export async function DELETE(_request: NextRequest, { params }: Params) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  const { hash, itemId, tagId } = await params;

  return withListAccess(user.id, hash, async ({ list }) => {
    const item = await getItemInList(itemId, list.id);
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const tag = await getTagInList(tagId, list.id);
    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    const updated = await prisma.todoItem.update({
      where: { id: itemId },
      data: { tags: { disconnect: { id: tagId } } },
      select: itemSelect,
    });

    return NextResponse.json(toItemResponse(updated));
  });
}
