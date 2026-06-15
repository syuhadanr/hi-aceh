"use client";

import React, { useState, useEffect } from "react";
import { Users, Plus, Pencil, Trash2, X, AlertTriangle, Key } from "lucide-react";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR" | "PENULIS";
  createdAt: string;
}

interface UserManagementClientProps {
  currentUserId: string;
}

export default function UserManagementClient({ currentUserId }: UserManagementClientProps) {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "EDITOR" | "PENULIS">("PENULIS");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
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
    setEmail("");
    setPassword("");
    setRole("PENULIS");
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: UserItem) => {
    setEditId(user.id);
    setName(user.name);
    setEmail(user.email);
    setPassword("");
    setRole(user.role);
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

    const payload = editId
      ? { id: editId, name, role, password } // Edit name, role, optional pass reset
      : { name, email, password, role }; // Create requires email & password

    try {
      const method = editId ? "PUT" : "POST";
      const res = await fetch("/api/admin/users", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Terjadi kesalahan.");
      } else {
        setIsModalOpen(false);
        fetchUsers();
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
      const res = await fetch(`/api/admin/users?id=${deleteId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal menghapus pengguna.");
      } else {
        setIsDeleteOpen(false);
        fetchUsers();
      }
    } catch (err) {
      setError("Kesalahan jaringan.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Daftar Pengguna</h2>
          <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-1">
            Kelola redaksi, editor, dan tim penulis internal Hi Aceh
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 rounded-lg bg-teal-605 hover:bg-teal-500 bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tambah Pengguna
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
                <th className="py-3.5 px-4">Nama Lengkap</th>
                <th className="py-3.5 px-4">Alamat Email</th>
                <th className="py-3.5 px-4">Hak Akses (Role)</th>
                <th className="py-3.5 px-4">Tanggal Ditambahkan</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {users.map((user) => (
                <tr key={user.id} className="text-xs hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                  <td className="py-4 px-4 font-semibold text-zinc-800 dark:text-zinc-200">
                    {user.name}
                    {user.id === currentUserId && (
                      <span className="ml-2 text-[9px] font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 border border-teal-500/20 px-1.5 py-0.5 rounded uppercase">Saya</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-zinc-550 dark:text-zinc-400 font-medium">{user.email}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase ${
                      user.role === "ADMIN"
                        ? "border-teal-500/30 text-teal-600 dark:text-teal-400 bg-teal-500/5"
                        : user.role === "EDITOR"
                        ? "border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500/5"
                        : "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-zinc-500">
                    {new Date(user.createdAt).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="p-1 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                        title="Edit Pengguna"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(user.id)}
                        disabled={user.id === currentUserId}
                        className="p-1 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/20 text-zinc-500 dark:text-zinc-450 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        title={user.id === currentUserId ? "Tidak dapat menghapus diri sendiri" : "Hapus Pengguna"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add-Edit User Form Modal */}
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
              <Users className="w-5 h-5 text-teal-500" />
              {editId ? "Edit Akun Pengguna" : "Tambah Pengguna Baru"}
            </h3>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-950/30 p-3.5 text-xs text-red-800 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Siti Aisyah"
                  className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-805 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Alamat Email
                </label>
                <input
                  type="email"
                  required
                  disabled={!!editId}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aisyah@hiaceh.com"
                  className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-805 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:opacity-50 disabled:bg-zinc-100 dark:disabled:bg-zinc-900 transition-colors font-medium border-zinc-200 dark:border-zinc-800"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    {editId ? "Reset Kata Sandi (Opsional)" : "Kata Sandi"}
                  </label>
                  {editId && (
                    <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-medium select-none">
                      <Key className="w-3 h-3 text-amber-500" /> Biarkan kosong jika tidak diubah
                    </span>
                  )}
                </div>
                <input
                  type="password"
                  required={!editId}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editId ? "••••••••" : "Kata sandi akun baru..."}
                  className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-805 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Peran Redaksi (Role)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-805 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
                >
                  <option value="PENULIS">PENULIS — Tulis artikel (Perlu Persetujuan Terbit)</option>
                  <option value="EDITOR">EDITOR — Tulis &amp; Moderasi Persetujuan Terbit</option>
                  <option value="ADMIN">ADMIN — Akses Penuh, Manajemen User &amp; Sistem</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-900">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-zinc-250 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-650 dark:text-zinc-300 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white shadow-sm transition-colors cursor-pointer"
                >
                  {actionLoading ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Buat Pengguna"}
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
              Hapus Akun Pengguna?
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus akun pengguna ini? Pengguna yang sudah menulis artikel terpublikasi tidak dapat dihapus demi integritas relasi database.
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
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-805 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-650 dark:text-zinc-300 transition-colors cursor-pointer border-zinc-200 dark:border-zinc-800"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-650 hover:bg-red-500 disabled:opacity-50 text-white shadow-sm transition-all cursor-pointer bg-red-600"
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
