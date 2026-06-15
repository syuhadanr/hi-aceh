"use client";

import React, { useState, useEffect } from "react";
import { Layers, Plus, Pencil, Trash2, X, AlertTriangle } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  parent?: { id: string; name: string } | null;
  _count?: { articles: number };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (res.ok) {
        setCategories(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditId(null);
    setName("");
    setDescription("");
    setParentId("");
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditId(cat.id);
    setName(cat.name);
    setDescription(cat.description || "");
    setParentId(cat.parentId || "");
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (id: string) => {
    setDeleteId(id);
    setError(null);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);

    const payload = {
      id: editId,
      name,
      description,
      parentId: parentId || null,
    };

    try {
      const method = editId ? "PUT" : "POST";
      const res = await fetch("/api/admin/categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Terjadi kesalahan.");
      } else {
        setIsModalOpen(false);
        fetchCategories();
      }
    } catch (err) {
      setError("Kesalahan jaringan.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setActionLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/categories?id=${deleteId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal menghapus rubrik.");
      } else {
        setIsDeleteOpen(false);
        fetchCategories();
      }
    } catch (err) {
      setError("Kesalahan jaringan.");
    } finally {
      setActionLoading(false);
    }
  };

  const generatedSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Rubrik &amp; Kategori</h2>
          <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-1">
            Kelola segmentasi struktur rubrik berita portal Hi Aceh
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 rounded-lg bg-teal-605 hover:bg-teal-500 bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Rubrik Baru
        </button>
      </div>

      {/* Main Table View */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm transition-colors">
          <table className="w-full min-w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-wider bg-zinc-50 dark:bg-zinc-900/40">
                <th className="py-3.5 px-4">Nama Rubrik</th>
                <th className="py-3.5 px-4">Slug URL</th>
                <th className="py-3.5 px-4">Rubrik Induk (Parent)</th>
                <th className="py-3.5 px-4 text-center">Jumlah Artikel</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-zinc-500">
                    Belum ada rubrik terdaftar.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="text-xs hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                    <td className="py-4 px-4 font-semibold text-zinc-800 dark:text-zinc-200">
                      {cat.name}
                      {cat.description && (
                        <p className="text-[10px] text-zinc-400 font-normal mt-0.5">{cat.description}</p>
                      )}
                    </td>
                    <td className="py-4 px-4 text-zinc-500 font-mono">{cat.slug}</td>
                    <td className="py-4 px-4">
                      {cat.parent ? (
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 bg-indigo-500/5">
                          {cat.parent.name}
                        </span>
                      ) : (
                        <span className="text-zinc-450 dark:text-zinc-500 font-medium">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-zinc-700 dark:text-zinc-300">
                      {cat._count?.articles || 0}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                          title="Edit Rubrik"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(cat.id)}
                          className="p-1 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/20 text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                          title="Hapus Rubrik"
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

      {/* Modal for Add-Edit Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200 select-none">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-teal-500" />
              {editId ? "Edit Rubrik & Kategori" : "Buat Rubrik Baru"}
            </h3>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-950/30 p-3.5 text-xs text-red-800 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Nama Rubrik
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Aceh Besar"
                  className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Slug URL (Otomatis)
                </label>
                <input
                  type="text"
                  readOnly
                  value={generatedSlug}
                  placeholder="auto-generated-slug"
                  className="w-full text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 px-3 py-2.5 text-zinc-400 dark:text-zinc-500 focus:outline-none select-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Deskripsi (Opsional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Keterangan singkat rubrik..."
                  rows={3}
                  className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Rubrik Induk (Parent)
                </label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
                >
                  <option value="">-- Tanpa Induk (Kategori Utama) --</option>
                  {categories
                    .filter((cat) => cat.id !== editId && !cat.parentId) // Filter circular and allow only single level subcats
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-900">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white shadow-sm transition-colors cursor-pointer"
                >
                  {actionLoading ? "Menyimpan..." : "Simpan Rubrik"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Hapus Rubrik Kategori?
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus kategori rubrik ini? Kategori yang memiliki artikel aktif tidak dapat dihapus.
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
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white shadow-sm transition-all cursor-pointer"
              >
                {actionLoading ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
