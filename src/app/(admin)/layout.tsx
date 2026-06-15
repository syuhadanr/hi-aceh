"use client";

import React, { useState } from "react";
import Sidebar from "src/components/admin/sidebar";
import Header from "src/components/admin/header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans transition-colors">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMobileMenuToggle={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900 p-4 md:p-8 md:ml-64 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800 scrollbar-track-transparent transition-colors">
          {children}
        </main>
      </div>
    </div>
  );
}
