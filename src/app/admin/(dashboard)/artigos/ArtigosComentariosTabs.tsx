"use client";

import { useState } from "react";
import { ArticlesTabs } from "./ArticlesTabs";
import { CommentsClient } from "../comentarios/CommentsClient";
import type { Article, Comment } from "@/types/database.types";

const outerTabs = [
  { id: "artigos", label: "Artigos" },
  { id: "comentarios", label: "Comentários" },
] as const;

type OuterTabId = (typeof outerTabs)[number]["id"];

export function ArtigosComentariosTabs({
  articles,
  currentAuthorId,
  comments,
  articleTitles,
  initialTab,
}: {
  articles: Article[];
  currentAuthorId: string | null;
  comments: Comment[];
  articleTitles: Record<string, string>;
  initialTab?: string;
}) {
  const [active, setActive] = useState<OuterTabId>(initialTab === "comentarios" ? "comentarios" : "artigos");
  const pendingComments = comments.filter((c) => c.status === "pending").length;

  return (
    <div>
      <div style={{ display: "flex", gap: "0.25rem", borderBottom: "1px solid var(--admin-border)", marginBottom: "1.25rem" }}>
        {outerTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.875rem 1.5rem",
              fontSize: "0.9375rem",
              fontWeight: 800,
              color: active === tab.id ? "#315E9C" : "var(--admin-muted)",
              background: "none",
              border: "none",
              borderBottom: active === tab.id ? "2.5px solid #315E9C" : "2.5px solid transparent",
              cursor: "pointer",
              marginBottom: "-1px",
            }}
          >
            {tab.label}
            {tab.id === "comentarios" && pendingComments > 0 && (
              <span
                style={{
                  backgroundColor: "#dc2626",
                  color: "white",
                  fontSize: "0.6875rem",
                  fontWeight: 800,
                  minWidth: "1.125rem",
                  height: "1.125rem",
                  borderRadius: "9999px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 0.3rem",
                }}
              >
                {pendingComments > 99 ? "99+" : pendingComments}
              </span>
            )}
          </button>
        ))}
      </div>

      {active === "artigos" ? (
        <ArticlesTabs articles={articles} currentAuthorId={currentAuthorId} />
      ) : (
        <CommentsClient comments={comments} articleTitles={articleTitles} />
      )}
    </div>
  );
}
