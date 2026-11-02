import Link from "next/link";
import { Plus, Instagram, Linkedin, MessageCircle, Music2, Youtube, X as XIcon, Radio, Share2 } from "lucide-react";
import { WEEKDAYS_PT, type CalendarCell } from "@/lib/calendar-grid";
import type { Article, ContentCalendarItem } from "@/types/database.types";

type ArticlePill = Pick<Article, "id" | "title_pt" | "status" | "scheduled_for" | "author_id"> & { authorName: string | null };

const PLATFORM_LABEL: Record<NonNullable<ContentCalendarItem["platform"]>, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  tiktok: "TikTok",
  youtube: "YouTube",
  x: "X",
  live: "Live",
  other: "Outro",
};

// Lucide doesn't ship WhatsApp or TikTok marks, so those fall back to a
// generic chat bubble / music note — every other platform here has its
// real brand icon.
const PLATFORM_ICON: Record<NonNullable<ContentCalendarItem["platform"]>, typeof Instagram> = {
  instagram: Instagram,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
  tiktok: Music2,
  youtube: Youtube,
  x: XIcon,
  live: Radio,
  other: Share2,
};

export function CalendarGrid({
  grid,
  itemsByDate,
  articlesByDate,
  monthKey,
}: {
  grid: CalendarCell[];
  itemsByDate: Map<string, ContentCalendarItem[]>;
  articlesByDate: Map<string, ArticlePill[]>;
  monthKey: string;
}) {
  return (
    <div style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {WEEKDAYS_PT.map((w) => (
          <div key={w} style={{ padding: "0.625rem", textAlign: "center", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid var(--admin-border)" }}>
            {w}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {grid.map((cell) => {
          const items = itemsByDate.get(cell.dateKey) ?? [];
          const articles = articlesByDate.get(cell.dateKey) ?? [];
          const hasContent = items.length > 0 || articles.length > 0;
          return (
            <div
              key={cell.dateKey}
              style={{
                minHeight: "7.5rem",
                minWidth: 0,
                padding: "0.5rem",
                borderRight: "1px solid var(--admin-border)",
                borderBottom: "1px solid var(--admin-border)",
                backgroundColor: cell.inMonth ? "transparent" : "var(--admin-surface-alt)",
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: cell.inMonth ? "var(--admin-text)" : "var(--admin-faint)" }}>
                  {cell.date.getDate()}
                </span>
                <Link
                  href={`/admin/calendario/novo?date=${cell.dateKey}&month=${monthKey}`}
                  title="Adicionar item"
                  style={{ color: "var(--admin-faint)", display: "flex", alignItems: "center" }}
                >
                  <Plus size={14} />
                </Link>
              </div>

              {hasContent && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", maxHeight: "6.5rem", overflowY: "auto" }}>
                  {articles.map((a) => {
                    const pending = a.status === "pending";
                    return (
                      <Link
                        key={`a-${a.id}`}
                        href={pending ? `/admin/artigos/${a.id}/revisar` : `/admin/artigos/${a.id}`}
                        title={`${a.title_pt}${a.authorName ? ` — ${a.authorName}` : ""}`}
                        style={{
                          display: "block",
                          padding: "0.125rem 0.375rem",
                          borderRadius: "0.25rem",
                          fontSize: "0.6875rem",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          backgroundColor: pending ? "rgba(255,183,3,0.15)" : "rgba(200, 154, 74,0.12)",
                          color: pending ? "#cc9200" : "#A07B3B",
                        }}
                      >
                        {pending ? "⏳ " : "✓ "}
                        {a.title_pt}
                      </Link>
                    );
                  })}
                  {items.map((item) => {
                    const isSocial = item.type === "social_post";
                    const PlatformIcon = isSocial ? PLATFORM_ICON[item.platform ?? "other"] : null;
                    return (
                      <Link
                        key={`i-${item.id}`}
                        href={`/admin/calendario/${item.id}?month=${monthKey}`}
                        title={`${isSocial && item.platform ? `${PLATFORM_LABEL[item.platform]}: ` : ""}${item.title}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.1875rem",
                          padding: "0.125rem 0.375rem",
                          borderRadius: "0.25rem",
                          fontSize: "0.6875rem",
                          fontWeight: 700,
                          minWidth: 0,
                          backgroundColor: isSocial ? "rgba(49, 94, 156,0.12)" : "rgba(148,163,184,0.18)",
                          color: isSocial ? "#315E9C" : "var(--admin-text-secondary)",
                        }}
                      >
                        {PlatformIcon ? <PlatformIcon size={11} style={{ flexShrink: 0 }} /> : <span style={{ flexShrink: 0 }}>📝</span>}
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
