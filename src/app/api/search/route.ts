import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { mapPrismaArticle } from "@/lib/data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim() || "";

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [], query });
  }

  try {
    const articles = await db.article.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        OR: [
          { title: { contains: query } },
          { excerpt: { contains: query } },
          { content: { contains: query } },
        ],
      },
      orderBy: { publishedAt: "desc" },
      take: 20,
      include: { author: true, category: true, tags: true, featuredImage: true },
    });

    const mapped = articles.map(mapPrismaArticle as any).filter(Boolean);
    return NextResponse.json({ results: mapped, query });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ results: [], query, error: "Search failed" }, { status: 500 });
  }
}
