import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireListAccess } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

/**
 * DELETE /api/lists/[hash]
 * Delete a todo list. Only the owner can delete.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ hash: string }> }
) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  const { hash } = await params;

  const accessResult = await requireListAccess(user.id, hash);
  if (accessResult instanceof NextResponse) return accessResult;
  const { list, role } = accessResult;

  if (role !== "owner") {
    return NextResponse.json(
      { error: "Only the list owner can delete this list" },
      { status: 403 }
    );
  }

  await prisma.todoList.delete({
    where: { id: list.id },
  });

  void logAudit({
    userId: user.id,
    action: "list.delete",
    targetType: "list",
    targetId: list.id,
  });

  return NextResponse.json({ success: true });
}
