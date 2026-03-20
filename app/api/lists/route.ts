import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { listSelect, toListResponse } from "@/lib/responses";
import { validateTitle, validationErrorResponse } from "@/lib/validation";
import { logAudit } from "@/lib/audit";
import type { ValidationError } from "@/lib/validation";

/**
 * GET /api/lists
 * Fetch all lists the authenticated user owns or collaborates on.
 */
export async function GET() {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  const [ownedLists, collaborations] = await Promise.all([
    prisma.todoList.findMany({
      where: { ownerId: user.id },
      select: {
        ...listSelect,
        _count: { select: { items: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.collaborator.findMany({
      where: { userId: user.id },
      select: {
        list: {
          select: {
            ...listSelect,
            _count: { select: { items: true } },
          },
        },
      },
      orderBy: { addedAt: "desc" },
    }),
  ]);

  const lists = [
    ...ownedLists.map((list) => ({
      ...toListResponse(list, "owner" as const),
      itemCount: list._count.items,
    })),
    ...collaborations.map((c) => ({
      ...toListResponse(c.list, "collaborator" as const),
      itemCount: c.list._count.items,
    })),
  ];

  return NextResponse.json({ lists });
}

/**
 * POST /api/lists
 * Create a new todo list.
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const user = authResult;

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const errors: ValidationError[] = [];
  const title = validateTitle(body.title, errors);
  if (errors.length > 0) {
    return validationErrorResponse(errors);
  }

  // Generate a unique URL-safe hash (16 random bytes = 32 hex chars)
  let hash: string;
  let attempts = 0;
  do {
    hash = randomBytes(16).toString("hex");
    const existing = await prisma.todoList.findUnique({
      where: { hash },
      select: { id: true },
    });
    if (!existing) break;
    attempts++;
  } while (attempts < 3);

  const list = await prisma.todoList.create({
    data: {
      hash,
      title: title!,
      ownerId: user.id,
    },
    select: {
      ...listSelect,
      _count: { select: { items: true } },
    },
  });

  void logAudit({
    userId: user.id,
    action: "list.create",
    targetType: "list",
    targetId: list.id,
  });

  return NextResponse.json(
    {
      ...toListResponse(list, "owner"),
      itemCount: list._count.items,
    },
    { status: 201 }
  );
}
