import { NextResponse, NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const MESSAGES_FILE = path.join(process.cwd(), "src", "data", "messages.json");
const SETTINGS_FILE = path.join(process.cwd(), "src", "data", "settings.json");

async function verifyCaptcha(token: string, code: string) {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const payload = JSON.parse(decoded);
    const { code: expectedCode, ts, sig } = payload;
    const secret = process.env.CONTACT_CAPTCHA_SECRET || "dev-contact-captcha-secret";
    const now = Date.now();
    if (!ts || !sig) return false;
    // expire after 10 minutes
    if (Math.abs(now - Number(ts)) > 1000 * 60 * 10) return false;
    const expectedSig = crypto.createHmac("sha256", secret).update(`${expectedCode}|${ts}`).digest("hex");
    if (expectedSig !== sig) return false;
    return expectedCode === (code || "");
  } catch (e) {
    console.error("captcha verify error", e);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, address, subject, message, captcha, captchaToken } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const captchaOk = await verifyCaptcha(captchaToken, captcha);
    if (!captchaOk) {
      return NextResponse.json({ error: "Invalid captcha" }, { status: 400 });
    }

    const msg = {
      id: crypto.randomUUID(),
      name,
      email,
      address: address || "",
      subject,
      message,
      createdAt: new Date().toISOString(),
    };

    // ensure data dir exists
    const dataDir = path.dirname(MESSAGES_FILE);
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    let messages: any[] = [];
    if (fs.existsSync(MESSAGES_FILE)) {
      try {
        messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf-8") || "[]");
      } catch (e) {
        messages = [];
      }
    }

    messages.unshift(msg);
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));

    // try to send email if SMTP configured
    try {
      const settings = fs.existsSync(SETTINGS_FILE)
        ? JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"))
        : {};

      const to = settings.contactEmail || process.env.CONTACT_DEFAULT_EMAIL;
      const smtpHost = process.env.SMTP_HOST;
      if (to && smtpHost) {
        // send email using nodemailer if available
        try {
          const mailModule = await import("nodemailer");
          const nodemailer = mailModule.default || mailModule;
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: process.env.SMTP_SECURE === "true" || false,
            auth: process.env.SMTP_USER
              ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
              : undefined,
          });

          const html = `
            <p>Pesan baru dari formulir Kontak:</p>
            <p><strong>Nama:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Alamat:</strong> ${address || "-"}</p>
            <p><strong>Subjek:</strong> ${subject}</p>
            <p><strong>Pesan:</strong><br/>${message.replace(/\n/g, "<br/>")}</p>
          `;

          await transporter.sendMail({
            from: process.env.SMTP_FROM || `no-reply@${process.env.SMTP_HOST || "local"}`,
            to,
            subject: `Kontak: ${subject}`,
            html,
          });
        } catch (e) {
          console.error("Failed to send contact email:", e);
        }
      }
    } catch (e) {
      console.error("contact email flow error", e);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact POST error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
