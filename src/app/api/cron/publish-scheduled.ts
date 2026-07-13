import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";

/**
 * Cron endpoint to auto-publish scheduled articles.
 * Call this periodically (every 5 minutes recommended) from a cron service.
 * 
 * For Vercel, add to vercel.json:
 * {
 *   crons: [{
 *     path: "/api/cron/publish-scheduled",
 *     schedule: "every 5 minutes"
 *   }]
 * }
 */
export async function GET(req: NextRequest) {
  // Optional: Verify the request is from your cron service
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const now = new Date();

    // Find all SCHEDULED articles where publishedAt <= now
    const articlesToPublish = await db.article.findMany({
      where: {
        status: "SCHEDULED",
        publishedAt: {
          lte: now,
        },
        deletedAt: null,
      },
    });

    if (articlesToPublish.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No articles to publish",
        published: 0,
      });
    }

    // Update all of them to PUBLISHED
    const updateResult = await db.article.updateMany({
      where: {
        status: "SCHEDULED",
        publishedAt: {
          lte: now,
        },
        deletedAt: null,
      },
      data: {
        status: "PUBLISHED",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Published ${updateResult.count} scheduled article(s)`,
      published: updateResult.count,
      articles: articlesToPublish.map((a) => ({
        id: a.id,
        title: a.title,
        scheduledFor: a.publishedAt,
      })),
    });
  } catch (error) {
    console.error("Error publishing scheduled articles:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
