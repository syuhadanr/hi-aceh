import { NextResponse, NextRequest } from "next/server";
import { db } from "src/lib/db";
import { auth } from "src/auth";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { getRequestIp, logActivity } from "@/lib/activity-log";

const MAX_IMAGE_SIZE = 200_000; // 200 KB target maximum
const MIN_IMAGE_QUALITY = 35;
const TARGET_IMAGE_WIDTH = 1200;

// Ensure upload directory exists
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

async function compressImage(buffer: Buffer) {
  const input = sharp(buffer).rotate();
  const metadata = await input.metadata();
  const format = metadata.format || "jpeg";
  const width = metadata.width && metadata.width > TARGET_IMAGE_WIDTH ? TARGET_IMAGE_WIDTH : metadata.width;

  let quality = 80;
  let outputBuffer: Buffer;
  let currentWidth = width;

  const encode = async (q: number, w: number | undefined) => {
    const pipeline = sharp(buffer).rotate().resize({ width: w, withoutEnlargement: true });
    if (format === "png") {
      return pipeline.png({ quality: q, effort: 6 }).toBuffer();
    }
    if (format === "webp") {
      return pipeline.webp({ quality: q }).toBuffer();
    }
    return pipeline.jpeg({ quality: q }).toBuffer();
  };

  outputBuffer = await encode(quality, currentWidth);

  while (outputBuffer.length > MAX_IMAGE_SIZE && quality > MIN_IMAGE_QUALITY) {
    quality -= 10;
    outputBuffer = await encode(quality, currentWidth);
  }

  while (outputBuffer.length > MAX_IMAGE_SIZE && currentWidth && currentWidth > 600) {
    currentWidth = Math.max(600, Math.floor(currentWidth * 0.9));
    outputBuffer = await encode(quality, currentWidth);
  }

  return {
    buffer: outputBuffer,
    format,
  };
}

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const media = await db.media.findMany({
      include: {
        uploadedBy: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(media);
  } catch (error) {
    console.error("Media fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
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
    const buffer = Buffer.from(arrayBuffer as ArrayBuffer) as unknown as Buffer;
    const isImage = file.type.startsWith("image/");

    const timestamp = Date.now();
    const cleanFileName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .toLowerCase();
    const baseName = path.basename(cleanFileName, path.extname(cleanFileName));

    let outputBuffer = buffer;
    let extension = path.extname(cleanFileName) || "";
    let mimeType = file.type;

    if (isImage) {
      const { buffer: compressedBuffer, format } = await compressImage(buffer);
      outputBuffer = compressedBuffer;

      if (format === "png") {
        extension = ".png";
        mimeType = "image/png";
      } else if (format === "webp") {
        extension = ".webp";
        mimeType = "image/webp";
      } else {
        extension = ".jpg";
        mimeType = "image/jpeg";
      }
    }

    const filename = `${timestamp}-${baseName}${extension}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    fs.writeFileSync(filePath, outputBuffer);

    const relativeUrl = `/uploads/${filename}`;
    const userId = session.user?.id;

    const media = await db.media.create({
      data: {
        url: relativeUrl,
        filename: file.name,
        mimeType,
        size: outputBuffer.length,
        uploadedById: userId,
      },
      include: {
        uploadedBy: { select: { name: true } },
      },
    });

    await logActivity({
      userId,
      action: "UPLOAD_MEDIA",
      description: `Mengunggah media: ${file.name} (${Math.round(outputBuffer.length / 1024)} KB)`,
      entityType: "Media",
      entityId: media.id,
      ipAddress: getRequestIp(req),
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error("Media upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Find media in DB
    const media = await db.media.findUnique({
      where: { id },
      include: {
        articles: { select: { id: true } },
      },
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Check if media is used as featured image in any articles
    if (media.articles.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete media that is currently used as a featured image in articles" },
        { status: 400 }
      );
    }

    // Delete file from disk if it exists
    const filename = path.basename(media.url);
    const filePath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete record from DB
    await db.media.delete({ where: { id } });

    await logActivity({
      userId: session.user?.id,
      action: "DELETE_MEDIA",
      description: `Menghapus media: ${media.filename}`,
      entityType: "Media",
      entityId: media.id,
      ipAddress: getRequestIp(req),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Media delete error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
