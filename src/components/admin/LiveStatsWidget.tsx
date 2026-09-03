"use client";

import { useEffect, useState } from "react";
import { Eye, Users } from "lucide-react";

type Staff = { name: string; role: "admin" | "author" };
type LiveStats = { visitorsOnline: number; onlineStaff: Staff[] };

const POLL_MS = 15000;

export function LiveStatsWidget() {
  const [stats, setStats] = useState<LiveStats | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/admin/live-stats");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setStats(data);
      } catch {
        // Silently skip — keeps showing the last known numbers.
      }
    }

    load();
    const interval = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const admins = stats?.onlineStaff.filter((s) => s.role === "admin") ?? [];
  const authors = stats?.onlineStaff.filter((s) => s.role === "author") ?? [];

  return (
    <div style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", padding: "1.5rem", marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
        <span className="live-pulse-dot" style={{ width: "0.5rem", height: "0.5rem", borderRadius: "50%", backgroundColor: "#06D6A0", flexShrink: 0 }} />
        <h2 style={{ fontSize: "0.9375rem", fontWeight: 800, color: "var(--admin-text)" }}>Ao vivo agora</h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
          <div style={{ width: "2.75rem", height: "2.75rem", borderRadius: "0.75rem", backgroundColor: "rgba(67,97,238,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Eye size={18} color="#4361EE" />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: "1.75rem", color: "var(--admin-text)", lineHeight: 1 }}>{stats?.visitorsOnline ?? "—"}</div>
            <div style={{ fontSize: "0.8125rem", color: "var(--admin-muted)", fontWeight: 600 }}>Visitantes no site agora</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
          <div style={{ width: "2.75rem", height: "2.75rem", borderRadius: "0.75rem", backgroundColor: "rgba(6,214,160,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Users size={18} color="#04a87d" />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: "1.75rem", color: "var(--admin-text)", lineHeight: 1 }}>{stats?.onlineStaff.length ?? "—"}</div>
            <div style={{ fontSize: "0.8125rem", color: "var(--admin-muted)", fontWeight: 600 }}>
              Equipe online {admins.length > 0 || authors.length > 0 ? `(${admins.length} admin${admins.length === 1 ? "" : "s"}, ${authors.length} autor${authors.length === 1 ? "" : "es"})` : ""}
            </div>
          </div>
        </div>
      </div>

      {stats && stats.onlineStaff.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid var(--admin-border)" }}>
          {stats.onlineStaff.map((s, i) => (
            <span
              key={`${s.name}-${i}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                padding: "0.3rem 0.75rem",
                borderRadius: "9999px",
                backgroundColor: "var(--admin-surface-alt)",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--admin-text-secondary)",
              }}
            >
              <span style={{ width: "0.4rem", height: "0.4rem", borderRadius: "50%", backgroundColor: "#06D6A0" }} />
              {s.name}
            </span>
          ))}
        </div>
      )}

      <style>{`
        @keyframes live-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.75); }
        }
        .live-pulse-dot { animation: live-pulse 1.6s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
