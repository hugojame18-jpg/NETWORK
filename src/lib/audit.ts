import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

interface LogActionInput {
  actorId: string;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Prisma.InputJsonValue;
}

/** Records an admin action to the audit trail. Never throws — a logging failure should not block the action itself. */
export async function logAction({ actorId, action, targetType, targetId, metadata }: LogActionInput) {
  try {
    await prisma.auditLog.create({
      data: { actorId, action, targetType, targetId, metadata },
    });
  } catch (error) {
    console.error("[audit] failed to record action", { action, targetType, targetId }, error);
  }
}
