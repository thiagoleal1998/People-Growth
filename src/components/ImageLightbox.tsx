"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

/** Tap-to-enlarge for any container that renders markdown-lite HTML via
 * dangerouslySetInnerHTML (article body, ticket descriptions/comments,
 * institutional pages — anywhere renderMarkdownLite()'s own
 * `cursor:zoom-in` figures can appear). One hook call covers every image
 * inside the ref'd container, including across multiple separate
 * dangerouslySetInnerHTML blocks, since the click listener is delegated on
 * the shared ancestor rather than attached per-image.
 *
 * Call sites that live inside another click-to-close overlay (a modal
 * backdrop, say) are the reason the lightbox's own backdrop stops
 * propagation below — otherwise opening it could also fire the parent's
 * onClose.
 */
export function useImageLightbox<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG" && target.closest("figure")) {
        setSrc((target as HTMLImageElement).src);
      }
    }
    el.addEventListener("click", handleClick);
    return () => el.removeEventListener("click", handleClick);
  }, []);

  const lightbox = src ? (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setSrc(null);
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        backgroundColor: "rgba(0,0,0,0.92)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.25rem",
        cursor: "zoom-out",
      }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setSrc(null);
        }}
        aria-label="Fechar"
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          width: "2.75rem",
          height: "2.75rem",
          borderRadius: "50%",
          border: "none",
          backgroundColor: "rgba(255,255,255,0.12)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <X size={22} />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: "0.5rem", objectFit: "contain", cursor: "default" }}
      />
    </div>
  ) : null;

  return { ref, lightbox };
}
