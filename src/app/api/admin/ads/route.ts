import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "src/auth";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const ads = await db.ad.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(ads);
  } catch (error) {
    console.error("Ads fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, type, location, imageUrl, linkUrl, scriptCode, status, startDate, endDate, ratio } = body;

    if (!title || !location) {
      return NextResponse.json({ error: "Title and Location are required" }, { status: 400 });
    }

    const ad = await db.ad.create({
      data: {
        title,
        type: type || "IMAGE_BANNER",
        location,
        imageUrl: imageUrl || null,
        linkUrl: linkUrl || null,
        scriptCode: scriptCode || null,
        status: typeof status === "boolean" ? status : true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        ratio: ratio || "1:1",
      },
    });

    return NextResponse.json(ad);
  } catch (error) {
    console.error("Ad creation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
