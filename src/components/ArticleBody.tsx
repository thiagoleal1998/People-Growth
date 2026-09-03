"use client";

import { useState } from "react";
import { List, ChevronDown } from "lucide-react";
import { TextToSpeechButton } from "./TextToSpeechButton";

type Props = {
  title: string;
  summary: string | null;
  speechText: string;
  bodyHtml: string;
  coverImage: string | null;
  coverImageCaption: string | null;
  coverImageCredit: string | null;
  videoEmbedUrl: string | null;
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
}: Props) {
  const [expanded, setExpanded] = useState(false);

  // A video is already the article's main visual, so the cover photo only
  // takes this spot when there's no video competing for it.
  const showCoverImage = Boolean(coverImage) && !videoEmbedUrl;

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
              border: "1.5px solid #4361EE",
              backgroundColor: "var(--site-surface)",
              color: "var(--site-text)",
            }}
          >
            <List size={18} color="#4361EE" />
            Resumo
            <ChevronDown size={16} style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
          </button>
        )}
        <TextToSpeechButton text={speechText} title={title} fill={!summary} />
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
          <figure className="article-cover-figure" style={{ float: "right", width: "320px", margin: "0.25rem 0 1rem 1.75rem" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImage!}
              alt={coverImageCaption ?? title}
              style={{ width: "100%", height: "auto", borderRadius: "0.625rem", display: "block" }}
            />
            {(coverImageCaption || coverImageCredit) && (
              <figcaption style={{ marginTop: "0.625rem", paddingLeft: "0.75rem", borderLeft: "2px solid #4361EE" }}>
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

        {summary && expanded && (
          <p style={{ fontSize: "1.0625rem", lineHeight: 1.75, color: "var(--site-text)", whiteSpace: "pre-line", margin: "0 0 1.5rem" }}>
            {summary}
          </p>
        )}

        <div
          style={{ fontSize: "1.0625rem", lineHeight: 1.85, color: "var(--site-text-secondary)" }}
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />

        <div style={{ clear: "both" }} />
      </div>

      <style>{`
        @media (max-width: 640px) {
          .article-cover-figure { float: none !important; width: 100% !important; margin-left: 0 !important; }
        }
      `}</style>
    </>
  );
}
