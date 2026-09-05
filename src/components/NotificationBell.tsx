"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import type { Notification } from "@/types/database.types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR");
}

export function NotificationBell({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [panelPos, setPanelPos] = useState<{ left: number; bottom: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setNotifications(data.notifications ?? []);
          setUnreadCount(data.unreadCount ?? 0);
        }
      } catch {
        // best-effort — a failed poll just tries again next interval
      }
    }

    load();
    const interval = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleOpen() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPanelPos({ left: rect.left, bottom: window.innerHeight - rect.top + 8 });
    }
    setOpen((v) => !v);
  }

  async function handleOpenNotification(n: Notification) {
    if (!n.read) {
      setNotifications((prev) => prev.map((i) => (i.id === n.id ? { ...i, read: true } : i)));
      setUnreadCount((c) => Math.max(0, c - 1));
      fetch("/api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: n.id }) }).catch(() => {});
    }
    setOpen(false);
    if (n.link) router.push(n.link);
  }

  async function handleMarkAllRead() {
    setNotifications((prev) => prev.map((i) => ({ ...i, read: true })));
    setUnreadCount(0);
    fetch("/api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: true }) }).catch(() => {});
  }

  const bellIcon = (
    <span style={{ position: "relative", display: "flex" }}>
      <Bell size={17} />
      {unreadCount > 0 && (
        <span
          style={{
            position: "absolute",
            top: "-0.25rem",
            right: "-0.3rem",
            backgroundColor: "#dc2626",
            color: "white",
            fontSize: "0.5625rem",
            fontWeight: 800,
            minWidth: "0.9rem",
            height: "0.9rem",
            borderRadius: "9999px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 0.2rem",
          }}
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </span>
  );

  return (
    <div style={{ position: "relative" }}>
      {compact ? (
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleOpen}
          title="Notificações"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "2rem",
            height: "2rem",
            borderRadius: "0.5rem",
            color: "rgba(255,255,255,0.7)",
            background: open ? "rgba(255,255,255,0.06)" : "none",
            border: "none",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {bellIcon}
        </button>
      ) : (
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleOpen}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.625rem 0.875rem",
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "rgba(255,255,255,0.7)",
            background: open ? "rgba(255,255,255,0.06)" : "none",
            border: "none",
            cursor: "pointer",
            width: "100%",
            textAlign: "left",
          }}
        >
          {bellIcon}
          Notificações
        </button>
      )}

      {open && panelPos && createPortal(
        <div
          ref={panelRef}
          style={{
            position: "fixed",
            bottom: `${panelPos.bottom}px`,
            left: `${panelPos.left}px`,
            width: "320px",
            maxWidth: "90vw",
            backgroundColor: "var(--admin-surface)",
            color: "var(--admin-text)",
            borderRadius: "0.75rem",
            border: "1px solid var(--admin-border)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            zIndex: 300,
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", borderBottom: "1px solid var(--admin-border)" }}>
            <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>Notificações</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                style={{ fontSize: "0.75rem", color: "#4361EE", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
              >
                Marcar todas como lidas
              </button>
            )}
          </div>
          <div style={{ maxHeight: "320px", overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "2rem 1rem", textAlign: "center", color: "var(--admin-faint)", fontSize: "0.8125rem" }}>
                Nenhuma notificação por enquanto.
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleOpenNotification(n)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "0.75rem 1rem",
                    borderBottom: "1px solid var(--admin-border)",
                    background: n.read ? "none" : "rgba(67,97,238,0.06)",
                    border: "none",
                    borderBottomWidth: "1px",
                    borderBottomStyle: "solid",
                    borderBottomColor: "var(--admin-border)",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                    {!n.read && <span style={{ width: "0.4rem", height: "0.4rem", borderRadius: "9999px", backgroundColor: "#4361EE", flexShrink: 0, marginTop: "0.375rem" }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--admin-text)" }}>{n.title}</div>
                      {n.body && <div style={{ fontSize: "0.75rem", color: "var(--admin-muted)", marginTop: "0.125rem" }}>{n.body}</div>}
                      <div style={{ fontSize: "0.6875rem", color: "var(--admin-faint)", marginTop: "0.25rem" }}>{formatDate(n.created_at)}</div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
