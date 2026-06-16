import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SETTINGS_FILE = path.join(process.cwd(), "src", "data", "settings.json");

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
  featuredBriefsCategory: "politik",
  footerLogo: "",
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

export async function GET() {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      return NextResponse.json(DEFAULT_SETTINGS);
    }
    const data = fs.readFileSync(SETTINGS_FILE, "utf-8");
    const settings = JSON.parse(data);
    return NextResponse.json({ ...DEFAULT_SETTINGS, ...settings });
  } catch (e) {
    console.error("Error reading public settings", e);
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}
