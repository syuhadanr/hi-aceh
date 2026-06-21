"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Image as ImageIcon, Code, Calendar, Upload, X, Loader2, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

const DESKTOP_PLACEMENTS = [
  {
    title: "Header / Kepala Halaman",
    options: [
      { value: "HEADER_BETWEEN", label: "Bawah Header (Beranda & Kategori)", sublabel: "Rasio Aspek 6:1" },
      { value: "MAIN_BELOW_HEADLINE", label: "Di Bawah Headline / Hero Utama (Beranda)", sublabel: "Tinggi Tetap 12rem" },
      { value: "POPULAR_BELOW", label: "Di Bawah Widget Populer (Beranda)", sublabel: "Tinggi Tetap 12rem" },
    ]
  },
  {
    title: "Feed Terkini (Sisipan Berita)",
    options: [
      { value: "FEED_INLINE_1", label: "Feed Sisipan Banner 1 (Beranda)", sublabel: "Rasio Aspek 6:1" },
      { value: "FEED_INLINE_2", label: "Feed Sisipan Card 2 (Beranda)", sublabel: "Rasio Aspek 4:3" },
      { value: "FEED_AFTER_SELESAI", label: "Bawah Feed Terkini / Selesai (Beranda)", sublabel: "Rasio Aspek 6:1" },
    ]
  },
  {
    title: "Sidebar / Kolom Samping",
    options: [
      { value: "FEED_ASIDE_TOP", label: "Sidebar Feed - Atas (Beranda)", sublabel: "Rasio Aspek 4:5" },
      { value: "FEED_ASIDE_MID", label: "Sidebar Feed - Tengah (Beranda)", sublabel: "Rasio Aspek 4:5" },
      { value: "FEED_ASIDE_BOTTOM", label: "Sidebar Feed - Bawah (Beranda)", sublabel: "Rasio Aspek 4:5" },
    ]
  },
  {
    title: "Dalam Artikel",
    options: [
      { value: "ARTICLE_ABOVE_TITLE", label: "Atas Judul Artikel (Halaman Artikel)", sublabel: "Rasio Aspek 6:1" },
      { value: "ARTICLE_BELOW_IMAGE", label: "Bawah Gambar Utama (Halaman Artikel)", sublabel: "Rasio Aspek 16:9" },
      { value: "ARTICLE_IN_CONTENT", label: "Di Dalam Konten / Isi (Halaman Artikel)", sublabel: "Rasio Aspek 16:9" },
      { value: "ARTICLE_END", label: "Bawah / Akhir Artikel (Halaman Artikel)", sublabel: "Rasio Aspek 16:9" },
    ]
  }
];

const MOBILE_PLACEMENTS = [
  {
    title: "Header / Kepala Halaman",
    options: [
      { value: "MOBILE_HEADER", label: "Bawah Header / Banner Atas (Beranda & Kategori)", sublabel: "Rasio Aspek 6:1" },
    ]
  },
  {
    title: "Feed Terkini (Sisipan Berita)",
    options: [
      { value: "MOBILE_FEED_1", label: "Feed Sisipan Banner 1 (Beranda)", sublabel: "Rasio Aspek 4:3" },
      { value: "MOBILE_FEED_2", label: "Feed Sisipan Card 2 (Beranda)", sublabel: "Rasio Aspek 4:3" },
      { value: "MOBILE_FEED_AFTER", label: "Antara Widget (Semua Halaman)", sublabel: "Rasio Aspek 4:3" },
    ]
  },
  {
    title: "Dalam Artikel",
    options: [
      { value: "MOBILE_ARTICLE_ABOVE", label: "Atas Judul Artikel (Halaman Artikel)", sublabel: "Rasio Aspek 6:1" },
      { value: "MOBILE_ARTICLE_MIDDLE", label: "Di Dalam Konten / Isi (Halaman Artikel)", sublabel: "Rasio Aspek 4:3" },
      { value: "MOBILE_ARTICLE_END", label: "Bawah / Akhir Artikel (Halaman Artikel)", sublabel: "Rasio Aspek 4:3" },
    ]
  }
];

export default function EditAdPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeAdTab, setActiveAdTab] = useState<"desktop" | "mobile">("desktop");
  const [formData, setFormData] = useState({
    title: "",
    type: "IMAGE_BANNER",
    location: [] as string[],
    imageUrl: "",
    linkUrl: "",
    scriptCode: "",
    status: true,
    startDate: "",
    endDate: "",
  });

  const toggleLocation = (loc: string) => {
    setFormData((prev) => {
      const current = prev.location;
      if (current.includes(loc)) {
        return { ...prev, location: current.filter((x) => x !== loc) };
      } else {
        return { ...prev, location: [...current, loc] };
      }
    });
  };

  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaLibrary, setMediaLibrary] = useState<any[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const formatDatetimeLocal = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (id) {
      fetchAd();
    }
  }, [id]);

  const fetchAd = async () => {
    setInitialLoading(true);
    try {
      const res = await fetch(`/api/admin/ads/${id}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          title: data.title || "",
          type: data.type || "IMAGE_BANNER",
          location: data.location ? [data.location] : [],
          imageUrl: data.imageUrl || "",
          linkUrl: data.linkUrl || "",
          scriptCode: data.scriptCode || "",
          status: data.status !== undefined ? data.status : true,
          startDate: formatDatetimeLocal(data.startDate),
          endDate: formatDatetimeLocal(data.endDate),
        });
      } else {
        showToast("Gagal memuat detail iklan.", "error");
        router.push("/admin/ads");
      }
    } catch (err) {
      console.error(err);
      showToast("Kesalahan jaringan.", "error");
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchMediaLibrary = async () => {
    setIsLoadingMedia(true);
    try {
      const res = await fetch("/api/admin/media");
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

  const openMediaSelector = () => {
    fetchMediaLibrary();
    setIsMediaModalOpen(true);
  };

  const selectImageFromMedia = (url: string) => {
    setFormData((prev) => ({ ...prev, imageUrl: url }));
    setIsMediaModalOpen(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      const formDataUpload = new FormData();
      formDataUpload.append("file", e.target.files[0]);

      try {
        const res = await fetch("/api/admin/media", {
          method: "POST",
          body: formDataUpload,
        });

        const data = await res.json();
        if (res.ok && data.url) {
          setFormData((prev) => ({ ...prev, imageUrl: data.url }));
          showToast("Gambar banner berhasil diunggah!", "success");
        } else {
          showToast(data.error || "Gagal mengunggah gambar.", "error");
        }
      } catch (err) {
        showToast("Kesalahan jaringan saat mengunggah.", "error");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.location.length === 0) {
      showToast("Pilih setidaknya satu posisi penempatan.", "error");
      setLoading(false);
      return;
    }

    if (formData.type === "IMAGE_BANNER" && !formData.imageUrl) {
      showToast("Gambar banner wajib ditentukan untuk tipe Banner.", "error");
      setLoading(false);
      return;
    }

    if (formData.type === "CUSTOM_SCRIPT" && !formData.scriptCode) {
      showToast("Kode Script wajib ditentukan untuk tipe Script.", "error");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/ads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
        }),
      });

      if (res.ok) {
        showToast("Iklan berhasil diperbarui!", "success");
        router.push("/admin/ads");
      } else {
        const errData = await res.json();
        showToast(errData.error || "Gagal memperbarui rincian iklan.", "error");
      }
    } catch (err) {
      showToast("Kesalahan jaringan.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 text-zinc-500 select-none">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        <span className="text-xs font-semibold">Memuat rincian iklan...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center gap-3 select-none">
        <Link
          href="/admin/ads"
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-xl transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Edit Rincian Iklan
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Ubah rincian banner, penempatan, tipe, atau jadwal tayang iklan Anda
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-left">
        {/* Main Content Fields */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-zinc-850 dark:text-zinc-150 border-b border-zinc-100 dark:border-zinc-900 pb-3 flex items-center gap-2 select-none">
              <ImageIcon className="w-4 h-4 text-teal-500" />
              Detail Informasi Iklan
            </h3>

            {/* Nama Iklan */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider mb-2">
                Nama Iklan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Contoh: Iklan Kopi Gayo Banner Utama"
                className="w-full text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-3 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
              />
            </div>

            {/* Tipe Iklan */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider mb-2">
                Tipe Iklan <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                className="w-full text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-3 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
              >
                <option value="IMAGE_BANNER">Image Banner (Gambar/Banner)</option>
                <option value="CUSTOM_SCRIPT">Custom Script (Google AdSense/AdNow)</option>
              </select>
            </div>

            {/* Conditionally Render Banner URL/Script Editor (MOVED ON TOP) */}
            {formData.type === "IMAGE_BANNER" ? (
              <div className="space-y-4">
                {/* Banner Upload / Picker */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider mb-2">
                    Gambar / Banner Utama <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="Masukkan URL gambar atau gunakan pengunggah"
                      className="flex-1 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-3 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="inline-flex items-center justify-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-850 px-4 py-3 rounded-xl text-xs font-bold text-zinc-750 dark:text-zinc-300 transition-colors cursor-pointer select-none"
                      >
                        {isUploading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-zinc-550" />
                        ) : (
                          <Upload className="w-4 h-4 text-zinc-550" />
                        )}
                        Unggah
                      </button>
                      <button
                        type="button"
                        onClick={openMediaSelector}
                        className="inline-flex items-center justify-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-850 px-4 py-3 rounded-xl text-xs font-bold text-zinc-750 dark:text-zinc-300 transition-colors cursor-pointer select-none"
                      >
                        Pilih Media
                      </button>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Batas maksimum ukuran berkas adalah 2MB. Resolusi yang direkomendasikan menyesuaikan rasio posisi yang dipilih.
                  </p>

                  {/* Banner Preview */}
                  {formData.imageUrl && (
                    <div className="relative mt-3 max-h-48 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900 p-2 flex items-center justify-center group">
                      <img
                        src={formData.imageUrl}
                        alt="Pratinjau Banner"
                        className="max-h-40 w-auto object-contain rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, imageUrl: "" }))}
                        className="absolute top-3 right-3 bg-red-600 hover:bg-red-500 text-white rounded-full p-1.5 shadow-md transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Target URL */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider mb-2">
                    Pranala Tujuan (Target Link URL)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <LinkIcon className="h-4 w-4 text-zinc-400" />
                    </div>
                    <input
                      type="url"
                      value={formData.linkUrl}
                      onChange={(e) => setFormData((prev) => ({ ...prev, linkUrl: e.target.value }))}
                      placeholder="https://gayo-coffee.com/diskon-spesial"
                      className="w-full text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 pl-10 pr-3.5 py-3 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Masukkan URL tujuan lengkap dengan http:// atau https://
                  </p>
                </div>
              </div>
            ) : (
              // Custom Script Textarea
              <div>
                <label className="block text-[10px] font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider mb-2">
                  Kode Script Iklan (Google AdSense, AdNow, Dll) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3.5 pointer-events-none">
                    <Code className="h-4 w-4 text-zinc-400" />
                  </div>
                  <textarea
                    rows={8}
                    required
                    value={formData.scriptCode}
                    onChange={(e) => setFormData((prev) => ({ ...prev, scriptCode: e.target.value }))}
                    placeholder="Masukkan tag <script> atau kode iklan HTML..."
                    className="w-full text-xs font-mono rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 pl-10 pr-3.5 py-3 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
                  />
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">
                  Tempel kode script penayang iklan pihak ketiga Anda di sini. Pastikan kodenya valid.
                </p>
              </div>
            )}

            {/* Posisi Iklan (TAB VERSION) */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider mb-3">
                Posisi Penempatan <span className="text-red-500">*</span>
              </label>

              {/* Tab Selector */}
              <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-4 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveAdTab("desktop")}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    activeAdTab === "desktop"
                      ? "border-teal-500 text-teal-600 dark:text-teal-400"
                      : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-300"
                  }`}
                >
                  Desktop ({formData.location.filter((loc) => !loc.startsWith("MOBILE_")).length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAdTab("mobile")}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    activeAdTab === "mobile"
                      ? "border-teal-500 text-teal-600 dark:text-teal-400"
                      : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-300"
                  }`}
                >
                  Mobile ({formData.location.filter((loc) => loc.startsWith("MOBILE_")).length})
                </button>
              </div>

              <div className="space-y-6">
                {(activeAdTab === "desktop" ? DESKTOP_PLACEMENTS : MOBILE_PLACEMENTS).map((sub) => (
                  <div key={sub.title} className="space-y-2">
                    <span className="block text-[11px] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 pb-1 mt-3 select-none">
                      {sub.title}
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {sub.options.map((opt) => {
                        const isSelected = formData.location.includes(opt.value);
                        return (
                          <div
                            key={opt.value}
                            onClick={() => toggleLocation(opt.value)}
                            className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer select-none transition-all ${
                              isSelected
                                ? "border-teal-500 bg-teal-500/5"
                                : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700"
                            }`}
                          >
                            <div className="flex items-center h-5 mt-0.5">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="w-4 h-4 text-teal-600 border-zinc-300 rounded focus:ring-teal-500 accent-teal-600 cursor-pointer"
                              />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 leading-snug">
                                {opt.label}
                              </span>
                              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                {opt.sublabel} ({opt.value})
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Jadwal & Status — inline below placements */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-zinc-850 dark:text-zinc-150 border-b border-zinc-100 dark:border-zinc-900 pb-3 flex items-center gap-2 select-none">
            <Calendar className="w-4 h-4 text-teal-500" />
            Jadwal &amp; Status
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Status Iklan */}
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider mb-2">
                Status Tayang
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-700 dark:text-zinc-350 select-none">
                  <input
                    type="radio"
                    checked={formData.status === true}
                    onChange={() => setFormData((prev) => ({ ...prev, status: true }))}
                    className="accent-teal-600"
                  />
                  Tampilkan (Aktif)
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-700 dark:text-zinc-350 select-none">
                  <input
                    type="radio"
                    checked={formData.status === false}
                    onChange={() => setFormData((prev) => ({ ...prev, status: false }))}
                    className="accent-teal-600"
                  />
                  Sembunyikan
                </label>
              </div>
            </div>

            {/* Mulai Tayang */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider mb-2">
                Tanggal Mulai Tayang
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                className="w-full text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-3 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none"
              />
              <p className="text-[10px] text-zinc-400 mt-1">
                Kosongkan jika ingin segera menayangkan iklan secara langsung
              </p>
            </div>

            {/* Akhir Tayang */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider mb-2">
                Tanggal Berakhir Tayang
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                className="w-full text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-3 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none"
              />
              <p className="text-[10px] text-zinc-400 mt-1">
                Kosongkan jika ingin iklan terus tayang tanpa batas akhir
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading || isUploading}
            className="w-full inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-700/60 text-white font-bold text-xs uppercase px-5 py-3.5 rounded-xl shadow-lg shadow-teal-500/10 transition-all cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Simpan Perubahan
          </button>
        </div>
      </form>

      {/* Media Library Selector Modal */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-150 dark:border-zinc-900">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                Pilih Gambar dari Pustaka Media
              </h3>
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-555 transition-colors cursor-pointer"
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
                  Tidak ada gambar di pustaka media. Silakan unggah berkas baru atau pilih unggah manual.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {mediaLibrary.map((item) => {
                    const isSelected = formData.imageUrl === item.url;
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
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-650 hover:bg-zinc-50 dark:text-zinc-300 transition-colors cursor-pointer"
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