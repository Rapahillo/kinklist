import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function DELETE(request: Request) {
  const result = await requireAuth();
  if (result instanceof NextResponse) return result;
  const user = result;

  const body = await request.json();
  if (body.confirmEmail?.toLowerCase().trim() !== user.email.toLowerCase()) {
    return NextResponse.json(
      { error: "Email confirmation does not match" },
      { status: 400 }
    );
  }

  await prisma.$transaction(async (tx) => {
    // Delete all sessions for this user
    await tx.session.deleteMany({ where: { userId: user.id } });

    // Delete all magic links for this user's email
    await tx.magicLink.deleteMany({ where: { email: user.email } });

    // Delete collaborator entries on other users' lists
    await tx.collaborator.deleteMany({ where: { userId: user.id } });

    // Delete all owned todo lists (items, tags, collaborators cascade via schema)
    await tx.todoList.deleteMany({ where: { ownerId: user.id } });

    // Delete the user
    await tx.user.delete({ where: { id: user.id } });
  });

  // Audit log survives user deletion (no FK cascade)
  void logAudit({
    action: "account.delete",
    metadata: { email: user.email },
  });

  const cookieStore = await cookies();
  cookieStore.set("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
    path: "/",
  });

  return Response.json({ success: true });
}
