"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Camera, Save, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function ProfilePage() {
  const { data: session } = useSession();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
      setAvatarUrl((session.user as any).avatarUrl || "");
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/admin/profile");
      if (res.ok) {
        const data = await res.json();
        setName(data.name || "");
        setEmail(data.email || "");
        setBio(data.bio || "");
        setAvatarUrl(data.avatarUrl || "");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/profile/avatar", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setAvatarUrl(data.avatarUrl);
        showToast("Avatar berhasil diunggah", "success");
      } else {
        showToast(data.error || "Gagal mengunggah avatar", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Gagal mengunggah avatar", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Profil berhasil disimpan", "success");
      } else {
        showToast(data.error || "Gagal menyimpan profil", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Gagal menyimpan profil", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-6 sm:px-6">
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="relative w-32 h-32 rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-400 text-3xl font-bold">
                {session?.user?.name?.substring(0, 2).toUpperCase() || "US"}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Profil Saya</h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">
              Kelola informasi akun, bio, dan unggah foto profil.
            </p>
          </div>
        </div>

        <div className="grid gap-6 mt-6 sm:grid-cols-[220px_1fr]">
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Foto Profil
            </label>
            <label className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 cursor-pointer text-sm font-semibold text-teal-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Camera className="w-4 h-4" />
              {isUploading ? "Mengunggah..." : "Unggah Foto"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={isUploading}
              />
            </label>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Foto profil akan disimpan dalam format yang dapat diakses oleh sistem.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Email
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="mt-2 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Bio singkat
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="mt-2 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center justify-center rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 disabled:opacity-50 transition-colors"
              >
                {isSaving ? "Menyimpan..." : "Simpan Profil"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
