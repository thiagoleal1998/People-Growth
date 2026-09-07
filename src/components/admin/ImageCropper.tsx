"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, X, ZoomIn } from "lucide-react";

const VIEWPORT = 280;

type Props = {
  file: File;
  shape?: "circle" | "square";
  outputSize?: number;
  onCancel: () => void;
  onConfirm: (file: File) => void;
};

/** Modal crop/zoom/pan UI shown right after picking a file, before it's
 * uploaded — lets the person recenter and zoom instead of getting whatever
 * crop the browser/server would have picked. Pure canvas + pointer events,
 * no external library (keeps this self-contained, like the rest of the
 * admin UI kit). Portaled to document.body for the same reason
 * NotificationBell's dropdown is — this can be opened from inside a
 * scrollable/overflow-hidden form area. */
export function ImageCropper({ file, shape = "circle", outputSize = 480, onCancel, onConfirm }: Props) {
  // Computed once at mount from the prop, not re-derived in an effect — this
  // component is always given a fresh `file` via a full mount/unmount (see
  // the `{pendingFile && <ImageCropper .../>}` call sites), never swapped
  // in place, so a lazy initializer is enough and avoids an extra render.
  const [imgUrl] = useState(() => URL.createObjectURL(file));
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = new Image();
    // setNatural fires later, from the load event — not synchronously in
    // the effect body — so this is the "subscribe to an external system"
    // shape rather than a same-tick cascading setState.
    img.onload = () => setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = imgUrl;
    return () => URL.revokeObjectURL(imgUrl);
  }, [imgUrl]);

  if (!natural) return null;

  const baseScale = VIEWPORT / Math.min(natural.w, natural.h);
  const scale = baseScale * zoom;
  const displayedW = natural.w * scale;
  const displayedH = natural.h * scale;
  const maxOffsetX = Math.max(0, (displayedW - VIEWPORT) / 2);
  const maxOffsetY = Math.max(0, (displayedH - VIEWPORT) / 2);
  const clampedOffset = {
    x: Math.min(maxOffsetX, Math.max(-maxOffsetX, offset.x)),
    y: Math.min(maxOffsetY, Math.max(-maxOffsetY, offset.y)),
  };
  const left = VIEWPORT / 2 - displayedW / 2 + clampedOffset.x;
  const top = VIEWPORT / 2 - displayedH / 2 + clampedOffset.y;

  function handlePointerDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: offset.x, origY: offset.y };
    setDragging(true);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setOffset({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy });
  }

  function handlePointerUp() {
    dragRef.current = null;
    setDragging(false);
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    setZoom((z) => Math.min(3, Math.max(1, z - e.deltaY * 0.0015)));
  }

  function handleConfirm() {
    const canvas = document.createElement("canvas");
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext("2d");
    if (!ctx || !imgRef.current) return;

    // Map the visible viewport rectangle back into the original image's
    // natural pixel coordinates, same scale factor used to display it.
    const sourceX = -left / scale;
    const sourceY = -top / scale;
    const sourceSize = VIEWPORT / scale;
    ctx.drawImage(imgRef.current, sourceX, sourceY, sourceSize, sourceSize, 0, 0, outputSize, outputSize);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const cropped = new File([blob], "foto.webp", { type: "image/webp" });
        onConfirm(cropped);
      },
      "image/webp",
      0.9
    );
  }

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15,23,42,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "var(--admin-surface)",
          border: "1px solid var(--admin-border)",
          borderRadius: "1rem",
          padding: "1.5rem",
          width: `${VIEWPORT + 48}px`,
          maxWidth: "100%",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        }}
      >
        <p style={{ margin: "0 0 1rem", fontSize: "0.9375rem", fontWeight: 700, color: "var(--admin-text)" }}>Ajustar foto</p>

        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onWheel={handleWheel}
          style={{
            width: VIEWPORT,
            height: VIEWPORT,
            margin: "0 auto",
            borderRadius: shape === "circle" ? "50%" : "0.75rem",
            overflow: "hidden",
            position: "relative",
            backgroundColor: "#0d1b2a",
            cursor: dragging ? "grabbing" : "grab",
            touchAction: "none",
            border: "1px solid var(--admin-border-strong)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={imgUrl}
            alt=""
            draggable={false}
            style={{
              position: "absolute",
              left,
              top,
              width: displayedW,
              height: displayedH,
              maxWidth: "none",
              userSelect: "none",
              pointerEvents: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginTop: "1.125rem" }}>
          <ZoomIn size={16} color="var(--admin-muted)" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            style={{ flex: 1 }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.625rem", marginTop: "1.25rem" }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              border: "1px solid var(--admin-border-strong)",
              backgroundColor: "var(--admin-surface)",
              color: "var(--admin-text)",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            <X size={15} /> Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              padding: "0.5rem 1.125rem",
              borderRadius: "0.5rem",
              border: "none",
              backgroundColor: "#4361EE",
              color: "white",
              fontWeight: 700,
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            <Check size={15} /> Usar esta foto
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
