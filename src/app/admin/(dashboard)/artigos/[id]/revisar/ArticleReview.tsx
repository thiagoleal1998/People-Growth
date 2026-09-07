"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, MessageSquareWarning, Edit, X, Loader2 } from "lucide-react";
import { ArticlePreviewFrame } from "@/components/ArticlePreviewFrame";
import { alertDialog, confirmDialog } from "@/components/admin/dialog-store";
import { publishArticle, approveAndSchedule, requestChanges } from "../../actions";
import type { Article, Author, Category } from "@/types/database.types";

type Annotation = { id: string; quote: string; note: string };
type Popover = { id: string; x: number; y: number; quote: string };

const cardStyle: React.CSSProperties = {
  backgroundColor: "var(--admin-surface)",
  border: "1px solid var(--admin-border)",
  borderRadius: "1rem",
  padding: "1.25rem",
};

/** A single page to actually review a pending article: read it rendered
 * exactly as it'll ship (same ArticlePreviewFrame the public preview
 * uses), select any passage to attach a note about it, and either approve
 * or send the compiled notes back to the author — no bouncing between the
 * list, a separate preview tab, and a bare prompt() for feedback. */
export function ArticleReview({ article, author, category }: { article: Article; author: Author | null; category: Category | null }) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [popover, setPopover] = useState<Popover | null>(null);
  const [noteText, setNoteText] = useState("");
  const [pending, startTransition] = useTransition();

  // Removes a <mark> previously inserted by surroundContents while keeping
  // its text in place — used both for a cancelled (never confirmed)
  // selection and for an annotation the admin later deletes from the list.
  function unwrapMark(id: string) {
    const mark = containerRef.current?.querySelector<HTMLElement>(`mark[data-annotation-id="${id}"]`);
    if (!mark || !mark.parentNode) return;
    const parent = mark.parentNode;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
    parent.normalize();
  }

  function handleMouseUp() {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !containerRef.current) return;
    const text = selection.toString().trim();
    if (!text) return;
    const range = selection.getRangeAt(0);
    if (!containerRef.current.contains(range.commonAncestorContainer)) return;
    // A previous selection whose popover was left open without being
    // confirmed shouldn't stay highlighted once a new one is made.
    if (popover) unwrapMark(popover.id);
    const rect = range.getBoundingClientRect();
    const id = crypto.randomUUID();
    // Highlight immediately, before the note is even typed — otherwise the
    // native browser selection (the only thing marking which text was
    // picked) disappears the moment focus moves into the popover's
    // textarea, and there's no way to tell what's being commented on.
    // surroundContents throws if the selection crosses element boundaries
    // (e.g. spans two paragraphs); the annotation is still recorded either
    // way, just without the highlight in that case.
    try {
      const mark = document.createElement("mark");
      mark.dataset.annotationId = id;
      mark.style.backgroundColor = "rgba(255,183,3,0.45)";
      mark.style.borderRadius = "0.2rem";
      mark.style.boxShadow = "0 0 0 2px rgba(255,183,3,0.45)";
      range.surroundContents(mark);
    } catch {
      // selection spanned multiple elements — skip the highlight, keep the note
    }
    window.getSelection()?.removeAllRanges();
    setPopover({ id, x: rect.left + rect.width / 2, y: rect.bottom + 8, quote: text });
    setNoteText("");
  }

  function addAnnotation() {
    if (!popover || !noteText.trim()) return;
    setAnnotations((prev) => [...prev, { id: popover.id, quote: popover.quote, note: noteText.trim() }]);
    setPopover(null);
  }

  function cancelPopover() {
    if (popover) unwrapMark(popover.id);
    setPopover(null);
  }

  function removeAnnotation(id: string) {
    unwrapMark(id);
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
  }

  function buildFeedback(): string {
    return annotations.map((a) => `Trecho: "${a.quote}"\n→ ${a.note}`).join("\n\n");
  }

  async function handleRequestChanges() {
    const feedback = buildFeedback();
    if (!feedback.trim()) {
      await alertDialog("Selecione um trecho do artigo e adicione um comentário antes de solicitar alterações.");
      return;
    }
    startTransition(async () => {
      try {
        await requestChanges(article.id, feedback);
        router.push("/admin/artigos");
      } catch (err) {
        await alertDialog(err instanceof Error ? err.message : "Erro ao solicitar alterações.");
      }
    });
  }

  async function handleApprove() {
    const willSchedule = Boolean(article.scheduled_for);
    const ok = await confirmDialog(
      willSchedule ? "Aprovar e agendar este artigo para a data pedida pelo autor?" : "Aprovar e publicar este artigo agora?",
      { confirmText: "Aprovar" }
    );
    if (!ok) return;
    startTransition(async () => {
      try {
        if (willSchedule) await approveAndSchedule(article.id);
        else await publishArticle(article.id);
        router.push("/admin/artigos");
      } catch (err) {
        await alertDialog(err instanceof Error ? err.message : "Erro ao aprovar o artigo.");
      }
    });
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", alignItems: "start" }} className="review-grid">
      <div>
        <Link
          href="/admin/artigos"
          style={{ color: "var(--admin-muted)", fontSize: "0.875rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.375rem", marginBottom: "1.25rem" }}
        >
          <ArrowLeft size={14} /> Voltar para a lista
        </Link>
        <div ref={containerRef} onMouseUp={handleMouseUp}>
          <ArticlePreviewFrame article={article} author={author} category={category} />
        </div>
      </div>

      <div style={{ position: "sticky", top: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={cardStyle}>
          <p style={{ margin: 0, fontSize: "0.8125rem", fontWeight: 700, color: "var(--admin-text)", marginBottom: "0.375rem" }}>Como revisar</p>
          <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--admin-muted)", lineHeight: 1.5 }}>
            Selecione um trecho do texto ao lado para comentar sobre ele. As anotações viram a lista de pedidos de alteração enviada ao autor.
          </p>
        </div>

        <div style={cardStyle}>
          <p style={{ margin: "0 0 0.75rem", fontSize: "0.8125rem", fontWeight: 700, color: "var(--admin-text)" }}>
            Anotações {annotations.length > 0 && `(${annotations.length})`}
          </p>
          {annotations.length === 0 ? (
            <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--admin-faint)" }}>Nenhuma anotação ainda.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {annotations.map((a) => (
                <div key={a.id} style={{ borderLeft: "3px solid #cc9200", paddingLeft: "0.625rem", position: "relative" }}>
                  <button
                    type="button"
                    onClick={() => removeAnnotation(a.id)}
                    title="Remover anotação"
                    style={{ position: "absolute", top: 0, right: 0, background: "none", border: "none", color: "var(--admin-faint)", cursor: "pointer", padding: "0.125rem" }}
                  >
                    <X size={13} />
                  </button>
                  <p style={{ margin: "0 1.25rem 0.25rem 0", fontSize: "0.75rem", fontStyle: "italic", color: "var(--admin-muted)" }}>&ldquo;{a.quote}&rdquo;</p>
                  <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--admin-text)" }}>{a.note}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          <button
            type="button"
            onClick={handleApprove}
            disabled={pending}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.125rem",
              borderRadius: "0.625rem",
              border: "none",
              backgroundColor: "#04a87d",
              color: "white",
              fontWeight: 700,
              fontSize: "0.875rem",
              cursor: pending ? "default" : "pointer",
              opacity: pending ? 0.7 : 1,
            }}
          >
            {pending ? <Loader2 size={16} className="admin-spin" /> : <Check size={16} />}
            {article.scheduled_for ? "Aprovar e agendar" : "Aprovar e publicar"}
          </button>
          <button
            type="button"
            onClick={handleRequestChanges}
            disabled={pending}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.125rem",
              borderRadius: "0.625rem",
              border: "none",
              backgroundColor: "rgba(239,68,68,0.1)",
              color: "#dc2626",
              fontWeight: 700,
              fontSize: "0.875rem",
              cursor: pending ? "default" : "pointer",
              opacity: pending ? 0.7 : 1,
            }}
          >
            {pending ? <Loader2 size={16} className="admin-spin" /> : <MessageSquareWarning size={16} />}
            Enviar alterações{annotations.length > 0 ? ` (${annotations.length})` : ""}
          </button>
          <Link
            href={`/admin/artigos/${article.id}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.125rem",
              borderRadius: "0.625rem",
              border: "1px solid var(--admin-border-strong)",
              backgroundColor: "var(--admin-surface)",
              color: "var(--admin-text)",
              fontWeight: 700,
              fontSize: "0.875rem",
              textDecoration: "none",
            }}
          >
            <Edit size={16} /> Editar artigo diretamente
          </Link>
        </div>
      </div>

      {popover && (
        <div
          style={{
            position: "fixed",
            left: Math.max(8, popover.x - 130),
            top: popover.y,
            zIndex: 1000,
            width: "260px",
            backgroundColor: "var(--admin-surface)",
            border: "1px solid var(--admin-border-strong)",
            borderRadius: "0.75rem",
            padding: "0.75rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          }}
        >
          <textarea
            autoFocus
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="O que precisa mudar nesse trecho?"
            rows={3}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "0.5rem",
              border: "1px solid var(--admin-border-strong)",
              fontSize: "0.8125rem",
              fontFamily: "inherit",
              boxSizing: "border-box",
              resize: "vertical",
              backgroundColor: "var(--admin-surface)",
              color: "var(--admin-text)",
            }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
            <button
              type="button"
              onClick={cancelPopover}
              style={{ padding: "0.375rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--admin-border-strong)", background: "none", color: "var(--admin-text)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={addAnnotation}
              disabled={!noteText.trim()}
              style={{ padding: "0.375rem 0.75rem", borderRadius: "0.5rem", border: "none", backgroundColor: "#4361EE", color: "white", fontSize: "0.75rem", fontWeight: 700, cursor: noteText.trim() ? "pointer" : "default", opacity: noteText.trim() ? 1 : 0.6 }}
            >
              Adicionar
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .review-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
