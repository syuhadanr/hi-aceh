import { NextResponse, NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "src/lib/db";
import { auth } from "src/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRole = session.user?.role;
  if (userRole !== "ADMIN" && userRole !== "EDITOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "25");
    const userId = searchParams.get("userId");

    const where: Prisma.ActivityLogWhereInput = {};
    if (userId) where.userId = userId;

    const skip = (page - 1) * limit;

    const [logs, total, users] = await Promise.all([
      db.activityLog.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.activityLog.count({ where }),
      db.user.findMany({
        select: { id: true, name: true, role: true },
        orderBy: { name: "asc" },
      }),
    ]);

    return NextResponse.json({
      logs,
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Activity log fetch error:", error);
    // Return empty if table doesn't exist yet
    return NextResponse.json({
      logs: [],
      users: [],
      pagination: { page: 1, limit: 25, total: 0, totalPages: 0 },
    });
  }
}
