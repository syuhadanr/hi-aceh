"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Image as ImageIcon,
  UploadCloud,
  Copy,
  Trash2,
  Calendar,
  User,
  HardDrive,
  Check,
  X,
  Maximize2,
  Loader2,
} from "lucide-react";

interface MediaFile {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: string;
  uploadedBy: {
    name: string;
  };
}

export default function MediaPage() {
  const [mediaList, setMediaList] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preview & delete states
  const [previewMedia, setPreviewMedia] = useState<MediaFile | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/media");
      if (res.ok) {
        const data = await res.json();
        setMediaList(data);
      }
    } catch (e) {
      console.error(e);
      setError("Gagal memuat pustaka media.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleUploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleUploadFiles(e.target.files);
    }
  };

  const handleUploadFiles = async (files: FileList) => {
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    // Support single file upload for now
    formData.append("file", files[0]);

    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal mengunggah berkas.");
      } else {
        // Refresh list
        fetchMedia();
      }
    } catch (err) {
      setError("Kesalahan jaringan saat mengunggah.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setActionLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/media?id=${deleteId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal menghapus media.");
      } else {
        setDeleteId(null);
        fetchMedia();
      }
    } catch (err) {
      setError("Kesalahan jaringan.");
    } finally {
      setActionLoading(false);
    }
  };

  const copyUrlToClipboard = (file: MediaFile) => {
    const fullUrl = `${window.location.origin}${file.url}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedId(file.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Pustaka Media
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Kelola berkas gambar dan lampiran artikel portal Hi Aceh
          </p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2 rounded-lg bg-teal-605 hover:bg-teal-500 bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UploadCloud className="w-4 h-4" />
          )}
          Unggah Foto
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* Alert */}
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3.5 text-xs text-red-800 dark:text-red-400 border border-red-200 dark:border-red-900/50">
          {error}
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full py-10 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 ${
          dragActive
            ? "border-teal-500 bg-teal-500/5"
            : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
        }`}
      >
        <UploadCloud className={`w-8 h-8 ${dragActive ? "text-teal-500" : "text-zinc-400"}`} />
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          Tarik &amp; lepas file di sini, atau klik untuk memilih file
        </span>
        <span className="text-[10px] text-zinc-400">
          Mendukung format gambar (PNG, JPG, JPEG, WEBP) hingga 5MB
        </span>
      </div>

      {/* Grid List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
        </div>
      ) : mediaList.length === 0 ? (
        <div className="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 py-16 text-center text-sm text-zinc-500">
          <ImageIcon className="w-8 h-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-700" />
          <p className="font-semibold">Pustaka media masih kosong</p>
          <p className="text-xs text-zinc-400 mt-1">
            Mulai unggah foto unggulan pertama Anda
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {mediaList.map((file) => (
            <div
              key={file.id}
              className="group relative border border-zinc-250 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 overflow-hidden shadow-sm flex flex-col justify-between hover:border-zinc-350 dark:hover:border-zinc-700 transition-all duration-200"
            >
              {/* Media Thumb */}
              <div className="relative aspect-square w-full bg-zinc-50 dark:bg-zinc-900 overflow-hidden flex items-center justify-center">
                <img
                  src={file.url}
                  alt={file.filename}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
                {/* Overlay hover tools */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPreviewMedia(file)}
                    className="p-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-700 text-zinc-250 hover:text-white transition-all cursor-pointer"
                    title="Lihat Penuh"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => copyUrlToClipboard(file)}
                    className="p-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-700 text-zinc-250 hover:text-white transition-all cursor-pointer"
                    title="Salin Link"
                  >
                    {copiedId === file.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => setDeleteId(file.id)}
                    className="p-2 rounded-lg bg-red-600/80 hover:bg-red-650 border border-red-500 text-white transition-all cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Details footer */}
              <div className="p-3 space-y-1 bg-zinc-50/50 dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900/50">
                <p className="text-[11px] font-bold text-zinc-700 dark:text-zinc-200 truncate" title={file.filename}>
                  {file.filename}
                </p>
                <div className="flex items-center justify-between text-[9px] text-zinc-450 dark:text-zinc-500 font-medium">
                  <div className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3" />
                    {formatBytes(file.size)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(file.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[9px] text-zinc-400 mt-1 italic">
                  <User className="w-2.5 h-2.5" />
                  <span>Oleh: {file.uploadedBy?.name || "Redaksi"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl relative border border-zinc-800 flex flex-col">
            <button
              onClick={() => setPreviewMedia(null)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex-1 flex items-center justify-center bg-zinc-900 p-8 max-h-[70vh]">
              <img
                src={previewMedia.url}
                alt={previewMedia.filename}
                className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>
            <div className="p-5 border-t border-zinc-900 bg-zinc-950 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white truncate">{previewMedia.filename}</h3>
                <p className="text-xs text-zinc-450 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                  <span>Ukuran: {formatBytes(previewMedia.size)}</span>
                  <span>Tipe: {previewMedia.mimeType}</span>
                  <span>Tanggal: {formatDate(previewMedia.createdAt)}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyUrlToClipboard(previewMedia)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Salin Link URL
                </button>
                <button
                  onClick={() => {
                    setDeleteId(previewMedia.id);
                    setPreviewMedia(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-500 text-white shadow transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 mb-3">
              <Trash2 className="w-5 h-5 text-red-500" />
              Hapus File Media?
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus file ini? File yang digunakan sebagai gambar utama artikel tidak dapat dihapus.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-900">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
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
