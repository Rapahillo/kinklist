import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { withListAccess, getTagInList } from "@/lib/queries";

type Params = { params: Promise<{ hash: string; tagId: string }> };

/**
 * DELETE /api/lists/[hash]/tags/[tagId]
 * Delete a tag from a list (also removes it from all items via Prisma implicit M2M).
 */
export async function DELETE(_request: NextRequest, { params }: Params) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  const { hash, tagId } = await params;

  return withListAccess(user.id, hash, async ({ list }) => {
    const existing = await getTagInList(tagId, list.id);
    if (!existing) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    await prisma.tag.delete({ where: { id: tagId } });

    return NextResponse.json({ success: true });
  });
}
