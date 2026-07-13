import { NextResponse, NextRequest } from "next/server";
import { ArticleStatus, Prisma } from "@prisma/client";
import { db } from "src/lib/db";
import { auth } from "src/auth";
import { getRequestIp, logActivity } from "@/lib/activity-log";
import { publishDueScheduledArticles } from "@/lib/article-scheduler";

const ARTICLE_STATUSES = new Set<string>(Object.values(ArticleStatus));

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

function resolveArticleStatusForRole({
  requestedStatus,
  existingStatus,
  role,
}: {
  requestedStatus?: string | null;
  existingStatus?: ArticleStatus;
  role?: string;
}): ArticleStatus {
  const fallbackStatus = existingStatus || "DRAFT";

  if (role !== "PENULIS") {
    return ARTICLE_STATUSES.has(requestedStatus || "")
      ? (requestedStatus as ArticleStatus)
      : fallbackStatus;
  }

  if (!requestedStatus || requestedStatus === "DRAFT") {
    return existingStatus === "PUBLISHED" ? "PENDING" : "DRAFT";
  }

  return "PENDING";
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
    const userRole = session.user?.role;

    if (trash && userRole === "PENULIS") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const where: Prisma.ArticleWhereInput = {};

    // Trash filter
    if (trash) {
      where.deletedAt = { not: null };
    } else {
      where.deletedAt = null;
    }

    // Status filter
    if (status && ARTICLE_STATUSES.has(status)) {
      where.status = status as ArticleStatus;
    }

    // Category filter
    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (authorId) {
      where.authorId = authorId;
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
          const sortMap: Record<
            string,
            Prisma.ArticleOrderByWithRelationInput | Prisma.ArticleOrderByWithRelationInput[]
          > = {
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

    const userRole = session.user?.role;
    const sessionUserId = session.user?.id;
    let resolvedAuthorId = sessionUserId;
    if ((userRole === "ADMIN" || userRole === "EDITOR") && authorId) {
      resolvedAuthorId = authorId;
    }

    let finalTagIds = tagIds;
    if (tagNames && Array.isArray(tagNames)) {
      finalTagIds = await resolveTagIds(tagNames);
    }

    // Check for past scheduled dates BEFORE role resolution
    let requestedPublishedAt: Date | null = null;
    let shouldAutoPublish = false;
    if (publishedAt && (status === "SCHEDULED" || status === "PUBLISHED")) {
      requestedPublishedAt = new Date(publishedAt);
      const now = new Date();
      if (requestedPublishedAt <= now) {
        // Past date: will auto-publish but keep the user-specified date
        shouldAutoPublish = true;
      }
    }

    let resolvedStatus = resolveArticleStatusForRole({
      requestedStatus: status,
      role: userRole,
    });

    // If past date was scheduled, override to PUBLISHED and use the scheduled date
    let finalPublishedAt: Date | null = null;
    if (shouldAutoPublish && requestedPublishedAt) {
      resolvedStatus = "PUBLISHED";
      finalPublishedAt = requestedPublishedAt;
    } else if ((resolvedStatus === "SCHEDULED" || resolvedStatus === "PENDING") && publishedAt) {
      // Keep scheduled date for SCHEDULED articles or PENDING articles with a specified date
      finalPublishedAt = new Date(publishedAt);
    } else if (resolvedStatus === "PUBLISHED" && !publishedAt) {
      // Publishing now without a specific date
      finalPublishedAt = new Date();
    }

    const resolvedEditorId =
      userRole === "ADMIN" || userRole === "EDITOR"
        ? editorId || (resolvedStatus === "PUBLISHED" ? sessionUserId : null)
        : null;

    const article = await db.article.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        type: type || "TEKS",
        videoUrl: videoUrl || null,
        status: resolvedStatus,
        isBreaking: isBreaking || false,
        isFeatured: isFeatured || false,
        publishedAt: finalPublishedAt,
        authorId: resolvedAuthorId,
        editorId: resolvedEditorId,
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

    await logActivity({
      userId: session.user.id,
      action: resolvedStatus === "PENDING" ? "SUBMIT_ARTICLE" : "CREATE_ARTICLE",
      description:
        resolvedStatus === "PENDING"
          ? `Mengajukan artikel untuk persetujuan: "${article.title}"`
          : `Membuat artikel baru: "${article.title}"`,
      entityType: "Article",
      entityId: article.id,
      ipAddress: getRequestIp(req),
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

    const userRole = session.user?.role;
    const sessionUserId = session.user?.id;

    // Check for past scheduled dates BEFORE role resolution
    let requestedPublishedAt: Date | null = null;
    let shouldAutoPublish = false;
    if (publishedAt && (status === "SCHEDULED" || status === "PUBLISHED")) {
      requestedPublishedAt = new Date(publishedAt);
      const now = new Date();
      if (requestedPublishedAt <= now) {
        // Past date: will auto-publish but keep the user-specified date
        shouldAutoPublish = true;
      }
    }

    let resolvedAuthorId = existing.authorId;
    if ((userRole === "ADMIN" || userRole === "EDITOR") && authorId) {
      resolvedAuthorId = authorId;
    }

    let finalTagIds = tagIds;
    if (tagNames && Array.isArray(tagNames)) {
      finalTagIds = await resolveTagIds(tagNames);
    }

    const resolvedStatus = resolveArticleStatusForRole({
      requestedStatus: status,
      existingStatus: existing.status,
      role: userRole,
    });

    // If past date was scheduled, override to PUBLISHED and use the scheduled date
    let finalStatus = resolvedStatus;
    if (shouldAutoPublish && requestedPublishedAt) {
      finalStatus = "PUBLISHED";
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

    // Handle publishedAt for SCHEDULED and PUBLISHED statuses
    let resolvedPublishedAt = existing.publishedAt;
    if (finalStatus === "PENDING" || finalStatus === "DRAFT") {
      resolvedPublishedAt = null;
    } else if (shouldAutoPublish && requestedPublishedAt) {
      // Past date: use the user-specified date
      resolvedPublishedAt = requestedPublishedAt;
    } else if (finalStatus === "SCHEDULED" && publishedAt) {
      // For SCHEDULED, use the provided publishedAt date
      resolvedPublishedAt = new Date(publishedAt);
    } else if (finalStatus === "PUBLISHED" && publishedAt) {
      // For PUBLISHED with explicit date, use that date
      resolvedPublishedAt = new Date(publishedAt);
    } else if (finalStatus === "PUBLISHED" && !publishedAt) {
      // Publishing now without a scheduled date - set to current time
      resolvedPublishedAt = new Date();
    } else if (publishedAt) {
      // For other statuses with publishedAt, use it
      resolvedPublishedAt = new Date(publishedAt);
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
        status: finalStatus,
        isBreaking: isBreaking !== undefined ? isBreaking : existing.isBreaking,
        isFeatured: isFeatured !== undefined ? isFeatured : existing.isFeatured,
        publishedAt: resolvedPublishedAt,
        categoryId: categoryId || existing.categoryId,
        featuredImageId: featuredImageId !== undefined ? featuredImageId : existing.featuredImageId,
        authorId: resolvedAuthorId,
        editorId:
          editorId !== undefined
            ? editorId
            : finalStatus === "PUBLISHED" &&
              (userRole === "ADMIN" || userRole === "EDITOR")
            ? sessionUserId
            : existing.editorId,
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

    const action =
      resolvedStatus === "PUBLISHED" && existing.status !== "PUBLISHED"
        ? "PUBLISH_ARTICLE"
        : resolvedStatus === "DRAFT" && existing.status === "PENDING"
        ? "REJECT_ARTICLE"
        : resolvedStatus === "PENDING"
        ? "SUBMIT_ARTICLE"
        : "UPDATE_ARTICLE";

    const descriptionMap: Record<string, string> = {
      PUBLISH_ARTICLE: `Menyetujui dan menerbitkan artikel: "${article.title}"`,
      REJECT_ARTICLE: `Menolak artikel dan mengembalikan ke draft: "${article.title}"`,
      SUBMIT_ARTICLE: `Mengajukan perubahan artikel untuk persetujuan: "${article.title}"`,
      UPDATE_ARTICLE: `Memperbarui artikel: "${article.title}"`,
    };

    await logActivity({
      userId: session.user.id,
      action,
      description: descriptionMap[action],
      entityType: "Article",
      entityId: article.id,
      ipAddress: getRequestIp(req),
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

    const userRole = session.user?.role;
    if (userRole === "PENULIS") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (permanent) {
      await db.article.delete({ where: { id } });
    } else {
      // Soft delete
      await db.article.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    }

    await logActivity({
      userId: session.user.id,
      action: "DELETE_ARTICLE",
      description: permanent
        ? `Menghapus permanen artikel: "${existing.title}"`
        : `Memindahkan artikel ke sampah: "${existing.title}"`,
      entityType: "Article",
      entityId: existing.id,
      ipAddress: getRequestIp(req),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Article delete error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
