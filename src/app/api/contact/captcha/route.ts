import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  try {
    const secret = process.env.CONTACT_CAPTCHA_SECRET || "dev-contact-captcha-secret";
    const codeChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // avoid ambiguous
    let code = "";
    for (let i = 0; i < 5; i++) code += codeChars[Math.floor(Math.random() * codeChars.length)];

    const ts = Date.now();
    const sig = crypto.createHmac("sha256", secret).update(`${code}|${ts}`).digest("hex");
    const payload = { code, ts, sig };
    const token = Buffer.from(JSON.stringify(payload)).toString("base64");

    // simple svg
    const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns='http://www.w3.org/2000/svg' width='120' height='40'><rect width='100%' height='100%' fill='#0f172a'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Inter, Arial' font-size='22' fill='#10b981'>${code}</text></svg>`;

    return NextResponse.json({ svg, token });
  } catch (e) {
    console.error("captcha gen error", e);
    return NextResponse.json({ error: "Failed to generate captcha" }, { status: 500 });
  }
}
