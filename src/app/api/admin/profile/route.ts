import { NextResponse, NextRequest } from "next/server";
import { db } from "src/lib/db";
import { auth } from "src/auth";
import { getRequestIp, logActivity } from "@/lib/activity-log";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatarUrl: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, bio } = body;
    const cleanedName = typeof name === "string" ? name.trim() : "";

    if (!cleanedName) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const user = await db.user.update({
      where: { id: session.user.id },
      data: {
        name: cleanedName,
        bio: typeof bio === "string" && bio.trim() ? bio.trim() : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatarUrl: true,
        role: true,
      },
    });

    await logActivity({
      userId: session.user.id,
      action: "UPDATE_PROFILE",
      description: `Memperbarui profil: ${user.name}`,
      entityType: "User",
      entityId: user.id,
      ipAddress: getRequestIp(req),
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
