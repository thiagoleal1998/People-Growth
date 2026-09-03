"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getVisitorId } from "@/lib/visitor";

function currentScrollPercent(): number {
  const doc = document.documentElement;
  const scrollable = doc.scrollHeight - doc.clientHeight;
  if (scrollable <= 0) return 100;
  return Math.min(100, Math.max(0, Math.round(((doc.scrollTop || document.body.scrollTop) / scrollable) * 100)));
}

export function Analytics() {
  const pathname = usePathname();
  const viewId = useRef<string | null>(null);
  const maxScroll = useRef(0);

  useEffect(() => {
    const visitorId = getVisitorId();
    if (!visitorId) return;

    viewId.current = null;
    maxScroll.current = currentScrollPercent();

    const params = new URLSearchParams(window.location.search);

    fetch("/api/track/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        visitorId,
        referrer: document.referrer || null,
        utmSource: params.get("utm_source"),
        utmMedium: params.get("utm_medium"),
        utmCampaign: params.get("utm_campaign"),
      }),
      keepalive: true,
    })
      .then((res) => res.json())
      .then((data) => {
        viewId.current = data?.id ?? null;
      })
      .catch(() => {});

    function onScroll() {
      maxScroll.current = Math.max(maxScroll.current, currentScrollPercent());
    }

    function sendScrollDepth() {
      if (!viewId.current) return;
      const payload = JSON.stringify({ id: viewId.current, scrollDepth: maxScroll.current });
      navigator.sendBeacon?.("/api/track/scroll", new Blob([payload], { type: "application/json" }));
      viewId.current = null; // avoid a duplicate send if both listeners fire
    }

    function onVisibilityChange() {
      if (document.visibilityState === "hidden") sendScrollDepth();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", sendScrollDepth);

    return () => {
      sendScrollDepth();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", sendScrollDepth);
    };
  }, [pathname]);

  return null;
}
