"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { withAutoplay } from "@/lib/youtube";

/**
 * Shows a static thumbnail with a play button instead of an eager iframe.
 * YouTube's embed script is heavy — loading it unconditionally on the
 * homepage hero (100% of visitors, above the fold) would hurt LCP. The
 * real iframe only mounts once the visitor actually clicks play.
 */
export function VideoFacade({ embedUrl, thumbnailUrl, title }: { embedUrl: string; thumbnailUrl: string | null; title: string }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        src={withAutoplay(embedUrl)}
        title={title}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Reproduzir vídeo: ${title}`}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        border: "none",
        padding: 0,
        cursor: "pointer",
        backgroundColor: "#000",
        backgroundImage: thumbnailUrl ? `url(${thumbnailUrl})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          width: "4.5rem",
          height: "4.5rem",
          borderRadius: "50%",
          backgroundColor: "rgba(67,97,238,0.9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 32px -4px rgba(0,0,0,0.5)",
          transition: "transform 0.15s",
        }}
        className="video-facade-play"
      >
        <Play size={26} color="white" fill="white" style={{ marginLeft: "3px" }} />
      </span>
    </button>
  );
}
