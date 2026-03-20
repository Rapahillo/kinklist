import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireListAccess } from "@/lib/auth";

/**
 * GET /api/audit?listHash=...&page=1&limit=50
 * Returns audit logs for a list. Only accessible by the list owner.
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  const listHash = request.nextUrl.searchParams.get("listHash");
  if (!listHash) {
    return NextResponse.json(
      { error: "listHash is required" },
      { status: 400 }
    );
  }

  const accessResult = await requireListAccess(user.id, listHash);
  if (accessResult instanceof NextResponse) return accessResult;
  const { list, role } = accessResult;

  if (role !== "owner") {
    return NextResponse.json(
      { error: "Only the list owner can view audit logs" },
      { status: 403 }
    );
  }

  const page = Math.max(1, parseInt(request.nextUrl.searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(request.nextUrl.searchParams.get("limit") || "50", 10)));
  const skip = (page - 1) * limit;

  // 90-day retention window
  const retentionCutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: {
        targetType: "list",
        targetId: list.id,
        createdAt: { gt: retentionCutoff },
      },
      select: {
        id: true,
        action: true,
        userId: true,
        metadata: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({
      where: {
        targetType: "list",
        targetId: list.id,
        createdAt: { gt: retentionCutoff },
      },
    }),
  ]);

  return NextResponse.json({
    logs: logs.map((log) => ({
      id: log.id,
      action: log.action,
      userId: log.userId,
      metadata: log.metadata,
      createdAt: log.createdAt.toISOString(),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
