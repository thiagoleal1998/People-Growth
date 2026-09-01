"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export function SavedToast({ show }: { show: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) return;
    setVisible(true);
    router.replace(pathname, { scroll: false });
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  if (!visible) return null;

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
