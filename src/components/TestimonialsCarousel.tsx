"use client";

import { useEffect, useState } from "react";
import { Quote, Star } from "lucide-react";
import type { Testimonial } from "@/types/database.types";

const VISIBLE = 3;
const INTERVAL_MS = 5000;

export function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [start, setStart] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (testimonials.length <= VISIBLE || paused) return;
    const id = setInterval(() => {
      setStart((s) => (s + 1) % testimonials.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [testimonials.length, paused]);

  const count = Math.min(VISIBLE, testimonials.length);
  const items = Array.from({ length: count }, (_, i) => testimonials[(start + i) % testimonials.length]);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="hover-card testimonial-fade"
          style={{
            backgroundColor: "var(--site-card)",
            borderRadius: "1.25rem",
            padding: "1.75rem",
            border: "1px solid var(--site-border)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Quote size={22} color="#4361EE" style={{ marginBottom: "0.75rem", opacity: 0.5 }} />
          {item.rating && (
            <div style={{ display: "flex", gap: "0.125rem", marginBottom: "0.75rem" }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} color="#FFB703" fill={i < item.rating! ? "#FFB703" : "none"} />
              ))}
            </div>
          )}
          <p style={{ color: "var(--site-text-secondary)", fontSize: "0.9375rem", lineHeight: 1.7, marginBottom: "1.25rem", flex: 1 }}>
            &ldquo;{item.text_pt}&rdquo;
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "2.75rem",
                height: "2.75rem",
                borderRadius: "50%",
                flexShrink: 0,
                background: item.avatar_url ? `url(${item.avatar_url}) center/cover` : "linear-gradient(135deg, #4361EE, #06D6A0)",
              }}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--site-text)" }}>{item.name}</div>
              {(item.role || item.company) && (
                <div style={{ fontSize: "0.8125rem", color: "var(--site-muted)" }}>
                  {[item.role, item.company].filter(Boolean).join(" · ")}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {testimonials.length > VISIBLE && (
        <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "center", gap: "0.375rem", marginTop: "0.5rem" }}>
          {testimonials.map((t, i) => (
            <span
              key={t.id}
              style={{
                width: "0.5rem",
                height: "0.5rem",
                borderRadius: "50%",
                backgroundColor: i === start ? "#4361EE" : "var(--site-border-strong)",
                transition: "background-color 0.3s",
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        .testimonial-fade { animation: testimonialFadeIn 0.5s ease; }
        @keyframes testimonialFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
