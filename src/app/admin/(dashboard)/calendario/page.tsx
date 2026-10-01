import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import { SavedToast } from "@/components/admin/SavedToast";
import { CalendarGrid } from "./CalendarGrid";
import { buildMonthGrid, parseMonthParam, monthParamKey, shiftMonth, MONTH_NAMES_PT } from "@/lib/calendar-grid";
import { dateKeySaoPaulo } from "@/lib/date-key";
import type { Article, Author, ContentCalendarItem } from "@/types/database.types";

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; saved?: string }>;
}) {
  const { month: monthParam, saved } = await searchParams;
  const { year, month } = parseMonthParam(monthParam);
  const monthKey = monthParamKey(year, month);
  const grid = buildMonthGrid(year, month);
  const firstKey = grid[0].dateKey;
  const lastKey = grid[grid.length - 1].dateKey;
  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const [{ data: itemsData }, { data: articlesData }, { data: authorsData }] = await Promise.all([
    client.from("content_calendar_items").select("*").gte("scheduled_date", firstKey).lte("scheduled_date", lastKey),
    client.from("articles").select("id, title_pt, status, scheduled_for, author_id").not("scheduled_for", "is", null).in("status", ["pending", "scheduled"]),
    client.from("authors").select("id, name"),
  ]);

  const items = (itemsData ?? []) as ContentCalendarItem[];
  const articles = (articlesData ?? []) as Pick<Article, "id" | "title_pt" | "status" | "scheduled_for" | "author_id">[];
  const authorNameById = new Map(((authorsData ?? []) as Pick<Author, "id" | "name">[]).map((a) => [a.id, a.name]));

  const itemsByDate = new Map<string, ContentCalendarItem[]>();
  for (const item of items) {
    const key = item.scheduled_date;
    if (!itemsByDate.has(key)) itemsByDate.set(key, []);
    itemsByDate.get(key)!.push(item);
  }

  const articlesByDate = new Map<string, (Pick<Article, "id" | "title_pt" | "status" | "scheduled_for" | "author_id"> & { authorName: string | null })[]>();
  for (const article of articles) {
    if (!article.scheduled_for) continue;
    const key = dateKeySaoPaulo(article.scheduled_for);
    if (key < firstKey || key > lastKey) continue;
    if (!articlesByDate.has(key)) articlesByDate.set(key, []);
    articlesByDate.get(key)!.push({ ...article, authorName: article.author_id ? authorNameById.get(article.author_id) ?? null : null });
  }

  return (
    <div>
      <SavedToast show={saved === "1"} />
      <PageHeader
        title="Calendário de Divulgação"
        subtitle={`${MONTH_NAMES_PT[month]} de ${year}`}
        action={
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Link href={`/admin/calendario?month=${monthParamKey(prev.year, prev.month)}`} style={{ padding: "0.5rem 0.875rem", borderRadius: "0.5rem", border: "1px solid var(--admin-border-strong)", color: "var(--admin-text)", fontSize: "0.875rem", textDecoration: "none" }}>
              ← Anterior
            </Link>
            <Link href={`/admin/calendario?month=${monthParamKey(next.year, next.month)}`} style={{ padding: "0.5rem 0.875rem", borderRadius: "0.5rem", border: "1px solid var(--admin-border-strong)", color: "var(--admin-text)", fontSize: "0.875rem", textDecoration: "none" }}>
              Próximo →
            </Link>
          </div>
        }
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem", marginBottom: "1rem", fontSize: "0.8125rem", color: "var(--admin-muted)" }}>
        <span><span style={{ color: "#cc9200" }}>⏳</span> Matéria aguardando aprovação</span>
        <span><span style={{ color: "#04a87d" }}>✓</span> Matéria agendada (aprovada)</span>
        <span><span style={{ color: "#4361EE" }}>📱</span> Post de rede social</span>
        <span>📝 Pauta de matéria a produzir</span>
      </div>
      <CalendarGrid grid={grid} itemsByDate={itemsByDate} articlesByDate={articlesByDate} monthKey={monthKey} />
    </div>
  );
}
