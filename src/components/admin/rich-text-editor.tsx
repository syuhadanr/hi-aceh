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

  const uploadImageFile = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Upload failed");
      }

      editor?.chain().focus().setImage({ src: data.url }).run();
    } catch (error) {
      console.error(error);
      window.alert("Gagal mengunggah gambar lokal. Pastikan format valid.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLocalImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadImageFile(file);
    e.target.value = "";
  };

  const triggerLocalImageUpload = () => {
    fileInputRef.current?.click();
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-teal-500 underline hover:text-teal-400 cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full mx-auto my-4",
        },
      }),
      Youtube.configure({
        HTMLAttributes: {
          class: "rounded-lg overflow-hidden my-4",
        },
        width: 640,
        height: 360,
      }),
      Placeholder.configure({
        placeholder,
      }),
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

  const addImage = () => {
    const url = window.prompt("Masukkan URL gambar:", "https://");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addYoutube = () => {
    const url = window.prompt(
      "Masukkan URL video YouTube:",
      "https://www.youtube.com/watch?v="
    );
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  };

  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title?: string;
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
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
        {/* Text Style */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Tebal (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Miring (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Garis Bawah (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          title="Coret"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive("code")}
          title="Kode Inline"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Headings */}
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          isActive={editor.isActive("paragraph")}
          title="Paragraf"
        >
          <Pilcrow className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Daftar Bullet"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Daftar Bernomor"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Kutipan"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Garis Horizontal"
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          title="Rata Kiri"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          title="Rata Tengah"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
          title="Rata Kanan"
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Media */}
        <ToolbarButton
          onClick={addLink}
          isActive={editor.isActive("link")}
          title="Sisipkan Link"
        >
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>
        {editor.isActive("link") && (
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="Hapus Link"
          >
            <Unlink className="w-4 h-4" />
          </ToolbarButton>
        )}
          <ToolbarButton onClick={triggerLocalImageUpload} disabled={isUploading} title="Unggah Gambar Lokal">
          <UploadCloud className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} title="Sisipkan Gambar via URL">
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleLocalImageChange}
          disabled={isUploading}
        />
        <ToolbarButton onClick={addYoutube} title="Sisipkan Video YouTube">
          <YoutubeIcon className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Bubble Menu - appears when text is selected */}
      <BubbleMenu
        editor={editor}
        className="flex items-center gap-0.5 px-1.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl"
      >
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
        >
          <Bold className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
        >
          <Italic className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
        >
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={addLink} isActive={editor.isActive("link")}>
          <LinkIcon className="w-3.5 h-3.5" />
        </ToolbarButton>
      </BubbleMenu>

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Footer - word count */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 text-[10px] text-zinc-400">
        <span>
          {editor.storage.characterCount?.characters?.() || editor.getText().length} karakter
        </span>
        <span>
          {editor.storage.characterCount?.words?.() || editor.getText().split(/\s+/).filter(Boolean).length} kata
        </span>
      </div>
    </div>
  );
}
