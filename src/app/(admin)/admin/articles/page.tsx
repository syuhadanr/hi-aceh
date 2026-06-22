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
  ChevronLeft,
  ChevronRight,
  Flame,
  Star,
  Clock,
  Check,
  X as XIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
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

const COLUMN_SORT_MAP: Record<string, [string, string]> = {
  title: ["title_asc", "title_desc"],
  category: ["category_asc", "category_desc"],
  author: ["author_asc", "author_desc"],
  status: ["status_asc", "status_desc"],
  viewCount: ["viewCount_asc", "viewCount_desc"],
  publishedAt: ["publishedAt_asc", "publishedAt_desc"],
};

const STATUS_FILTERS = ["", "PUBLISHED", "DRAFT", "PENDING", "SCHEDULED"] as const;
const STATUS_LABELS: Record<string, string> = {
  "": "Semua",
  PUBLISHED: "Terbit",
  DRAFT: "Draft",
  PENDING: "Menunggu",
  SCHEDULED: "Terjadwal",
};

export default function ArticlesPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || "PENULIS";

  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("publishedAt_desc");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchArticles = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (sortBy) params.set("sort", sortBy);
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
  }, [search, statusFilter, sortBy]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/articles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) fetchArticles(pagination.page);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchArticles(1), 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, sortBy]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/articles?id=${deleteId}`, { method: "DELETE" });
      if (res.ok) { setIsDeleteOpen(false); fetchArticles(pagination.page); }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleColumnSort = (col: string) => {
    const [asc, desc] = COLUMN_SORT_MAP[col];
    setSortBy(sortBy === desc ? asc : desc);
  };

  const SortIcon = ({ col }: { col: string }) => {
    const [asc, desc] = COLUMN_SORT_MAP[col];
    if (sortBy === asc) return <ArrowUp className="w-3 h-3 text-teal-500" />;
    if (sortBy === desc) return <ArrowDown className="w-3 h-3 text-teal-500" />;
    return <ArrowUpDown className="w-3 h-3 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-400 transition-colors" />;
  };

  const isSortedBy = (col: string) => {
    const [asc, desc] = COLUMN_SORT_MAP[col];
    return sortBy === asc || sortBy === desc;
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PUBLISHED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      DRAFT: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
      PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      SCHEDULED: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    };
    const labelMap: Record<string, string> = {
      PUBLISHED: "Terbit", DRAFT: "Draft", PENDING: "Menunggu", SCHEDULED: "Terjadwal",
    };
    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${map[status] || map.DRAFT}`}>
        {status === "SCHEDULED" && <Clock className="w-3 h-3" />}
        {labelMap[status] || status}
      </span>
    );
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });

  const SortableTh = ({ col, children, className = "" }: { col: string; children: React.ReactNode; className?: string }) => (
    <th className={`py-3.5 px-4 ${className}`}>
      <button
        onClick={() => handleColumnSort(col)}
        className={`group inline-flex items-center gap-1.5 uppercase tracking-wider font-bold text-[10px] transition-colors cursor-pointer ${isSortedBy(col) ? "text-teal-600 dark:text-teal-400" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
      >
        {children}
        <SortIcon col={col} />
      </button>
    </th>
  );

  const activeFilterCount = [statusFilter !== "", sortBy !== "publishedAt_desc"].filter(Boolean).length;

  return (
    <div className="space-y-4 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Semua Artikel</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 hidden sm:block">
            Kelola dan publikasikan konten berita portal Hi Aceh
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 px-3 py-2 sm:px-4 text-xs font-semibold text-white shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Artikel Baru</span>
        </Link>
      </div>

      {/* ── DESKTOP filter bar ── */}
      <div className="hidden md:flex items-center gap-2 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
        {/* Search */}
        <div className="relative min-w-[180px] flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari judul artikel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-8 pr-3 py-2 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
          />
        </div>

        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700" />

        {/* Status pills */}
        <div className="flex items-center gap-1">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${statusFilter === s
                  ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20"
                  : "text-zinc-500 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700 ml-auto" />

        {/* Sort dropdown */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-[11px] font-semibold rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 px-2.5 py-2 focus:outline-none focus:border-teal-500 cursor-pointer transition-colors"
          >
            <option value="publishedAt_desc">Terbaru Terbit</option>
            <option value="publishedAt_asc">Terlama Terbit</option>
            <option value="updatedAt_desc">Terbaru Diedit</option>
            <option value="createdAt_desc">Terbaru Dibuat</option>
            <option value="viewCount_desc">Terpopuler</option>
            <option value="viewCount_asc">Paling Sedikit Views</option>
            <option value="title_asc">Judul A–Z</option>
            <option value="title_desc">Judul Z–A</option>
          </select>
        </div>
      </div>

      {/* ── MOBILE filter bar ── */}
      <div className="flex md:hidden flex-col gap-2">
        {/* Row 1: Search + filter toggle button */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari artikel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 pl-8 pr-3 py-2.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
            />
          </div>
          <button
            onClick={() => setShowMobileFilters((v) => !v)}
            className={`relative flex items-center gap-1.5 px-3 py-2.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer shrink-0 ${showMobileFilters || activeFilterCount > 0
                ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20"
                : "border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900"
              }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-teal-500 text-white text-[9px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Row 2: collapsible filter panel */}
        {showMobileFilters && (
          <div className="flex flex-col gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
            {/* Status */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Status</p>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_FILTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${statusFilter === s
                        ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20"
                        : "text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                      }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Urutkan</p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 px-3 py-2.5 focus:outline-none focus:border-teal-500 cursor-pointer transition-colors"
              >
                <option value="publishedAt_desc">Terbaru Terbit</option>
                <option value="publishedAt_asc">Terlama Terbit</option>
                <option value="updatedAt_desc">Terbaru Diedit</option>
                <option value="createdAt_desc">Terbaru Dibuat</option>
                <option value="viewCount_desc">Terpopuler</option>
                <option value="viewCount_asc">Paling Sedikit Views</option>
                <option value="title_asc">Judul A–Z</option>
                <option value="title_desc">Judul Z–A</option>
              </select>
            </div>

            {/* Reset */}
            {activeFilterCount > 0 && (
              <button
                onClick={() => { setStatusFilter(""); setSortBy("publishedAt_desc"); }}
                className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 transition-colors text-left"
              >
                Reset filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm transition-colors">
          <table className="w-full min-w-[640px] text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
                <SortableTh col="title" className="w-[38%]">Artikel</SortableTh>
                <SortableTh col="category">Rubrik</SortableTh>
                <SortableTh col="author" className="hidden lg:table-cell">Penulis</SortableTh>
                <SortableTh col="status">Status</SortableTh>
                <SortableTh col="viewCount" className="text-center hidden sm:table-cell">Views</SortableTh>
                <SortableTh col="publishedAt">Tanggal</SortableTh>
                <th className="py-3.5 px-4 text-right text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {articles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sm text-zinc-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-700" />
                    <p className="font-medium">Belum ada artikel</p>
                    <p className="text-xs text-zinc-400 mt-1">Klik "Artikel Baru" untuk membuat artikel pertama</p>
                  </td>
                </tr>
              ) : (
                articles.map((article) => (
                  <tr key={article.id} className="text-xs hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">

                    {/* Artikel */}
                    <td className="py-3.5 px-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          {article.isBreaking && <Flame className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                          {article.isFeatured && <Star className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate block">
                            {article.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[10px] text-zinc-400 font-mono truncate max-w-[160px]">
                            /{article.slug}
                          </span>
                          {article.tags.slice(0, 2).map((tag) => (
                            <span key={tag.id} className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                              #{tag.name}
                            </span>
                          ))}
                          {article.tags.length > 2 && (
                            <span className="text-[9px] text-zinc-400">+{article.tags.length - 2}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Rubrik */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 whitespace-nowrap">
                        {article.category.name}
                      </span>
                    </td>

                    {/* Penulis — hidden on small screens */}
                    <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400 whitespace-nowrap hidden lg:table-cell">
                      {article.author.name}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">{statusBadge(article.status)}</td>

                    {/* Views — hidden on mobile */}
                    <td className="py-3.5 px-4 text-center font-bold text-zinc-700 dark:text-zinc-300 hidden sm:table-cell">
                      {article.viewCount.toLocaleString("id-ID")}
                    </td>

                    {/* Tanggal */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-zinc-600 dark:text-zinc-300 font-medium">
                          {article.publishedAt
                            ? formatDate(article.publishedAt)
                            : <span className="text-zinc-400 italic text-[10px]">Belum terbit</span>}
                        </span>
                        {article.updatedAt && (
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 shrink-0" />
                            {formatDate(article.updatedAt)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {article.status === "PENDING" && (role === "ADMIN" || role === "EDITOR") && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(article.id, "PUBLISHED")}
                              className="p-1.5 rounded border border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
                              title="Setujui & Terbitkan"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(article.id, "DRAFT")}
                              className="p-1.5 rounded border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                              title="Tolak & Jadikan Draft"
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
                          onClick={() => { setDeleteId(article.id); setIsDeleteOpen(true); }}
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
          <span className="hidden sm:block">
            Menampilkan {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} artikel
          </span>
          <span className="sm:hidden text-zinc-400">
            Hal. {pagination.page} / {pagination.totalPages}
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
              if (pagination.totalPages <= 5) pageNum = i + 1;
              else if (pagination.page <= 3) pageNum = i + 1;
              else if (pagination.page >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;
              else pageNum = pagination.page - 2 + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => fetchArticles(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer ${pageNum === pagination.page
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

      {/* Delete Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 mb-3">
              <Trash2 className="w-5 h-5 text-red-500" />
              Pindahkan ke Sampah?
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
              Artikel akan dipindahkan ke folder sampah. Anda dapat memulihkannya kembali dari halaman Sampah.
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