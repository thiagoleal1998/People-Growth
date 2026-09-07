export function renderMarkdownLite(text: string): string {
  // URLs (in images/links) commonly contain "_" — signed CDN tokens
  // especially (Globo's image URLs, for one, routinely do). If the
  // rendered <img>/<a> tag were left inline, the bold/italic/underline
  // regexes further down would run over its src/href text too and see
  // markdown emphasis markers that were never meant as such, mangling the
  // URL. Each image/link is rendered immediately but stashed behind an
  // opaque placeholder token (built from a NUL character, which can never
  // occur in authored text) so later regexes have nothing to misread, then
  // swapped back in at the very end.
  const NUL = String.fromCharCode(0);
  const blocks: string[] = [];
  const protect = (prefix: "FIG" | "LNK", html: string): string => {
    const token = NUL + prefix + blocks.length + NUL;
    blocks.push(html);
    return token;
  };

  // Windows-style "\r\n" line endings (possible in stored content from
  // before the WYSIWYG editor, or from certain paste/import sources) break
  // every "\n\n"-based paragraph/list/quote split below, since "\r" sits
  // between the two "\n" characters they're looking for. Normalizing first
  // makes every downstream regex CRLF-agnostic.
  let html = text
    .replace(/\r\n?/g, "\n")
    .replace(/^### (.+)$/gm, '<h3 style="font-size:1.25rem;font-weight:800;color:var(--site-text);margin:1.75rem 0 0.875rem">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:1.5rem;font-weight:800;color:var(--site-text);margin:2rem 0 1rem">$1</h2>')
    // "!gif[alt](url "credito" "fonte")" — a looping muted video, for links
    // that only LOOK like a still ".gif" but are actually served as video
    // (common on news CDNs: the file is really an mp4, which an <img> tag
    // can't display at all — broken icon, no error). Same two optional
    // quoted slots as images. Must run before the image regex since it
    // shares the "[alt](url)" shape.
    .replace(/!gif\[([^\]]*)\]\(((?:[^\s()]|\([^()]*\))+)(?:\s+"([^"]*)")?(?:\s+"([^"]*)")?\)/g, (_match, alt: string, url: string, credit: string | undefined, source: string | undefined) => {
      const captionLine = alt ? `<span style="display:block">${alt}</span>` : "";
      const creditLine = credit ? `<span style="display:block;margin-top:0.25rem;font-size:0.75rem;color:var(--site-faint)">Créditos: ${credit}</span>` : "";
      const sourceLine = source ? `<span style="display:block;margin-top:0.25rem;font-size:0.75rem;color:var(--site-faint)">Fonte: ${source}</span>` : "";
      const figcaption = alt || credit || source ? `<figcaption style="margin-top:0.625rem;font-size:0.8125rem;color:var(--site-muted);text-align:center">${captionLine}${creditLine}${sourceLine}</figcaption>` : "";
      return protect("FIG", `<figure style="margin:2rem 0"><video src="${url}" autoplay loop muted playsinline style="width:100%;border-radius:0.75rem;display:block"></video>${figcaption}</figure>`);
    })
    // Images must run before the link regex below — "![alt](url)" contains
    // a "[alt](url)" substring that the link pattern would otherwise eat.
    // Two optional quoted slots after the url — "![alt](url "credito" "fonte")"
    // — carry the credit and source lines shown under the image. A single
    // quoted slot is the older format (credit only), kept for old articles.
    // The url group allows one level of balanced parens — plain "[^)]+"
    // stops at the FIRST ")", which breaks real-world URLs that contain
    // one (many CDNs, including Globo's, encode image filters like
    // "filters:strip_icc()" directly in the path).
    .replace(/!\[([^\]]*)\]\(((?:[^\s()]|\([^()]*\))+)(?:\s+"([^"]*)")?(?:\s+"([^"]*)")?\)/g, (_match, alt: string, url: string, credit: string | undefined, source: string | undefined) => {
      const captionLine = alt ? `<span style="display:block">${alt}</span>` : "";
      const creditLine = credit ? `<span style="display:block;margin-top:0.25rem;font-size:0.75rem;color:var(--site-faint)">Créditos: ${credit}</span>` : "";
      const sourceLine = source ? `<span style="display:block;margin-top:0.25rem;font-size:0.75rem;color:var(--site-faint)">Fonte: ${source}</span>` : "";
      const figcaption = alt || credit || source ? `<figcaption style="margin-top:0.625rem;font-size:0.8125rem;color:var(--site-muted);text-align:center">${captionLine}${creditLine}${sourceLine}</figcaption>` : "";
      return protect("FIG", `<figure style="margin:2rem 0"><img src="${url}" alt="${alt}" style="width:100%;border-radius:0.75rem;display:block" />${figcaption}</figure>`);
    })
    // Same balanced-parens allowance as the image url above.
    .replace(/\[([^\]]+)\]\(((?:[^\s()]|\([^()]*\))+)\)/g, (_match, linkText: string, url: string) =>
      protect("LNK", `<a href="${url}" style="color:#4361EE;font-weight:600;text-decoration:underline">${linkText}</a>`)
    )
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
      <span style="position:absolute;left:0.5rem;top:-0.5rem;font-size:3rem;line-height:1;color:#4361EE;font-family:Georgia,serif;font-weight:800">&ldquo;</span>
      <p style="font-size:1.1875rem;font-weight:700;font-style:italic;color:var(--site-text);line-height:1.5;margin:0">${quoteText}</p>
      ${attribution ? `<p style="margin:0.625rem 0 0;font-size:0.875rem;font-weight:700;color:var(--site-muted)">— ${attribution}</p>` : ""}
    </blockquote>\n\n`;
  });

  // Consecutive "1. …" lines become an <ol>. list-style is set explicitly
  // (not just left to the browser default) because Tailwind's preflight
  // reset zeroes it globally on every <ul>/<ol> — without it the markers
  // silently don't render anywhere this HTML is dropped in via
  // dangerouslySetInnerHTML, only inside the editor (which has its own
  // scoped ".tiptap-content ul/ol" override, see globals.css).
  // The matched span consumes one of the two "\n"s that originally separated
  // this list from whatever comes after it (each line's own trailing "\n" is
  // part of the match) — forcing two newlines back after the closing tag,
  // same as the blockquote block above, guarantees the paragraph splitter
  // below still sees a real block boundary regardless of how many blank
  // lines followed in the source.
  html = html.replace(/(?:^\d+\.\s+.+$\n?)+/gm, (block) => {
    const items = block.trim().split("\n").map((line) => line.replace(/^\d+\.\s+/, ""));
    return `<ol style="padding-left:1.5rem;margin:1rem 0;list-style:decimal;display:flex;flex-direction:column;gap:0.75rem">${items
      .map((i) => `<li>${i}</li>`)
      .join("")}</ol>\n\n`;
  });

  // Consecutive "- …" lines become a <ul>
  html = html.replace(/(?:^-\s+.+$\n?)+/gm, (block) => {
    const items = block.trim().split("\n").map((line) => line.replace(/^-\s+/, ""));
    return `<ul style="padding-left:1.5rem;margin:1rem 0;list-style:disc">${items
      .map((i) => `<li style="margin-bottom:0.5rem">${i}</li>`)
      .join("")}</ul>\n\n`;
  });

  // Remaining blank-line-separated blocks become paragraphs. A block that
  // is nothing but a single image placeholder stays a bare <figure> (its
  // own visual block); everything else — including a block that's nothing
  // but a link — gets wrapped in a <p>, matching prior behavior.
  const figTokenRe = new RegExp(`^${NUL}FIG\\d+${NUL}$`);
  const renderedBlocks = html.split(/\n\n+/).map((block) => {
    const trimmed = block.trim();
    if (!trimmed) return "";
    if (figTokenRe.test(trimmed)) return trimmed;
    if (/^<(h2|h3|ul|ol|blockquote)/.test(trimmed)) return trimmed;
    return `<p style="margin:0 0 1.25rem">${trimmed}</p>`;
  });

  // A "## Fontes principais" / "## Bibliografia" heading and whatever
  // follows it (until the next heading) used to read as a plain
  // paragraph/list like any other — nothing marked it as a block of
  // citations rather than body text, and its links opened in the same tab,
  // taking the reader off the article. Grouped using these EXACT block
  // boundaries (rather than re-deriving them from the assembled HTML string
  // via regex, which — tried first — silently failed to find anything on
  // any article long/varied enough to contain a block shape the
  // reconstruction regex didn't perfectly round-trip, since one mismatch
  // anywhere in the whole document discarded the grouping everywhere).
  groupSourceSections(renderedBlocks, blocks);

  const rendered = renderedBlocks.join("");
  const tokenRe = new RegExp(`${NUL}(?:FIG|LNK)(\\d+)${NUL}`, "g");
  return rendered.replace(tokenRe, (_match, index: string) => blocks[Number(index)]);
}

// Matched against the WHOLE heading text, not just a substring — a heading
// like "Depois das fontes" or "As fontes do problema" merely mentions the
// word and isn't a citations section. An image's own "Fonte: ..." credit
// line (rendered as a <figcaption><span>, never a heading) is a different
// thing entirely and is never touched by this.
const SOURCE_HEADING_RE = /^(fontes?(\s+principais)?|bibliografia|refer[êe]ncias?)\s*:?$/i;

// Mutates `renderedBlocks` in place, merging a matched heading with every
// block after it up to the next heading into one wrapped, tinted group, and
// mutates the matching entries of `protectedBlocks` (the shared protect()
// array — see renderMarkdownLite) so every link inside that group opens in
// a new tab. Each link's protect() call gets its own array index, so
// rewriting specific indices here can never affect a link anywhere else in
// the document.
function groupSourceSections(renderedBlocks: string[], protectedBlocks: string[]): void {
  const NUL = String.fromCharCode(0);
  const lnkTokenRe = new RegExp(`${NUL}LNK(\\d+)${NUL}`, "g");

  for (let i = 0; i < renderedBlocks.length; i++) {
    const headingMatch = renderedBlocks[i].match(/^<h[23][^>]*>([\s\S]*?)<\/h[23]>$/);
    const headingText = headingMatch ? headingMatch[1].replace(/<[^>]+>/g, "").trim() : null;
    if (!headingText || !SOURCE_HEADING_RE.test(headingText)) continue;

    const groupStart = i;
    let groupEnd = i + 1;
    while (groupEnd < renderedBlocks.length && !/^<h[23]/.test(renderedBlocks[groupEnd])) groupEnd++;

    const groupHtml = renderedBlocks.slice(groupStart, groupEnd).join("");
    let match: RegExpExecArray | null;
    lnkTokenRe.lastIndex = 0;
    while ((match = lnkTokenRe.exec(groupHtml))) {
      const idx = Number(match[1]);
      if (!/\btarget=/.test(protectedBlocks[idx])) {
        protectedBlocks[idx] = protectedBlocks[idx].replace(/<a\s+href="/, '<a target="_blank" rel="noopener noreferrer" href="');
      }
    }

    const styledHeading = renderedBlocks[groupStart].replace(/style="([^"]*)"/, 'style="$1;margin-top:0"');
    const rest = renderedBlocks.slice(groupStart + 1, groupEnd).join("");
    // Collapse the whole group into its first slot and blank out the rest
    // (rather than splicing them out) so the outer loop's indices stay
    // valid — the blanked slots just contribute nothing once joined.
    renderedBlocks[groupStart] =
      `<div style="background-color:rgba(67,97,238,0.05);border:1px solid rgba(67,97,238,0.15);border-radius:0.75rem;padding:0.25rem 1.5rem 1.25rem;margin:2rem 0;font-size:0.9rem;color:var(--site-text-secondary)">${styledHeading}${rest}</div>`;
    for (let j = groupStart + 1; j < groupEnd; j++) renderedBlocks[j] = "";
    i = groupEnd - 1;
  }
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
    .replace(/!gif\[[^\]]*\]\((?:[^\s()]|\([^()]*\))+(?:\s+"[^"]*")?(?:\s+"[^"]*")?\)/g, "")
    .replace(/!\[[^\]]*\]\((?:[^\s()]|\([^()]*\))+(?:\s+"[^"]*")?(?:\s+"[^"]*")?\)/g, "")
    .replace(/\[([^\]]+)\]\((?:[^\s()]|\([^()]*\))+\)/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\+\+(.+?)\+\+/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, " ")
    .trim();
}

// There's no UI field for this — it's always derived from the word count,
// at a standard 200 words/minute silent-reading pace, same as most
// newsrooms' CMSs use. Every save must recompute it (never carry over the
// old value) since the content itself may have changed.
export function calculateReadTime(content: string): number {
  const wordCount = stripMarkdownLite(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(wordCount / 200));
}
