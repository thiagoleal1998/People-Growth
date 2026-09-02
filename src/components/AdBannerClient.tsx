"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getVisitorId } from "@/lib/visitor";
import type { Ad } from "@/types/database.types";

export function AdBannerClient({ ad, style }: { ad: Ad; style?: React.CSSProperties }) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const firedRef = useRef(false);
  const pathname = usePathname();

  function track(eventType: "impression" | "click") {
    fetch("/api/track/ad", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adId: ad.id, slotKey: ad.slot_key, eventType, path: pathname, visitorId: getVisitorId() }),
      keepalive: true,
    }).catch(() => {});
  }

  useEffect(() => {
    firedRef.current = false;
    const el = linkRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !firedRef.current) {
          firedRef.current = true;
          track("impression");
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ad.id, pathname]);

  return (
    <a
      ref={linkRef}
      href={ad.link_url || "#"}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={() => track("click")}
      style={{ display: "block", textDecoration: "none", ...style }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={ad.image_url!} alt={ad.alt_text || "Publicidade"} style={{ width: "100%", height: "auto", display: "block", borderRadius: "0.5rem" }} />
      <div style={{ fontSize: "0.6875rem", color: "var(--site-faint)", textAlign: "center", marginTop: "0.25rem" }}>Publicidade</div>
    </a>
  );
}
