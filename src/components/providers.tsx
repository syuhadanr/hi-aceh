"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/ui/Toast";
import { useEffect } from "react";

function FaviconUpdater() {
  useEffect(() => {
    // Fetch public settings and apply favicon dynamically
    fetch("/api/settings", { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.favicon) {
          const existing = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
          if (existing) {
            existing.href = data.favicon;
          } else {
            const link = document.createElement("link");
            link.rel = "icon";
            link.href = data.favicon;
            document.head.appendChild(link);
          }
        }
      })
      .catch(() => {});
  }, []);
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <ToastProvider>
          <FaviconUpdater />
          {children}
        </ToastProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
