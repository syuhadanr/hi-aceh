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

    console.log("View tracking for slug:", slug);

    const article = await db.article.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!article) {
      console.log("Article not found for slug:", slug);
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const clientIP = getClientIP(req);
    const ipHash = hashIP(clientIP);
    const userAgent = req.headers.get("user-agent") || "";
    const referrer = req.headers.get("referer") || "";
    const path = new URL(req.url).pathname;

    console.log("Recording view - articleId:", article.id, "path:", path);

    // Increment viewCount and record PageView in parallel
    const [updatedArticle, pageView] = await Promise.all([
      db.article.update({
        where: { id: article.id },
        data: { viewCount: { increment: 1 } },
        select: { viewCount: true },
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

    console.log("View recorded successfully - new viewCount:", updatedArticle.viewCount);
    return NextResponse.json({ ok: true, viewCount: updatedArticle.viewCount });
  } catch (error) {
    console.error("View tracking error:", error);
    return NextResponse.json({ error: "Failed", details: String(error) }, { status: 500 });
  }
}
