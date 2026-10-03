"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import { Selection } from "@tiptap/pm/state";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, Underline, Heading2, Heading3, Link2, List, ListOrdered, Quote, Undo2, Redo2, ImagePlus, ExternalLink, Film, Youtube, Highlighter, Loader2 } from "lucide-react";
import { markdownLiteToEditorHtml, editorHtmlToMarkdownLite } from "@/lib/markdown-lite-editor";
import { extractYouTubeId } from "@/lib/youtube";
import { promptDialog, alertDialog } from "./dialog-store";
import { ImageWithCredit } from "./tiptap-image-with-credit";
import { VideoGif } from "./tiptap-videogif";
import { YoutubeEmbed } from "./tiptap-youtube";
import { HighlightQuotes } from "./tiptap-highlight-quotes";
import { ImageCropper, type AspectOption } from "./ImageCropper";
import { BrandHighlight } from "./tiptap-highlight-mark";
import type { EditorView } from "@tiptap/pm/view";

// Pasted rich text (Word/Docs/Notion/chat apps) carries its bold/italic/link
// formatting as real HTML — forcing plain text on paste (an earlier attempt)
// fixed paragraph structure but threw that formatting away entirely. The
// actual cause of paragraphs merging was the source's block markup: many
// apps wrap each paragraph in a <div> instead of <p> (which our schema
// doesn't recognize as a paragraph), or separate them with <br><br> instead
// of real block boundaries. Normalizing just those two shapes before
// ProseMirror parses the clipboard HTML fixes the structure while leaving
// every inline mark (bold, italic, links) untouched.
function transformPastedHTML(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");

  Array.from(doc.body.children).forEach((el) => {
    if (el.tagName === "DIV") {
      const p = doc.createElement("p");
      p.innerHTML = el.innerHTML;
      el.replaceWith(p);
    }
  });

  Array.from(doc.body.children).forEach((el) => {
    if (el.tagName !== "P" || !el.querySelector("br")) return;
    const pieces: ChildNode[][] = [[]];
    Array.from(el.childNodes).forEach((node) => {
      if (node.nodeName === "BR") pieces.push([]);
      else pieces[pieces.length - 1].push(node);
    });
    const newParagraphs = pieces
      .filter((piece) => piece.some((n) => (n.textContent ?? "").trim() !== ""))
      .map((piece) => {
        const p = doc.createElement("p");
        piece.forEach((n) => p.appendChild(n));
        return p;
      });
    newParagraphs.forEach((p) => el.before(p));
    el.remove();
  });

  return doc.body.innerHTML;
}

// Plain-text clipboard data from some sources (macOS rich-text apps like
// Notes/Pages/TextEdit, PDF text extraction, some web editors' plain-text
// export) uses the Unicode LINE SEPARATOR (U+2028) / PARAGRAPH SEPARATOR
// (U+2029) characters instead of "\n" for line breaks. ProseMirror's default
// plain-text paste handling only recognizes "\r\n"/"\n" to split lines into
// paragraphs, so text using these instead pastes as one giant unbroken
// paragraph — the exact "everything merged into one block" symptom, just
// via the plain-text path rather than the HTML path handled above. Built
// with String.fromCharCode/split/join (not a regex literal) because the
// JS parser treats a raw U+2028/U+2029 character as a source line
// terminator, which breaks inside a /regex/ literal.
function transformPastedText(text: string): string {
  const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);
  const LINE_SEPARATOR = String.fromCharCode(0x2028);
  return text.split(PARAGRAPH_SEPARATOR).join("\n\n").split(LINE_SEPARATOR).join("\n");
}

const CROP_ASPECTS: AspectOption[] = [
  { label: "16:9", value: 16 / 9 },
  { label: "4:3", value: 4 / 3 },
  { label: "3:2", value: 3 / 2 },
  { label: "1:1", value: 1 },
];

async function uploadContentImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/admin/upload-content-image", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok || !data.url) throw new Error(data.error ?? "Falha no upload.");
  return data.url as string;
}

function updateImageAttrs(editor: Editor, pos: number, patch: Record<string, unknown>) {
  const node = editor.state.doc.nodeAt(pos);
  if (!node) return;
  editor.view.dispatch(editor.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...patch }));
}

// Images pasted from a copied file/screenshot arrive as clipboard items, not
// as HTML — and copying an image out of a web page often gives both, so the
// file takes precedence.
function clipboardImageFiles(data: DataTransfer | null): File[] {
  if (!data) return [];
  return Array.from(data.items)
    .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
    .map((item) => item.getAsFile())
    .filter((file): file is File => file !== null);
}

// Some sources (Word, Google Docs, rich-text apps) paste images inline as
// base64 data: URLs inside the HTML rather than as clipboard files.
async function dataUrlImagesFromHtml(html: string): Promise<File[]> {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const srcs = Array.from(doc.querySelectorAll("img"))
    .map((img) => img.getAttribute("src") ?? "")
    .filter((src) => src.startsWith("data:image/"));
  return Promise.all(
    srcs.map(async (src, i) => {
      const blob = await (await fetch(src)).blob();
      return new File([blob], `colado-${i + 1}.${blob.type.split("/")[1] ?? "png"}`, { type: blob.type });
    })
  );
}

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

// Lets a parent form read the editor's current live content (e.g. before
// it's been saved) and replace it programmatically (e.g. after a
// translation call) — see the "Traduzir" button in ArticleForm.
export type MarkdownEditorHandle = {
  getContent: () => string;
  setContent: (text: string) => void;
};

export const MarkdownEditor = forwardRef<
  MarkdownEditorHandle,
  { name: string; defaultValue: string; minHeight?: number; highlightQuotes?: string[] }
>(function MarkdownEditor({ name, defaultValue, minHeight = 420, highlightQuotes }, ref) {
  const [serialized, setSerialized] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [cropState, setCropState] = useState<{ file: File; pos: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stable across renders (only uses state setters), so it's safe to hand to
  // useEditor, which captures its config once at creation.
  function insertPastedFiles(view: EditorView, files: File[]) {
    setUploading(true);
    (async () => {
      try {
        for (const file of files) {
          const url = await uploadContentImage(file);
          const { state } = view;
          view.dispatch(state.tr.replaceSelectionWith(state.schema.nodes.image.create({ src: url })));
          const after = view.state;
          view.dispatch(after.tr.setSelection(Selection.near(after.doc.resolve(after.selection.to))));
        }
      } catch (err) {
        await alertDialog(err instanceof Error ? err.message : "Erro ao enviar a imagem colada.");
      } finally {
        setUploading(false);
      }
    })();
  }

  async function editImageFields(editor: Editor, pos: number, attrs: Record<string, unknown>) {
    const caption = await promptDialog("Legenda da imagem (aparece embaixo dela):", (attrs.alt as string | null) ?? "");
    if (caption === null) return;
    const credit = await promptDialog("Créditos da imagem (ex: nome do fotógrafo):", (attrs.credit as string | null) ?? "");
    if (credit === null) return;
    const source = await promptDialog("Fonte da imagem (ex: site ou publicação de origem):", (attrs.source as string | null) ?? "");
    if (source === null) return;
    updateImageAttrs(editor, pos, { alt: caption || null, credit: credit || null, source: source || null });
  }

  async function requestImageCrop(_editor: Editor, pos: number, attrs: Record<string, unknown>) {
    try {
      const res = await fetch(attrs.src as string);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      setCropState({ file: new File([blob], "foto", { type: blob.type || "image/jpeg" }), pos });
    } catch {
      await alertDialog(
        "Não consegui abrir esta imagem para recortar. Imagens de outros sites podem bloquear isso — baixe o arquivo e cole ou envie pelo botão de imagem, que aí dá para recortar."
      );
    }
  }

  async function applyCroppedImage(cropped: File) {
    const target = cropState;
    setCropState(null);
    if (!target || !editor) return;
    setUploading(true);
    try {
      const url = await uploadContentImage(cropped);
      updateImageAttrs(editor, target.pos, { src: url });
    } catch (err) {
      await alertDialog(err instanceof Error ? err.message : "Erro ao enviar a imagem recortada.");
    } finally {
      setUploading(false);
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      ImageWithCredit.configure({ onEditRequest: editImageFields, onCropRequest: requestImageCrop }),
      VideoGif,
      YoutubeEmbed,
      BrandHighlight,
      HighlightQuotes.configure({ quotes: highlightQuotes ?? [] }),
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
      transformPastedHTML,
      transformPastedText,
      handlePaste: (view, event) => {
        const files = clipboardImageFiles(event.clipboardData);
        if (files.length > 0) {
          insertPastedFiles(view, files);
          return true;
        }
        const html = event.clipboardData?.getData("text/html") ?? "";
        const text = event.clipboardData?.getData("text/plain") ?? "";
        if (!html.includes("data:image/") || text.trim() !== "") return false;
        dataUrlImagesFromHtml(html).then((inlineFiles) => {
          if (inlineFiles.length > 0) insertPastedFiles(view, inlineFiles);
        });
        return true;
      },
    },
  });

  // Covers the case where `highlightQuotes` becomes known/changes after the
  // editor already exists — the `.configure()` above only seeds its initial
  // state, since `useEditor` doesn't re-create the editor when its config
  // object's identity changes.
  useEffect(() => {
    editor?.commands.setHighlightQuotes(highlightQuotes ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, JSON.stringify(highlightQuotes ?? [])]);

  useImperativeHandle(
    ref,
    () => ({
      getContent: () => serialized,
      setContent: (text: string) => {
        editor?.commands.setContent(markdownLiteToEditorHtml(text));
        setSerialized(text);
      },
    }),
    [serialized, editor]
  );

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

  function insertImageMarkdown(editor: Editor, url: string, caption: string, credit: string, source: string) {
    editor
      .chain()
      .focus()
      .insertContent({ type: "image", attrs: { src: url, alt: caption || null, credit: credit || null, source: source || null } })
      .run();
    // insertContent leaves the image as a selected node (NodeSelection).
    // Typing right after inserting — the natural next thing to do — would
    // replace the whole image instead of adding text, since ProseMirror
    // treats typing over a selected node as "replace it". Move the cursor
    // to a normal text position right after it instead. Selection.near
    // (rather than a plain TextSelection) finds the closest valid text
    // position instead of requiring an exact one.
    const { state, view } = editor;
    const selection = Selection.near(state.doc.resolve(state.selection.to));
    view.dispatch(state.tr.setSelection(selection));
  }

  async function promptImageCaptionAndCredit() {
    const caption = (await promptDialog("Legenda da imagem (opcional, aparece embaixo dela):")) ?? "";
    const credit = (await promptDialog("Créditos da imagem (opcional, ex: nome do fotógrafo):")) ?? "";
    const source = (await promptDialog("Fonte da imagem (opcional, ex: site ou publicação de origem):")) ?? "";
    return { caption, credit, source };
  }

  async function handleImageUrlInsert() {
    if (!editor) return;
    const url = await promptDialog("URL da imagem (link para uma imagem já publicada em outro lugar):");
    if (!url || !url.trim()) return;
    const { caption, credit, source } = await promptImageCaptionAndCredit();
    insertImageMarkdown(editor, url.trim(), caption, credit, source);
  }

  function insertVideoGifMarkdown(editor: Editor, url: string, caption: string, credit: string, source: string) {
    editor
      .chain()
      .focus()
      .insertContent({ type: "videoGif", attrs: { src: url, alt: caption || null, credit: credit || null, source: source || null } })
      .run();
    // Same fix as insertImageMarkdown — see its comment for why this is needed.
    const { state, view } = editor;
    const selection = Selection.near(state.doc.resolve(state.selection.to));
    view.dispatch(state.tr.setSelection(selection));
  }

  async function handleVideoGifUrlInsert() {
    if (!editor) return;
    const url = await promptDialog(
      "URL do gif/vídeo em loop (use isso quando um link \".gif\" aparecer quebrado — muitos sites, como portais de notícia, servem esses \"gifs\" como vídeo por trás):"
    );
    if (!url || !url.trim()) return;
    const { caption, credit, source } = await promptImageCaptionAndCredit();
    insertVideoGifMarkdown(editor, url.trim(), caption, credit, source);
  }

  function insertYoutubeMarkdown(editor: Editor, url: string, caption: string) {
    editor
      .chain()
      .focus()
      .insertContent({ type: "youtubeEmbed", attrs: { url, caption: caption || null } })
      .run();
    // Same fix as insertImageMarkdown — see its comment for why this is needed.
    const { state, view } = editor;
    const selection = Selection.near(state.doc.resolve(state.selection.to));
    view.dispatch(state.tr.setSelection(selection));
  }

  async function handleYoutubeUrlInsert() {
    if (!editor) return;
    const url = await promptDialog("URL do vídeo do YouTube:");
    if (!url || !url.trim()) return;
    if (!extractYouTubeId(url.trim())) {
      await alertDialog("Esse link não parece ser um vídeo do YouTube válido.");
      return;
    }
    const caption = (await promptDialog("Legenda do vídeo (opcional, aparece embaixo dele):")) ?? "";
    insertYoutubeMarkdown(editor, url.trim(), caption);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;

    setUploading(true);
    try {
      const url = await uploadContentImage(file);
      const { caption, credit, source } = await promptImageCaptionAndCredit();
      insertImageMarkdown(editor, url, caption, credit, source);
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
        <button type="button" title="Destacar trecho (Ctrl+Shift+H)" onClick={() => editor.chain().focus().toggleBrandHighlight().run()} style={activeStyle(editor.isActive("highlight"))}>
          <Highlighter size={16} />
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
        <button
          type="button"
          title='Inserir gif/vídeo em loop por link — use quando um ".gif" aparecer quebrado (muitos sites servem esses "gifs" como vídeo)'
          onClick={handleVideoGifUrlInsert}
          style={toolButtonStyle}
        >
          <Film size={16} />
        </button>
        <button
          type="button"
          title="Inserir vídeo do YouTube — mostra a miniatura no texto, toca ao clicar"
          onClick={handleYoutubeUrlInsert}
          style={toolButtonStyle}
        >
          <Youtube size={16} />
        </button>
        <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleFileChange} style={{ display: "none" }} />
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
      {cropState && (
        <ImageCropper
          file={cropState.file}
          shape="square"
          outputSize={1600}
          aspectOptions={CROP_ASPECTS}
          defaultAspect={16 / 9}
          onCancel={() => setCropState(null)}
          onConfirm={applyCroppedImage}
        />
      )}
    </div>
  );
});
