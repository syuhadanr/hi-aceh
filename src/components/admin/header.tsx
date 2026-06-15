"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { ChevronDown, User, Settings, LogOut, Sun, Moon, Menu } from "lucide-react";

type HeaderProps = {
  onMobileMenuToggle?: () => void;
};

export default function Header({ onMobileMenuToggle }: HeaderProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const name = session?.user?.name || "Pengguna";
  const email = session?.user?.email || "";
  const role = session?.user?.role || "PENULIS";

  // Prevent SSR hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Resolve current page title
  const getPageTitle = () => {
    if (pathname === "/admin/dashboard") return "Dashboard";
    if (pathname === "/admin/categories") return "Rubrik & Kategori";
    if (pathname === "/admin/tags") return "Tag Kategori";
    if (pathname === "/admin/media") return "Pustaka Media";
    if (pathname === "/admin/ads") return "Manajemen Iklan";
    if (pathname === "/admin/users") return "Daftar Pengguna";
    if (pathname === "/admin/settings") return "Pengaturan Sistem";
    if (pathname === "/admin/activity") return "Log Aktivitas";
    if (pathname === "/admin/profile") return "Profil Saya";
    if (pathname.startsWith("/admin/articles")) {
      if (pathname === "/admin/articles/new") return "Artikel Baru";
      if (pathname === "/admin/articles/trash") return "Sampah";
      if (pathname.endsWith("/edit")) return "Edit Artikel";
      return "Daftar Semua Artikel";
    }
    return "Hi Aceh Redaksi";
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 backdrop-blur-md px-4 md:px-6 flex items-center justify-between select-none shrink-0 z-30 transition-colors">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors md:hidden"
          aria-label="Buka menu admin"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-zinc-850 dark:text-zinc-100 tracking-tight truncate">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-2">
        {/* Dark/Light mode toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-805 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/40 text-zinc-500 dark:text-zinc-400 hover:text-zinc-850 hover:bg-zinc-100 dark:hover:text-zinc-100 transition-all cursor-pointer"
            title="Ganti Tema"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
          </button>
        )}

        {/* Dropdown menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-350 dark:hover:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 transition-all select-none cursor-pointer group"
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold border border-teal-500/20 text-[10px] uppercase select-none">
              {name.substring(0, 2).toUpperCase()}
            </div>
            <span className="hidden sm:inline text-xs font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
              {name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors" />
          </button>

          {/* User Dropdown Panel */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-1.5 shadow-xl shadow-zinc-200/50 dark:shadow-black/80 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
              <div className="px-3 py-2.5">
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-none">{name}</p>
                <p className="text-[10px] text-zinc-500 truncate mt-1">{email}</p>
                <span className="inline-block text-[8px] font-extrabold px-1.5 py-0.5 rounded tracking-wider bg-zinc-100 dark:bg-zinc-850 text-zinc-650 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 uppercase mt-2">
                  {role}
                </span>
              </div>

              <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1.5" />

              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    window.location.href = "/admin/profile";
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 hover:bg-zinc-50 dark:hover:text-zinc-200 dark:hover:bg-zinc-900/60 transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Profil Saya</span>
                </button>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    window.location.href = "/admin/settings";
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 hover:bg-zinc-50 dark:hover:text-zinc-200 dark:hover:bg-zinc-900/60 transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Pengaturan</span>
                </button>
              </div>

              <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1.5" />

              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-zinc-650 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
