"use client";

import { useEffect, useState } from "react";
import { ThumbsUp, CornerDownRight, Flag, ChevronDown, ChevronUp } from "lucide-react";
import { CommentForm } from "./CommentForm";
import { timeAgo } from "@/lib/time-ago";
import type { Comment } from "@/types/database.types";

function hasStoredId(key: string, id: string): boolean {
  try {
    const arr = JSON.parse(localStorage.getItem(key) ?? "[]") as string[];
    return arr.includes(id);
  } catch {
    return false;
  }
}

function addStoredId(key: string, id: string) {
  try {
    const arr = JSON.parse(localStorage.getItem(key) ?? "[]") as string[];
    if (!arr.includes(id)) localStorage.setItem(key, JSON.stringify([...arr, id]));
  } catch {
    // localStorage unavailable — like/report still works, just not deduped locally
  }
}

function LikeButton({ commentId, initialLikes }: { commentId: string; initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLiked(hasStoredId("liked-comments", commentId));
  }, [commentId]);

  async function handleLike() {
    if (liked) return;
    setLiked(true);
    setLikes((n) => n + 1);
    addStoredId("liked-comments", commentId);
    try {
      const res = await fetch(`/api/comments/${commentId}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.likes === "number") setLikes(data.likes);
      }
    } catch {
      // optimistic count stands even if the network call fails
    }
  }

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={liked}
      style={{ display: "flex", alignItems: "center", gap: "0.375rem", background: "none", border: "none", color: liked ? "#4361EE" : "var(--site-muted)", fontSize: "0.8125rem", fontWeight: 600, cursor: liked ? "default" : "pointer", padding: 0 }}
    >
      <ThumbsUp size={14} fill={liked ? "#4361EE" : "none"} /> {likes > 0 ? likes : ""}
    </button>
  );
}

function ReportButton({ commentId }: { commentId: string }) {
  const [reported, setReported] = useState(false);

  useEffect(() => {
    setReported(hasStoredId("reported-comments", commentId));
  }, [commentId]);

  async function handleReport() {
    if (reported) return;
    setReported(true);
    addStoredId("reported-comments", commentId);
    try {
      await fetch(`/api/comments/${commentId}/report`, { method: "POST" });
    } catch {
      // report was recorded locally; a failed network call isn't worth surfacing
    }
  }

  return (
    <button
      type="button"
      onClick={handleReport}
      disabled={reported}
      style={{ display: "flex", alignItems: "center", gap: "0.375rem", background: "none", border: "none", color: reported ? "#dc2626" : "var(--site-muted)", fontSize: "0.8125rem", fontWeight: 600, cursor: reported ? "default" : "pointer", padding: 0 }}
    >
      <Flag size={14} fill={reported ? "#dc2626" : "none"} /> {reported ? "Denunciado" : "Denunciar"}
    </button>
  );
}

function CommentCard({
  comment,
  articleId,
  replies,
  isReply = false,
}: {
  comment: Comment;
  articleId: string;
  replies: Comment[];
  isReply?: boolean;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [repliesOpen, setRepliesOpen] = useState(false);

  return (
    <div
      style={{
        backgroundColor: isReply ? "var(--site-bg)" : "var(--site-surface-alt)",
        border: isReply ? "1px solid var(--site-border)" : "none",
        borderRadius: "0.875rem",
        padding: "1.25rem 1.5rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--site-text)" }}>{comment.name}</span>
        <span style={{ fontSize: "0.75rem", color: "var(--site-faint)" }} suppressHydrationWarning>
          {timeAgo(comment.created_at)}
        </span>
      </div>
      <p style={{ color: "var(--site-text-secondary)", fontSize: "0.9375rem", lineHeight: 1.65, whiteSpace: "pre-line", marginBottom: "0.875rem" }}>
        {comment.body}
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
        <LikeButton commentId={comment.id} initialLikes={comment.likes} />
        {!isReply && (
          <button
            type="button"
            onClick={() => setReplyOpen((o) => !o)}
            style={{ display: "flex", alignItems: "center", gap: "0.375rem", background: "none", border: "none", color: "var(--site-muted)", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer", padding: 0 }}
          >
            <CornerDownRight size={14} /> Responder
          </button>
        )}
        <ReportButton commentId={comment.id} />
      </div>

      {replyOpen && (
        <div style={{ marginTop: "1rem" }}>
          <CommentForm articleId={articleId} parentId={comment.id} compact onCancel={() => setReplyOpen(false)} />
        </div>
      )}

      {!isReply && replies.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <button
            type="button"
            onClick={() => setRepliesOpen((o) => !o)}
            style={{ display: "flex", alignItems: "center", gap: "0.375rem", background: "none", border: "none", color: "#4361EE", fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer", padding: 0 }}
          >
            {replies.length} resposta{replies.length === 1 ? "" : "s"}
            {repliesOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {repliesOpen && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.875rem", paddingLeft: "1.5rem", borderLeft: "2px solid var(--site-border)" }}>
              {replies.map((reply) => (
                <CommentCard key={reply.id} comment={reply} articleId={articleId} replies={[]} isReply />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Comments({ articleId, comments }: { articleId: string; comments: Comment[] }) {
  const topLevel = comments.filter((c) => !c.parent_id);
  const repliesByParent = new Map<string, Comment[]>();
  for (const c of comments) {
    if (!c.parent_id) continue;
    const list = repliesByParent.get(c.parent_id) ?? [];
    list.push(c);
    repliesByParent.set(c.parent_id, list);
  }
  for (const list of repliesByParent.values()) {
    list.sort((a, b) => a.created_at.localeCompare(b.created_at));
  }

  return (
    <>
      {topLevel.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "2rem" }}>
          {topLevel.map((comment) => (
            <CommentCard key={comment.id} comment={comment} articleId={articleId} replies={repliesByParent.get(comment.id) ?? []} />
          ))}
        </div>
      )}
      <CommentForm articleId={articleId} />
    </>
  );
}
