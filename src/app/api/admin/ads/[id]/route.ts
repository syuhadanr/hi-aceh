import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "src/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const ad = await db.ad.findUnique({
      where: { id },
    });
    if (!ad) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }
    return NextResponse.json(ad);
  } catch (error) {
    console.error("Ad fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { title, type, location, imageUrl, linkUrl, scriptCode, status, startDate, endDate, ratio } = body;

    if (!title || !location) {
      return NextResponse.json({ error: "Title and Location are required" }, { status: 400 });
    }

    const updatedAd = await db.ad.update({
      where: { id },
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

    return NextResponse.json(updatedAd);
  } catch (error) {
    console.error("Ad update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const ad = await db.ad.findUnique({
      where: { id },
    });
    if (!ad) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    const updatedData: any = {};
    if (body.title !== undefined) updatedData.title = body.title;
    if (body.type !== undefined) updatedData.type = body.type;
    if (body.location !== undefined) updatedData.location = body.location;
    if (body.imageUrl !== undefined) updatedData.imageUrl = body.imageUrl;
    if (body.linkUrl !== undefined) updatedData.linkUrl = body.linkUrl;
    if (body.scriptCode !== undefined) updatedData.scriptCode = body.scriptCode;
    if (body.status !== undefined) updatedData.status = body.status;
    if (body.startDate !== undefined) updatedData.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.endDate !== undefined) updatedData.endDate = body.endDate ? new Date(body.endDate) : null;
    if (body.ratio !== undefined) updatedData.ratio = body.ratio;

    const updatedAd = await db.ad.update({
      where: { id },
      data: updatedData,
    });

    return NextResponse.json(updatedAd);
  } catch (error) {
    console.error("Ad patch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await db.ad.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ad delete error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
