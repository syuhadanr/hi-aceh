import { NextResponse, NextRequest } from "next/server";
import { auth } from "src/auth";
import fs from "fs";
import path from "path";
import { getRequestIp, logActivity } from "@/lib/activity-log";

const SETTINGS_FILE = path.join(process.cwd(), "src", "data", "settings.json");

// Default settings values
const DEFAULT_SETTINGS = {
  siteName: "Hi Aceh",
  siteDescription: "Cermat Mendata, Cerdas Mengulas",
  siteLogo: "",
  contactEmail: "redaksi@hiaceh.com",
  address: "Banda Aceh, Aceh, Indonesia",
  phoneNumber: "",
  faxNumber: "",
  socialFacebook: "https://facebook.com/hiaceh",
  socialInstagram: "https://instagram.com/hiaceh",
  socialTwitter: "https://twitter.com/hiaceh",
  socialTikTok: "https://www.tiktok.com/@hiaceh",
  socialYoutube: "https://youtube.com/hiaceh",
  headerLogo: "",
  headerShowSlogan: true,
  navbarCategories: [],
  footerLogo: "",
  featuredBriefsCategory: "politik",
  footerDescription: "Portal Berita Aceh & Indonesia Terkini",
  footerShowCategories: [
    { name: "Aceh", slug: "aceh" },
    { name: "Indonesia", slug: "indonesia" },
    { name: "Politik", slug: "politik" },
    { name: "Ekonomi", slug: "ekonomi" },
    { name: "Budaya", slug: "budaya" },
    { name: "Wisata", slug: "wisata" }
  ],
  footerShowPages: ["about", "redaksi", "disclaimer", "pedoman-media"],
  footerSocialTitle: "IKUTI MEDIA SOSIAL",
  footerSocialDescription: "Tetap terhubung dengan kabar terkini dari Aceh dan Indonesia melalui saluran media sosial kami.",
  favicon: "",
  seoTitle: "Hi Aceh - Portal Berita Aceh & Indonesia",
  seoDescription: "Portal berita terkini dari Aceh dan Indonesia",
  seoKeywords: "aceh, berita aceh, portal aceh, indonesia",
  googleAnalyticsId: "",
};

// Helper to ensure parent dir exists and read file
const getSettings = () => {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      const parentDir = path.dirname(SETTINGS_FILE);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2));
      return DEFAULT_SETTINGS;
    }
    const data = fs.readFileSync(SETTINGS_FILE, "utf-8");
    const settings = JSON.parse(data);
    return { ...DEFAULT_SETTINGS, ...settings };
  } catch (e) {
    console.error("Error reading settings", e);
    return DEFAULT_SETTINGS;
  }
};

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = getSettings();
  return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Settings modification only allowed for ADMIN / EDITOR
  const role = session.user?.role;
  if (role !== "ADMIN" && role !== "EDITOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const updatedSettings = {
      siteName: body.siteName || DEFAULT_SETTINGS.siteName,
      siteDescription: body.siteDescription !== undefined ? body.siteDescription : DEFAULT_SETTINGS.siteDescription,
      siteLogo: body.siteLogo || "",
      contactEmail: body.contactEmail || DEFAULT_SETTINGS.contactEmail,
      address: body.address || DEFAULT_SETTINGS.address,
      phoneNumber: body.phoneNumber || "",
      faxNumber: body.faxNumber || "",
      socialFacebook: body.socialFacebook || "",
      socialInstagram: body.socialInstagram || "",
      socialTwitter: body.socialTwitter || "",
      socialTikTok: body.socialTikTok || "",
      socialYoutube: body.socialYoutube || "",
      headerLogo: body.headerLogo || "",
      headerShowSlogan: body.headerShowSlogan !== undefined ? body.headerShowSlogan : DEFAULT_SETTINGS.headerShowSlogan,
      navbarCategories: body.navbarCategories !== undefined ? body.navbarCategories : DEFAULT_SETTINGS.navbarCategories,
      footerLogo: body.footerLogo || "",
      featuredBriefsCategory: body.featuredBriefsCategory || DEFAULT_SETTINGS.featuredBriefsCategory,
      footerDescription: body.footerDescription !== undefined ? body.footerDescription : DEFAULT_SETTINGS.footerDescription,
      footerShowCategories: body.footerShowCategories !== undefined ? body.footerShowCategories : DEFAULT_SETTINGS.footerShowCategories,
      footerShowPages: body.footerShowPages !== undefined ? body.footerShowPages : DEFAULT_SETTINGS.footerShowPages,
      footerSocialTitle: body.footerSocialTitle || DEFAULT_SETTINGS.footerSocialTitle,
      footerSocialDescription: body.footerSocialDescription !== undefined ? body.footerSocialDescription : DEFAULT_SETTINGS.footerSocialDescription,
      favicon: body.favicon || "",
      seoTitle: body.seoTitle || DEFAULT_SETTINGS.seoTitle,
      seoDescription: body.seoDescription || DEFAULT_SETTINGS.seoDescription,
      seoKeywords: body.seoKeywords || DEFAULT_SETTINGS.seoKeywords,
      googleAnalyticsId: body.googleAnalyticsId || "",
    };

    const parentDir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updatedSettings, null, 2));

    await logActivity({
      userId: session.user?.id,
      action: "UPDATE_SETTINGS",
      description: "Memperbarui pengaturan sistem",
      entityType: "Settings",
      ipAddress: getRequestIp(req),
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
