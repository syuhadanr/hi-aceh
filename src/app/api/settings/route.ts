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
  socialYoutube: "https://youtube.com/hiaceh",
  headerLogo: "",
  headerShowSlogan: true,
  navbarCategories: [
    { name: "ACEH", slug: "aceh", visible: true },
    { name: "INDONESIA", slug: "indonesia", visible: true },
    { name: "POLITIK", slug: "politik", visible: true },
    { name: "EKONOMI", slug: "ekonomi", visible: true },
    { name: "BUDAYA", slug: "budaya", visible: true },
    { name: "WISATA", slug: "wisata", visible: true },
    { name: "KESEHATAN", slug: "kesehatan", visible: true },
    { name: "GAYA HIDUP", slug: "gaya-hidup", visible: true },
    { name: "GLOBAL", slug: "global", visible: true },
    { name: "TEKNOLOGI", slug: "teknologi", visible: true },
    { name: "OLAHRAGA", slug: "olahraga", visible: true },
    { name: "HIBURAN", slug: "hiburan", visible: true },
    { name: "DAERAH", slug: "daerah", visible: true },
    { name: "NASIONAL", slug: "nasional", visible: true }
  ],
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
