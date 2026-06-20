"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Megaphone, CheckCircle2, XCircle, BarChart3, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface Ad {
  id: string;
  title: string;
  type: "IMAGE_BANNER" | "CUSTOM_SCRIPT";
  location: string;
  imageUrl?: string;
  linkUrl?: string;
  status: boolean;
  startDate?: string;
  endDate?: string;
  impressions: number;
  clicks: number;
  createdAt: string;
}

const LOCATION_LABELS: Record<string, string> = {
  HEADER_BETWEEN: "Bawah Header (Beranda & Kategori)",
  MAIN_BELOW_HEADLINE: "Bawah Headline / Hero Utama (Beranda)",
  POPULAR_BELOW: "Bawah Widget Populer (Beranda)",
  FEED_ASIDE_TOP: "Sidebar Feed - Atas (Beranda)",
  FEED_ASIDE_MID: "Sidebar Feed - Tengah (Beranda)",
  FEED_ASIDE_BOTTOM: "Sidebar Feed - Bawah (Beranda)",
  FEED_AFTER_SELESAI: "Bawah Feed Terkini / Selesai (Beranda)",
  FEED_INLINE_1: "Feed Sisipan Banner 1 (Beranda)",
  FEED_INLINE_2: "Feed Sisipan Card 2 (Beranda)",
  ARTICLE_ABOVE_TITLE: "Atas Judul Artikel (Halaman Artikel)",
  ARTICLE_BELOW_IMAGE: "Bawah Gambar Utama (Halaman Artikel)",
  ARTICLE_IN_CONTENT: "Di Dalam Konten / Isi (Halaman Artikel)",
  ARTICLE_END: "Bawah / Akhir Artikel (Halaman Artikel)",
  SIDEBAR: "Sidebar (Halaman Artikel)",
};

export default function AdsAdminPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ads");
      if (res.ok) {
        const data = await res.json();
        setAds(data);
      } else {
        showToast("Gagal memuat data iklan.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Kesalahan jaringan.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/admin/ads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: !currentStatus }),
      });

      if (res.ok) {
        setAds((prev) =>
          prev.map((ad) => (ad.id === id ? { ...ad, status: !currentStatus } : ad))
        );
        showToast("Status iklan berhasil diperbarui.", "success");
      } else {
        showToast("Gagal memperbarui status iklan.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Kesalahan jaringan.", "error");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus iklan ini?")) return;

    try {
      const res = await fetch(`/api/admin/ads/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setAds((prev) => prev.filter((ad) => ad.id !== id));
        showToast("Iklan berhasil dihapus.", "success");
      } else {
        showToast("Gagal menghapus iklan.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Kesalahan jaringan.", "error");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between select-none">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-teal-500" />
            Pengelolaan Iklan
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Sesuaikan banner, penempatan dummy ad, kode script, serta durasi penayangan iklan di portal Hi Aceh
          </p>
        </div>
        <Link
          href="/admin/ads/new"
          className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-lg shadow-lg shadow-teal-500/10 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Pasang Iklan Baru
        </Link>
      </div>

      {/* Grid Stats */}
      {!loading && ads.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Iklan</span>
              <span className="text-2xl font-black text-zinc-850 dark:text-zinc-50 leading-tight">{ads.length}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 flex items-center justify-center font-bold">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Impresi</span>
              <span className="text-2xl font-black text-zinc-850 dark:text-zinc-50 leading-tight">
                {ads.reduce((acc, curr) => acc + curr.impressions, 0).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-650 dark:text-amber-400 flex items-center justify-center font-bold">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Klik</span>
              <span className="text-2xl font-black text-zinc-850 dark:text-zinc-50 leading-tight">
                {ads.reduce((acc, curr) => acc + curr.clicks, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-500">
            <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
            <span className="text-xs font-semibold">Memuat data iklan...</span>
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-450 dark:text-zinc-650 mb-3">
              <Megaphone className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Belum Ada Iklan</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Saat ini belum ada iklan yang dipasang. Tekan tombol &quot;Pasang Iklan Baru&quot; untuk membuat iklan pertama Anda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30 text-[10px] font-bold text-zinc-500 uppercase tracking-wider select-none">
                  <th className="px-6 py-4">Nama Iklan</th>
                  <th className="px-6 py-4">Posisi Penempatan</th>
                  <th className="px-6 py-4">Tipe</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Statistik (Imp / Klik)</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 text-xs">
                {ads.map((ad) => (
                  <tr key={ad.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-800 dark:text-zinc-150">{ad.title}</span>
                        {ad.type === "IMAGE_BANNER" && ad.linkUrl && (
                          <a
                            href={ad.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-teal-600 dark:text-teal-400 hover:underline mt-0.5 truncate max-w-[200px]"
                          >
                            {ad.linkUrl}
                          </a>
                        )}
                        <span className="text-[9px] text-zinc-400 mt-1">
                          Dibuat: {new Date(ad.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                          {LOCATION_LABELS[ad.location] || ad.location}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-450 mt-0.5">{ad.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        ad.type === "IMAGE_BANNER"
                          ? "border-teal-500/20 text-teal-600 bg-teal-500/5 dark:text-teal-400"
                          : "border-purple-500/20 text-purple-650 bg-purple-500/5 dark:text-purple-400"
                      }`}>
                        {ad.type === "IMAGE_BANNER" ? "Image Banner" : "Custom Script"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(ad.id, ad.status)}
                        disabled={togglingId === ad.id}
                        className="inline-flex items-center gap-1 hover:opacity-85 active:scale-95 transition-all cursor-pointer"
                        title="Klik untuk mengubah status"
                      >
                        {togglingId === ad.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                        ) : ad.status ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full text-[10px] font-bold border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-650 dark:text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full text-[10px] font-bold border border-red-500/20">
                            <XCircle className="w-3.5 h-3.5" />
                            Tidak Aktif
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right select-none font-medium">
                      <div className="flex flex-col items-end">
                        <span className="font-mono text-zinc-800 dark:text-zinc-200">
                          {ad.impressions.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {ad.clicks.toLocaleString()} Klik ({ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : "0.00"}% CTR)
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right select-none">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/ads/edit/${ad.id}`}
                          className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-550 dark:text-zinc-450 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-md transition-colors cursor-pointer"
                          title="Ubah Rincian Iklan"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(ad.id)}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-zinc-550 dark:text-zinc-450 hover:text-red-600 dark:hover:text-red-400 rounded-md transition-colors cursor-pointer"
                          title="Hapus Iklan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
