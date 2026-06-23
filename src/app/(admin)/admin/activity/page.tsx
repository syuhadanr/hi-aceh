"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Activity,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  User,
  Filter,
} from "lucide-react";

interface LogEntry {
  id: string;
  action: string;
  description: string;
  entityType: string | null;
  entityId: string | null;
  ipAddress: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface UserOption {
  id: string;
  name: string;
  role: string;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  CREATE_ARTICLE: { label: "Buat Artikel", color: "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/5" },
  UPDATE_ARTICLE: { label: "Edit Artikel", color: "border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/5" },
  DELETE_ARTICLE: { label: "Hapus Artikel", color: "border-red-500/30 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/5" },
  PUBLISH_ARTICLE: { label: "Terbitkan", color: "border-teal-500/30 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/5" },
  RESTORE_ARTICLE: { label: "Pulihkan", color: "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/5" },
  CREATE_USER: { label: "Buat Pengguna", color: "border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/5" },
  UPDATE_USER: { label: "Edit Pengguna", color: "border-violet-500/30 text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/5" },
  DELETE_USER: { label: "Hapus Pengguna", color: "border-red-500/30 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/5" },
  LOGIN: { label: "Login", color: "border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/40" },
  LOGOUT: { label: "Logout", color: "border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/40" },
  UPLOAD_MEDIA: { label: "Upload Media", color: "border-pink-500/30 text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-500/5" },
  DELETE_MEDIA: { label: "Hapus Media", color: "border-red-500/30 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/5" },
  UPDATE_SETTINGS: { label: "Ubah Pengaturan", color: "border-orange-500/30 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/5" },
  UPDATE_PROFILE: { label: "Ubah Profil", color: "border-cyan-500/30 text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/5" },
  UPLOAD_AVATAR: { label: "Foto Profil", color: "border-fuchsia-500/30 text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-50 dark:bg-fuchsia-500/5" },
  SUBMIT_ARTICLE: { label: "Ajukan Artikel", color: "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/5" },
  REJECT_ARTICLE: { label: "Tolak Artikel", color: "border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/5" },
};

const ROLE_STYLE: Record<string, string> = {
  ADMIN: "border-teal-500/30 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/5",
  EDITOR: "border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/5",
  PENULIS: "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/5",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLogs = useCallback(
    async (p = page) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: p.toString(),
          limit: "25",
        });
        if (selectedUserId) params.set("userId", selectedUserId);

        const res = await fetch(`/api/admin/activity?${params}`);
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs);
          setTotalPages(data.pagination.totalPages);
          setTotal(data.pagination.total);
          setUsers(data.users || []);
        }
      } catch (e) {
        console.error(e);
        setLogs([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [page, selectedUserId]
  );

  useEffect(() => {
    fetchLogs(page);
  }, [page, selectedUserId]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchLogs(page);
  };

  // Filter by search client-side
  const filteredLogs = search
    ? logs.filter(
        (log) =>
          log.description.toLowerCase().includes(search.toLowerCase()) ||
          log.user.name.toLowerCase().includes(search.toLowerCase()) ||
          log.action.toLowerCase().includes(search.toLowerCase())
      )
    : logs;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Log Aktivitas
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">`r`n            Riwayat semua tindakan yang dilakukan di panel admin`r`n          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          Perbarui
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Log", value: total, color: "text-zinc-900 dark:text-zinc-50" },
          {
            label: "Hari Ini",
            value: logs.filter(
              (l) =>
                new Date(l.createdAt).toDateString() === new Date().toDateString()
            ).length,
            color: "text-teal-600 dark:text-teal-400",
          },
          {
            label: "Pengguna Aktif",
            value: new Set(logs.map((l) => l.user.id)).size,
            color: "text-indigo-600 dark:text-indigo-400",
          },
          {
            label: "Aksi Berbeda",
            value: new Set(logs.map((l) => l.action)).size,
            color: "text-amber-600 dark:text-amber-400",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm"
          >
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
              {stat.label}
            </p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan deskripsi, pengguna, atau aksi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors placeholder:text-zinc-400"
          />
        </div>
        {users.length > 0 && (
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <select
              value={selectedUserId}
              onChange={(e) => {
                setSelectedUserId(e.target.value);
                setPage(1);
              }}
              className="pl-8 pr-8 py-2.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors appearance-none"
            >
              <option value="">Semua Pengguna</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Log Table */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
            <Activity className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />
            <p className="text-sm font-medium text-zinc-500">Belum ada log aktivitas</p>
            <p className="text-xs text-zinc-400">
              Setiap tindakan admin akan dicatat di sini secara otomatis
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Aksi</th>
                  <th className="py-3 px-4">Deskripsi</th>
                  <th className="py-3 px-4">Pengguna</th>
                  <th className="py-3 px-4">IP</th>
                  <th className="py-3 px-4 text-right">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                {filteredLogs.map((log) => {
                  const actionInfo = ACTION_LABELS[log.action] || {
                    label: log.action,
                    color: "border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/40",
                  };

                  return (
                    <tr
                      key={log.id}
                      className="text-xs hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors"
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${actionInfo.color}`}
                        >
                          {actionInfo.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-md">
                          {log.description}
                        </p>
                        {log.entityType && (
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {log.entityType}
                            {log.entityId ? `: ${log.entityId.slice(0, 8)}...` : ""}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-500/10 text-teal-500 text-[9px] font-bold border border-teal-500/20 uppercase">
                            {log.user.name.substring(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-700 dark:text-zinc-300">
                              {log.user.name}
                            </p>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${ROLE_STYLE[log.user.role] || "border-zinc-300 dark:border-zinc-700 text-zinc-500"}`}
                            >
                              {log.user.role}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-zinc-400 dark:text-zinc-500 font-mono text-[10px]">
                        {log.ipAddress || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span
                          title={new Date(log.createdAt).toLocaleString("id-ID")}
                          className="text-zinc-500 dark:text-zinc-400"
                        >
                          {timeAgo(log.createdAt)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            Menampilkan {(page - 1) * 25 + 1}–{Math.min(page * 25, total)} dari{" "}
            {total} log
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            </button>
            <span className="text-xs text-zinc-500 px-2">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

