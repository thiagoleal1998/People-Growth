import Link from "next/link";
import { Plus } from "lucide-react";
import { WEEKDAYS_PT, type CalendarCell } from "@/lib/calendar-grid";
import type { Article, ContentCalendarItem } from "@/types/database.types";

type ArticlePill = Pick<Article, "id" | "title_pt" | "status" | "scheduled_for" | "author_id"> & { authorName: string | null };

const PLATFORM_LABEL: Record<NonNullable<ContentCalendarItem["platform"]>, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  live: "Live",
  other: "Outro",
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
                          backgroundColor: pending ? "rgba(255,183,3,0.15)" : "rgba(6,214,160,0.12)",
                          color: pending ? "#cc9200" : "#04a87d",
                        }}
                      >
                        {pending ? "⏳ " : "✓ "}
                        {a.title_pt}
                      </Link>
                    );
                  })}
                  {items.map((item) => {
                    const isSocial = item.type === "social_post";
                    return (
                      <Link
                        key={`i-${item.id}`}
                        href={`/admin/calendario/${item.id}?month=${monthKey}`}
                        title={item.title}
                        style={{
                          display: "block",
                          padding: "0.125rem 0.375rem",
                          borderRadius: "0.25rem",
                          fontSize: "0.6875rem",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          backgroundColor: isSocial ? "rgba(67,97,238,0.12)" : "rgba(148,163,184,0.18)",
                          color: isSocial ? "#4361EE" : "var(--admin-text-secondary)",
                        }}
                      >
                        {isSocial ? `📱 ${item.platform ? PLATFORM_LABEL[item.platform] + ": " : ""}` : "📝 "}
                        {item.title}
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
