import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "src/components/providers";
import fs from "fs";
import path from "path";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const SETTINGS_FILE = path.join(process.cwd(), "src", "data", "settings.json");
  let seoTitle = "Hi Aceh - Portal Berita Aceh & Indonesia";
  let seoDescription = "Portal berita terkini dari Aceh dan Indonesia";
  let seoKeywords = "aceh, berita aceh, portal aceh, indonesia";
  let faviconUrl = "/favicon.ico";

  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, "utf-8");
      const settings = JSON.parse(data);
      seoTitle = settings.seoTitle || settings.siteName || seoTitle;
      seoDescription = settings.seoDescription || settings.siteDescription || seoDescription;
      seoKeywords = settings.seoKeywords || seoKeywords;
      faviconUrl = settings.favicon || settings.siteLogo || faviconUrl;
    }
  } catch (e) {
    console.error("Error generating dynamic metadata in layout", e);
  }

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    icons: {
      icon: faviconUrl,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
