import { db } from "@/lib/db";

type ActivityLogInput = {
  userId?: string | null;
  action: string;
  description: string;
  entityType?: string | null;
  entityId?: string | null;
  ipAddress?: string | null;
};

export function getRequestIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || null;
  return req.headers.get("x-real-ip");
}

export async function logActivity({
  userId,
  action,
  description,
  entityType = null,
  entityId = null,
  ipAddress = null,
}: ActivityLogInput) {
  if (!userId) return;

  try {
    await db.activityLog.create({
      data: {
        userId,
        action,
        description,
        entityType,
        entityId,
        ipAddress,
      },
    });
  } catch (error) {
    console.error("Activity log write failed:", error);
  }
}
