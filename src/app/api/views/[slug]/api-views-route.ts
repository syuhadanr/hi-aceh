import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

function hashIP(ip: string): string {
  return crypto
    .createHash("sha256")
    .update(ip)
    .digest("hex");
}

function getClientIP(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "unknown";
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const article = await db.article.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const clientIP = getClientIP(req);
    const ipHash = hashIP(clientIP);
    const userAgent = req.headers.get("user-agent") || "";
    const referrer = req.headers.get("referer") || "";
    const path = new URL(req.url).pathname;

    // Increment viewCount and record PageView in parallel
    await Promise.all([
      db.article.update({
        where: { id: article.id },
        data: { viewCount: { increment: 1 } },
      }),
      db.pageView.create({
        data: {
          articleId: article.id,
          path,
          ipHash,
          userAgent,
          referrer,
        },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("View tracking error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}