"use client";

import React, { useState, useRef } from "react";
import { ArrowLeft, Save, Image as ImageIcon, Code, Calendar, Upload, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewAdPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    type: "IMAGE_BANNER",
    location: "HEADER_TOP",
    imageUrl: "",
    linkUrl: "",
    scriptCode: "",
    status: true,
    startDate: "",
    endDate: "",
    ratio: "1:1",
  });
  const [takenLocations, setTakenLocations] = useState<string[]>([]);

  React.useEffect(() => {
    const fetchExistingAds = async () => {
      try {
        const res = await fetch("/api/admin/ads");
        if (res.ok) {
          const data = await res.json();
          const locations = data.map((ad: any) => ad.location);
          setTakenLocations(locations);
        }
      } catch (err) {
        console.error("Gagal memuat iklan terpasang", err);
      }
    };
    fetchExistingAds();
  }, []);

  // Upload and Media selector state
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaLibrary, setMediaLibrary] = useState<any[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      setError(null);
      const formData = new FormData();
      formData.append("file", e.target.files[0]);

      try {
        const res = await fetch("/api/admin/media", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.url) {
          setFormData((prev) => ({ ...prev, imageUrl: data.url }));
        } else {
          setError(data.error || "Gagal mengunggah berkas.");
        }
      } catch (err) {
        setError("Kesalahan jaringan saat mengunggah.");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
    };

    try {
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal menyimpan iklan.");
      } else {
        router.push("/admin/ads");
      }
    } catch (err) {
      setError("Kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to render a location <option> with consistent taken styling
  const LocationOption = ({
    value,
    label,
  }: {
    value: string;
    label: string;
  }) => {
    const taken = takenLocations.includes(value);
    return (
      <option
        value={value}
        disabled={taken}
        className={`bg-white dark:bg-zinc-950 ${taken
            ? "text-zinc-300 dark:text-zinc-600"
            : "text-zinc-800 dark:text-zinc-200"
          }`}
      >
        {label}
        {taken && " — (Sudah Ada)"}
      </option>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto select-none pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/ads"
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Pasang Iklan Baru
            </h2>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-1">
              Konfigurasi pengaturan dan materi iklan
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-800 dark:text-red-400 border border-red-200 dark:border-red-900/50">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-5">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 border-b border-zinc-100 dark:border-zinc-900 pb-3">
                Informasi Dasar
              </h3>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                  Nama Iklan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Contoh: Promo Ramadhan 2026"
                  className="w-full text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                    Tipe Iklan
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
                  >
                    <option value="IMAGE_BANNER">Banner Gambar</option>
                    <option value="CUSTOM_SCRIPT">Custom Script (Adsense, dll)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                    Posisi Tayang
                  </label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
                  >
                    <optgroup label="Global" className="text-zinc-400 dark:text-zinc-600 font-semibold">
                      <LocationOption value="HEADER_TOP" label="Header Atas" />
                      <LocationOption value="FOOTER_BOTTOM" label="Footer Bawah" />
                      <LocationOption value="STICKY_BOTTOM" label="Sticky Bawah (Mobile)" />
                    </optgroup>
                    <optgroup label="Halaman Artikel" className="text-zinc-400 dark:text-zinc-600 font-semibold">
                      <LocationOption value="ARTICLE_ABOVE_TITLE" label="Atas Judul" />
                      <LocationOption value="ARTICLE_BELOW_IMAGE" label="Bawah Gambar Utama" />
                      <LocationOption value="ARTICLE_IN_CONTENT" label="Dalam Konten" />
                      <LocationOption value="ARTICLE_END" label="Akhir Artikel" />
                    </optgroup>
                    <optgroup label="Halaman List" className="text-zinc-400 dark:text-zinc-600 font-semibold">
                      <LocationOption value="FEED_INLINE_1" label="Feed List 1 (Berita Terbaru)" />
                      <LocationOption value="FEED_INLINE_2" label="Feed List 2 (Kategori Berita)" />
                      <LocationOption value="SIDEBAR" label="Sidebar Desktop" />
                    </optgroup>
                  </select>

                  {/* Ratio hint per location */}
                  {formData.type === "IMAGE_BANNER" && (() => {
                    const hints: Record<string, string> = {
                      HEADER_TOP: "Rasio ideal: 6:1 (contoh: 728×90 px) — Leaderboard banner",
                      FOOTER_BOTTOM: "Rasio ideal: 8:1 (contoh: 728×90 px) — Footer leaderboard",
                      STICKY_BOTTOM: "Rasio ideal: 8:1 (contoh: 320×50 px) — Mobile sticky",
                      ARTICLE_ABOVE_TITLE: "Rasio ideal: 16:5 (contoh: 728×228 px) — Article banner",
                      ARTICLE_BELOW_IMAGE: "Rasio ideal: 16:5 (contoh: 728×228 px) — Article banner",
                      ARTICLE_IN_CONTENT: "Pilih rasio di bawah: 16:5 (lebar), 16:9 (landscape) atau 1:1 (kotak)",
                      ARTICLE_END: "Pilih rasio di bawah: 16:5 (lebar), 16:9 (landscape) atau 1:1 (kotak)",
                      FEED_INLINE_1: "Rasio ideal: 4:3 (contoh: 400×300 px) — Feed card",
                      FEED_INLINE_2: "Rasio ideal: 4:3 (contoh: 400×300 px) — Kategori card",
                      SIDEBAR: "Pilih rasio di bawah: 1:1 (kotak) atau 9:16 (vertikal)",
                    };
                    const hint = hints[formData.location];
                    return hint ? (
                      <p className="text-[10px] text-teal-600 dark:text-teal-400 mt-1.5 flex items-start gap-1">
                        <span className="shrink-0">💡</span> {hint}. Gambar apapun akan di-crop otomatis agar pas.
                      </p>
                    ) : null;
                  })()}
                </div>
              </div>

              {["SIDEBAR", "ARTICLE_IN_CONTENT", "ARTICLE_END"].includes(formData.location) && formData.type === "IMAGE_BANNER" && (
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900">
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                    Rasio Gambar Banner ({formData.location === "SIDEBAR" ? "Sidebar Only" : "Artikel Only"})
                  </label>
                  <select
                    name="ratio"
                    value={formData.ratio}
                    onChange={handleChange}
                    className="w-full text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
                  >
                    {formData.location === "SIDEBAR" ? (
                      <>
                        <option value="1:1">Square (1:1) — Persegi</option>
                        <option value="9:16">Vertical / Story (9:16)</option>
                      </>
                    ) : (
                      <>
                        <option value="16:5">Wide Banner (16:5)</option>
                        <option value="16:9">Landscape (16:9)</option>
                        <option value="1:1">Square (1:1) — Persegi</option>
                      </>
                    )}
                  </select>
                </div>
              )}
            </div>

            {/* Materi Iklan */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-5">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 border-b border-zinc-100 dark:border-zinc-900 pb-3 flex items-center gap-2">
                {formData.type === "IMAGE_BANNER" ? <ImageIcon className="w-4 h-4 text-teal-500" /> : <Code className="w-4 h-4 text-teal-500" />}
                Materi Iklan
              </h3>

              {formData.type === "IMAGE_BANNER" ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                      Banner Gambar <span className="text-red-500">*</span>
                    </label>

                    {formData.imageUrl ? (
                      <div className="relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 overflow-hidden flex flex-col items-center justify-center p-4 max-w-md mx-auto group">
                        <div className="w-full aspect-[4/1] overflow-hidden rounded-lg shadow-sm bg-zinc-200 dark:bg-zinc-800">
                          <img
                            src={formData.imageUrl}
                            alt="Banner Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, imageUrl: "" }))}
                          className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white rounded-full p-1.5 shadow-md transition-colors cursor-pointer"
                          title="Hapus gambar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <p className="text-[10px] text-zinc-400 mt-2 truncate w-full text-center">{formData.imageUrl}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-8 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/10 space-y-4">
                        <div className="rounded-full bg-zinc-100 dark:bg-zinc-800 p-3">
                          <ImageIcon className="w-6 h-6 text-zinc-400 dark:text-zinc-650" />
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-500 text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {isUploading ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Mengunggah...
                              </>
                            ) : (
                              <>
                                <Upload className="w-3.5 h-3.5" />
                                Unggah Gambar
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={openMediaSelector}
                            className="px-4 py-2 text-xs font-bold rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                          >
                            Pilih Pustaka Media
                          </button>
                        </div>
                        <div className="w-full flex items-center gap-3 py-1">
                          <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1"></div>
                          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Atau Masukkan URL</span>
                          <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1"></div>
                        </div>
                        <input
                          type="url"
                          name="imageUrl"
                          required={formData.type === "IMAGE_BANNER"}
                          value={formData.imageUrl}
                          onChange={handleChange}
                          placeholder="https://example.com/banner.jpg"
                          className="w-full text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                      disabled={isUploading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                      Target URL (Jika Diklik)
                    </label>
                    <input
                      type="url"
                      name="linkUrl"
                      value={formData.linkUrl}
                      onChange={handleChange}
                      placeholder="https://client-website.com"
                      className="w-full text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                    Script Code (HTML/JS) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="scriptCode"
                    required={formData.type === "CUSTOM_SCRIPT"}
                    value={formData.scriptCode}
                    onChange={handleChange}
                    rows={8}
                    placeholder="<!-- Google AdSense Code -->&#10;<script async src='...'></script>"
                    className="w-full text-sm font-mono rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
                  />
                  <p className="text-[10px] text-zinc-500 mt-2">Pastikan script yang dimasukkan valid dan aman. Kesalahan script dapat merusak tampilan halaman.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar / Settings */}
          <div className="space-y-6">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-5">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 border-b border-zinc-100 dark:border-zinc-900 pb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-500" />
                Penjadwalan
              </h3>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                  Mulai Tayang (Opsional)
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                  Akhir Tayang (Opsional)
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="status"
                      checked={formData.status}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-zinc-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500"></div>
                  </div>
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Iklan Aktif
                  </span>
                </label>
                <p className="text-[10px] text-zinc-500 mt-2 ml-13">Jika tidak aktif, iklan tidak akan ditampilkan meski dalam periode jadwal.</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 px-6 py-4 text-sm font-bold text-white shadow-sm transition-all cursor-pointer"
            >
              <Save className="w-5 h-5" />
              {loading ? "Menyimpan..." : "Simpan & Pasang Iklan"}
            </button>
          </div>
        </div>
      </form>

      {/* Media Library Selector Modal */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-155 dark:border-zinc-900">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                Pilih Gambar dari Pustaka Media
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
                    const isSelected = formData.imageUrl === item.url;
                    return (
                      <div
                        key={item.id}
                        onClick={() => selectImageFromMedia(item.url)}
                        className={`group relative aspect-square rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-900 cursor-pointer border-2 transition-all ${isSelected
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