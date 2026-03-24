import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { withListAccess, getTagsInList } from "@/lib/queries";
import { toTagResponse } from "@/lib/responses";
import { validateTagName, validationErrorResponse } from "@/lib/validation";
import type { ValidationError } from "@/lib/validation";

/**
 * GET /api/lists/[hash]/tags
 * Fetch all tags for a list.
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
    const tags = await getTagsInList(list.id);
    return NextResponse.json({ tags: tags.map(toTagResponse) });
  });
}

/**
 * POST /api/lists/[hash]/tags
 * Create a new tag for a list.
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
  const name = validateTagName(body.name, errors);
  if (errors.length > 0) {
    return validationErrorResponse(errors);
  }

  const color =
    typeof body.color === "string" && body.color.trim().length > 0
      ? body.color.trim().slice(0, 20)
      : null;

  return withListAccess(user.id, hash, async ({ list }) => {
    try {
      const tag = await prisma.tag.create({
        data: {
          name: name!,
          color,
          listId: list.id,
        },
        select: { id: true, name: true, color: true },
      });
      return NextResponse.json(toTagResponse(tag), { status: 201 });
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        err.code === "P2002"
      ) {
        return NextResponse.json(
          { error: "A tag with that name already exists in this list" },
          { status: 409 }
        );
      }
      throw err;
    }
  });
}
