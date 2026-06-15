import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");

    const ads = await prisma.ad.findMany({
      where: location ? { location: location as any } : undefined,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(ads);
  } catch (error: any) {
    console.error("GET /api/admin/ads error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch ads" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, type, location, imageUrl, linkUrl, scriptCode, status, startDate, endDate, ratio } = body;

    if (!title || !location) {
      return NextResponse.json({ error: "Title and location are required" }, { status: 400 });
    }

    const newAd = await prisma.ad.create({
      data: {
        title,
        type: type || "IMAGE_BANNER",
        location,
        imageUrl: imageUrl || null,
        linkUrl: linkUrl || null,
        scriptCode: scriptCode || null,
        status: status !== undefined ? status : true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        ratio: ratio || "1:1",
      }
    });

    return NextResponse.json(newAd, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/admin/ads error:", error);
    return NextResponse.json({ error: error.message || "Failed to create ad" }, { status: 500 });
  }
}
