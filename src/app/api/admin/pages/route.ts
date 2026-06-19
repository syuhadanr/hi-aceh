import { NextResponse, NextRequest } from "next/server";
import { auth } from "src/auth";
import fs from "fs";
import path from "path";

const PAGES_FILE = path.join(process.cwd(), "src", "data", "pages.json");

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (!fs.existsSync(PAGES_FILE)) {
      return NextResponse.json({});
    }
    const data = fs.readFileSync(PAGES_FILE, "utf-8");
    const pages = JSON.parse(data);
    return NextResponse.json(pages);
  } catch (e) {
    console.error("Error reading pages", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as any)?.role;
  if (role !== "ADMIN" && role !== "EDITOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { slug, title, ...otherFields } = body;
    
    if (!slug || !title) {
      return NextResponse.json({ error: "Slug and title are required" }, { status: 400 });
    }

    let pages: Record<string, any> = {};
    if (fs.existsSync(PAGES_FILE)) {
      const data = fs.readFileSync(PAGES_FILE, "utf-8");
      pages = JSON.parse(data);
    } else {
      const parentDir = path.dirname(PAGES_FILE);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
    }

    pages[slug] = {
      title,
      ...otherFields,
    };

    fs.writeFileSync(PAGES_FILE, JSON.stringify(pages, null, 2));
    return NextResponse.json({ success: true, page: pages[slug] });
  } catch (error) {
    console.error("Pages update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
