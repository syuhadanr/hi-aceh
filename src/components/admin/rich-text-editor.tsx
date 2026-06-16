"use client";

import React, { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Video as YoutubeIcon,
  UploadCloud,
  Minus,
  Pilcrow,
  Unlink,
  Database,
  X,
  ChevronDown,
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Tulis konten artikel di sini...",
}: RichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image insert modal state
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageModalTab, setImageModalTab] = useState<"url" | "media" | "local">("url");
  const [imageUrlInput, setImageUrlInput] = useState("https://");
  const [mediaLibrary, setMediaLibrary] = useState<any[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

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

  const openImageModal = (tab: "url" | "media" | "local" = "url") => {
    setImageModalTab(tab);
    setImageUrlInput("https://");
    if (tab === "media") fetchMediaLibrary();
    setIsImageModalOpen(true);
  };

  const insertImageUrl = () => {
    if (imageUrlInput && imageUrlInput !== "https://") {
      editor?.chain().focus().setImage({ src: imageUrlInput }).run();
      setIsImageModalOpen(false);
    }
  };

  const insertMediaImage = (url: string) => {
    editor?.chain().focus().setImage({ src: url }).run();
    setIsImageModalOpen(false);
  };

  const uploadImageFile = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/media", {
        method: "POST",
        credentials: "same-origin",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Upload failed");
      editor?.chain().focus().setImage({ src: data.url }).run();
      setIsImageModalOpen(false);
    } catch (error) {
      console.error(error);
      window.alert("Gagal mengunggah gambar. Pastikan format valid.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLocalImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadImageFile(file);
    e.target.value = "";
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-teal-500 underline hover:text-teal-400 cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-lg max-w-full mx-auto my-4" },
      }),
      Youtube.configure({
        HTMLAttributes: { class: "rounded-lg overflow-hidden my-4" },
        width: 640,
        height: 360,
      }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-5 py-4 text-zinc-800 dark:text-zinc-200",
      },
    },
  });

  if (!editor) {
    return (
      <div className="h-64 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500" />
      </div>
    );
  }

  const addLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Masukkan URL link:", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addYoutube = () => {
    const url = window.prompt("Masukkan URL video YouTube:", "https://www.youtube.com/watch?v=");
    if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
  };

  const ToolbarButton = ({
    onClick, isActive = false, disabled = false, children, title,
  }: {
    onClick: () => void; isActive?: boolean; disabled?: boolean;
    children: React.ReactNode; title?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-md transition-all duration-150 cursor-pointer ${
        isActive
          ? "bg-teal-500/15 text-teal-500 dark:text-teal-400"
          : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200"
      } ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );

  const ToolbarDivider = () => (
    <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-1" />
  );

  return (
    <>
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} title="Tebal (Ctrl+B)">
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} title="Miring (Ctrl+I)">
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")} title="Garis Bawah">
            <UnderlineIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive("strike")} title="Coret">
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive("code")} title="Kode Inline">
            <Code className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive("heading", { level: 1 })} title="Heading 1">
            <Heading1 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })} title="Heading 2">
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive("heading", { level: 3 })} title="Heading 3">
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setParagraph().run()} isActive={editor.isActive("paragraph")} title="Paragraf">
            <Pilcrow className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")} title="Daftar Bullet">
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} title="Daftar Bernomor">
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")} title="Kutipan">
            <Quote className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Garis Horizontal">
            <Minus className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} isActive={editor.isActive({ textAlign: "left" })} title="Rata Kiri">
            <AlignLeft className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} isActive={editor.isActive({ textAlign: "center" })} title="Rata Tengah">
            <AlignCenter className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} isActive={editor.isActive({ textAlign: "right" })} title="Rata Kanan">
            <AlignRight className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton onClick={addLink} isActive={editor.isActive("link")} title="Sisipkan Link">
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>
          {editor.isActive("link") && (
            <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()} title="Hapus Link">
              <Unlink className="w-4 h-4" />
            </ToolbarButton>
          )}

          {/* Image button — opens modal */}
          <ToolbarButton onClick={() => openImageModal("url")} title="Sisipkan Gambar">
            <ImageIcon className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton onClick={addYoutube} title="Sisipkan Video YouTube">
            <YoutubeIcon className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)">
            <Undo className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Y)">
            <Redo className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Bubble Menu */}
        <BubbleMenu editor={editor} className="flex items-center gap-0.5 px-1.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")}>
            <Bold className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")}>
            <Italic className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")}>
            <UnderlineIcon className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton onClick={addLink} isActive={editor.isActive("link")}>
            <LinkIcon className="w-3.5 h-3.5" />
          </ToolbarButton>
        </BubbleMenu>

        <EditorContent editor={editor} />

        <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 text-[10px] text-zinc-400">
          <span>{editor.storage.characterCount?.characters?.() || editor.getText().length} karakter</span>
          <span>{editor.storage.characterCount?.words?.() || editor.getText().split(/\s+/).filter(Boolean).length} kata</span>
        </div>
      </div>

      {/* Image Insert Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Sisipkan Gambar</h3>
              <button type="button" onClick={() => setIsImageModalOpen(false)} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-5">
              {([
                { key: "url", label: "URL Gambar", icon: <LinkIcon className="w-3.5 h-3.5" /> },
                { key: "media", label: "Pustaka Media", icon: <Database className="w-3.5 h-3.5" /> },
                { key: "local", label: "Unggah Lokal", icon: <UploadCloud className="w-3.5 h-3.5" /> },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setImageModalTab(tab.key);
                    if (tab.key === "media") fetchMediaLibrary();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                    imageModalTab === tab.key
                      ? "border-teal-500 text-teal-600 dark:text-teal-400"
                      : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  }`}
                >
                  {tab.icon}{tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* URL Tab */}
              {imageModalTab === "url" && (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">URL Gambar</label>
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https://example.com/gambar.jpg"
                    className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2.5 text-zinc-900 dark:text-zinc-50 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    onKeyDown={(e) => e.key === "Enter" && insertImageUrl()}
                    autoFocus
                  />
                  {imageUrlInput && imageUrlInput !== "https://" && (
                    <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                      <img src={imageUrlInput} alt="preview" className="w-full max-h-48 object-contain" onError={(e) => (e.currentTarget.style.display = "none")} />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={insertImageUrl}
                    disabled={!imageUrlInput || imageUrlInput === "https://"}
                    className="w-full py-2.5 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 text-white disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    Sisipkan Gambar
                  </button>
                </div>
              )}

              {/* Media Library Tab */}
              {imageModalTab === "media" && (
                <div>
                  {isLoadingMedia ? (
                    <div className="flex items-center justify-center h-48">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500" />
                    </div>
                  ) : mediaLibrary.length === 0 ? (
                    <div className="text-center py-12 text-zinc-400 text-xs">Tidak ada foto di pustaka media.</div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {mediaLibrary.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => insertMediaImage(item.url)}
                          className="group relative aspect-square rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-900 cursor-pointer border-2 border-transparent hover:border-teal-500 transition-all"
                        >
                          <img src={item.url} alt={item.filename} className="object-cover w-full h-full" />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-[8px] text-white truncate opacity-0 group-hover:opacity-100 transition-opacity">
                            {item.filename}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Local Upload Tab */}
              {imageModalTab === "local" && (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Unggah dari Perangkat</label>
                  <div
                    onClick={() => imageFileInputRef.current?.click()}
                    className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-10 text-center cursor-pointer hover:border-teal-500 hover:bg-teal-500/5 transition-all"
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
                        <p className="text-xs text-zinc-400">Mengunggah...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <UploadCloud className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
                        <p className="text-xs font-semibold text-zinc-500">Klik untuk pilih gambar</p>
                        <p className="text-[10px] text-zinc-400">PNG, JPG, WEBP, GIF</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={imageFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLocalImageChange}
                    disabled={isUploading}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input (kept for backward compat, unused now) */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLocalImageChange} disabled={isUploading} />
    </>
  );
}