"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { List, ChevronDown } from "lucide-react";
import { TextToSpeechButton } from "./TextToSpeechButton";
import { useImageLightbox } from "./ImageLightbox";
import type { ArticleSource } from "@/types/database.types";

// Finds the character offset (snapped to a word boundary) up to which `p`'s
// text renders at or above `maxBottomY` (viewport px) — i.e. how much of the
// summary fits in the narrow column before it runs past the floated cover
// photo. Walks word-by-word (not a binary search — summaries are short)
// measuring each prefix's rendered bottom edge via Range, since that's the
// only way to know real wrapped-line positions without reimplementing the
// browser's own line-breaking.
function findSummarySplitIndex(p: HTMLParagraphElement, maxBottomY: number): number {
  const textNode = p.firstChild;
  if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return 0;
  const text = textNode.textContent || "";
  const words = text.match(/\S+\s*/g) || [];
  const range = document.createRange();
  let offset = 0;
  let lastGoodOffset = 0;
  for (const word of words) {
    const candidate = offset + word.length;
    range.setStart(textNode, 0);
    range.setEnd(textNode, candidate);
    const rects = range.getClientRects();
    const lastRect = rects[rects.length - 1];
    if (lastRect && lastRect.bottom <= maxBottomY) {
      lastGoodOffset = candidate;
    } else {
      break;
    }
    offset = candidate;
  }
  return lastGoodOffset;
}

type SummaryLayout = { mode: "solo" } | { mode: "stretch"; height: number } | { mode: "split"; splitIndex: number };

type Props = {
  title: string;
  summary: string | null;
  speechText: string;
  bodyHtml: string;
  coverImage: string | null;
  coverImageCaption: string | null;
  coverImageCredit: string | null;
  videoEmbedUrl: string | null;
  sources?: ArticleSource[] | null;
  aiDisclosure?: { title: string; text: string } | null;
  locale?: string;
};

export function ArticleBody({
  title,
  summary,
  speechText,
  bodyHtml,
  coverImage,
  coverImageCaption,
  coverImageCredit,
  videoEmbedUrl,
  sources,
  aiDisclosure,
  locale,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  // Tapping any in-article image (markdown-lite's figures) opens it full
  // size — see ImageLightbox.tsx. bodyRef is reused below for the
  // highlight-reveal observer, since both just need the same rendered
  // container.
  const { ref: bodyRef, lightbox } = useImageLightbox<HTMLDivElement>();

  // The cover image is an external/Storage URL outside our control — a slow
  // CDN hiccup or a transient 5xx shouldn't leave a broken-image icon
  // sitting in a published article. One silent retry (cache-busted, so a
  // flaky response isn't just replayed from a failed cache entry) catches
  // the common transient case; if it still fails, a styled placeholder
  // takes over instead of the browser's broken-image glyph.
  const [coverImageStatus, setCoverImageStatus] = useState<"loading" | "retrying" | "ok" | "failed">("loading");
  const [coverImageSrc, setCoverImageSrc] = useState(coverImage);
  useEffect(() => {
    Promise.resolve().then(() => {
      setCoverImageStatus("loading");
      setCoverImageSrc(coverImage);
    });
  }, [coverImage]);

  // Highlights draw in once they scroll into view. Done here (not in CSS
  // scroll-driven animations) so it works in every browser — those only
  // exist in some, and elsewhere the highlight just sat there static.
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const marks = Array.from(body.querySelectorAll<HTMLElement>(".brand-highlight"));
    if (marks.length === 0) return;
    if (!("IntersectionObserver" in window)) {
      marks.forEach((m) => m.classList.add("is-revealed"));
      return;
    }
    body.classList.add("highlight-sweep-ready");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -15% 0px", threshold: 0.6 }
    );
    marks.forEach((m) => observer.observe(m));
    return () => observer.disconnect();
  }, [bodyHtml, bodyRef]);

  // A video is already the article's main visual, so the cover photo only
  // takes this spot when there's no video competing for it.
  const showCoverImage = Boolean(coverImage) && !videoEmbedUrl;

  // The cover photo floats right of the summary card. Two ways that goes
  // wrong once the card is open, and the fix for each:
  //  - Photo taller than the summary text: the card's own text runs out
  //    before the photo does, leaving blank page background below it ->
  //    stretch the card's min-height to match the photo (mode "stretch").
  //  - Summary longer than the photo: once the card's narrow column
  //    (forced narrow by the float-avoiding grid box below, needed so it
  //    never overlaps the photo) runs past the photo's bottom, nothing
  //    reclaims the now-free full width beside/under it -> split the card
  //    in two at the exact word where the photo ends, so part one stays
  //    narrow (still avoiding the photo) and part two continues full width
  //    below it (mode "split"). Measuring is real DOM Range measurement on
  //    the rendered text, not an estimate, since line-wrap points depend on
  //    font metrics no formula here could reproduce reliably.
  // Both are desktop-only (mobile unfloats the photo entirely, see the
  // media query below) and only matter once the card is actually open.
  // On the <figure> itself, not just the <img> -- the figure (which is what
  // actually floats) also includes the caption below the image, so the
  // float's real bottom edge is further down than the image alone.
  const coverFigureRef = useRef<HTMLElement | null>(null);
  const summaryMeasureRef = useRef<HTMLParagraphElement | null>(null);
  const [summaryLayout, setSummaryLayout] = useState<SummaryLayout>({ mode: "solo" });

  // Falls back to "solo" (full text, narrow column, un-stretched) whenever
  // something that could change the measurement happens while open; the
  // layout effect below then measures that "solo" render and upgrades it —
  // both are layout effects so this reset-then-measure cascade fully
  // resolves before the browser paints, with no visible flash back to
  // "solo" in between. Skipped while collapsed/collapsing so a
  // "stretch"/"split" layout doesn't swap back to one unsplit block of text
  // mid-close-animation — the next open re-triggers this with a clean
  // "solo" baseline regardless.
  useLayoutEffect(() => {
    if (!expanded) return;
    // Resetting to the DOM-measurement baseline on open/content-change is
    // the legitimate case the lint rule can't tell apart from accidental
    // cascading renders — there's no way to know the right layout without
    // first rendering "solo" and measuring it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSummaryLayout({ mode: "solo" });
  }, [expanded, showCoverImage, coverImageStatus, summary]);

  useLayoutEffect(() => {
    if (summaryLayout.mode !== "solo" || !expanded || !showCoverImage || !summary) return;
    if (window.innerWidth <= 640) return; // mobile: photo isn't floated, "solo" is already correct
    const figure = coverFigureRef.current;
    const p = summaryMeasureRef.current;
    if (!figure || !p) return;
    const figureBottom = figure.getBoundingClientRect().bottom;
    const pBottom = p.getBoundingClientRect().bottom;
    if (pBottom <= figureBottom) {
      setSummaryLayout({ mode: "stretch", height: figure.getBoundingClientRect().height });
      return;
    }
    const splitIndex = findSummarySplitIndex(p, figureBottom);
    if (splitIndex > 0 && splitIndex < summary.length) {
      setSummaryLayout({ mode: "split", splitIndex });
    }
  }, [summaryLayout, expanded, showCoverImage, summary]);

  // Separate from the measurement effect above so the listener stays
  // attached after upgrading to "stretch"/"split" — a resize needs to
  // bounce back to "solo" first either way, to get a fresh baseline to
  // re-measure, which is what re-triggers the effect above.
  useEffect(() => {
    if (!expanded || !showCoverImage || !summary) return;
    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => setSummaryLayout({ mode: "solo" }), 150);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, [expanded, showCoverImage, summary]);

  const summaryParagraphStyle = { fontSize: "1.0625rem", lineHeight: 1.75, color: "var(--site-text)", whiteSpace: "pre-line" as const, margin: 0 };

  return (
    <>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {summary && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              padding: "0.75rem 1.125rem",
              borderRadius: "0.625rem",
              fontSize: "0.9375rem",
              fontWeight: 700,
              cursor: "pointer",
              border: "1.5px solid #315E9C",
              backgroundColor: "var(--site-surface)",
              color: "var(--site-text)",
            }}
          >
            <List size={18} color="#315E9C" />
            Resumo
            <ChevronDown size={16} style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
          </button>
        )}
        <TextToSpeechButton text={speechText} title={title} locale={locale} fill highlightRef={bodyRef} />
      </div>

      {videoEmbedUrl && (
        <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: "0.75rem", overflow: "hidden", marginBottom: "1.75rem" }}>
          <iframe
            src={videoEmbedUrl}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* The photo floats right inside the same flow as the summary AND the
          article text, so the copy wraps alongside it and then continues at
          full width once it clears the photo — the newspaper layout, rather
          than the photo sitting alone in its own isolated column. */}
      <div>
        {showCoverImage && (
          <figure
            ref={coverFigureRef}
            className="article-cover-figure"
            style={{ float: "right", width: "320px", margin: "0.25rem 0 1rem 1.75rem" }}
          >
            {coverImageStatus === "failed" ? (
              <div
                style={{
                  width: "100%",
                  aspectRatio: "4 / 3",
                  borderRadius: "0.625rem",
                  background: "linear-gradient(135deg, #0d1b2a, #1a1f3e)",
                }}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverImageSrc!}
                alt={coverImageCaption ?? title}
                style={{ width: "100%", height: "auto", borderRadius: "0.625rem", display: "block" }}
                onLoad={() => setCoverImageStatus("ok")}
                onError={() => {
                  setCoverImageStatus((status) => {
                    if (status === "retrying") return "failed";
                    // Cache-busted re-request — a fresh network attempt, not
                    // the same failed response served back from cache.
                    setCoverImageSrc(`${coverImage}${coverImage!.includes("?") ? "&" : "?"}retry=${Date.now()}`);
                    return "retrying";
                  });
                }}
              />
            )}
            {(coverImageCaption || coverImageCredit) && (
              <figcaption style={{ marginTop: "0.625rem", paddingLeft: "0.75rem", borderLeft: "2px solid #315E9C" }}>
                {coverImageCaption && (
                  <span style={{ display: "block", fontSize: "0.8125rem", color: "var(--site-text-secondary)", lineHeight: 1.45 }}>
                    {coverImageCaption}
                  </span>
                )}
                {coverImageCredit && (
                  <span style={{ display: "block", fontSize: "0.75rem", color: "var(--site-muted)", marginTop: "0.25rem" }}>
                    Imagem: {coverImageCredit}
                  </span>
                )}
              </figcaption>
            )}
          </figure>
        )}

        {summary && (
          <>
            <div className={`summary-box${expanded ? " summary-box-expanded" : ""}`}>
              <div className="summary-box-clip">
                <div
                  className={`summary-box-content${summaryLayout.mode === "split" ? " summary-box-content-top" : ""}`}
                  style={{
                    minHeight: summaryLayout.mode === "stretch" ? summaryLayout.height : undefined,
                    boxSizing: "border-box",
                  }}
                >
                  <p ref={summaryMeasureRef} style={summaryParagraphStyle}>
                    {summaryLayout.mode === "split" ? summary.slice(0, summaryLayout.splitIndex) : summary}
                  </p>
                </div>
              </div>
            </div>
            {summaryLayout.mode === "split" && (
              <div className={`summary-box summary-box-cleared${expanded ? " summary-box-expanded" : ""}`}>
                <div className="summary-box-clip">
                  <div className="summary-box-content summary-box-content-bottom">
                    <p style={summaryParagraphStyle}>{summary.slice(summaryLayout.splitIndex)}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div
          ref={bodyRef}
          style={{ fontSize: "1.0625rem", lineHeight: 1.85, color: "var(--site-text-secondary)", overflowWrap: "anywhere" }}
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />

        {aiDisclosure && (
          <section style={{ marginTop: "2.5rem", padding: "0 0.25rem", fontSize: "0.875rem", lineHeight: 1.6, color: "var(--site-muted)" }}>
            <div style={{ fontWeight: 700, color: "var(--site-text)", marginBottom: "0.25rem" }}>
              {aiDisclosure.title}
            </div>
            <p style={{ margin: 0, fontStyle: "italic" }}>{aiDisclosure.text}</p>
          </section>
        )}
        {sources && sources.length > 0 && (
          <section
            style={{
              marginTop: "1.5rem",
              backgroundColor: "rgba(49, 94, 156,0.05)",
              border: "1px solid rgba(49, 94, 156,0.15)",
              borderTop: "2px solid #315E9C",
              borderRadius: "0.75rem",
              padding: "1.25rem 1.5rem 1.5rem",
            }}
          >
            <h2 style={{ fontSize: "1rem", fontWeight: 800, textTransform: "uppercase", color: "var(--site-text)", marginBottom: "0.875rem" }}>
              Fontes:
            </h2>
            <ul style={{ paddingLeft: "1.25rem", margin: 0, listStyle: "disc", display: "flex", flexDirection: "column", gap: "0.625rem", fontSize: "0.9rem", lineHeight: 1.6, color: "var(--site-muted)" }}>
              {sources.map((source, index) => (
                <li key={index}>
                  {source.url ? (
                    <a href={source.url} target="_blank" rel="noopener noreferrer" style={{ color: "#315E9C", textDecoration: "underline", wordBreak: "break-word" }}>
                      {source.label}
                    </a>
                  ) : (
                    source.label
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div style={{ clear: "both" }} />
      </div>

      {lightbox}

      <style>{`
        .tts-word { transition: background-color 0.1s ease, color 0.1s ease; border-radius: 0.2em; }
        .tts-active-word { background-color: rgba(49, 94, 156, 0.18); color: var(--site-text); }
        @media (max-width: 640px) {
          .article-cover-figure { float: none !important; width: 100% !important; margin-left: 0 !important; }
          /* A width the columnist picked for a wide desktop column reads as
             tiny on an already-narrow phone screen — full width on mobile,
             with the lightbox above as the way to see original detail. */
          .article-img-figure { width: 100% !important; }
        }
        /* Animates from 0 to its natural content height with no JS height
           measuring: a single-row grid with height:auto on the container
           resolves 1fr against the row's max-content size, so "0fr -> 1fr"
           genuinely tweens 0 -> auto. The overflow:hidden wrapper just below
           clips the content while the row is shorter than it. */
        .summary-box {
          display: grid;
          grid-template-rows: 0fr;
          opacity: 0;
          transition: grid-template-rows 0.35s ease, opacity 0.25s ease;
        }
        /* Part two of a split summary (see "split" mode above): without
           this, a grid container avoids the floated photo for its whole
           height even though this box only starts once the photo has
           already ended -- clear forces it below the float so its width
           resolves full-width instead of narrow again. */
        .summary-box-cleared {
          clear: right;
        }
        .summary-box-expanded {
          grid-template-rows: 1fr;
          opacity: 1;
        }
        .summary-box-clip {
          overflow: hidden;
          min-height: 0;
        }
        .summary-box-content {
          background-color: rgba(49, 94, 156, 0.07);
          border-left: 4px solid #315E9C;
          border-radius: 0 0.625rem 0.625rem 0;
          padding: 1.25rem 1.5rem;
          margin-bottom: 1.5rem;
        }
        /* Split mode: two cards reading as one continuous one -- part one
           (still narrow, still avoiding the photo) loses its bottom
           rounding and margin so it butts straight into part two, which
           picks the rounding back up at the bottom. */
        .summary-box-content-top {
          border-radius: 0 0.625rem 0 0;
          margin-bottom: 0;
        }
        .summary-box-content-bottom {
          border-radius: 0 0 0.625rem 0.625rem;
        }
      `}</style>
    </>
  );
}
