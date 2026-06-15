import { NextResponse } from "next/server";
import { db } from "src/lib/db";
import { auth } from "src/auth";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tags = await db.tag.findMany({
      include: {
        _count: { select: { articles: true } },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(tags);
  } catch (error) {
    console.error("Tags fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const exists = await db.tag.findFirst({
      where: { OR: [{ name }, { slug }] },
    });

    if (exists) {
      return NextResponse.json(
        { error: "Tag with this name or slug already exists" },
        { status: 400 }
      );
    }

    const tag = await db.tag.create({
      data: { name, slug },
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error("Tag creation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, name } = await req.json();
    if (!id || !name) {
      return NextResponse.json({ error: "ID and Name are required" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const exists = await db.tag.findFirst({
      where: {
        id: { not: id },
        OR: [{ name }, { slug }],
      },
    });

    if (exists) {
      return NextResponse.json(
        { error: "Another tag with this name or slug already exists" },
        { status: 400 }
      );
    }

    const tag = await db.tag.update({
      where: { id },
      data: { name, slug },
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error("Tag update error:", error);
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

    await db.tag.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tag delete error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
