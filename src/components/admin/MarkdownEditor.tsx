"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Bold, Italic, Underline, Heading2, Heading3, Link2, List, ListOrdered, Quote, Undo2, Redo2, ImagePlus, ExternalLink, Loader2 } from "lucide-react";
import { markdownLiteToEditorHtml, editorHtmlToMarkdownLite } from "@/lib/markdown-lite-editor";
import { promptDialog, alertDialog } from "./dialog-store";

const toolButtonStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "2rem",
  height: "2rem",
  borderRadius: "0.375rem",
  border: "none",
  background: "none",
  color: "var(--admin-muted)",
  cursor: "pointer",
};

function activeStyle(active: boolean) {
  return active
    ? { ...toolButtonStyle, backgroundColor: "rgba(67,97,238,0.12)", color: "#4361EE" }
    : toolButtonStyle;
}

export function MarkdownEditor({
  name,
  defaultValue,
  minHeight = 420,
}: {
  name: string;
  defaultValue: string;
  minHeight?: number;
}) {
  const [serialized, setSerialized] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Image,
    ],
    content: markdownLiteToEditorHtml(defaultValue),
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setSerialized(editorHtmlToMarkdownLite(editor.getHTML()));
    },
    editorProps: {
      attributes: {
        style: `min-height:${minHeight}px`,
        class: "tiptap-content",
      },
    },
  });

  async function insertLink(editor: Editor) {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = await promptDialog("URL do link:", previousUrl ?? "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    if (editor.state.selection.empty) {
      editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  }

  function insertImageMarkdown(editor: Editor, url: string, caption: string, credit: string) {
    editor.chain().focus().setImage({ src: url, alt: caption, title: credit || undefined }).run();
  }

  async function handleImageUrlInsert() {
    if (!editor) return;
    const url = await promptDialog("URL da imagem (link para uma imagem já publicada em outro lugar):");
    if (!url || !url.trim()) return;
    const caption = (await promptDialog("Legenda da imagem (opcional, aparece embaixo dela):")) ?? "";
    const credit = (await promptDialog("Crédito / fonte da imagem (opcional, aparece abaixo da legenda):")) ?? "";
    insertImageMarkdown(editor, url.trim(), caption, credit);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload-content-image", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Falha no upload.");
      const caption = (await promptDialog("Legenda da imagem (opcional, aparece embaixo dela):")) ?? "";
      const credit = (await promptDialog("Crédito / fonte da imagem (opcional, aparece abaixo da legenda):")) ?? "";
      insertImageMarkdown(editor, data.url, caption, credit);
    } catch (err) {
      await alertDialog(err instanceof Error ? err.message : "Erro ao enviar a imagem.");
    } finally {
      setUploading(false);
    }
  }

  if (!editor) return null;

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.125rem",
          padding: "0.375rem",
          border: "1px solid var(--admin-border-strong)",
          borderBottom: "none",
          borderRadius: "0.5rem 0.5rem 0 0",
          backgroundColor: "var(--admin-surface-alt)",
          flexWrap: "wrap",
          position: "sticky",
          top: 0,
          zIndex: 5,
        }}
      >
        <button type="button" title="Negrito" onClick={() => editor.chain().focus().toggleBold().run()} style={activeStyle(editor.isActive("bold"))}>
          <Bold size={16} />
        </button>
        <button type="button" title="Itálico" onClick={() => editor.chain().focus().toggleItalic().run()} style={activeStyle(editor.isActive("italic"))}>
          <Italic size={16} />
        </button>
        <button type="button" title="Sublinhado" onClick={() => editor.chain().focus().toggleUnderline().run()} style={activeStyle(editor.isActive("underline"))}>
          <Underline size={16} />
        </button>
        <div style={{ width: "1px", height: "1.25rem", backgroundColor: "var(--admin-border-strong)", margin: "0 0.25rem" }} />
        <button type="button" title="Subtítulo" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} style={activeStyle(editor.isActive("heading", { level: 2 }))}>
          <Heading2 size={16} />
        </button>
        <button type="button" title="Subtítulo pequeno" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} style={activeStyle(editor.isActive("heading", { level: 3 }))}>
          <Heading3 size={16} />
        </button>
        <div style={{ width: "1px", height: "1.25rem", backgroundColor: "var(--admin-border-strong)", margin: "0 0.25rem" }} />
        <button type="button" title="Lista" onClick={() => editor.chain().focus().toggleBulletList().run()} style={activeStyle(editor.isActive("bulletList"))}>
          <List size={16} />
        </button>
        <button type="button" title="Lista numerada" onClick={() => editor.chain().focus().toggleOrderedList().run()} style={activeStyle(editor.isActive("orderedList"))}>
          <ListOrdered size={16} />
        </button>
        <div style={{ width: "1px", height: "1.25rem", backgroundColor: "var(--admin-border-strong)", margin: "0 0.25rem" }} />
        <button type="button" title="Citação em destaque" onClick={() => editor.chain().focus().toggleBlockquote().run()} style={activeStyle(editor.isActive("blockquote"))}>
          <Quote size={16} />
        </button>
        <div style={{ width: "1px", height: "1.25rem", backgroundColor: "var(--admin-border-strong)", margin: "0 0.25rem" }} />
        <button type="button" title="Desfazer" onClick={() => editor.chain().focus().undo().run()} style={toolButtonStyle}>
          <Undo2 size={16} />
        </button>
        <button type="button" title="Refazer" onClick={() => editor.chain().focus().redo().run()} style={toolButtonStyle}>
          <Redo2 size={16} />
        </button>
        <div style={{ width: "1px", height: "1.25rem", backgroundColor: "var(--admin-border-strong)", margin: "0 0.25rem" }} />
        <button type="button" title="Link" onClick={() => insertLink(editor)} style={activeStyle(editor.isActive("link"))}>
          <Link2 size={16} />
        </button>
        <div style={{ width: "1px", height: "1.25rem", backgroundColor: "var(--admin-border-strong)", margin: "0 0.25rem" }} />
        <button
          type="button"
          title="Inserir imagem"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          style={{ ...toolButtonStyle, cursor: uploading ? "default" : "pointer" }}
        >
          {uploading ? <Loader2 size={16} className="admin-spin" /> : <ImagePlus size={16} />}
        </button>
        <button
          type="button"
          title="Inserir imagem por link (URL) — não ocupa espaço no site"
          onClick={handleImageUrlInsert}
          style={toolButtonStyle}
        >
          <ExternalLink size={16} />
        </button>
        <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} style={{ display: "none" }} />
      </div>
      <div
        style={{
          border: "1px solid var(--admin-border-strong)",
          borderRadius: "0 0 0.5rem 0.5rem",
          backgroundColor: "var(--admin-surface)",
          padding: "0.875rem 1rem",
        }}
      >
        <EditorContent editor={editor} />
      </div>
      <input type="hidden" name={name} value={serialized} />
    </div>
  );
}
