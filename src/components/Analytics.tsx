"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getVisitorId } from "@/lib/visitor";

export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    const visitorId = getVisitorId();
    if (!visitorId) return;
    fetch("/api/track/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, visitorId }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
