import React from "react";
import { Inter, Playfair_Display, Oswald } from "next/font/google";
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

export const metadata = {
  title: "Hi Aceh - Portal Berita Aceh & Indonesia",
  description: "Cermat Mendata, Cerdas Mengulas",
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