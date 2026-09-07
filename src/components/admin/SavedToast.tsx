"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export function SavedToast({ show }: { show: boolean }) {
  const router = useRouter();
  const pathname = usePathname();

  // The toast's visibility is just `show` directly — no separate local
  // state to keep in sync with it. The previous version stripped "?saved=1"
  // from the URL immediately, which flipped `show` back to false well
  // before the 3s mark; a cleanup tied to that dependency change ended up
  // cancelling the still-pending dismiss timer before it ever fired, so the
  // toast never actually disappeared. Deferring the URL cleanup until AFTER
  // the delay — rather than tracking visibility as its own state — means
  // there's no premature transition for a cleanup to race against.
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => router.replace(pathname, { scroll: false }), 3000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "1.25rem",
        right: "1.25rem",
        zIndex: 200,
        backgroundColor: "#04a87d",
        color: "white",
        padding: "0.75rem 1.25rem",
        borderRadius: "0.625rem",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        fontWeight: 600,
        fontSize: "0.875rem",
        boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
      }}
    >
      <CheckCircle2 size={18} />
      Salvo com sucesso
    </div>
  );
}
