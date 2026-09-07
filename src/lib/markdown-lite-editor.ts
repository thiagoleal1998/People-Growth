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

  // Same reasoning as renderMarkdownLite in markdown-lite.ts: URLs commonly
  // contain "_" (Globo's CDN URLs, among others, routinely do), and the
  // bold/italic/underline regexes below would otherwise run over an
  // already-rendered <img>/<a> tag's src/href text and mangle it. Stash
  // each behind an opaque NUL-based token until every other regex has run.
  const NUL = String.fromCharCode(0);
  const blocks: string[] = [];
  const protect = (prefix: "FIG" | "LNK", html: string): string => {
    const token = NUL + prefix + blocks.length + NUL;
    blocks.push(html);
    return token;
  };

  // Some stored rows still have Windows-style "\r\n" line endings (from
  // before the WYSIWYG editor existed) — normalize before the "\n\n"-based
  // paragraph split below, or every paragraph in that article loads as one
  // single run since "\r" sits between the two "\n" it looks for.
  let html = text
    .replace(/\r\n?/g, "\n")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    // "!gif[...]" — a looping muted video standing in for a "gif" that's
    // actually served as video by its host. Must run before the image
    // regex since it shares the "[alt](url)" shape.
    .replace(/!gif\[([^\]]*)\]\(((?:[^\s()]|\([^()]*\))+)(?:\s+"([^"]*)")?(?:\s+"([^"]*)")?\)/g, (_match, alt: string, src: string, credit?: string, source?: string) => {
      const creditAttr = credit ? ` data-credit="${credit}"` : "";
      const sourceAttr = source ? ` data-source="${source}"` : "";
      return protect("FIG", `<video src="${src}" alt="${alt}"${creditAttr}${sourceAttr}></video>`);
    })
    // The url group allows one level of balanced parens — plain "[^)]+"
    // stops at the FIRST ")", which breaks real-world URLs that contain
    // one (many CDNs, including Globo's, encode image filters like
    // "filters:strip_icc()" directly in the path).
    .replace(/!\[([^\]]*)\]\(((?:[^\s()]|\([^()]*\))+)(?:\s+"([^"]*)")?(?:\s+"([^"]*)")?\)/g, (_match, alt: string, src: string, credit?: string, source?: string) => {
      const creditAttr = credit ? ` data-credit="${credit}"` : "";
      const sourceAttr = source ? ` data-source="${source}"` : "";
      return protect("FIG", `<img src="${src}" alt="${alt}"${creditAttr}${sourceAttr} />`);
    })
    .replace(/\[([^\]]+)\]\(((?:[^\s()]|\([^()]*\))+)\)/g, (_match, linkText: string, url: string) => protect("LNK", `<a href="${url}">${linkText}</a>`))
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

  const figTokenRe = new RegExp(`^${NUL}FIG\\d+${NUL}$`);
  const rendered = html
    .split(/\n\n+/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (figTokenRe.test(trimmed)) return trimmed;
      if (/^<(h2|h3|ul|ol|blockquote)/.test(trimmed)) return trimmed;
      return `<p>${trimmed}</p>`;
    })
    .filter(Boolean)
    .join("");

  const tokenRe = new RegExp(`${NUL}(?:FIG|LNK)(\\d+)${NUL}`, "g");
  return rendered.replace(tokenRe, (_match, index: string) => blocks[Number(index)]);
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

// Same shape as serializeImage but with the "!gif" marker — see VideoGif
// in tiptap-videogif.ts for why this is a separate node from images.
function serializeVideoGif(el: HTMLElement): string {
  const alt = el.getAttribute("alt") ?? "";
  const src = el.getAttribute("src") ?? "";
  const credit = el.getAttribute("data-credit") ?? "";
  const source = el.getAttribute("data-source") ?? "";
  const suffix = credit || source ? ` "${credit}" "${source}"` : "";
  return `!gif[${alt}](${src}${suffix})`;
}

export function editorHtmlToMarkdownLite(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");

  function renderInline(node: ChildNode): string {
    // A raw embedded newline (e.g. from a plain-text paste that the browser
    // didn't split into separate <p> tags) has no "soft break" meaning in
    // this dialect — "\n\n+" is the only paragraph boundary it recognizes,
    // so a lone "\n" left as-is silently collapses to a space when rendered.
    // Promoting it to a full paragraph break is the only lossless mapping.
    if (node.nodeType === Node.TEXT_NODE) return (node.textContent ?? "").replace(/\n/g, "\n\n");
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
      case "video":
        return serializeVideoGif(el);
      case "br":
        // Same reasoning as the text-node case above.
        return "\n\n";
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
      case "video":
        return serializeVideoGif(el);
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
