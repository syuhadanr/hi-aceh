"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Pencil,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  Flame,
  Star,
  Clock,
  Check,
  X as XIcon,
} from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PENDING" | "PUBLISHED" | "SCHEDULED";
  type: "TEKS" | "FOTO" | "VIDEO";
  isBreaking: boolean;
  isFeatured: boolean;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: { id: string; name: string };
  category: { id: string; name: string; slug: string };
  tags: { id: string; name: string }[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ArticlesPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || "PENULIS";

  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchArticles = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "20");
        if (search) params.set("search", search);
        if (statusFilter) params.set("status", statusFilter);

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
    },
    [search, statusFilter]
  );



  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/articles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        fetchArticles(pagination.page);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  // Refetch articles when search query or status filter changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchArticles(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/articles?id=${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setIsDeleteOpen(false);
        fetchArticles(pagination.page);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PUBLISHED:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      DRAFT:
        "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
      PENDING:
        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      SCHEDULED:
        "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    };
    const labelMap: Record<string, string> = {
      PUBLISHED: "Terbit",
      DRAFT: "Draft",
      PENDING: "Menunggu",
      SCHEDULED: "Terjadwal",
    };
    return (
      <span
        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
          map[status] || map.DRAFT
        }`}
      >
        {status === "SCHEDULED" && <Clock className="w-3 h-3" />}
        {labelMap[status] || status}
      </span>
    );
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Semua Artikel
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Kelola dan publikasikan konten berita portal Hi Aceh
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 rounded-lg bg-teal-600 hover:bg-teal-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors mt-2 md:mt-0"
        >
          <Plus className="w-4 h-4" />
          Artikel Baru
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-0 w-full md:w-auto md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari judul artikel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 pl-9 pr-3 py-2.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-zinc-400" />
          {["", "PUBLISHED", "DRAFT", "PENDING", "SCHEDULED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                statusFilter === s
                  ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20"
                  : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent"
              }`}
            >
              {s === ""
                ? "Semua"
                : s === "PUBLISHED"
                ? "Terbit"
                : s === "DRAFT"
                ? "Draft"
                : s === "PENDING"
                ? "Menunggu"
                : "Terjadwal"}
            </button>
          ))}
        </div>
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
                <th className="py-3.5 px-4 w-[40%]">Artikel</th>
                <th className="py-3.5 px-4">Rubrik</th>
                <th className="py-3.5 px-4">Penulis</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Views</th>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {articles.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-16 text-center text-sm text-zinc-500"
                  >
                    <FileText className="w-8 h-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-700" />
                    <p className="font-medium">Belum ada artikel</p>
                    <p className="text-xs text-zinc-400 mt-1">
                      Klik "Tulis Artikel Baru" untuk membuat artikel pertama
                    </p>
                  </td>
                </tr>
              ) : (
                articles.map((article) => (
                  <tr
                    key={article.id}
                    className="text-xs hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            {article.isBreaking && (
                              <Flame className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            )}
                            {article.isFeatured && (
                              <Star className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            )}
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate block">
                              {article.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-zinc-400 font-mono">
                              /{article.slug}
                            </span>
                            {article.tags.length > 0 && (
                              <div className="flex items-center gap-1">
                                {article.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag.id}
                                    className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                                  >
                                    #{tag.name}
                                  </span>
                                ))}
                                {article.tags.length > 3 && (
                                  <span className="text-[9px] text-zinc-400">
                                    +{article.tags.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 bg-indigo-500/5">
                        {article.category.name}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-zinc-600 dark:text-zinc-400">
                      {article.author.name}
                    </td>
                    <td className="py-4 px-4">{statusBadge(article.status)}</td>
                    <td className="py-4 px-4 text-center font-bold text-zinc-700 dark:text-zinc-300">
                      {article.viewCount.toLocaleString("id-ID")}
                    </td>
                    <td className="py-4 px-4 text-zinc-500 whitespace-nowrap">
                      {article.publishedAt
                        ? formatDate(article.publishedAt)
                        : formatDate(article.updatedAt)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {article.status === "PENDING" && (role === "ADMIN" || role === "EDITOR") && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(article.id, "PUBLISHED")}
                              className="p-1.5 rounded border border-emerald-250 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                              title="Setujui &amp; Terbitkan"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(article.id, "DRAFT")}
                              className="p-1.5 rounded border border-rose-250 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors cursor-pointer"
                              title="Tolak &amp; Jadikan Draft"
                            >
                              <XIcon className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        <Link
                          href={`/admin/articles/${article.id}/edit`}
                          className="p-1.5 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
                          title="Edit Artikel"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                        <a
                          href={`/${article.category.slug}/${article.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
                          title="Lihat di Frontend"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => {
                            setDeleteId(article.id);
                            setIsDeleteOpen(true);
                          }}
                          className="p-1.5 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/20 text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                          title="Hapus Artikel"
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
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>
            Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} dari{" "}
            {pagination.total} artikel
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => fetchArticles(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-30 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => fetchArticles(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    pageNum === pagination.page
                      ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20"
                      : "border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => fetchArticles(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-30 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 mb-3">
              <Trash2 className="w-5 h-5 text-red-500" />
              Pindahkan ke Sampah?
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
              Artikel akan dipindahkan ke folder sampah. Anda dapat
              memulihkannya kembali dari halaman Sampah.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-900">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white shadow-sm transition-all cursor-pointer"
              >
                {actionLoading ? "Menghapus..." : "Ya, Pindahkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
