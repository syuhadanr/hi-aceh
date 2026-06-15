import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      // Async update clicks (fire and forget)
      db.ad.update({
        where: { id },
        data: { clicks: { increment: 1 } }
      }).catch(console.error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to track click" }, { status: 500 });
  }
}
