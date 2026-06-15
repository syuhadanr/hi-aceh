import { NextResponse } from "next/server";
import { db } from "src/lib/db";
import { auth } from "src/auth";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as any)?.role;
  if (role !== "ADMIN" && role !== "EDITOR") {
    return NextResponse.json({ count: 0 });
  }

  try {
    const count = await db.article.count({
      where: {
        status: "PENDING",
        deletedAt: null,
      },
    });
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Pending count fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
