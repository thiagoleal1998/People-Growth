"use client";

import { useState } from "react";
import { List, ChevronDown } from "lucide-react";
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
  const [expanded, setExpanded] = useState(false);

  // A video is already the article's main visual (rendered further down),
  // so the cover photo only shows here — beside the summary, or on its
  // own — when there's no video competing for that same spot.
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
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
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

      {/* The photo always shows here (when there's no video) — it's not
          part of what the Resumo toggle hides. It floats right so the
          summary text, when open, wraps beside it in one flow rather than
          sitting in a rigid independent column. */}
      {(showCoverImage || (summary && expanded)) && (
        <div style={{ marginTop: "1.25rem", overflow: "hidden" }}>
          {showCoverImage && (
            <div className="article-top-matter-photo" style={{ float: "right", width: "300px", marginLeft: "1.5rem", marginBottom: "0.75rem" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImage!}
                alt={coverImageCaption ?? title}
                style={{ width: "100%", borderRadius: "0.625rem", display: "block", objectFit: "cover", aspectRatio: "4/3" }}
              />
              {(coverImageCaption || coverImageCredit) && (
                <div style={{ marginTop: "0.5rem" }}>
                  {coverImageCaption && <p style={{ fontSize: "0.8125rem", color: "var(--site-text-secondary)", margin: 0, lineHeight: 1.4 }}>{coverImageCaption}</p>}
                  {coverImageCredit && <p style={{ fontSize: "0.75rem", color: "var(--site-muted)", margin: "0.125rem 0 0" }}>Imagem: {coverImageCredit}</p>}
                </div>
              )}
            </div>
          )}

          {summary && expanded && (
            <p style={{ fontSize: "1.0625rem", lineHeight: 1.75, color: "var(--site-text)", whiteSpace: "pre-line", margin: 0 }}>
              {summary}
            </p>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .article-top-matter-photo { float: none !important; width: 100% !important; margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
