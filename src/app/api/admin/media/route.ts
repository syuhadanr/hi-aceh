import { NextResponse, NextRequest } from "next/server";
import { db } from "src/lib/db";
import { auth } from "src/auth";
import fs from "fs";
import path from "path";
import sharp from "sharp";

// Ensure upload directory exists
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function GET(req: NextRequest) {
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
    const safeBuffer = buffer;
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
      const image = sharp(safeBuffer).rotate().resize({ width: 1200, withoutEnlargement: true });
      const metadata = await image.metadata();
      const format = metadata.format;

      if (format === "png") {
        extension = ".png";
        mimeType = "image/png";
        outputBuffer = await image.png({ quality: 80, effort: 6 }).toBuffer();
      } else if (format === "webp") {
        extension = ".webp";
        mimeType = "image/webp";
        outputBuffer = await image.webp({ quality: 80 }).toBuffer();
      } else {
        extension = ".jpg";
        mimeType = "image/jpeg";
        outputBuffer = await image.jpeg({ quality: 80 }).toBuffer();
      }

      let quality = 70;
      while (outputBuffer.length > 100000 && quality >= 40) {
        if (format === "png") {
          outputBuffer = await image.png({ quality, effort: 6 }).toBuffer();
        } else if (format === "webp") {
          outputBuffer = await image.webp({ quality }).toBuffer();
        } else {
          outputBuffer = await image.jpeg({ quality }).toBuffer();
        }
        quality -= 10;
      }
    }

    const filename = `${timestamp}-${baseName}${extension}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    fs.writeFileSync(filePath, outputBuffer);

    const relativeUrl = `/uploads/${filename}`;
    const userId = (session.user as any)?.id;

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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Media delete error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
