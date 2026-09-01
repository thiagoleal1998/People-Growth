"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Author } from "@/types/database.types";

type Milestone = { year: string; label: string };

const founderMilestones: Record<string, Milestone[]> = {
  "Thiago Leal": [
    { year: "2022", label: "Fundou a People & Growth" },
    { year: "2024", label: "Fundou a Neuro Botics" },
  ],
};

function paragraphs(text: string | null) {
  return (text ?? "")
    .split(/\r?\n\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function FounderCard({ author }: { author: Author }) {
  const [open, setOpen] = useState(false);
  const bioParagraphs = paragraphs(author.bio_pt);
  const milestones = founderMilestones[author.name];

  return (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      style={{
        textAlign: "left",
        width: "100%",
        cursor: "pointer",
        backgroundColor: "#f0f4f8",
        borderRadius: "1rem",
        padding: "1.25rem",
        border: "1px solid rgba(0,0,0,0.05)",
        font: "inherit",
        color: "inherit",
      }}
    >
      <div style={{ display: "flex", gap: "0.875rem", alignItems: "center" }}>
        <div
          style={{
            width: "3.5rem",
            height: "3.5rem",
            borderRadius: "50%",
            flexShrink: 0,
            background: author.photo_url
              ? `url(${author.photo_url}) center/cover`
              : "linear-gradient(135deg, #4361EE, #06D6A0)",
          }}
        />
        <div>
          <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#0d1b2a" }}>{author.name}</h3>
          {author.role_pt && (
            <div style={{ color: "#4361EE", fontWeight: 600, fontSize: "0.8125rem", marginTop: "0.125rem" }}>
              {author.role_pt}
            </div>
          )}
        </div>
      </div>

      {!open && author.tagline_pt && (
        <p
          style={{
            color: "#475569",
            fontSize: "0.875rem",
            lineHeight: 1.6,
            marginTop: "0.875rem",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {author.tagline_pt}
        </p>
      )}

      {open && (
        <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {milestones?.map((m) => (
            <div key={m.year} style={{ display: "flex", gap: "0.625rem", alignItems: "baseline" }}>
              <span
                style={{
                  color: "#4361EE",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  backgroundColor: "rgba(67,97,238,0.1)",
                  padding: "0.0625rem 0.5rem",
                  borderRadius: "9999px",
                  flexShrink: 0,
                }}
              >
                {m.year}
              </span>
              <span style={{ color: "#475569", fontSize: "0.875rem" }}>{m.label}</span>
            </div>
          ))}
          {bioParagraphs.map((p, i) => (
            <p key={i} style={{ color: "#475569", fontSize: "0.875rem", lineHeight: 1.65 }}>
              {p}
            </p>
          ))}
        </div>
      )}

      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.25rem",
          marginTop: "0.875rem",
          fontSize: "0.8125rem",
          fontWeight: 700,
          color: "#4361EE",
        }}
      >
        {open ? "Ver menos" : "Ver trajetória"}
        <ChevronDown size={14} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
      </div>
    </button>
  );
}
