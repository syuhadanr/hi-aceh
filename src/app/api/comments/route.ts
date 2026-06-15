import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/comments?articleId=xxx — fetch approved comments for an article
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get("articleId");

  if (!articleId) {
    return NextResponse.json({ error: "articleId is required" }, { status: 400 });
  }

  try {
    const comments = await db.comment.findMany({
      where: { articleId, isApproved: true },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        body: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("GET /api/comments error:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

// POST /api/comments — submit a new comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, name, email, commentBody } = body;

    if (!articleId || !name?.trim() || !commentBody?.trim()) {
      return NextResponse.json(
        { error: "articleId, name, and comment body are required" },
        { status: 400 }
      );
    }

    // Basic spam / length guards
    if (name.trim().length > 100) {
      return NextResponse.json({ error: "Name is too long" }, { status: 400 });
    }
    if (commentBody.trim().length > 2000) {
      return NextResponse.json({ error: "Comment is too long (max 2000 characters)" }, { status: 400 });
    }

    // Verify article exists
    const article = await db.article.findFirst({
      where: { id: articleId, status: "PUBLISHED", deletedAt: null },
      select: { id: true },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const comment = await db.comment.create({
      data: {
        articleId,
        name: name.trim(),
        email: email?.trim() || null,
        body: commentBody.trim(),
        isApproved: true,
      },
      select: {
        id: true,
        name: true,
        body: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("POST /api/comments error:", error);
    return NextResponse.json({ error: "Failed to submit comment" }, { status: 500 });
  }
}
