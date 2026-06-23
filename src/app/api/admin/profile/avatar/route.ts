import { NextResponse, NextRequest } from "next/server";
import { db } from "src/lib/db";
import { auth } from "src/auth";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { getRequestIp, logActivity } from "@/lib/activity-log";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").toLowerCase();
    const baseName = path.basename(cleanFileName, path.extname(cleanFileName));
    const filename = `${timestamp}-${baseName}.jpg`;
    const filePath = path.join(UPLOAD_DIR, filename);

    await sharp(buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(filePath);

    const relativeUrl = `/uploads/${filename}`;
    const userId = session.user.id;

    const user = await db.user.update({
      where: { id: userId },
      data: {
        avatarUrl: relativeUrl,
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
      userId,
      action: "UPLOAD_AVATAR",
      description: `Mengunggah foto profil: ${user.name}`,
      entityType: "User",
      entityId: user.id,
      ipAddress: getRequestIp(req),
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
