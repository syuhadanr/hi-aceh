import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ad = await prisma.ad.findUnique({
      where: { id }
    });
    if (!ad) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }
    return NextResponse.json(ad);
  } catch (error: any) {
    console.error("GET /api/admin/ads/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch ad" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, type, location, imageUrl, linkUrl, scriptCode, status, startDate, endDate, ratio } = body;

    const updatedAd = await prisma.ad.update({
      where: { id },
      data: {
        title,
        type,
        location,
        imageUrl: imageUrl || null,
        linkUrl: linkUrl || null,
        scriptCode: scriptCode || null,
        status: Boolean(status),
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        ratio: ratio || "1:1",
      }
    });

    return NextResponse.json(updatedAd);
  } catch (error: any) {
    console.error("PUT /api/admin/ads/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to update ad" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const updatedAd = await prisma.ad.update({
      where: { id },
      data: { status: Boolean(status) },
    });

    return NextResponse.json(updatedAd);
  } catch (error: any) {
    console.error("PATCH /api/admin/ads/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to toggle ad" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    await prisma.ad.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/admin/ads/[id] error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete ad" }, { status: 500 });
  }
}
