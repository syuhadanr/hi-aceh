import { NextResponse, NextRequest } from "next/server";
import { db } from "src/lib/db";
import { auth } from "src/auth";

async function resolveTagIds(tagNames: string[]): Promise<string[]> {
  if (!tagNames || tagNames.length === 0) return [];

  const ids: string[] = [];
  for (const name of tagNames) {
    const cleanName = name.trim();
    if (!cleanName) continue;

    const slug = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    // Find or create tag
    let tag = await db.tag.findFirst({
      where: {
        OR: [
          { name: { equals: cleanName } },
          { slug: { equals: slug } }
        ]
      }
    });

    if (!tag) {
      tag = await db.tag.create({
        data: { name: cleanName, slug }
      });
    }
    ids.push(tag.id);
  }
  return ids;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status"); // DRAFT, PUBLISHED, PENDING, SCHEDULED
    const search = searchParams.get("search");
    const categoryId = searchParams.get("categoryId");
    const authorId = searchParams.get("authorId");
    const trash = searchParams.get("trash") === "true";

    const where: any = {};

    // Trash filter
    if (trash) {
      where.deletedAt = { not: null };
    } else {
      where.deletedAt = null;
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Category filter
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Author filter (PENULIS can only see own articles)
    const userRole = (session.user as any)?.role;
    const userId = (session.user as any)?.id;

    if (authorId) {
      where.authorId = authorId;
    } else if (userRole === "PENULIS") {
      where.authorId = userId;
    }

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
      ];
    }

    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      db.article.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, email: true } },
          editor: { select: { id: true, name: true, email: true } },
          category: { select: { id: true, name: true, slug: true } },
          tags: { select: { id: true, name: true, slug: true } },
          featuredImage: { select: { id: true, url: true, filename: true } },
        },
        orderBy: (() => {
          const sortParam = searchParams.get("sort") || "publishedAt_desc";
          const sortMap: Record<string, any> = {
            publishedAt_desc: [{ publishedAt: "desc" }, { createdAt: "desc" }],
            updatedAt_desc: { updatedAt: "desc" },
            createdAt_desc: { createdAt: "desc" },
            viewCount_desc: { viewCount: "desc" },
            title_asc: { title: "asc" },
          };
          return sortMap[sortParam] ?? sortMap.publishedAt_desc;
        })(),
        skip,
        take: limit,
      }),
      db.article.count({ where }),
    ]);

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Articles fetch error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      title,
      content,
      excerpt,
      type,
      videoUrl,
      status,
      isBreaking,
      isFeatured,
      publishedAt,
      categoryId,
      featuredImageId,
      tagIds,
      tagNames,
      authorId,
      editorId,
      sumberName,
      sumberUrl,
    } = body;

    if (!title || !content || !categoryId) {
      return NextResponse.json(
        { error: "Judul, konten, dan rubrik wajib diisi" },
        { status: 400 }
      );
    }

    // Generate slug from title
    let slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    // Check for existing slug and make unique
    const existingSlug = await db.article.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const userRole = (session.user as any)?.role;
    const sessionUserId = (session.user as any)?.id;
    let resolvedAuthorId = sessionUserId;
    if ((userRole === "ADMIN" || userRole === "EDITOR") && authorId) {
      resolvedAuthorId = authorId;
    }

    let finalTagIds = tagIds;
    if (tagNames && Array.isArray(tagNames)) {
      finalTagIds = await resolveTagIds(tagNames);
    }

    const article = await db.article.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        type: type || "TEKS",
        videoUrl: videoUrl || null,
        status: status || "DRAFT",
        isBreaking: isBreaking || false,
        isFeatured: isFeatured || false,
        publishedAt: publishedAt ? new Date(publishedAt) : (status === "PUBLISHED" ? new Date() : null),
        authorId: resolvedAuthorId,
        editorId: editorId || null,
        sumberName: sumberName || null,
        sumberUrl: sumberUrl || null,
        categoryId,
        featuredImageId: featuredImageId || null,
        tags: finalTagIds?.length
          ? { connect: finalTagIds.map((id: string) => ({ id })) }
          : undefined,
      },
      include: {
        author: { select: { id: true, name: true } },
        editor: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        tags: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error("Article creation error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      id,
      title,
      content,
      excerpt,
      type,
      videoUrl,
      status,
      isBreaking,
      isFeatured,
      publishedAt,
      categoryId,
      featuredImageId,
      tagIds,
      tagNames,
      authorId,
      editorId,
      sumberName,
      sumberUrl,
    } = body;

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

    // Check ownership for PENULIS
    const userRole = (session.user as any)?.role;
    const userId = (session.user as any)?.id;
    if (userRole === "PENULIS" && existing.authorId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let resolvedAuthorId = existing.authorId;
    if ((userRole === "ADMIN" || userRole === "EDITOR") && authorId) {
      resolvedAuthorId = authorId;
    }

    let finalTagIds = tagIds;
    if (tagNames && Array.isArray(tagNames)) {
      finalTagIds = await resolveTagIds(tagNames);
    }

    // Re-generate slug if title changed
    let slug = existing.slug;
    if (title && title !== existing.title) {
      slug = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      const existingSlug = await db.article.findFirst({
        where: { slug, id: { not: id } },
      });
      if (existingSlug) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }
    }

    // Handle publishedAt for PUBLISHED status
    let resolvedPublishedAt = existing.publishedAt;
    if (publishedAt) {
      resolvedPublishedAt = new Date(publishedAt);
    } else if (status === "PUBLISHED" && !existing.publishedAt) {
      resolvedPublishedAt = new Date();
    }

    const article = await db.article.update({
      where: { id },
      data: {
        title: title || existing.title,
        slug,
        content: content !== undefined ? content : existing.content,
        excerpt: excerpt !== undefined ? excerpt : existing.excerpt,
        type: type || existing.type,
        videoUrl: videoUrl !== undefined ? videoUrl : existing.videoUrl,
        status: status || existing.status,
        isBreaking: isBreaking !== undefined ? isBreaking : existing.isBreaking,
        isFeatured: isFeatured !== undefined ? isFeatured : existing.isFeatured,
        publishedAt: resolvedPublishedAt,
        categoryId: categoryId || existing.categoryId,
        featuredImageId: featuredImageId !== undefined ? featuredImageId : existing.featuredImageId,
        authorId: resolvedAuthorId,
        editorId: editorId !== undefined ? editorId : existing.editorId,
        sumberName: sumberName !== undefined ? sumberName : existing.sumberName,
        sumberUrl: sumberUrl !== undefined ? sumberUrl : existing.sumberUrl,
        tags: finalTagIds !== undefined
          ? { set: finalTagIds.map((id: string) => ({ id })) }
          : undefined,
      },
      include: {
        author: { select: { id: true, name: true } },
        editor: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        tags: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error("Article update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const permanent = searchParams.get("permanent") === "true";

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

    // Check ownership for PENULIS
    const userRole = (session.user as any)?.role;
    const userId = (session.user as any)?.id;
    if (userRole === "PENULIS" && existing.authorId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (permanent) {
      // Permanent delete - only ADMIN/EDITOR
      if (userRole === "PENULIS") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      await db.article.delete({ where: { id } });
    } else {
      // Soft delete
      await db.article.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Article delete error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
