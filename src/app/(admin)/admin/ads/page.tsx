"use client";

import React, { useState, useEffect } from "react";
import { Megaphone, Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Ad {
  id: string;
  title: string;
  type: string;
  location: string;
  status: boolean;
  impressions: number;
  clicks: number;
  startDate: string | null;
  endDate: string | null;
}

export default function AdsAdminPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/ads");
      const data = await res.json();
      if (res.ok) {
        setAds(data);
      } else {
        console.error("Error fetching ads:", data.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (ad: Ad) => {
    setTogglingId(ad.id);
    try {
      const res = await fetch(`/api/admin/ads/${ad.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: !ad.status }),
      });
      if (res.ok) {
        setAds((prev) =>
          prev.map((a) => (a.id === ad.id ? { ...a, status: !a.status } : a))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTogglingId(null);
    }
  };

  const handleOpenDelete = (id: string) => {
    setDeleteId(id);
    setError(null);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setError(null);

    try {
      const res = await fetch(`/api/admin/ads/${deleteId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Gagal menghapus iklan.");
      } else {
        setIsDeleteOpen(false);
        fetchAds();
      }
    } catch (err) {
      setError("Kesalahan jaringan.");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const translateLocation = (loc: string) => {
    const map: Record<string, string> = {
      HEADER_TOP: "Header Atas",
      FOOTER_BOTTOM: "Footer Bawah",
      STICKY_BOTTOM: "Mobile Sticky Bawah",
      ARTICLE_ABOVE_TITLE: "Atas Judul Artikel",
      ARTICLE_BELOW_IMAGE: "Bawah Gambar Artikel",
      ARTICLE_IN_CONTENT: "Dalam Konten Artikel",
      ARTICLE_END: "Akhir Artikel",
      FEED_INLINE_1: "Feed List 1",
      FEED_INLINE_2: "Feed List 2",
      SIDEBAR: "Sidebar Desktop",
    };
    return map[loc] || loc;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-teal-500" />
            Manajemen Iklan
          </h2>
          <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-1">
            Kelola penempatan banner dan script iklan dinamis di portal
          </p>
        </div>
        <Link
          href="/admin/ads/new"
          className="flex items-center gap-2 rounded-lg bg-teal-600 hover:bg-teal-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Pasang Iklan Baru
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm transition-colors">
          <table className="w-full min-w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-wider bg-zinc-50 dark:bg-zinc-900/40">
                <th className="py-3.5 px-4">Nama Iklan</th>
                <th className="py-3.5 px-4">Posisi</th>
                <th className="py-3.5 px-4">Tipe</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Impresi / Klik</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {ads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-zinc-500">
                    Belum ada iklan terdaftar.
                  </td>
                </tr>
              ) : (
                ads.map((ad) => (
                  <tr key={ad.id} className="text-xs hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200">{ad.title}</p>
                      <p className="text-[10px] text-zinc-400 font-normal mt-0.5">
                        {formatDate(ad.startDate)} - {formatDate(ad.endDate)}
                      </p>
                    </td>
                    <td className="py-4 px-4 font-medium text-zinc-600 dark:text-zinc-400">
                      {translateLocation(ad.location)}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded border border-blue-500/20 text-blue-600 dark:text-blue-400 bg-blue-500/5">
                        {ad.type === "IMAGE_BANNER" ? "Banner Gambar" : "Custom Script"}
                      </span>
                    </td>
                    {/* ─── Inline Toggle ─── */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => handleToggleStatus(ad)}
                          disabled={togglingId === ad.id}
                          title={ad.status ? "Klik untuk nonaktifkan" : "Klik untuk aktifkan"}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                            ad.status ? "bg-teal-500" : "bg-zinc-300 dark:bg-zinc-700"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              ad.status ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                        <span className={`text-[9px] font-semibold ${ad.status ? "text-teal-500" : "text-zinc-400"}`}>
                          {ad.status ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center font-mono text-zinc-500">
                      <span className="text-zinc-800 dark:text-zinc-300 font-semibold">{ad.impressions}</span> / {ad.clicks}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/admin/ads/edit/${ad.id}`)}
                          className="p-1 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                          title="Edit Iklan"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(ad.id)}
                          className="p-1 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/20 text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                          title="Hapus Iklan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Hapus Iklan?
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus iklan ini secara permanen?
            </p>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-950/30 p-3.5 text-xs text-red-800 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-900">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-650 dark:text-zinc-300 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-500 text-white shadow-sm transition-all cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
