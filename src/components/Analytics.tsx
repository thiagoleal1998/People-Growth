"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getVisitorId } from "@/lib/visitor";

export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    const visitorId = getVisitorId();
    if (!visitorId) return;

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
    }).catch(() => {});
  }, [pathname]);

  return null;
}
