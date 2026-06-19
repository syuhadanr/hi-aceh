import React from "react";
import fs from "fs";
import path from "path";
import TopBar from "@/components/layout/TopBar";
import HeaderNav from '@/components/layout/HeaderNav';
import Footer from "@/components/layout/Footer";


export const dynamic = "force-dynamic";

export default function PrivacyPolicyPage() {
  const PAGES_FILE = path.join(process.cwd(), "src", "data", "pages.json");
  let pageData = {
    title: "Kebijakan Privasi",
    content: "<p>Halaman kebijakan privasi belum dikonfigurasi.</p>"
  };

  try {
    if (fs.existsSync(PAGES_FILE)) {
      const fileContent = fs.readFileSync(PAGES_FILE, "utf-8");
      const pages = JSON.parse(fileContent);
      if (pages["privacy-policy"]) {
        pageData = pages["privacy-policy"];
      }
    }
  } catch (e) {
    console.error("Error loading privacy policy data", e);
  }

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen flex flex-col font-sans">
      <TopBar />
      <HeaderNav activeCategory={null} />

      <div className="container mx-auto px-4 py-12 flex-grow max-w-[800px] font-sans">
        <header className="mb-12 border-b border-gray-200 dark:border-zinc-800 pb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold uppercase text-gray-900 dark:text-white mb-2">
            {pageData.title}
          </h1>
        </header>

        <div 
          className="prose prose-sm max-w-none text-gray-650 dark:text-zinc-400 font-sans leading-relaxed space-y-6"
          dangerouslySetInnerHTML={{ __html: pageData.content }}
        />
      </div>
      <Footer />
    </div>
  );
}
