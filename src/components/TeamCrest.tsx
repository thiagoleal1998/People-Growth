"use client";

import { useState } from "react";

// `src` should already be the best known-reliable logo url by the time it
// gets here — see withReliableCrests in sports.ts, which swaps a fixture's
// own API-Football logo (media.api-sports.io, confirmed live to fail DNS
// on at least one real network) for the scraped equivalent
// (cdn.api-futebol.com.br) server-side, before the page is even sent. This
// component's onError->placeholder is just the last-resort safety net for
// whatever's left over (no scraped match existed, or even the reliable
// source has a genuine one-off hiccup) — needs client state, so this is its
// own small client component, shared by both the home widget (already
// client) and FixtureRow on /esportes (a Server Component that couldn't
// otherwise handle an image load failure itself).
export function TeamCrest({ src, alt, size = 44 }: { src: string | null; alt: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  if (!showImage) {
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
      src={src}
      alt={alt}
      title={alt}
      width={size}
      height={size}
      style={{ objectFit: "contain", flexShrink: 0 }}
      onError={() => setFailed(true)}
    />
  );
}
