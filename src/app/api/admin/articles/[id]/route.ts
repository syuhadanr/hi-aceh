import { NextResponse, NextRequest } from "next/server";
import { db } from "src/lib/db";
import { auth } from "src/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const article = await db.article.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        editor: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true, slug: true } },
        tags: { select: { id: true, name: true, slug: true } },
        featuredImage: { select: { id: true, url: true, filename: true } },
      },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("Article fetch error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
