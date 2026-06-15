import { NextResponse } from "next/server";
import { db } from "src/lib/db";
import { auth } from "src/auth";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const categories = await db.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
        parent: {
          select: { id: true, name: true },
        },
        _count: {
          select: { articles: true },
        },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Categories fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, description, parentId } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const exists = await db.category.findFirst({
      where: { OR: [{ name }, { slug }] },
    });

    if (exists) {
      return NextResponse.json(
        { error: "Category with this name or slug already exists" },
        { status: 400 }
      );
    }

    const category = await db.category.create({
      data: {
        name,
        slug,
        description: description || null,
        parentId: parentId || null,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Category creation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, name, description, parentId } = await req.json();
    if (!id || !name) {
      return NextResponse.json({ error: "ID and Name are required" }, { status: 400 });
    }

    if (parentId && parentId === id) {
      return NextResponse.json(
        { error: "Category cannot be its own parent" },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const exists = await db.category.findFirst({
      where: {
        id: { not: id },
        OR: [{ name }, { slug }],
      },
    });

    if (exists) {
      return NextResponse.json(
        { error: "Another category with this name or slug already exists" },
        { status: 400 }
      );
    }

    const category = await db.category.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || null,
        parentId: parentId || null,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Category update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const articleCount = await db.article.count({
      where: { categoryId: id },
    });

    if (articleCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete category that contains active articles" },
        { status: 400 }
      );
    }

    // Set children's parentId to null before deletion
    await db.category.updateMany({
      where: { parentId: id },
      data: { parentId: null },
    });

    await db.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Category delete error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
