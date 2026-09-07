export function renderMarkdownLite(text: string): string {
  // Windows-style "\r\n" line endings (possible in stored content from
  // before the WYSIWYG editor, or from certain paste/import sources) break
  // every "\n\n"-based paragraph/list/quote split below, since "\r" sits
  // between the two "\n" characters they're looking for. Normalizing first
  // makes every downstream regex CRLF-agnostic.
  let html = text
    .replace(/\r\n?/g, "\n")
    .replace(/^### (.+)$/gm, '<h3 style="font-size:1.25rem;font-weight:800;color:var(--site-text);margin:1.75rem 0 0.875rem">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:1.5rem;font-weight:800;color:var(--site-text);margin:2rem 0 1rem">$1</h2>')
    // Images must run before the link regex below — "![alt](url)" contains
    // a "[alt](url)" substring that the link pattern would otherwise eat.
    // Two optional quoted slots after the url — "![alt](url "credito" "fonte")"
    // — carry the credit and source lines shown under the image. A single
    // quoted slot is the older format (credit only), kept for old articles.
    .replace(/!\[([^\]]*)\]\(([^)]+?)(?:\s+"([^"]*)")?(?:\s+"([^"]*)")?\)/g, (_match, alt: string, url: string, credit: string | undefined, source: string | undefined) => {
      const captionLine = alt ? `<span style="display:block">${alt}</span>` : "";
      const creditLine = credit ? `<span style="display:block;margin-top:0.25rem;font-size:0.75rem;color:var(--site-faint)">Créditos: ${credit}</span>` : "";
      const sourceLine = source ? `<span style="display:block;margin-top:0.25rem;font-size:0.75rem;color:var(--site-faint)">Fonte: ${source}</span>` : "";
      const figcaption = alt || credit || source ? `<figcaption style="margin-top:0.625rem;font-size:0.8125rem;color:var(--site-muted);text-align:center">${captionLine}${creditLine}${sourceLine}</figcaption>` : "";
      return `<figure style="margin:2rem 0"><img src="${url}" alt="${alt}" style="width:100%;border-radius:0.75rem;display:block" />${figcaption}</figure>`;
    })
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#4361EE;font-weight:600;text-decoration:underline">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:700;color:var(--site-text)">$1</strong>')
    // Underline has no standard markdown syntax, so it uses its own marker.
    // Both this and italic run after bold, so a lone "_" or "+" left over
    // from bold's "**" never gets misread as one of these.
    .replace(/\+\+(.+?)\+\+/g, "<u>$1</u>")
    .replace(/_(.+?)_/g, "<em>$1</em>");

  // Consecutive "> …" lines become a pull-quote. A trailing "— Attribution"
  // line is pulled out and shown smaller, under the quote itself.
  html = html.replace(/(?:^>\s?.*$\n?)+/gm, (block) => {
    const lines = block.trim().split("\n").map((line) => line.replace(/^>\s?/, ""));
    let attribution: string | null = null;
    if (lines.length > 1 && /^—\s+/.test(lines[lines.length - 1])) {
      attribution = lines.pop()!.replace(/^—\s+/, "");
    }
    const quoteText = lines.join(" ");
    return `<blockquote style="position:relative;margin:2rem 0;padding:0.5rem 1rem 0.5rem 2.75rem;border-left:3px solid #4361EE">
      <span style="position:absolute;left:0;top:-0.5rem;font-size:3rem;line-height:1;color:#4361EE;font-family:Georgia,serif;font-weight:800">&ldquo;</span>
      <p style="font-size:1.1875rem;font-weight:700;font-style:italic;color:var(--site-text);line-height:1.5;margin:0">${quoteText}</p>
      ${attribution ? `<p style="margin:0.625rem 0 0;font-size:0.875rem;font-weight:700;color:var(--site-muted)">— ${attribution}</p>` : ""}
    </blockquote>\n\n`;
  });

  // Consecutive "1. …" lines become an <ol>
  html = html.replace(/(?:^\d+\.\s+.+$\n?)+/gm, (block) => {
    const items = block.trim().split("\n").map((line) => line.replace(/^\d+\.\s+/, ""));
    return `<ol style="padding-left:1.5rem;margin:1rem 0;display:flex;flex-direction:column;gap:0.75rem">${items
      .map((i) => `<li>${i}</li>`)
      .join("")}</ol>`;
  });

  // Consecutive "- …" lines become a <ul>
  html = html.replace(/(?:^-\s+.+$\n?)+/gm, (block) => {
    const items = block.trim().split("\n").map((line) => line.replace(/^-\s+/, ""));
    return `<ul style="padding-left:1.5rem;margin:1rem 0">${items
      .map((i) => `<li style="margin-bottom:0.5rem">${i}</li>`)
      .join("")}</ul>`;
  });

  // Remaining blank-line-separated blocks become paragraphs
  return html
    .split(/\n\n+/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (/^<(h2|h3|ul|ol|blockquote|figure)/.test(trimmed)) return trimmed;
      return `<p style="margin:0 0 1.25rem">${trimmed}</p>`;
    })
    .join("");
}

/** Plain-text version of the article body, for the text-to-speech reader —
 * strips markdown-lite syntax so the browser doesn't read symbols aloud. */
export function stripMarkdownLite(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/^>\s?—\s+.+$/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^#{2,3}\s+/gm, "")
    .replace(/^[-\d]+\.?\s+/gm, "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\+\+(.+?)\+\+/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, " ")
    .trim();
}
