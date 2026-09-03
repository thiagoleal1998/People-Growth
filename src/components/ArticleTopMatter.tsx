"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { TextToSpeechButton } from "./TextToSpeechButton";

type Props = {
  title: string;
  summary: string | null;
  speechText: string;
  coverImage: string | null;
  coverImageCaption: string | null;
  coverImageCredit: string | null;
  hasVideo: boolean;
};

export function ArticleTopMatter({ title, summary, speechText, coverImage, coverImageCaption, coverImageCredit, hasVideo }: Props) {
  const [expanded, setExpanded] = useState(true);

  // A video is already the article's main visual (rendered further down),
  // so the cover photo only shows here — beside the summary, or full width
  // on its own — when there's no video competing for that same spot.
  const showCoverImage = Boolean(coverImage) && !hasVideo;

  if (!summary && !showCoverImage) {
    return (
      <div style={{ marginBottom: "1.75rem" }}>
        <TextToSpeechButton text={speechText} title={title} />
      </div>
    );
  }

  return (
    <div style={{ marginBottom: "1.75rem" }}>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: summary ? "1rem" : "0" }}>
        {summary && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.625rem 1.125rem",
              borderRadius: "9999px",
              border: "1px solid var(--site-border-strong)",
              backgroundColor: "var(--site-surface)",
              color: "var(--site-text)",
              fontSize: "0.875rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Resumo
            <ChevronDown size={15} style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
          </button>
        )}
        <TextToSpeechButton text={speechText} title={title} />
      </div>

      {(summary && expanded) || (showCoverImage && !summary) ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: summary && showCoverImage ? "1fr 320px" : "1fr",
            gap: "1.5rem",
            alignItems: "start",
          }}
          className="article-top-matter-grid"
        >
          {summary && expanded && (
            <div style={{ backgroundColor: "var(--site-surface-alt)", borderRadius: "0.75rem", padding: "1.25rem 1.5rem" }}>
              <p style={{ fontSize: "1rem", lineHeight: 1.75, color: "var(--site-text-secondary)", whiteSpace: "pre-line", margin: 0 }}>
                {summary}
              </p>
            </div>
          )}

          {showCoverImage && (
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImage!}
                alt={coverImageCaption ?? title}
                style={{ width: "100%", borderRadius: "0.75rem", display: "block", objectFit: "cover", aspectRatio: "4/3" }}
              />
              {(coverImageCaption || coverImageCredit) && (
                <div style={{ marginTop: "0.5rem", paddingLeft: "0.625rem", borderLeft: "2px solid var(--site-border-strong)" }}>
                  {coverImageCaption && <p style={{ fontSize: "0.8125rem", color: "var(--site-text-secondary)", margin: 0 }}>{coverImageCaption}</p>}
                  {coverImageCredit && <p style={{ fontSize: "0.75rem", color: "var(--site-muted)", margin: "0.125rem 0 0" }}>Imagem: {coverImageCredit}</p>}
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}

      <style>{`
        @media (max-width: 640px) {
          .article-top-matter-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
