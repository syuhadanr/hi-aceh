import React from "react";
import { Inter, Playfair_Display, Oswald } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  weight: ["500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://hiaceh.id"),
  title: "Hi Aceh - Portal Berita Aceh & Indonesia",
  description: "Cermat Mendata, Cerdas Mengulas",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Hi Aceh - Portal Berita Aceh & Indonesia",
    description: "Cermat Mendata, Cerdas Mengulas",
    siteName: "Hi Aceh",
    images: [
      {
        url: "/logo.png", // swap for a proper 1200x630 OG banner if you have one
        width: 1200,
        height: 630,
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hi Aceh - Portal Berita Aceh & Indonesia",
    description: "Cermat Mendata, Cerdas Mengulas",
    images: ["/logo.png"],
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${inter.variable} ${playfair.variable} ${oswald.variable} ${inter.className} bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark transition-colors duration-200 min-h-screen flex flex-col`}
    >
      {children}
    </div>
  );
}