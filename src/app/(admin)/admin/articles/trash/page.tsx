"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Trash2,
  RotateCcw,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  deletedAt: string;
  author: { id: string; name: string };
  category: { id: string; name: string };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function TrashPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Modal states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [restoreId, setRestoreId] = useState<string | null>(null);

  const fetchTrash = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      params.set("trash", "true");
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/articles?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setArticles(data.articles);
        setPagination(data.pagination);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchTrash();
  }, [fetchTrash]);

  const handleRestore = async () => {
    if (!restoreId) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/articles/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: restoreId }),
      });
      if (res.ok) {
        setIsRestoreOpen(false);
        fetchTrash(pagination.page);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!deleteId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/articles?id=${deleteId}&permanent=true`, {
        method: "DELETE",
      });
      if (res.ok) {
        setIsDeleteOpen(false);
        fetchTrash(pagination.page);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/articles"
          className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Tempat Sampah (Trash)
          </h2>
          <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-1">
            Pulihkan artikel yang terhapus atau hapus secara permanen
          </p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Cari judul artikel di sampah..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 pl-9 pr-3 py-2.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm transition-colors">
          <table className="w-full min-w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-wider bg-zinc-50 dark:bg-zinc-900/40">
                <th className="py-3.5 px-4 w-[50%]">Artikel</th>
                <th className="py-3.5 px-4">Rubrik</th>
                <th className="py-3.5 px-4">Penulis</th>
                <th className="py-3.5 px-4">Tanggal Dihapus</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {articles.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-16 text-center text-sm text-zinc-500"
                  >
                    <Trash2 className="w-8 h-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-700" />
                    <p className="font-medium">Tempat sampah kosong</p>
                    <p className="text-xs text-zinc-400 mt-1">
                      Tidak ada artikel yang saat ini berada di tempat sampah
                    </p>
                  </td>
                </tr>
              ) : (
                articles.map((article) => (
                  <tr
                    key={article.id}
                    className="text-xs hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors"
                  >
                    <td className="py-4 px-4 font-semibold text-zinc-800 dark:text-zinc-200">
                      {article.title}
                      <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        /{article.slug}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 bg-indigo-500/5">
                        {article.category.name}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-zinc-650 dark:text-zinc-400">
                      {article.author.name}
                    </td>
                    <td className="py-4 px-4 text-zinc-500 whitespace-nowrap">
                      {formatDate(article.deletedAt)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setRestoreId(article.id);
                            setIsRestoreOpen(true);
                          }}
                          className="p-1.5 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-teal-50 dark:hover:bg-teal-950/20 text-zinc-500 dark:text-zinc-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer"
                          title="Pulihkan Artikel"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteId(article.id);
                            setIsDeleteOpen(true);
                          }}
                          className="p-1.5 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/20 text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                          title="Hapus Permanen"
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-zinc-550">
          <span>
            Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} dari{" "}
            {pagination.total} artikel
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => fetchTrash(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-30 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => fetchTrash(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-30 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Restore Dialog */}
      {isRestoreOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 mb-3">
              <RotateCcw className="w-5 h-5 text-teal-500" />
              Pulihkan Artikel?
            </h3>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 mb-6 leading-relaxed">
              Artikel akan dikembalikan ke daftar artikel dengan status Draft.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-900">
              <button
                onClick={() => setIsRestoreOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-650 dark:text-zinc-300 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleRestore}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white shadow-sm transition-all cursor-pointer"
              >
                {actionLoading ? "Memulihkan..." : "Ya, Pulihkan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Permanently Dialog */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Hapus Secara Permanen?
            </h3>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 mb-6 leading-relaxed text-red-650 dark:text-red-400">
              Peringatan: Tindakan ini tidak dapat dibatalkan. Artikel akan dihapus secara permanen dari database.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-900">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-650 dark:text-zinc-300 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handlePermanentDelete}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white shadow-sm transition-all cursor-pointer"
              >
                {actionLoading ? "Menghapus..." : "Ya, Hapus Permanen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
