"use client";

import { useState } from "react";

// Three-stage fallback: the fixture's own logo (often API-Football's
// media.api-sports.io), then a second source if one's given (usually the
// scraped standings' cdn.api-futebol.com.br logo — a different domain, so
// a DNS/CDN problem with one doesn't take down the other), then a plain
// gradient circle. Needs client state (onError swapping the src) so this
// is its own small client component, shared by both the home widget
// (already client) and FixtureRow on /esportes (a Server Component that
// couldn't otherwise handle image load failures itself).
export function TeamCrest({
  src,
  fallbackSrc,
  alt,
  size = 44,
}: {
  src: string | null;
  fallbackSrc?: string | null;
  alt: string;
  size?: number;
}) {
  const [stage, setStage] = useState<"primary" | "fallback" | "placeholder">(src ? "primary" : fallbackSrc ? "fallback" : "placeholder");
  const currentSrc = stage === "primary" ? src : stage === "fallback" ? fallbackSrc : null;

  if (!currentSrc) {
    return (
      <div
        style={{ width: size, height: size, flexShrink: 0, borderRadius: "50%", background: "linear-gradient(135deg, #4361EE, #06D6A0)" }}
        title={alt}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentSrc}
      alt={alt}
      title={alt}
      width={size}
      height={size}
      style={{ objectFit: "contain", flexShrink: 0 }}
      onError={() => setStage((s) => (s === "primary" && fallbackSrc ? "fallback" : "placeholder"))}
    />
  );
}
