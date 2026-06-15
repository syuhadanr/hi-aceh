import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");

    if (!location) {
      return NextResponse.json({ error: "Location is required" }, { status: 400 });
    }

    const ad = await db.ad.findFirst({
      where: {
        location: location as any,
        status: true,
        OR: [
          { startDate: null, endDate: null },
          { startDate: { lte: new Date() }, endDate: null },
          { startDate: null, endDate: { gte: new Date() } },
          { startDate: { lte: new Date() }, endDate: { gte: new Date() } },
        ]
      },
      orderBy: { createdAt: "desc" }
    });

    if (ad) {
      // Async update impressions (fire and forget)
      db.ad.update({
        where: { id: ad.id },
        data: { impressions: { increment: 1 } }
      }).catch(console.error);
    }

    return NextResponse.json(ad || null);
  } catch (error: any) {
    console.error("GET /api/ads error:", error);
    return NextResponse.json({ error: "Failed to fetch ad" }, { status: 500 });
  }
}
