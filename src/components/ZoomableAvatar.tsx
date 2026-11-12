"use client";

import { useState } from "react";
import { X } from "lucide-react";

/** A circular profile-photo avatar that opens a full-size lightbox on
 * click — same visual treatment as the in-article image lightbox
 * (useImageLightbox), just for a plain CSS background-image circle
 * instead of a markdown-lite <figure><img>, so it needs its own small bit
 * of client state rather than reusing that hook as-is. */
export function ZoomableAvatar({ photoUrl, name, size = "6rem" }: { photoUrl: string | null; name: string; size?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => photoUrl && setOpen(true)}
        aria-label={photoUrl ? `Ampliar foto de ${name}` : undefined}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          flexShrink: 0,
          background: photoUrl ? `url("${photoUrl}") center/cover` : "linear-gradient(135deg, #315E9C, #C89A4A)",
          border: "none",
          padding: 0,
          cursor: photoUrl ? "zoom-in" : "default",
        }}
      />
      {open && photoUrl && (
        <div
          onClick={() => setOpen(false)}
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
              setOpen(false);
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
            src={photoUrl}
            alt={name}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: "0.5rem", objectFit: "contain", cursor: "default" }}
          />
        </div>
      )}
    </>
  );
}
