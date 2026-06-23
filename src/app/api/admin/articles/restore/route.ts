import { NextResponse, NextRequest } from "next/server";
import { db } from "src/lib/db";
import { auth } from "src/auth";
import { getRequestIp, logActivity } from "@/lib/activity-log";

// Restore article from trash
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user?.role === "PENULIS") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json(
        { error: "Article ID is required" },
        { status: 400 }
      );
    }

    const existing = await db.article.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    // Restore the article (set deletedAt to null, status to DRAFT)
    await db.article.update({
      where: { id },
      data: { deletedAt: null, status: "DRAFT" },
    });

    await logActivity({
      userId: session.user?.id,
      action: "RESTORE_ARTICLE",
      description: `Memulihkan artikel dari sampah: "${existing.title}"`,
      entityType: "Article",
      entityId: existing.id,
      ipAddress: getRequestIp(req),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Article restore error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
