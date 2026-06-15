import { NextResponse, NextRequest } from "next/server";
import fs from "fs";
import path from "path";

const PAGES_FILE = path.join(process.cwd(), "src", "data", "pages.json");

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    if (!fs.existsSync(PAGES_FILE)) {
      return NextResponse.json({ error: "Pages data file not found" }, { status: 404 });
    }
    const data = fs.readFileSync(PAGES_FILE, "utf-8");
    const pages = JSON.parse(data);
    
    if (!pages[slug]) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }
    
    return NextResponse.json({ slug, ...pages[slug] });
  } catch (e) {
    console.error("Error reading page", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
