"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  Layers,
  Tag,
  Image as ImageIcon,
  Megaphone,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  BookOpen,
} from "lucide-react";

type SidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    Artikel: pathname.startsWith("/admin/articles"),
    Halaman: pathname.startsWith("/admin/pages"),
  });
  const [pendingCount, setPendingCount] = useState(0);
  const [pageTitles, setPageTitles] = useState<Record<string, string>>({
    about: "Tentang Kami",
    redaksi: "Susunan Redaksi",
    contact: "Hubungi Kami",
    disclaimer: "Disclaimer",
    "pedoman-media": "Pedoman Media",
    "privacy-policy": "Kebijakan Privasi",
    "terms-of-service": "Ketentuan Layanan",
  });

  const role = session?.user?.role || "PENULIS";
  const name = session?.user?.name || "Pengguna";
  const avatarUrl = session?.user?.avatarUrl || "";
  const isAdmin = role === "ADMIN";

  // Fetch pending count for Admin / Editor
  useEffect(() => {
    if (role === "ADMIN" || role === "EDITOR") {
      const fetchPendingCount = async () => {
        try {
          const res = await fetch("/api/admin/articles/pending-count");
          if (res.ok) {
            const data = await res.json();
            setPendingCount(data.count || 0);
          }
        } catch (e) {
          console.error("Failed to fetch pending count", e);
        }
      };

      fetchPendingCount();
      // Poll every 30 seconds
      const interval = setInterval(fetchPendingCount, 30000);
      return () => clearInterval(interval);
    }
  }, [role]);

  // Fetch page titles dynamically
  useEffect(() => {
    if (!isAdmin) return;

    const fetchPageTitles = async () => {
      try {
        const res = await fetch("/api/pages");
        if (res.ok) {
          const data = await res.json();
          setPageTitles((prev) => {
            const updated = { ...prev };
            Object.keys(data).forEach((key) => {
              if (data[key]?.title) {
                updated[key] = data[key].title;
              }
            });
            return updated;
          });
        }
      } catch (e) {
        console.error("Failed to load page titles in sidebar", e);
      }
    };
    fetchPageTitles();
  }, [isAdmin, pathname]);

  const toggleSubmenu = (name: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  // Navigation config
  const navItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Artikel",
      icon: FileText,
      submenu: [
        { name: "Semua Artikel", href: "/admin/articles" },
        { name: "Tulis Baru", href: "/admin/articles/new" },
        ...(role === "PENULIS"
          ? []
          : [{ name: "Sampah", href: "/admin/articles/trash" }]),
      ],
    },
    {
      name: "Media",
      href: "/admin/media",
      icon: ImageIcon,
    },
    ...(isAdmin
      ? [
          {
            name: "Halaman",
            icon: BookOpen,
            submenu: [
              { name: pageTitles.about, href: "/admin/pages/about" },
              { name: pageTitles.redaksi, href: "/admin/pages/redaksi" },
              { name: pageTitles.contact, href: "/admin/pages/contact" },
              { name: pageTitles.disclaimer, href: "/admin/pages/disclaimer" },
              { name: pageTitles["pedoman-media"], href: "/admin/pages/pedoman-media" },
              { name: pageTitles["privacy-policy"], href: "/admin/pages/privacy-policy" },
              { name: pageTitles["terms-of-service"], href: "/admin/pages/terms-of-service" },
            ],
          },
          {
            name: "Rubrik",
            href: "/admin/categories",
            icon: Layers,
          },
          {
            name: "Tag",
            href: "/admin/tags",
            icon: Tag,
          },
          {
            name: "Iklan",
            href: "/admin/ads",
            icon: Megaphone,
          },
          {
            name: "Pengguna",
            href: "/admin/users",
            icon: Users,
          },
          {
            name: "Log Aktivitas",
            href: "/admin/activity",
            icon: ClipboardList,
          },
          {
            name: "Pengaturan",
            href: "/admin/settings",
            icon: Settings,
          },
        ]
      : []),
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 w-72 h-screen transform flex flex-col bg-zinc-950 dark:bg-zinc-950 border-r border-zinc-800/80 text-zinc-400 select-none transition-transform duration-300 md:w-64 md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Brand Logo */}
        <div className="flex items-center justify-between gap-3 px-6 h-16 border-b border-zinc-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-9 h-9 overflow-hidden rounded-lg bg-zinc-900 shadow-lg shadow-teal-500/10">
              <Image
                src="/logo.png"
                alt="Hi Aceh"
                fill
                sizes="36px"
                className="object-contain p-1"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-zinc-50 tracking-tight leading-none">Hi Aceh</span>
              <span className="text-[10px] text-teal-400 font-medium tracking-wider uppercase mt-0.5">Admin Panel</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors md:hidden"
            aria-label="Tutup menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M6.28 5.22a.75.75 0 011.06 0L12 9.94l4.66-4.72a.75.75 0 111.06 1.06L13.06 11l4.72 4.66a.75.75 0 11-1.06 1.06L12 12.06l-4.66 4.72a.75.75 0 11-1.06-1.06L10.94 11 6.22 6.28a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-850 scrollbar-track-transparent">
        {navItems.map((item) => {
          const Icon = item.icon;
          if (item.submenu) {
            const hasActiveSubitem = item.submenu.some(
              (sub) => pathname === sub.href
            );
            const isSubmenuOpen = !!openSubmenus[item.name];

            return (
              <div key={item.name} className="space-y-1">
                <button
                  onClick={() => toggleSubmenu(item.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all group duration-200 cursor-pointer ${
                    hasActiveSubitem
                      ? "text-zinc-50 bg-zinc-900/60 font-semibold"
                      : "hover:text-zinc-205 hover:bg-zinc-900/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors duration-200 ${
                      hasActiveSubitem ? "text-teal-400" : "text-zinc-500 group-hover:text-zinc-300"
                    }`} />
                    <span>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.name === "Artikel" && pendingCount > 0 && (role === "ADMIN" || role === "EDITOR") && (
                      <span className="flex items-center justify-center h-4.5 min-w-4.5 px-1 rounded-full bg-amber-500 text-[10px] font-extrabold text-zinc-950 animate-pulse">
                        {pendingCount}
                      </span>
                    )}
                    {isSubmenuOpen ? (
                      <ChevronUp className="w-4 h-4 text-zinc-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-500" />
                    )}
                  </div>
                </button>

                {isSubmenuOpen && (
                  <div className="pl-4 ml-3 border-l border-zinc-800/85 space-y-1 py-1">
                    {item.submenu.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`flex items-center justify-between h-8 px-4 text-xs font-medium rounded-md transition-all duration-200 ${
                            isSubActive
                              ? "text-teal-400 bg-teal-500/5 font-semibold"
                              : "hover:text-zinc-200 hover:bg-zinc-900/30"
                          }`}
                        >
                          <span>{sub.name}</span>
                          {sub.href === "/admin/articles" && pendingCount > 0 && (role === "ADMIN" || role === "EDITOR") && (
                            <span className="flex items-center justify-center h-4 min-w-4 px-1 rounded bg-amber-500/20 text-[9px] font-bold text-amber-400 border border-amber-500/30">
                              {pendingCount} P
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all group duration-200 ${
                isActive
                  ? "text-teal-400 bg-teal-500/5 border border-teal-500/10 font-semibold"
                  : "hover:text-zinc-200 hover:bg-zinc-900/40 border border-transparent"
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors duration-200 ${
                  isActive ? "text-teal-400" : "text-zinc-500 group-hover:text-zinc-300"
                }`}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* User Section at Bottom */}
      <div className="p-4 border-t border-zinc-900 bg-zinc-950/40 shrink-0">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg border border-zinc-900 bg-zinc-900/30 backdrop-blur-sm">
          <div className="relative flex items-center justify-center w-8 h-8 overflow-hidden rounded-full bg-teal-500/10 text-teal-400 font-bold border border-teal-500/20 text-xs shrink-0 select-none uppercase">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={name} fill sizes="32px" className="object-cover" />
            ) : (
              name.substring(0, 2)
            )}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-zinc-200 truncate leading-none">
              {name}
            </span>
            <div className="flex items-center mt-1">
              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wider border uppercase ${
                role === "ADMIN"
                  ? "border-teal-500/30 text-teal-400 bg-teal-500/5"
                  : role === "EDITOR"
                  ? "border-indigo-500/30 text-indigo-400 bg-indigo-500/5"
                  : "border-amber-500/30 text-amber-400 bg-amber-500/5"
              }`}>
                {role}
              </span>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/tungkuaceh" })}
            title="Keluar dari Panel"
            className="p-1.5 rounded-md hover:bg-zinc-800 hover:text-red-400 text-zinc-500 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  </>
  );
}
