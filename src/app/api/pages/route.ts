import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const PAGES_FILE = path.join(process.cwd(), "src", "data", "pages.json");

export async function GET() {
  try {
    if (!fs.existsSync(PAGES_FILE)) {
      return NextResponse.json({});
    }
    const data = fs.readFileSync(PAGES_FILE, "utf-8");
    const pages = JSON.parse(data);
    
    // We only return slug, title, and we omit large content for public list if needed,
    // but returning everything is fine and simpler for client mapping.
    return NextResponse.json(pages);
  } catch (e) {
    console.error("Error reading public pages", e);
    return NextResponse.json({});
  }
}
