"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/Toast";
import {
  Settings,
  Save,
  Globe,
  Mail,
  Share2,
  Upload,
  Check,
  Loader2,
  LayoutGrid,
  Image as ImageIcon,
  Plus,
  ArrowUp,
  ArrowDown,
  X,
  Eye,
  Phone,
  Layers,
} from "lucide-react";

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  siteLogo: string;
  contactEmail: string;
  address: string;
  phoneNumber: string;
  faxNumber: string;
  socialFacebook: string;
  socialInstagram: string;
  socialTwitter: string;
  socialTikTok: string;
  socialYoutube: string;
  // Header settings
  headerLogo: string;
  headerShowSlogan: boolean;
  navbarCategories: { name: string; slug: string; visible: boolean }[];
  featuredBriefsCategory: string;
  // Footer settings
  footerLogo: string;
  footerDescription: string;
  footerShowCategories: { name: string; slug: string }[];
  footerShowPages: string[];
  footerSocialTitle: string;
  footerSocialDescription: string;
  // SEO & General settings
  favicon: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  googleAnalyticsId: string;
}

const PAGE_KEYS = [
  { key: "about", label: "Tentang Kami" },
  { key: "redaksi", label: "Susunan Redaksi" },
  { key: "contact", label: "Hubungi Kami" },
  { key: "disclaimer", label: "Disclaimer" },
  { key: "pedoman-media", label: "Pedoman Pemberitaan Media Siber" },
  { key: "privacy-policy", label: "Kebijakan Privasi" },
  { key: "terms-of-service", label: "Ketentuan Layanan" },
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || "PENULIS";
  const isAuthorized = role === "ADMIN" || role === "EDITOR";

  const [settings, setSettings] = useState<SystemSettings>({
    siteName: "",
    siteDescription: "",
    siteLogo: "",
    contactEmail: "",
    address: "",
    phoneNumber: "",
    faxNumber: "",
    socialFacebook: "",
    socialInstagram: "",
    socialTwitter: "",
    socialTikTok: "",
    socialYoutube: "",
    headerLogo: "",
    headerShowSlogan: true,
    navbarCategories: [],
    featuredBriefsCategory: "politik",
    footerLogo: "",
    footerDescription: "",
    footerShowCategories: [],
    footerShowPages: [],
    footerSocialTitle: "",
    footerSocialDescription: "",
    favicon: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    googleAnalyticsId: "",
  });

  const [activeTab, setActiveTab] = useState<"general" | "header" | "footer">("general");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { showToast } = useToast();

  // Media Selector Modal State
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaLibrary, setMediaLibrary] = useState<any[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [mediaSelectorTarget, setMediaSelectorTarget] = useState<
    "siteLogo" | "headerLogo" | "footerLogo" | "favicon" | null
  >(null);

  const [allCategories, setAllCategories] = useState<{ name: string; slug: string }[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const headerLogoInputRef = useRef<HTMLInputElement>(null);
  const footerLogoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  fetchSettingsAndReconcile();
}, []);

const fetchSettingsAndReconcile = async () => {
  setIsLoading(true);
  try {
    const [settingsRes, categoriesRes] = await Promise.all([
      fetch("/api/admin/settings"),
      fetch("/api/admin/categories"),
    ]);

    let fetchedSettings: any = {};
    if (settingsRes.ok) {
      fetchedSettings = await settingsRes.json();
    }

    let realCategories: { name: string; slug: string }[] = [];
    if (categoriesRes.ok) {
      const catData = await categoriesRes.json();
      realCategories = catData.map((cat: any) => ({ name: cat.name, slug: cat.slug }));
      setAllCategories(realCategories);
    }

    const savedNavbar: { name: string; slug: string; visible: boolean }[] =
      fetchedSettings.navbarCategories || [];

    // Keep saved order/visibility for categories that still exist
    const reconciled = savedNavbar.filter((item) =>
      realCategories.some((cat) => cat.slug === item.slug)
    );

    // Update names in case they changed, keep visibility/order
    const reconciledWithFreshNames = reconciled.map((item) => {
      const match = realCategories.find((cat) => cat.slug === item.slug);
      return { ...item, name: match ? match.name.toUpperCase() : item.name };
    });

    // Append new categories not yet in the saved list
    const existingSlugs = new Set(reconciledWithFreshNames.map((i) => i.slug));
    const newOnes = realCategories
      .filter((cat) => !existingSlugs.has(cat.slug))
      .map((cat) => ({ name: cat.name.toUpperCase(), slug: cat.slug, visible: true }));

    const finalNavbar = [...reconciledWithFreshNames, ...newOnes];

    setSettings({ ...fetchedSettings, navbarCategories: finalNavbar });
  } catch (e) {
    console.error(e);
    showToast("Gagal memuat pengaturan sistem.", "error");
  } finally {
    setIsLoading(false);
  }
};


  const fetchMediaLibrary = async () => {
    setIsLoadingMedia(true);
    try {
      const res = await fetch("/api/admin/media", { credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        setMediaLibrary(data);
      }
    } catch (e) {
      console.error("Gagal memuat pustaka media", e);
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const openMediaSelector = (
    target: "siteLogo" | "headerLogo" | "footerLogo" | "favicon"
  ) => {
    setMediaSelectorTarget(target);
    fetchMediaLibrary();
    setIsMediaModalOpen(true);
  };

  const selectImageFromMedia = (url: string) => {
    if (mediaSelectorTarget) {
      setSettings((prev) => ({ ...prev, [mediaSelectorTarget]: url }));
      setIsMediaModalOpen(false);
      setMediaSelectorTarget(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized) return;
    setIsSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        showToast("Pengaturan sistem berhasil disimpan!", "success");
      } else {
        const data = await res.json();
        showToast(data.error || "Gagal menyimpan pengaturan.", "error");
      }
    } catch (err) {
      showToast("Kesalahan jaringan.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetField: "siteLogo" | "headerLogo" | "footerLogo" | "favicon"
  ) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", e.target.files[0]);

      try {
        const res = await fetch("/api/admin/media", {
          method: "POST",
          credentials: "same-origin",
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.url) {
          setSettings((prev) => ({ ...prev, [targetField]: data.url }));
          showToast("Berkas berhasil diunggah!", "success");
        } else {
          showToast(data.error || "Gagal mengunggah berkas.", "error");
        }
      } catch (err) {
        showToast("Kesalahan jaringan saat mengunggah.", "error");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleClearField = (
    field: "siteLogo" | "headerLogo" | "footerLogo" | "favicon"
  ) => {
    setSettings((prev) => ({ ...prev, [field]: "" }));
  };

  const handleToggleCategory = (cat: { name: string; slug: string }) => {
    setSettings((prev) => {
      const exists = prev.footerShowCategories.some((c) => c.slug === cat.slug);
      let newCats;
      if (exists) {
        newCats = prev.footerShowCategories.filter((c) => c.slug !== cat.slug);
      } else {
        newCats = [...prev.footerShowCategories, cat];
      }
      return { ...prev, footerShowCategories: newCats };
    });
  };

  const handleTogglePage = (pageKey: string) => {
    setSettings((prev) => {
      const exists = prev.footerShowPages.includes(pageKey);
      let newPages;
      if (exists) {
        newPages = prev.footerShowPages.filter((p) => p !== pageKey);
      } else {
        newPages = [...prev.footerShowPages, pageKey];
      }
      return { ...prev, footerShowPages: newPages };
    });
  };

  const moveCategory = (index: number, direction: "up" | "down") => {
    const newCats = [...settings.navbarCategories];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newCats.length) {
      const temp = newCats[index];
      newCats[index] = newCats[targetIndex];
      newCats[targetIndex] = temp;
      setSettings((prev) => ({ ...prev, navbarCategories: newCats }));
    }
  };

  const toggleCategoryVisibility = (index: number) => {
    const newCats = [...settings.navbarCategories];
    newCats[index].visible = !newCats[index].visible;
    setSettings((prev) => ({ ...prev, navbarCategories: newCats }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Pengaturan Sistem
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Konfigurasi identitas web, logo, kategori navigasi, SEO, dan footer portal Hi Aceh
          </p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        {[
          { id: "general", label: "Umum / General" },
          { id: "header", label: "Header & Navigasi" },
          { id: "footer", label: "Footer Layout" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-bold transition-colors border-b-2 cursor-pointer ${
              activeTab === tab.id
                ? "border-teal-500 text-teal-600 dark:text-teal-400"
                : "border-transparent text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-350"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>


      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6 text-left">
        
        {/* TAB 1: GENERAL SETTINGS */}
        {activeTab === "general" && (
          <div className="space-y-6">
            {/* Identity & Main Logo */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
                <Globe className="w-4 h-4 text-teal-500" />
                Identitas Utama
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-6 items-start">
                <div className="flex flex-col items-center gap-2 text-center">
                  <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    Logo Utama
                  </span>
                  <div className="relative aspect-square w-28 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 overflow-hidden flex items-center justify-center group">
                    {settings.siteLogo ? (
                      <>
                        <img
                          src={settings.siteLogo}
                          alt="Logo Utama"
                          className="w-full h-full object-contain p-2"
                        />
                        {isAuthorized && (
                          <button
                            type="button"
                            onClick={() => handleClearField("siteLogo")}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </>
                    ) : (
                      <ImageIcon className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
                    )}
                    {isAuthorized && !settings.siteLogo && (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 items-center justify-center p-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[9px] font-semibold text-white bg-teal-600 hover:bg-teal-500 px-2 py-1 rounded transition-colors w-full text-center"
                        >
                          Unggah
                        </button>
                        <button
                          type="button"
                          onClick={() => openMediaSelector("siteLogo")}
                          className="text-[9px] font-semibold text-white bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded transition-colors w-full text-center"
                        >
                          Pilih Media
                        </button>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFileUpload(e, "siteLogo")}
                    accept="image/*"
                    className="hidden"
                    disabled={!isAuthorized || isUploading}
                  />
                </div>

                <div className="space-y-4 flex-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                        Nama Portal / Website *
                      </label>
                      <input
                        type="text"
                        required
                        value={settings.siteName}
                        onChange={(e) =>
                          setSettings((prev) => ({ ...prev, siteName: e.target.value }))
                        }
                        disabled={!isAuthorized}
                        placeholder="Hi Aceh"
                        className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                        Kategori Featured Briefs
                      </label>
                      <select
                        value={settings.featuredBriefsCategory}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            featuredBriefsCategory: e.target.value,
                          }))
                        }
                        disabled={!isAuthorized}
                        className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors disabled:opacity-50"
                      >
                        {allCategories.length > 0 ? (
                          allCategories.map((cat) => (
                            <option key={cat.slug} value={cat.slug}>
                              {cat.name}
                            </option>
                          ))
                        ) : (
                          <option value="politik">Politik</option>
                        )}
                      </select>
                      <p className="text-[10px] text-zinc-400 mt-1">
                        Pilih kategori yang akan ditampilkan di widget Featured Briefs di halaman utama.
                      </p>
                    </div>

                    {/* Favicon configuration */}
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center gap-1">
                        <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                          Favicon (1:1)
                        </span>
                        <div className="relative aspect-square w-12 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 overflow-hidden flex items-center justify-center group">
                          {settings.favicon ? (
                            <>
                              <img
                                src={settings.favicon}
                                alt="Favicon"
                                className="w-full h-full object-contain p-1"
                              />
                              {isAuthorized && (
                                <button
                                  type="button"
                                  onClick={() => handleClearField("favicon")}
                                  className="absolute top-0 right-0 bg-red-655 bg-red-600 text-white rounded-full p-0.5 shadow-md hover:bg-red-500"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </>
                          ) : (
                            <Settings className="w-4 h-4 text-zinc-300 dark:text-zinc-700" />
                          )}
                          {isAuthorized && !settings.favicon && (
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-0.5 items-center justify-center p-0.5 text-[8px]">
                              <span
                                onClick={() => faviconInputRef.current?.click()}
                                className="text-white hover:text-teal-400 cursor-pointer"
                              >
                                Upload
                              </span>
                              <span
                                onClick={() => openMediaSelector("favicon")}
                                className="text-white hover:text-teal-400 cursor-pointer"
                              >
                                Media
                              </span>
                            </div>
                          )}
                        </div>
                        <input
                          type="file"
                          ref={faviconInputRef}
                          onChange={(e) => handleFileUpload(e, "favicon")}
                          accept="image/*"
                          className="hidden"
                          disabled={!isAuthorized || isUploading}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                      Alamat Redaksi
                    </label>
                    <input
                      type="text"
                      value={settings.address}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, address: e.target.value }))
                      }
                      disabled={!isAuthorized}
                      placeholder="Banda Aceh, Aceh, Indonesia"
                      className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info & Telephones */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
                <Mail className="w-4 h-4 text-teal-500" />
                Kontak &amp; Komunikasi
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Email Redaksi *
                  </label>
                  <input
                    type="email"
                    required
                    value={settings.contactEmail}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, contactEmail: e.target.value }))
                    }
                    disabled={!isAuthorized}
                    placeholder="redaksi@hiaceh.com"
                    className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    No. Telepon (PSTN)
                  </label>
                  <input
                    type="text"
                    value={settings.phoneNumber}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, phoneNumber: e.target.value }))
                    }
                    disabled={!isAuthorized}
                    placeholder="Contoh: 0651-XXXXXX"
                    className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    No. Faksimile (Fax)
                  </label>
                  <input
                    type="text"
                    value={settings.faxNumber}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, faxNumber: e.target.value }))
                    }
                    disabled={!isAuthorized}
                    placeholder="Contoh: 0651-XXXXXX"
                    className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* SEO Configurations */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
                <Globe className="w-4 h-4 text-teal-500" />
                Optimasi Mesin Pencari (SEO) &amp; Google Analytics
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Title Bar Browser (Browser Tab Title)
                  </label>
                  <input
                    type="text"
                    value={settings.seoTitle}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, seoTitle: e.target.value }))
                    }
                    disabled={!isAuthorized}
                    placeholder="Contoh: Hi Aceh - Media Online Aceh & Indonesia Terkini"
                    className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors disabled:opacity-50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                      Deskripsi Ringkas (SEO Description)
                    </label>
                    <textarea
                      value={settings.seoDescription}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, seoDescription: e.target.value }))
                      }
                      disabled={!isAuthorized}
                      rows={3}
                      placeholder="Tulis deskripsi meta SEO untuk mesin pencari..."
                      className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                      Kata Kunci Pencarian (SEO Keywords)
                    </label>
                    <textarea
                      value={settings.seoKeywords}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, seoKeywords: e.target.value }))
                      }
                      disabled={!isAuthorized}
                      rows={3}
                      placeholder="berita aceh, tsunami, kuliner aceh, wisata, dll."
                      className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    ID Google Analytics (UA-XXXXX or G-XXXXX)
                  </label>
                  <input
                    type="text"
                    value={settings.googleAnalyticsId}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, googleAnalyticsId: e.target.value }))
                    }
                    disabled={!isAuthorized}
                    placeholder="Masukkan Google Analytics Tracking ID..."
                    className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Social Medias */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
                <Share2 className="w-4 h-4 text-teal-500" />
                Pranala Sosial Media Utama
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Facebook Link
                  </label>
                  <input
                    type="url"
                    value={settings.socialFacebook}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, socialFacebook: e.target.value }))
                    }
                    disabled={!isAuthorized}
                    placeholder="https://facebook.com/..."
                    className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Instagram Link
                  </label>
                  <input
                    type="url"
                    value={settings.socialInstagram}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, socialInstagram: e.target.value }))
                    }
                    disabled={!isAuthorized}
                    placeholder="https://instagram.com/..."
                    className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Twitter / X Link
                  </label>
                  <input
                    type="url"
                    value={settings.socialTwitter}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, socialTwitter: e.target.value }))
                    }
                    disabled={!isAuthorized}
                    placeholder="https://twitter.com/..."
                    className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    YouTube Channel Link
                  </label>
                  <input
                    type="url"
                    value={settings.socialYoutube}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, socialYoutube: e.target.value }))
                    }
                    disabled={!isAuthorized}
                    placeholder="https://youtube.com/c/..."
                    className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    TikTok Link
                  </label>
                  <input
                    type="url"
                    value={settings.socialTikTok}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, socialTikTok: e.target.value }))
                    }
                    disabled={!isAuthorized}
                    placeholder="https://www.tiktok.com/@username"
                    className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HEADER & NAVIGATION SETTINGS */}
        {activeTab === "header" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
                <Globe className="w-4 h-4 text-teal-500" />
                Identitas dan Tampilan Header
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-6 items-start">
                <div className="flex flex-col items-center gap-2 text-center">
                  <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    Logo Header
                  </span>
                  <div className="relative aspect-square w-28 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 overflow-hidden flex items-center justify-center group">
                    {settings.headerLogo ? (
                      <>
                        <img
                          src={settings.headerLogo}
                          alt="Logo Header"
                          className="w-full h-full object-contain p-2"
                        />
                        {isAuthorized && (
                          <button
                            type="button"
                            onClick={() => handleClearField("headerLogo")}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </>
                    ) : settings.siteLogo ? (
                      <div className="relative w-full h-full">
                        <img
                          src={settings.siteLogo}
                          alt="Logo Website (Fallback)"
                          className="w-full h-full object-contain p-2 opacity-50"
                        />
                        <span className="absolute bottom-1 left-0 right-0 text-[8px] bg-black/60 text-white py-0.5 text-center">
                          Fallback Logo
                        </span>
                      </div>
                    ) : (
                      <ImageIcon className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
                    )}
                    {isAuthorized && !settings.headerLogo && (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 items-center justify-center p-2">
                        <button
                          type="button"
                          onClick={() => headerLogoInputRef.current?.click()}
                          className="text-[9px] font-semibold text-white bg-teal-600 hover:bg-teal-500 px-2 py-1 rounded transition-colors w-full text-center"
                        >
                          Unggah
                        </button>
                        <button
                          type="button"
                          onClick={() => openMediaSelector("headerLogo")}
                          className="text-[9px] font-semibold text-white bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded transition-colors w-full text-center"
                        >
                          Pilih Media
                        </button>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={headerLogoInputRef}
                    onChange={(e) => handleFileUpload(e, "headerLogo")}
                    accept="image/*"
                    className="hidden"
                    disabled={!isAuthorized || isUploading}
                  />
                  <span className="text-[8px] text-zinc-400">Kosongkan untuk mengikuti logo utama</span>
                </div>

                <div className="space-y-4 flex-1">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                      Slogan Redaksi (Teks Slogan Header)
                    </label>
                    <input
                      type="text"
                      value={settings.siteDescription}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, siteDescription: e.target.value }))
                      }
                      disabled={!isAuthorized}
                      placeholder="Cermat Mendata, Cerdas Mengulas"
                      className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors disabled:opacity-50"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          headerShowSlogan: !prev.headerShowSlogan,
                        }))
                      }
                      disabled={!isAuthorized}
                      className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${
                        settings.headerShowSlogan ? "bg-teal-500" : "bg-zinc-300 dark:bg-zinc-700"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                          settings.headerShowSlogan ? "translate-x-4" : ""
                        }`}
                      />
                    </button>
                    <span className="text-xs font-semibold text-zinc-705 dark:text-zinc-300">
                      Tampilkan Slogan di Bawah Logo Header (Jika dinonaktifkan, tinggi header akan mengecil)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navbar Categories order and visibility settings */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
                <Layers className="w-4 h-4 text-teal-500" />
                Urutan Kategori &amp; Visibilitas Menu Navigasi (Navbar)
              </h3>
              <p className="text-[11px] text-zinc-400">
                Gunakan tombol panah untuk menyusun urutan menu dari kiri ke kanan. Centang atau hapus centang untuk menyembunyikan kategori dari navbar utama. 8 kategori pertama (selain Home) akan langsung tampil, sisanya akan masuk ke dropdown "Lainnya".
              </p>

              <div className="space-y-1.5 border border-zinc-150 dark:border-zinc-900 rounded-lg p-3 bg-zinc-50 dark:bg-zinc-900/50 max-h-96 overflow-y-auto">
                {settings.navbarCategories.map((cat, idx) => (
                  <div
                    key={cat.slug}
                    className="flex items-center justify-between p-2 rounded-md bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-900 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={cat.visible}
                        onChange={() => toggleCategoryVisibility(idx)}
                        disabled={!isAuthorized}
                        className="rounded text-teal-600 focus:ring-teal-500 border-zinc-350 w-4 h-4 cursor-pointer"
                      />
                      <span className={`text-xs font-bold ${cat.visible ? "text-zinc-850 dark:text-zinc-100" : "text-zinc-400 line-through"}`}>
                        {cat.name} <span className="text-[10px] text-zinc-400 font-normal">({cat.slug})</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveCategory(idx, "up")}
                        disabled={idx === 0 || !isAuthorized}
                        className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 disabled:opacity-30 cursor-pointer"
                        title="Geser ke Atas"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveCategory(idx, "down")}
                        disabled={idx === settings.navbarCategories.length - 1 || !isAuthorized}
                        className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 disabled:opacity-30 cursor-pointer"
                        title="Geser ke Bawah"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      {idx < 8 && cat.visible && (
                        <span className="text-[8px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 px-1 rounded ml-1">
                          Navbar Utama
                        </span>
                      )}
                      {idx >= 8 && cat.visible && (
                        <span className="text-[8px] font-bold bg-amber-500/10 text-amber-650 dark:text-amber-400 border border-amber-500/20 px-1 rounded ml-1">
                          Dropdown Lainnya
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FOOTER SETTINGS */}
        {activeTab === "footer" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm space-y-6">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
                <LayoutGrid className="w-4 h-4 text-teal-500" />
                Pengaturan Layout Footer
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-6 items-start">
                <div className="flex flex-col items-center gap-2 text-center">
                  <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    Logo Footer
                  </span>
                  <div className="relative aspect-square w-28 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 overflow-hidden flex items-center justify-center group">
                    {settings.footerLogo ? (
                      <>
                        <img
                          src={settings.footerLogo}
                          alt="Logo Footer"
                          className="w-full h-full object-contain p-2"
                        />
                        {isAuthorized && (
                          <button
                            type="button"
                            onClick={() => handleClearField("footerLogo")}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </>
                    ) : settings.siteLogo ? (
                      <div className="relative w-full h-full">
                        <img
                          src={settings.siteLogo}
                          alt="Logo Website (Fallback)"
                          className="w-full h-full object-contain p-2 opacity-50"
                        />
                        <span className="absolute bottom-1 left-0 right-0 text-[8px] bg-black/60 text-white py-0.5 text-center">
                          Fallback Logo
                        </span>
                      </div>
                    ) : (
                      <ImageIcon className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
                    )}
                    {isAuthorized && !settings.footerLogo && (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 items-center justify-center p-2">
                        <button
                          type="button"
                          onClick={() => footerLogoInputRef.current?.click()}
                          className="text-[9px] font-semibold text-white bg-teal-600 hover:bg-teal-500 px-2 py-1 rounded transition-colors w-full text-center"
                        >
                          Unggah
                        </button>
                        <button
                          type="button"
                          onClick={() => openMediaSelector("footerLogo")}
                          className="text-[9px] font-semibold text-white bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded transition-colors w-full text-center"
                        >
                          Pilih Media
                        </button>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={footerLogoInputRef}
                    onChange={(e) => handleFileUpload(e, "footerLogo")}
                    accept="image/*"
                    className="hidden"
                    disabled={!isAuthorized || isUploading}
                  />
                  <span className="text-[8px] text-zinc-400">Kosongkan untuk mengikuti logo utama</span>
                </div>

                <div className="space-y-4 flex-1">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                      Deskripsi Ringkas Footer
                    </label>
                    <textarea
                      value={settings.footerDescription}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          footerDescription: e.target.value,
                        }))
                      }
                      disabled={!isAuthorized}
                      rows={2}
                      placeholder="Portal Berita Aceh & Indonesia Terkini"
                      className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                {/* Kategori list checkbox selection */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2.5">
                    Kategori Berita yang Ditampilkan
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
                    {allCategories.length === 0 ? (
                      <span className="text-xs text-zinc-400">Tidak ada kategori tersedia</span>
                    ) : (
                      allCategories.map((cat) => {
                        const isChecked = settings.footerShowCategories.some((c) => c.slug === cat.slug);
                        return (
                          <label key={cat.slug} className="flex items-center gap-2 cursor-pointer text-xs text-zinc-700 dark:text-zinc-350 select-none">
                              <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleCategory(cat)}
                              disabled={!isAuthorized}
                              className="rounded text-teal-600 focus:ring-teal-500 border-zinc-350 w-4 h-4 cursor-pointer"
                            />
                            <span>{cat.name}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Halaman list checkbox selection */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2.5">
                    Halaman Perusahaan yang Ditampilkan (Footer &amp; Bottom Bar)
                  </label>
                  <div className="space-y-2 p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
                    {PAGE_KEYS.map((page) => {
                      const isChecked = settings.footerShowPages.includes(page.key);
                      return (
                        <label key={page.key} className="flex items-center gap-2 cursor-pointer text-xs text-zinc-700 dark:text-zinc-350 select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePage(page.key)}
                            disabled={!isAuthorized}
                            className="rounded text-teal-600 focus:ring-teal-500 border-zinc-355 w-4 h-4 cursor-pointer"
                          />
                          <span>{page.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Judul Kolom Sosial Media
                  </label>
                  <input
                    type="text"
                    value={settings.footerSocialTitle}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        footerSocialTitle: e.target.value,
                      }))
                    }
                    disabled={!isAuthorized}
                    placeholder="IKUTI MEDIA SOSIAL"
                    className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Deskripsi Sosial Media
                  </label>
                  <textarea
                    value={settings.footerSocialDescription}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        footerSocialDescription: e.target.value,
                      }))
                    }
                    disabled={!isAuthorized}
                    rows={2}
                    placeholder="Tetap terhubung dengan kabar terkini dari Aceh..."
                    className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        {isAuthorized && (
          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-lg bg-teal-600 hover:bg-teal-500 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? "Menyimpan..." : "Simpan Pengaturan"}
            </button>
          </div>
        )}
      </form>

      {/* Media Library Selector Modal */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-150 dark:border-zinc-900">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                Pilih Logo / Favicon dari Pustaka Media
              </h3>
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {isLoadingMedia ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500" />
                </div>
              ) : mediaLibrary.length === 0 ? (
                <div className="text-center py-12 text-zinc-400 text-xs">
                  Tidak ada gambar di pustaka media. Silakan unggah berkas baru di menu Media.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {mediaLibrary.map((item) => {
                    const isSelected =
                      mediaSelectorTarget && settings[mediaSelectorTarget] === item.url;
                    return (
                      <div
                        key={item.id}
                        onClick={() => selectImageFromMedia(item.url)}
                        className={`group relative aspect-square rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-900 cursor-pointer border-2 transition-all ${
                          isSelected
                            ? "border-teal-500 ring-2 ring-teal-500/20"
                            : "border-transparent hover:border-zinc-350 dark:hover:border-zinc-700"
                        }`}
                      >
                        <img
                          src={item.url}
                          alt={item.filename}
                          className="object-cover w-full h-full"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-teal-500/10 flex items-center justify-center">
                            <span className="bg-teal-600 text-white rounded-full p-1 text-[10px] font-bold">
                              ✓
                            </span>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-[8px] text-white truncate opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.filename}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-150 dark:border-zinc-900">
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-605 border border-zinc-200 dark:border-zinc-800 text-zinc-650 hover:bg-zinc-50 dark:text-zinc-300 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
