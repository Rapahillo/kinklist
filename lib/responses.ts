import type { ListRole } from "@/lib/auth";

// --- Prisma select objects (use in all queries to prevent field leakage) ---

export const listSelect = {
  id: true,
  hash: true,
  title: true,
  createdAt: true,
  updatedAt: true,
  ownerId: true,
} as const;

export const itemSelect = {
  id: true,
  title: true,
  description: true,
  props: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  createdByUserId: true,
  tags: {
    select: {
      id: true,
      name: true,
      color: true,
    },
  },
} as const;

export const tagSelect = {
  id: true,
  name: true,
  color: true,
} as const;

/** Select for owner view — includes email */
export const collaboratorSelectOwner = {
  id: true,
  userId: true,
  nickname: true,
  addedAt: true,
  user: { select: { email: true } },
} as const;

/** Select for collaborator view — no email */
export const collaboratorSelectCollaborator = {
  id: true,
  userId: true,
  nickname: true,
  addedAt: true,
} as const;

// --- Response shaping functions ---

interface ListRow {
  id: string;
  hash: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
}

export function toListResponse(list: ListRow, role: ListRole) {
  return {
    hash: list.hash,
    title: list.title,
    role,
    createdAt: list.createdAt.toISOString(),
    updatedAt: list.updatedAt.toISOString(),
  };
}

interface ItemRow {
  id: string;
  title: string;
  description: string | null;
  props: unknown;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  createdByUserId: string;
  tags: { id: string; name: string; color: string | null }[];
}

export function toItemResponse(item: ItemRow) {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    props: Array.isArray(item.props) ? (item.props as string[]) : [],
    status: item.status,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    createdByUserId: item.createdByUserId,
    tags: item.tags.map((t) => ({ id: t.id, name: t.name, color: t.color })),
  };
}

interface TagRow {
  id: string;
  name: string;
  color: string | null;
}

export function toTagResponse(tag: TagRow) {
  return {
    id: tag.id,
    name: tag.name,
    color: tag.color,
  };
}

interface CollaboratorRowOwner {
  id: string;
  userId: string;
  nickname: string | null;
  addedAt: Date;
  user: { email: string };
}

interface CollaboratorRowCollaborator {
  id: string;
  userId: string;
  nickname: string | null;
  addedAt: Date;
}

export function toCollaboratorResponse(
  collaborator: CollaboratorRowOwner,
  viewerRole: "owner"
): { id: string; nickname: string | null; email: string; addedAt: string };
export function toCollaboratorResponse(
  collaborator: CollaboratorRowCollaborator,
  viewerRole: "collaborator"
): { id: string; nickname: string | null; addedAt: string };
export function toCollaboratorResponse(
  collaborator: CollaboratorRowOwner | CollaboratorRowCollaborator,
  viewerRole: ListRole
) {
  const base = {
    id: collaborator.id,
    nickname: collaborator.nickname,
    addedAt: collaborator.addedAt.toISOString(),
  };

  if (viewerRole === "owner" && "user" in collaborator) {
    return { ...base, email: collaborator.user.email };
  }

  return base;
}
