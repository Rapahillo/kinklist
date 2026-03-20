import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { withListAccess } from "@/lib/queries";

/**
 * POST /api/lists/[hash]/items/archive
 * Archive all completed items in a list.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  const { hash } = await params;

  return withListAccess(user.id, hash, async ({ list }) => {
    const result = await prisma.todoItem.updateMany({
      where: {
        listId: list.id,
        status: "COMPLETED",
      },
      data: {
        status: "ARCHIVED",
      },
    });

    return NextResponse.json({ archivedCount: result.count });
  });
}
