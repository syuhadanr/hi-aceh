"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/Toast";
import {
  Save,
  Send,
  ArrowLeft,
  Flame,
  Star,
  Clock,
  Eye,
  Video,
  Camera,
  X,
} from "lucide-react";

// Dynamic import for the rich text editor (TipTap needs browser APIs)
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

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  parent?: { id: string; name: string } | null;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface ArticleFormProps {
  articleId?: string;
}

export default function ArticleForm({ articleId }: ArticleFormProps) {
  const router = useRouter();
  const isEditing = !!articleId;

  const { data: session } = useSession();
  const role = session?.user?.role || "PENULIS";
  const isPenulis = role === "PENULIS";

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  // CHANGED: removed "TEKS", default is now "FOTO"
  const [type, setType] = useState<"FOTO" | "VIDEO">("FOTO");
  const [videoUrl, setVideoUrl] = useState("");
  const [status, setStatus] = useState<
    "DRAFT" | "PENDING" | "PUBLISHED" | "SCHEDULED"
  >("DRAFT");
  const [isBreaking, setIsBreaking] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [publishedAt, setPublishedAt] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // Custom Author, Editor, Sumber, Tags state
  const [users, setUsers] = useState<{ id: string; name: string; role: string }[]>([]);
  const [authorId, setAuthorId] = useState("");
  const [editorId, setEditorId] = useState("");
  const [sumberName, setSumberName] = useState("");
  const [sumberUrl, setSumberUrl] = useState("");
  const [tagInput, setTagInput] = useState("");

  // Lookups
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // UI state
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [tagSearch, setTagSearch] = useState("");

  // Photo carousel & Media selector state
  const [photos, setPhotos] = useState<{ url: string; caption: string }[]>([]);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaLibrary, setMediaLibrary] = useState<any[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchMediaLibrary = async () => {
    setIsLoadingMedia(true);
    try {
      const res = await fetch("/api/admin/media", { credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        setMediaLibrary(data);
      }
    } catch (e) {
      console.error("Gagal memuat pustaka media", e);
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploadingPhoto(true);
      const formData = new FormData();
      formData.append("file", e.target.files[0]);

      try {
        const res = await fetch("/api/admin/media", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (res.ok) {
          setPhotos((prev) => [...prev, { url: data.url, caption: "" }]);
        } else {
          showToast(data.error || "Gagal mengunggah gambar.", "error");
        }
      } catch (err) {
        showToast("Gagal menghubungi server untuk mengunggah gambar.", "error");
      } finally {
        setIsUploadingPhoto(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  // Slug preview
  const generatedSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  // Load categories, tags, and article data
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      try {
        const requests: Promise<Response>[] = [
          fetch("/api/admin/categories"),
          fetch("/api/admin/tags"),
        ];

        if (articleId) {
          requests.push(fetch(`/api/admin/articles/${articleId}`));
        }

        const results = await Promise.all(requests);
        const [catRes, tagRes, artRes] = results;

        if (catRes.ok) setCategories(await catRes.json());
        if (tagRes.ok) setTags(await tagRes.json());

        if (artRes && artRes.ok) {
          const article = await artRes.json();
          setTitle(article.title);

          if (article.type === "FOTO") {
            try {
              const parsed = JSON.parse(article.content);
              if (parsed && typeof parsed === "object" && "carousel" in parsed) {
                setPhotos(parsed.carousel || []);
                setContent(parsed.body || "");
              } else {
                setContent(article.content || "");
              }
            } catch (e) {
              setContent(article.content || "");
            }
          } else {
            setContent(article.content || "");
          }

          setExcerpt(article.excerpt || "");
          // CHANGED: fallback to "FOTO" instead of "TEKS"
          setType(article.type === "VIDEO" ? "VIDEO" : "FOTO");
          setVideoUrl(article.videoUrl || "");
          setStatus(article.status || "DRAFT");
          setIsBreaking(article.isBreaking || false);
          setIsFeatured(article.isFeatured || false);
          setCategoryId(article.categoryId || "");
          setSelectedTagIds(article.tags?.map((t: any) => t.id) || []);
          setAuthorId(article.authorId || "");
          setEditorId(article.editorId || "");
          setSumberName(article.sumberName || "");
          setSumberUrl(article.sumberUrl || "");
          setTagInput(article.tags?.map((t: any) => t.name).join(", ") || "");
          if (article.publishedAt) {
            setPublishedAt(
              new Date(article.publishedAt).toISOString().slice(0, 16)
            );
          }
        } else if (artRes && !artRes.ok) {
          showToast("Gagal memuat artikel untuk diedit.", "error");
        }
      } catch (e) {
        console.error(e);
        showToast("Gagal memuat data. Coba muat ulang halaman.", "error");
      } finally {
        setIsLoadingData(false);
      }
    };
    loadData();
  }, [articleId]);

  // Load users list if ADMIN/EDITOR
  useEffect(() => {
    if (role === "ADMIN" || role === "EDITOR") {
      fetch("/api/admin/users")
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setUsers(data))
        .catch((e) => console.error("Error loading users:", e));
    }
  }, [role]);

  // Set default authorId for new articles
  useEffect(() => {
    if (!isEditing && session?.user?.id && !authorId) {
      setAuthorId(session.user.id);
    }
  }, [session, isEditing, authorId]);

  const handleSave = async (saveStatus?: string, publishedAtOverride?: string | null) => {
    setIsSaving(true);

    const finalStatus =
      isPenulis && saveStatus === "PUBLISHED" ? "PENDING" : saveStatus || status;

    // Use override if provided, otherwise use state value
    const publishedAtToUse = publishedAtOverride !== undefined ? publishedAtOverride : publishedAt;

    const payload = {
      id: articleId,
      title,
      content: type === "FOTO" ? JSON.stringify({ carousel: photos, body: content }) : content,
      excerpt: excerpt || null,
      type,
      videoUrl: type === "VIDEO" ? videoUrl : null,
      status: finalStatus,
      isBreaking,
      isFeatured,
      publishedAt:
        finalStatus === "SCHEDULED" && publishedAtToUse ? publishedAtToUse : null,
      categoryId,
      featuredImageId: null,
      tagNames: tagInput.split(",").map((t) => t.trim()).filter(Boolean),
      authorId: role === "ADMIN" || role === "EDITOR" ? authorId : session?.user?.id,
      editorId: role === "ADMIN" || role === "EDITOR" ? (editorId || null) : null,
      sumberName: sumberName || null,
      sumberUrl: sumberUrl || null,
    };

    try {
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch("/api/admin/articles", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Terjadi kesalahan saat menyimpan.", "error");
      } else {
        showToast(
          finalStatus === "PENDING"
            ? "Artikel dikirim ke editor/admin untuk persetujuan sebelum terbit."
            : finalStatus === "PUBLISHED"
            ? "Artikel berhasil dipublikasikan!"
            : "Artikel berhasil disimpan sebagai draft.",
          "success"
        );
        if (!isEditing) {
          setTimeout(() => {
            router.push(`/admin/articles/${data.id}/edit`);
          }, 1200);
        }
      }
    } catch (e) {
      showToast("Kesalahan jaringan. Coba lagi.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishClick = () => {
    if (isPenulis) {
      showToast(
        "Artikel Penulis tidak langsung terbit. Artikel ini akan masuk tab Menunggu untuk disetujui Admin/Editor.",
        "info"
      );
    }
    // If a scheduled date is set, save as SCHEDULED; otherwise save as PUBLISHED
    const statusToSave = publishedAt ? "SCHEDULED" : "PUBLISHED";
    handleSave(statusToSave);
  };

  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(tagSearch.toLowerCase())
  );

  // Reusable type selector buttons (used in both mobile inline + desktop sidebar)
  const TypeSelector = () => (
    <div className="grid grid-cols-2 gap-2">
      {(
        [
          { value: "FOTO", icon: Camera, label: "Foto" },
          { value: "VIDEO", icon: Video, label: "Video" },
        ] as const
      ).map((t) => (
        <button
          key={t.value}
          onClick={() => setType(t.value)}
          className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
            type === t.value
              ? "border-teal-500/30 bg-teal-500/5 text-teal-600 dark:text-teal-400"
              : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          }`}
        >
          <t.icon className="w-4 h-4" />
          {t.label}
        </button>
      ))}
    </div>
  );

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">

      {/* Top Bar — desktop: title left + buttons right; mobile: title row then buttons row below */}
      <div>
        {/* Desktop layout: single row with title left, buttons right */}
        <div className="hidden lg:flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/articles")}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {isEditing ? "Edit Artikel" : "Artikel Baru"}
              </h2>
              {generatedSlug && (
                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                  /{generatedSlug}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSave("DRAFT")}
              disabled={isSaving || !title || !categoryId}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Simpan Draft
            </button>
            <button
              onClick={handlePublishClick}
              disabled={isSaving || !title || !content || !categoryId}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white shadow-sm transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {isSaving ? "Menyimpan..." : publishedAt ? (isPenulis ? "Ajukan Publikasi" : "Jadwalkan") : (isPenulis ? "Ajukan Publikasi" : "Publikasikan")}
            </button>
          </div>
        </div>

        {/* Mobile layout: title row, then full-width buttons below */}
        <div className="lg:hidden space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/articles")}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 transition-colors cursor-pointer flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
                {isEditing ? "Edit Artikel" : "Artikel Baru"}
              </h2>
              {generatedSlug && (
                <p className="text-[10px] text-zinc-400 font-mono mt-0.5 truncate">
                  /{generatedSlug}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSave("DRAFT")}
              disabled={isSaving || !title || !categoryId}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Simpan Draft
            </button>
            <button
              onClick={handlePublishClick}
              disabled={isSaving || !title || !content || !categoryId}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white shadow-sm transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              {isSaving ? "Menyimpan..." : publishedAt ? (isPenulis ? "Ajukan Publikasi" : "Jadwalkan") : (isPenulis ? "Ajukan Publikasi" : "Publikasikan")}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

        {/* Left Column - Main Content */}
        <div className="space-y-5">

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              Judul Artikel
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ketik judul berita yang menarik..."
              className="w-full text-lg font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
            />
          </div>

          {/* MOBILE ONLY: Article Type selector — shown inline after title on small screens */}
          <div className="lg:hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-sm">
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
              Tipe Artikel
            </label>
            <TypeSelector />
          </div>

          {/* Video URL */}
          {type === "VIDEO" && (
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                URL Video YouTube
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
              />
            </div>
          )}

          {/* Photo Gallery/Carousel Manager */}
          {type === "FOTO" && (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Galeri Foto Carousel
                  </label>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    Kelola foto slide untuk artikel ini.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      fetchMediaLibrary();
                      setIsMediaModalOpen(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-650 dark:text-zinc-350 transition-colors cursor-pointer"
                  >
                    + Pustaka Media
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isUploadingPhoto ? "Mengunggah..." : "+ Unggah Foto"}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleUploadPhoto}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              {photos.length === 0 ? (
                <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg p-6 text-center text-xs text-zinc-400">
                  Belum ada foto terpilih untuk carousel. Klik tombol di atas untuk menambahkan.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {photos.map((photo, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40"
                    >
                      <div className="relative w-16 h-16 rounded-md overflow-hidden bg-black flex-shrink-0">
                        <img
                          src={photo.url}
                          alt={`Slide ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                        <span className="absolute bottom-1 left-1 bg-black/60 text-white font-mono text-[9px] px-1 rounded">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <input
                          type="text"
                          placeholder="Teks caption..."
                          value={photo.caption}
                          onChange={(e) => {
                            const newPhotos = [...photos];
                            newPhotos[index].caption = e.target.value;
                            setPhotos(newPhotos);
                          }}
                          className="w-full text-[10px] rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2 py-1 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors placeholder:text-zinc-400"
                        />
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => {
                              const newPhotos = [...photos];
                              const temp = newPhotos[index];
                              newPhotos[index] = newPhotos[index - 1];
                              newPhotos[index - 1] = temp;
                              setPhotos(newPhotos);
                            }}
                            className="p-0.5 rounded text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 disabled:opacity-30 cursor-pointer text-xs"
                          >
                            ←
                          </button>
                          <button
                            type="button"
                            disabled={index === photos.length - 1}
                            onClick={() => {
                              const newPhotos = [...photos];
                              const temp = newPhotos[index];
                              newPhotos[index] = newPhotos[index + 1];
                              newPhotos[index + 1] = temp;
                              setPhotos(newPhotos);
                            }}
                            className="p-0.5 rounded text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 disabled:opacity-30 cursor-pointer text-xs"
                          >
                            →
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPhotos(photos.filter((_, i) => i !== index));
                            }}
                            className="p-0.5 rounded text-red-500 hover:bg-red-500/10 cursor-pointer text-[10px] ml-1 font-semibold"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Excerpt */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              Ringkasan (Opsional)
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Tulis ringkasan singkat artikel untuk tampilan preview di beranda..."
              rows={3}
              className="w-full text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
            />
          </div>

          {/* Rich Text Editor */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
              Konten Artikel
            </label>
            <RichTextEditor content={content} onChange={setContent} />
          </div>

        </div>

        {/* Right Column - Sidebar Settings */}
        <div className="space-y-5">

          {/* Schedule */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 inline mr-1" />
                Jadwal Tayang
              </label>
              {!publishedAt && (
                <span className="text-[9px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 px-1.5 py-0.5 rounded border border-teal-500/20">
                  Sekarang (Otomatis)
                </span>
              )}
            </div>
            <input
              type="datetime-local"
              value={publishedAt}
              onChange={(e) => {
                setPublishedAt(e.target.value);
                if (e.target.value) {
                  setStatus("SCHEDULED");
                }
              }}
              className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
            />
            {publishedAt ? (
              <button
                type="button"
                onClick={() => {
                  // Cancel the scheduled date and reset to DRAFT
                  setPublishedAt("");
                  setStatus("DRAFT");
                }}
                className="mt-2 w-full px-2 py-1.5 text-[9px] font-semibold text-red-650 hover:text-red-700 dark:text-red-400 dark:hover:text-red-305 border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <X className="w-3 h-3" />
                Batal Jadwal (Terbit Sekarang)
              </button>
            ) : (
              <p className="text-[10px] text-zinc-450 dark:text-zinc-550 mt-1.5">
                {isPenulis
                  ? "Artikel akan masuk persetujuan Admin/Editor saat tombol Ajukan Publikasi ditekan."
                  : "Biarkan kosong agar terbit secara instan saat tombol Publikasikan ditekan."}
              </p>
            )}
          </div>

          {/* DESKTOP ONLY: Article Type selector */}
          <div className="hidden lg:block rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-sm">
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
              Tipe Artikel
            </label>
            <TypeSelector />
          </div>

          {/* Category */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-sm">
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2.5">
              Rubrik / Kategori *
            </label>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 max-h-48 overflow-y-auto">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-center gap-2 cursor-pointer text-xs text-zinc-700 dark:text-zinc-300 hover:text-teal-655 dark:hover:text-teal-400 transition-colors"
                >
                  <input
                    type="radio"
                    name="category"
                    value={cat.id}
                    checked={categoryId === cat.id}
                    onChange={() => setCategoryId(cat.id)}
                    className="rounded-full text-teal-600 focus:ring-teal-500 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Penulis Berita */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-sm">
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Penulis Berita *
            </label>
            {role === "ADMIN" || role === "EDITOR" ? (
              <select
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                required
                className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
              >
                <option value="">-- Pilih Penulis --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-xs font-semibold px-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-350">
                {session?.user?.name || "Nama Penulis"}
              </div>
            )}
          </div>

          {/* Editor Berita (Admin / Editor Only) */}
          {(role === "ADMIN" || role === "EDITOR") && (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-sm">
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                Editor Berita
              </label>
              <select
                value={editorId}
                onChange={(e) => setEditorId(e.target.value)}
                className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
              >
                <option value="">-- Pilih Editor (Opsional) --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sumber Berita */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-sm space-y-3">
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Sumber Berita
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-zinc-400 dark:text-zinc-500 mb-1">Nama Sumber</label>
                <input
                  type="text"
                  value={sumberName}
                  onChange={(e) => setSumberName(e.target.value)}
                  placeholder="Nama/Teks"
                  className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:border-teal-500 placeholder:text-zinc-400 dark:placeholder:text-zinc-650"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 dark:text-zinc-500 mb-1">Link Tautan</label>
                <input
                  type="url"
                  value={sumberUrl}
                  onChange={(e) => setSumberUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:border-teal-500 placeholder:text-zinc-400 dark:placeholder:text-zinc-650"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-sm">
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Penanda (Tag)
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Aceh, Berita, Tsunami"
              className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-650"
            />
            <p className="text-[9px] text-zinc-450 dark:text-zinc-500 leading-normal mt-1.5">
              Minimal 3 kata, kata kunci tulisan, dipisahkan dengan koma dan tanpa karakter #.
            </p>
          </div>

          {/* Flags */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-sm space-y-3">
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
              Label Artikel
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => setIsBreaking(!isBreaking)}
                className={`relative w-9 h-5 rounded-full transition-colors ${isBreaking ? "bg-red-500" : "bg-zinc-300 dark:bg-zinc-700"}`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isBreaking ? "translate-x-4" : ""}`}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-red-500" />
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Breaking News
                </span>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => setIsFeatured(!isFeatured)}
                className={`relative w-9 h-5 rounded-full transition-colors ${isFeatured ? "bg-amber-500" : "bg-zinc-300 dark:bg-zinc-700"}`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isFeatured ? "translate-x-4" : ""}`}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Artikel Unggulan
                </span>
              </div>
            </label>
          </div>

          {/* Preview Link (when editing) */}
          {/* {isEditing && (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-sm">
              <a
               href={`/article/${generatedSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-650 dark:text-zinc-300 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Preview Artikel di Frontend
              </a>
            </div>
          )} */}
        </div>
      </div>

      {/* Media Library Selector Modal */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-150 dark:border-zinc-900">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                Pilih Foto dari Pustaka Media
              </h3>
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {isLoadingMedia ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500" />
                </div>
              ) : mediaLibrary.length === 0 ? (
                <div className="text-center py-12 text-zinc-400 text-xs">
                  Tidak ada foto di pustaka media. Silakan unggah foto baru.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {mediaLibrary.map((item) => {
                    const isSelected = photos.some((p) => p.url === item.url);
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (isSelected) {
                            setPhotos((prev) => prev.filter((p) => p.url !== item.url));
                          } else {
                            setPhotos((prev) => [...prev, { url: item.url, caption: "" }]);
                          }
                        }}
                        className={`group relative aspect-square rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-900 cursor-pointer border-2 transition-all ${
                          isSelected
                            ? "border-teal-500 ring-2 ring-teal-500/20"
                            : "border-transparent hover:border-zinc-350 dark:hover:border-zinc-700"
                        }`}
                      >
                        <img
                          src={item.url}
                          alt={item.filename}
                          className="object-cover w-full h-full"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-teal-500/10 flex items-center justify-center">
                            <span className="bg-teal-600 text-white rounded-full p-1 text-[10px] font-bold">
                              ✓
                            </span>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-[8px] text-white truncate opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.filename}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-150 dark:border-zinc-900">
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 text-white shadow-sm transition-colors cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
