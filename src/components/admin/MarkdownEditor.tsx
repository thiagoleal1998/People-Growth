"use client";

import { useRef, useState } from "react";
import { Bold, Heading2, Link2, List, ListOrdered, Quote, ImagePlus, Loader2 } from "lucide-react";

const fieldControlStyle = {
  width: "100%",
  padding: "0.875rem 1rem",
  borderRadius: "0 0 0.5rem 0.5rem",
  border: "1px solid var(--admin-border-strong)",
  borderTop: "none",
  fontSize: "0.95rem",
  lineHeight: 1.6,
  boxSizing: "border-box" as const,
  fontFamily: "inherit",
  backgroundColor: "var(--admin-surface)",
  color: "var(--admin-text)",
  resize: "vertical" as const,
};

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

export function MarkdownEditor({
  name,
  defaultValue,
  minHeight = 420,
  required,
}: {
  name: string;
  defaultValue: string;
  minHeight?: number;
  required?: boolean;
}) {
  const [value, setValue] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function applyAtSelection(transform: (selected: string, before: string, after: string) => { text: string; selectFrom: number; selectTo: number }) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = value.slice(0, start);
    const selected = value.slice(start, end);
    const after = value.slice(end);
    const { text, selectFrom, selectTo } = transform(selected, before, after);
    setValue(text);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(selectFrom, selectTo);
    });
  }

  function wrapSelection(marker: string, placeholder: string) {
    applyAtSelection((selected, before, after) => {
      const content = selected || placeholder;
      const text = `${before}${marker}${content}${marker}${after}`;
      return { text, selectFrom: before.length + marker.length, selectTo: before.length + marker.length + content.length };
    });
  }

  function prefixLines(prefix: string) {
    applyAtSelection((selected, before, after) => {
      const lineStart = before.lastIndexOf("\n") + 1;
      const linePrefix = before.slice(0, lineStart);
      const currentLineAndSelection = before.slice(lineStart) + selected;
      const prefixed = currentLineAndSelection
        .split("\n")
        .map((line) => (line.startsWith(prefix) ? line : `${prefix}${line}`))
        .join("\n");
      const text = `${linePrefix}${prefixed}${after}`;
      return { text, selectFrom: linePrefix.length, selectTo: linePrefix.length + prefixed.length };
    });
  }

  function insertLink() {
    const el = textareaRef.current;
    const selected = el ? value.slice(el.selectionStart, el.selectionEnd) : "";
    const url = window.prompt("URL do link:");
    if (!url) return;
    applyAtSelection((sel, before, after) => {
      const label = sel || selected || "texto do link";
      const text = `${before}[${label}](${url})${after}`;
      return { text, selectFrom: before.length + 1, selectTo: before.length + 1 + label.length };
    });
  }

  function insertImageMarkdown(url: string, caption: string) {
    applyAtSelection((_sel, before, after) => {
      const needsLeadingBreak = before.length > 0 && !before.endsWith("\n\n");
      const insertion = `${needsLeadingBreak ? "\n\n" : ""}![${caption}](${url})\n\n`;
      const text = `${before}${insertion}${after}`;
      return { text, selectFrom: text.length - after.length, selectTo: text.length - after.length };
    });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload-content-image", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Falha no upload.");
      const caption = window.prompt("Legenda da imagem (opcional, aparece embaixo dela):", "") ?? "";
      insertImageMarkdown(data.url, caption);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao enviar a imagem.");
    } finally {
      setUploading(false);
    }
  }

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
        }}
      >
        <button type="button" title="Negrito" onClick={() => wrapSelection("**", "texto em negrito")} style={toolButtonStyle}>
          <Bold size={16} />
        </button>
        <button type="button" title="Subtítulo" onClick={() => prefixLines("## ")} style={toolButtonStyle}>
          <Heading2 size={16} />
        </button>
        <button type="button" title="Citação em destaque" onClick={() => prefixLines("> ")} style={toolButtonStyle}>
          <Quote size={16} />
        </button>
        <button type="button" title="Lista" onClick={() => prefixLines("- ")} style={toolButtonStyle}>
          <List size={16} />
        </button>
        <button type="button" title="Lista numerada" onClick={() => prefixLines("1. ")} style={toolButtonStyle}>
          <ListOrdered size={16} />
        </button>
        <button type="button" title="Link" onClick={insertLink} style={toolButtonStyle}>
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
        <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} style={{ display: "none" }} />
      </div>
      <textarea
        ref={textareaRef}
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required={required}
        style={{ ...fieldControlStyle, minHeight: `${minHeight}px` }}
      />
    </div>
  );
}
