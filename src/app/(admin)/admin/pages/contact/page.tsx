"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

const RichTextEditor = dynamic(
  () => import("src/components/admin/rich-text-editor"),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500" />
      </div>
    ),
  }
);

export default function EditContactPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const role = session?.user?.role || "PENULIS";
  const isAuthorized = role === "ADMIN" || role === "EDITOR";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [catatanRedaksi, setCatatanRedaksi] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!isAuthorized) {
      router.push("/admin/dashboard");
      return;
    }

    const fetchPageData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/admin/pages");
        if (res.ok) {
          const data = await res.json();
          if (data.contact) {
            setTitle(data.contact.title || "Hubungi Kami");
            setDescription(data.contact.description || "");
            setCatatanRedaksi(data.contact.catatan_redaksi || "");
          } else {
            setTitle("Hubungi Kami");
            setDescription("");
            setCatatanRedaksi("");
          }
        }
      } catch (e) {
        console.error(e);
        showToast("Gagal memuat halaman kontak.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageData();
  }, [isAuthorized, router, showToast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized) return;

    setIsSaving(true);

    try {
      const res = await fetch("/api/admin/pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: "contact",
          title,
          description,
          catatan_redaksi: catatanRedaksi,
        }),
      });

      if (res.ok) {
        showToast("Halaman kontak berhasil disimpan!", "success");
      } else {
        const data = await res.json();
        showToast(data.error || "Gagal menyimpan halaman kontak.", "error");
      }
    } catch (err) {
      showToast("Kesalahan jaringan.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Edit Halaman: Hubungi Kami
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Dashboard &gt; Halaman &gt; Hubungi Kami
            </p>
          </div>
        </div>
      </div>

      {/* Editor Form */}
      <form onSubmit={handleSave} className="space-y-6 text-left">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
            Ubah Halaman Hubungi Kami
          </h3>

          {/* Field 1: Judul Halaman */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-450 uppercase tracking-wider mb-2">
              Judul Halaman *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Hubungi Kami"
              disabled={!isAuthorized}
              className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors disabled:opacity-50"
            />
          </div>

          {/* Field 2: Deskripsi */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-450 uppercase tracking-wider mb-2">
              Deskripsi (Bawah Judul)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat tentang halaman kontak..."
              disabled={!isAuthorized}
              rows={3}
              className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-2.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors disabled:opacity-50"
            />
          </div>

          {/* Field 3: Catatan Redaksi */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-450 uppercase tracking-wider mb-2">
              Catatan Redaksi
            </label>
            <RichTextEditor content={catatanRedaksi} onChange={setCatatanRedaksi} />
          </div>
        </div>

        {/* Action Button */}
        {isAuthorized && (
          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={isSaving || !title}
              className="flex items-center gap-2 rounded-lg bg-teal-600 hover:bg-teal-500 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? "Menyimpan..." : "Simpan Halaman"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
