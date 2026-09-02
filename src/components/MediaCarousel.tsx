"use client";

import { useEffect, useState } from "react";
import { Mic, Video, BookOpen, Headphones, Calendar, ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import type { MediaItem } from "@/types/database.types";

const mediaTypeMeta: Record<MediaItem["type"], { icon: LucideIcon; color: string }> = {
  interview: { icon: Mic, color: "#4361EE" },
  event: { icon: Video, color: "#06D6A0" },
  article: { icon: BookOpen, color: "#FFB703" },
  podcast: { icon: Headphones, color: "#4361EE" },
};

const VISIBLE = 3;
const INTERVAL_MS = 5000;

export function MediaCarousel({ items }: { items: MediaItem[] }) {
  const [start, setStart] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (items.length <= VISIBLE || paused) return;
    const id = setTimeout(() => {
      setStart((s) => (s + 1) % items.length);
    }, INTERVAL_MS);
    return () => clearTimeout(id);
  }, [start, items.length, paused]);

  const goPrev = () => setStart((s) => (s - 1 + items.length) % items.length);
  const goNext = () => setStart((s) => (s + 1) % items.length);

  const count = Math.min(VISIBLE, items.length);
  const visibleItems = Array.from({ length: count }, (_, i) => items[(start + i) % items.length]);

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem" }}>
        {visibleItems.map((item) => {
          const meta = mediaTypeMeta[item.type];
          const Icon = meta.icon;
          const card = (
            <div
              className="hover-card media-fade"
              style={{ backgroundColor: "var(--site-card)", borderRadius: "1rem", padding: "1.5rem", border: "1px solid var(--site-border)", display: "flex", gap: "1rem", height: "100%" }}
            >
              <div
                style={{
                  width: "2.75rem",
                  height: "2.75rem",
                  borderRadius: "0.75rem",
                  flexShrink: 0,
                  background: item.thumbnail ? `url(${item.thumbnail}) center/cover` : `${meta.color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {!item.thumbnail && <Icon size={18} color={meta.color} />}
              </div>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--site-text)", lineHeight: 1.4, marginBottom: "0.375rem" }}>{item.title}</h3>
                {item.outlet && <div style={{ color: "var(--site-muted)", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.25rem" }}>{item.outlet}</div>}
                {item.date && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--site-faint)", fontSize: "0.75rem" }}>
                    <Calendar size={12} /> {new Date(item.date).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
                  </div>
                )}
              </div>
            </div>
          );
          return item.url ? (
            <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              {card}
            </a>
          ) : (
            <div key={item.id}>{card}</div>
          );
        })}
      </div>

      {items.length > VISIBLE && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", marginTop: "1.5rem" }}>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Menção anterior"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2.25rem", height: "2.25rem", borderRadius: "50%", border: "1px solid var(--site-border-strong)", backgroundColor: "var(--site-card)", color: "#4361EE", cursor: "pointer" }}
          >
            <ChevronLeft size={18} />
          </button>

          <div style={{ display: "flex", gap: "0.375rem" }}>
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setStart(i)}
                aria-label={`Ir para a menção ${i + 1}`}
                style={{
                  width: "0.5rem",
                  height: "0.5rem",
                  borderRadius: "50%",
                  border: "none",
                  padding: 0,
                  backgroundColor: i === start ? "#4361EE" : "var(--site-border-strong)",
                  cursor: "pointer",
                  transition: "background-color 0.3s",
                }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={goNext}
            aria-label="Próxima menção"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2.25rem", height: "2.25rem", borderRadius: "50%", border: "1px solid var(--site-border-strong)", backgroundColor: "var(--site-card)", color: "#4361EE", cursor: "pointer" }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      <style>{`
        .media-fade { animation: mediaFadeIn 0.5s ease; }
        @keyframes mediaFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
