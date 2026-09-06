// Bridges the WYSIWYG editor (TipTap) and the markdown-lite text format
// actually stored in the database and rendered by markdown-lite.ts. Content
// never leaves the DB as HTML — the editor just gives authors a visual way
// to produce/edit the exact same **bold**/++underline++/## subtitle text
// every other part of the pipeline (public rendering, TTS stripping,
// existing drafts) already understands.

// Stored text -> semantic HTML fed into TipTap as initial content. Deliberately
// bare (no inline styles, no figure/figcaption) since this only ever feeds
// the editor's own chrome — renderMarkdownLite() still owns the public,
// styled HTML output.
export function markdownLiteToEditorHtml(text: string): string {
  if (!text.trim()) return "<p></p>";

  let html = text
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/!\[([^\]]*)\]\(([^)]+?)(?:\s+"([^"]*)")?(?:\s+"([^"]*)")?\)/g, (_match, alt: string, src: string, credit?: string, source?: string) => {
      const creditAttr = credit ? ` data-credit="${credit}"` : "";
      const sourceAttr = source ? ` data-source="${source}"` : "";
      return `<img src="${src}" alt="${alt}"${creditAttr}${sourceAttr} />`;
    })
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\+\+(.+?)\+\+/g, "<u>$1</u>")
    .replace(/_(.+?)_/g, "<em>$1</em>");

  html = html.replace(/(?:^>\s?.*$\n?)+/gm, (block) => {
    const lines = block.trim().split("\n").map((line) => line.replace(/^>\s?/, ""));
    return `<blockquote>${lines.map((l) => `<p>${l}</p>`).join("")}</blockquote>\n\n`;
  });

  html = html.replace(/(?:^\d+\.\s+.+$\n?)+/gm, (block) => {
    const items = block.trim().split("\n").map((line) => line.replace(/^\d+\.\s+/, ""));
    return `<ol>${items.map((i) => `<li>${i}</li>`).join("")}</ol>`;
  });

  html = html.replace(/(?:^-\s+.+$\n?)+/gm, (block) => {
    const items = block.trim().split("\n").map((line) => line.replace(/^-\s+/, ""));
    return `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
  });

  return html
    .split(/\n\n+/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (/^<(h2|h3|ul|ol|blockquote|img)/.test(trimmed)) return trimmed;
      return `<p>${trimmed}</p>`;
    })
    .filter(Boolean)
    .join("");
}

// TipTap's editor.getHTML() -> stored markdown-lite text. Client-only
// (DOMParser); the editor itself only ever runs client-side anyway.
// Credit/source live in data-credit/data-source (not the native "title"
// attribute) so the browser never shows its own hover tooltip over the
// image — see the custom Image extension in MarkdownEditor.tsx.
function serializeImage(el: HTMLElement): string {
  const alt = el.getAttribute("alt") ?? "";
  const src = el.getAttribute("src") ?? "";
  const credit = el.getAttribute("data-credit") ?? "";
  const source = el.getAttribute("data-source") ?? "";
  const suffix = credit || source ? ` "${credit}" "${source}"` : "";
  return `![${alt}](${src}${suffix})`;
}

export function editorHtmlToMarkdownLite(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");

  function renderInline(node: ChildNode): string {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const el = node as HTMLElement;
    const inner = () => Array.from(el.childNodes).map(renderInline).join("");
    switch (el.tagName.toLowerCase()) {
      case "strong":
      case "b":
        return `**${inner()}**`;
      case "em":
      case "i":
        return `_${inner()}_`;
      case "u":
        return `++${inner()}++`;
      case "a":
        return `[${inner()}](${el.getAttribute("href") ?? ""})`;
      case "img":
        return serializeImage(el);
      case "br":
        return "\n";
      default:
        return inner();
    }
  }

  function renderChildrenInline(el: Element): string {
    return Array.from(el.childNodes).map(renderInline).join("");
  }

  function renderBlock(node: ChildNode): string {
    if (node.nodeType === Node.TEXT_NODE) return (node.textContent ?? "").trim();
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const el = node as HTMLElement;
    switch (el.tagName.toLowerCase()) {
      case "h2":
        return `## ${renderChildrenInline(el)}`;
      case "h3":
        return `### ${renderChildrenInline(el)}`;
      case "img":
        return serializeImage(el);
      case "ul":
        return Array.from(el.children).map((li) => `- ${renderChildrenInline(li)}`).join("\n");
      case "ol":
        return Array.from(el.children).map((li, i) => `${i + 1}. ${renderChildrenInline(li)}`).join("\n");
      case "blockquote":
        return Array.from(el.children).map((p) => `> ${renderChildrenInline(p)}`).join("\n");
      case "p":
      default:
        return renderChildrenInline(el);
    }
  }

  return Array.from(doc.body.childNodes)
    .map(renderBlock)
    .filter((block) => block !== "")
    .join("\n\n")
    .trim();
}
