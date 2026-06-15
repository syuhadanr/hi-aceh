import React from "react";
import fs from "fs";
import path from "path";
import TopBar from "@/components/layout/TopBar";
import HeaderNav from '@/components/layout/HeaderNav';
import Footer from "@/components/layout/Footer";

export default function AboutPage() {
  const PAGES_FILE = path.join(process.cwd(), "src", "data", "pages.json");
  let pageData = {
    title: "Tentang Kami",
    content: "<p>Halaman tentang kami belum dikonfigurasi.</p>"
  };

  try {
    if (fs.existsSync(PAGES_FILE)) {
      const fileContent = fs.readFileSync(PAGES_FILE, "utf-8");
      const pages = JSON.parse(fileContent);
      if (pages.about) {
        pageData = pages.about;
      }
    }
  } catch (e) {
    console.error("Error loading about page data", e);
  }

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen flex flex-col font-sans">
      <TopBar />
      <HeaderNav activeCategory={null} />

      <div className="container mx-auto px-4 py-12 flex-grow max-w-[900px] font-sans">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold uppercase text-gray-900 dark:text-white mb-4">
            {pageData.title}
          </h1>
          <div className="h-1 w-24 bg-brand-green mx-auto"></div>
        </header>

        <div 
          className="prose prose-lg max-w-none text-gray-700 dark:text-zinc-300 font-sans leading-relaxed"
          dangerouslySetInnerHTML={{ __html: pageData.content }}
        />
      </div>
      <Footer />
    </div>
  );
}
