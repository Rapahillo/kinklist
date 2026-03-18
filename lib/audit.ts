import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type AuditAction =
  | "session.create"
  | "session.delete"
  | "session.delete_all"
  | "magic_link.request"
  | "account.delete"
  | "list.create"
  | "list.update"
  | "list.delete"
  | "list.access"
  | "collaborator.add"
  | "collaborator.remove";

interface AuditParams {
  userId?: string;
  action: AuditAction;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, string>;
}

/**
 * Log a security-relevant action. Fire-and-forget — failures are caught
 * and logged but never break the main flow.
 *
 * Do NOT log item content in audit logs (the content itself is sensitive).
 * Only log that an action occurred.
 */
export async function logAudit(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId ?? null,
        action: params.action,
        targetType: params.targetType ?? null,
        targetId: params.targetId ?? null,
        metadata: params.metadata ?? Prisma.JsonNull,
      },
    });
  } catch (error) {
    console.error("[audit] Failed to write audit log:", error);
  }
}
