import { NextResponse } from "next/server";
import { db } from "src/lib/db";
import { auth } from "src/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  if (!session || (userRole !== "ADMIN" && userRole !== "EDITOR")) {
    return NextResponse.json({ error: "Unauthorized. Admin or Editor access only." }, { status: 401 });
  }

  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Users fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized. Admin access only." }, { status: 401 });
  }

  try {
    const { name, email, password, role } = await req.json();
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const exists = await db.user.findUnique({
      where: { email },
    });

    if (exists) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("User creation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized. Admin access only." }, { status: 401 });
  }

  try {
    const { id, name, role, password } = await req.json();
    if (!id || !name || !role) {
      return NextResponse.json({ error: "ID, Name and Role are required" }, { status: 400 });
    }

    const updateData: any = { name, role };

    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized. Admin access only." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    if (id === session.user?.id) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    const articlesCount = await db.article.count({
      where: { authorId: id },
    });

    if (articlesCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete user who has authored articles" },
        { status: 400 }
      );
    }

    await db.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("User delete error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
