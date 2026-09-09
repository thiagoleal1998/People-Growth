import { NextRequest, NextResponse } from "next/server";
import writeExcelFile, { type Row } from "write-excel-file/node";
import { getCurrentProfile } from "@/lib/auth/profile";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { AD_SLOT_DEFS } from "@/app/admin/(dashboard)/publicidade/ad-slots";
import type { Article, Ad, Author, Comment, InternalTicket, ErrorReport } from "@/types/database.types";

export const SECTION_KEYS = ["resumo", "paginas", "origens", "localizacoes", "anuncios", "artigos", "chamados", "erros", "atividade"] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

const HEADER = { fontWeight: "bold" } as const;

function parseDateParam(value: string | null, timeSuffix: string): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T${timeSuffix}`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export async function GET(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const requested = (searchParams.get("sections") ?? "").split(",").filter((s): s is SectionKey => (SECTION_KEYS as readonly string[]).includes(s));
  if (requested.length === 0) {
    return NextResponse.json({ error: "Selecione ao menos um dado para baixar." }, { status: 400 });
  }

  const period = searchParams.get("period") ?? "30";
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const userFilter = searchParams.get("user");

  const validFrom = parseDateParam(from, "00:00:00");
  const validTo = parseDateParam(to, "23:59:59");
  const usingCustomRange = Boolean(validFrom || validTo);

  let since: string | null;
  let until: string | null = null;
  if (usingCustomRange) {
    since = validFrom;
    until = validTo;
  } else {
    const days = period === "all" ? null : Number(period) || 30;
    since = days ? new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString() : null;
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const needsViews = requested.some((s) => ["resumo", "paginas", "origens", "localizacoes"].includes(s));
  const needsAdEvents = requested.some((s) => ["resumo", "anuncios"].includes(s));

  let viewsQuery = client.from("page_views").select("path, article_id, visitor_id, referrer, utm_source, utm_campaign, scroll_depth, visitor_city, visitor_country");
  if (since) viewsQuery = viewsQuery.gte("created_at", since);
  if (until) viewsQuery = viewsQuery.lte("created_at", until);
  let adEventsQuery = client.from("ad_events").select("ad_slot_key, ad_id, event_type");
  if (since) adEventsQuery = adEventsQuery.gte("created_at", since);
  if (until) adEventsQuery = adEventsQuery.lte("created_at", until);

  const [{ data: viewsData }, { data: adEventsData }, { data: articlesData }, { data: adsData }] = await Promise.all([
    needsViews ? viewsQuery : Promise.resolve({ data: [] }),
    needsAdEvents ? adEventsQuery : Promise.resolve({ data: [] }),
    client.from("articles").select("id, title_pt"),
    client.from("ads").select("id, title, slot_key"),
  ]);

  const views = (viewsData ?? []) as {
    path: string;
    article_id: string | null;
    visitor_id: string;
    referrer: string | null;
    utm_source: string | null;
    utm_campaign: string | null;
    scroll_depth: number | null;
    visitor_city: string | null;
    visitor_country: string | null;
  }[];
  const adEvents = (adEventsData ?? []) as { ad_slot_key: string; ad_id: string | null; event_type: string }[];
  const articleTitles = new Map(((articlesData ?? []) as Pick<Article, "id" | "title_pt">[]).map((a) => [a.id, a.title_pt]));
  const slotLabels = new Map<string, string>(AD_SLOT_DEFS.map((d) => [d.key, d.label]));
  const adsById = new Map<string, Pick<Ad, "id" | "title" | "slot_key">>(
    ((adsData ?? []) as Pick<Ad, "id" | "title" | "slot_key">[]).map((a) => [a.id, a])
  );

  function sourceLabel(v: { referrer: string | null; utm_source: string | null; utm_campaign: string | null }): string {
    if (v.utm_source) return v.utm_campaign ? `${v.utm_source} / ${v.utm_campaign}` : v.utm_source;
    if (v.referrer) {
      try {
        return new URL(v.referrer).hostname.replace(/^www\./, "");
      } catch {
        return "Outro";
      }
    }
    return "Direto";
  }

  function locationLabel(v: { visitor_city: string | null; visitor_country: string | null }): string {
    if (v.visitor_city && v.visitor_country) return `${v.visitor_city}, ${v.visitor_country}`;
    return v.visitor_city || v.visitor_country || "Desconhecida";
  }

  const sheets: { sheet: string; data: Row[] }[] = [];

  if (requested.includes("resumo")) {
    const totalViews = views.length;
    const uniqueVisitors = new Set(views.map((v) => v.visitor_id)).size;
    const totalImpressions = adEvents.filter((e) => e.event_type === "impression").length;
    const totalClicks = adEvents.filter((e) => e.event_type === "click").length;
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const scrollSamples = views.map((v) => v.scroll_depth).filter((d): d is number => d != null);
    const avgScrollDepth = scrollSamples.length > 0 ? Math.round(scrollSamples.reduce((sum, d) => sum + d, 0) / scrollSamples.length) : null;

    sheets.push({
      sheet: "Resumo geral",
      data: [
        [{ value: "Métrica", ...HEADER }, { value: "Valor", ...HEADER }],
        [{ value: "Visualizações de página" }, { value: totalViews, type: Number }],
        [{ value: "Visitantes únicos" }, { value: uniqueVisitors, type: Number }],
        [{ value: "Cliques em anúncios" }, { value: totalClicks, type: Number }],
        [{ value: "CTR de anúncios (%)" }, { value: Number(ctr.toFixed(1)), type: Number }],
        [{ value: "Leitura média da página (%)" }, { value: avgScrollDepth ?? 0, type: Number }],
      ],
    });
  }

  if (requested.includes("paginas")) {
    const byPath = new Map<string, { views: number; visitors: Set<string>; title: string }>();
    for (const v of views) {
      const label = v.article_id ? (articleTitles.get(v.article_id) ?? v.path) : v.path;
      const entry = byPath.get(v.path) ?? { views: 0, visitors: new Set<string>(), title: label };
      entry.views++;
      entry.visitors.add(v.visitor_id);
      byPath.set(v.path, entry);
    }
    const rows = Array.from(byPath.entries())
      .map(([path, v]) => ({ path, views: v.views, uniques: v.visitors.size, title: v.title }))
      .sort((a, b) => b.views - a.views);

    sheets.push({
      sheet: "Páginas mais acessadas",
      data: [
        [{ value: "Página", ...HEADER }, { value: "Visualizações", ...HEADER }, { value: "Visitantes únicos", ...HEADER }],
        ...rows.map((r) => [{ value: r.title }, { value: r.views, type: Number }, { value: r.uniques, type: Number }]),
      ],
    });
  }

  if (requested.includes("origens")) {
    const bySource = new Map<string, { views: number; visitors: Set<string> }>();
    for (const v of views) {
      const label = sourceLabel(v);
      const entry = bySource.get(label) ?? { views: 0, visitors: new Set<string>() };
      entry.views++;
      entry.visitors.add(v.visitor_id);
      bySource.set(label, entry);
    }
    const rows = Array.from(bySource.entries())
      .map(([source, v]) => ({ source, views: v.views, uniques: v.visitors.size }))
      .sort((a, b) => b.views - a.views);

    sheets.push({
      sheet: "Origem do tráfego",
      data: [
        [{ value: "Origem", ...HEADER }, { value: "Visualizações", ...HEADER }, { value: "Visitantes únicos", ...HEADER }],
        ...rows.map((r) => [{ value: r.source }, { value: r.views, type: Number }, { value: r.uniques, type: Number }]),
      ],
    });
  }

  if (requested.includes("localizacoes")) {
    const byLocation = new Map<string, { views: number; visitors: Set<string> }>();
    for (const v of views) {
      const label = locationLabel(v);
      const entry = byLocation.get(label) ?? { views: 0, visitors: new Set<string>() };
      entry.views++;
      entry.visitors.add(v.visitor_id);
      byLocation.set(label, entry);
    }
    const rows = Array.from(byLocation.entries())
      .map(([location, v]) => ({ location, views: v.views, uniques: v.visitors.size }))
      .sort((a, b) => b.views - a.views);

    sheets.push({
      sheet: "Localização dos visitantes",
      data: [
        [{ value: "Local", ...HEADER }, { value: "Visualizações", ...HEADER }, { value: "Visitantes únicos", ...HEADER }],
        ...rows.map((r) => [{ value: r.location }, { value: r.views, type: Number }, { value: r.uniques, type: Number }]),
      ],
    });
  }

  if (requested.includes("anuncios")) {
    const statsByAd = new Map<string, { impressions: number; clicks: number }>();
    for (const e of adEvents) {
      if (!e.ad_id) continue;
      const s = statsByAd.get(e.ad_id) ?? { impressions: 0, clicks: 0 };
      if (e.event_type === "impression") s.impressions++;
      else s.clicks++;
      statsByAd.set(e.ad_id, s);
    }
    const rows = Array.from(statsByAd.entries()).map(([id, s]) => {
      const info = adsById.get(id);
      return {
        title: info?.title ?? id,
        slot: info ? (slotLabels.get(info.slot_key) ?? info.slot_key) : "—",
        impressions: s.impressions,
        clicks: s.clicks,
        ctr: s.impressions > 0 ? Number(((s.clicks / s.impressions) * 100).toFixed(1)) : 0,
      };
    });

    sheets.push({
      sheet: "Desempenho dos anúncios",
      data: [
        [{ value: "Anúncio", ...HEADER }, { value: "Espaço", ...HEADER }, { value: "Impressões", ...HEADER }, { value: "Cliques", ...HEADER }, { value: "CTR (%)", ...HEADER }],
        ...rows.map((r) => [{ value: r.title }, { value: r.slot }, { value: r.impressions, type: Number }, { value: r.clicks, type: Number }, { value: r.ctr, type: Number }]),
      ],
    });
  }

  if (requested.includes("artigos")) {
    const [{ data: articlesForStats }, { data: authorsData }, { data: commentsData }, { data: scrollData }] = await Promise.all([
      client.from("articles").select("id, title_pt, author_id, views").eq("status", "published"),
      client.from("authors").select("id, name"),
      client.from("comments").select("article_id, likes, reports"),
      client.from("page_views").select("article_id, scroll_depth").not("article_id", "is", null).not("scroll_depth", "is", null),
    ]);
    const authorNames = new Map(((authorsData ?? []) as Pick<Author, "id" | "name">[]).map((a) => [a.id, a.name]));
    const byArticle = new Map<string, { comments: number; likes: number; reports: number }>();
    for (const c of (commentsData ?? []) as Pick<Comment, "article_id" | "likes" | "reports">[]) {
      const entry = byArticle.get(c.article_id) ?? { comments: 0, likes: 0, reports: 0 };
      entry.comments++;
      entry.likes += c.likes;
      entry.reports += c.reports;
      byArticle.set(c.article_id, entry);
    }
    const scrollByArticle = new Map<string, number[]>();
    for (const v of (scrollData ?? []) as { article_id: string; scroll_depth: number }[]) {
      const arr = scrollByArticle.get(v.article_id) ?? [];
      arr.push(v.scroll_depth);
      scrollByArticle.set(v.article_id, arr);
    }
    const rows = ((articlesForStats ?? []) as Pick<Article, "id" | "title_pt" | "author_id" | "views">[])
      .map((a) => {
        const s = byArticle.get(a.id) ?? { comments: 0, likes: 0, reports: 0 };
        const scrollSamplesForArticle = scrollByArticle.get(a.id);
        const avgScrollDepth = scrollSamplesForArticle?.length
          ? Math.round(scrollSamplesForArticle.reduce((sum, d) => sum + d, 0) / scrollSamplesForArticle.length)
          : null;
        return {
          title: a.title_pt,
          author: a.author_id ? (authorNames.get(a.author_id) ?? "—") : "—",
          views: a.views,
          avgScrollDepth,
          comments: s.comments,
          likes: s.likes,
          reports: s.reports,
        };
      })
      .sort((a, b) => b.views - a.views);

    sheets.push({
      sheet: "Estatísticas de artigos",
      data: [
        [
          { value: "Artigo", ...HEADER },
          { value: "Autor", ...HEADER },
          { value: "Visualizações", ...HEADER },
          { value: "Leitura média (%)", ...HEADER },
          { value: "Comentários", ...HEADER },
          { value: "Curtidas", ...HEADER },
          { value: "Denúncias", ...HEADER },
        ],
        ...rows.map((r) => [
          { value: r.title },
          { value: r.author },
          { value: r.views, type: Number },
          { value: r.avgScrollDepth ?? 0, type: Number },
          { value: r.comments, type: Number },
          { value: r.likes, type: Number },
          { value: r.reports, type: Number },
        ]),
      ],
    });
  }

  if (requested.includes("chamados")) {
    let ticketsQuery = client.from("internal_tickets").select("ticket_number, title, type, status, assigned_to_name, created_by_name, created_at").order("created_at", { ascending: false });
    if (since) ticketsQuery = ticketsQuery.gte("created_at", since);
    if (until) ticketsQuery = ticketsQuery.lte("created_at", until);
    const { data: ticketsData } = await ticketsQuery;
    const rows = (ticketsData ?? []) as Pick<InternalTicket, "ticket_number" | "title" | "type" | "status" | "assigned_to_name" | "created_by_name" | "created_at">[];

    const TICKET_TYPE_LABELS: Record<string, string> = { bug: "Erro / bug", suggestion: "Sugestão de melhoria" };
    const TICKET_STATUS_LABELS: Record<string, string> = { open: "Aberto", in_progress: "Em andamento", resolved: "Resolvido" };

    sheets.push({
      sheet: "Chamados internos",
      data: [
        [
          { value: "Número", ...HEADER },
          { value: "Título", ...HEADER },
          { value: "Tipo", ...HEADER },
          { value: "Status", ...HEADER },
          { value: "Responsável", ...HEADER },
          { value: "Aberto por", ...HEADER },
          { value: "Criado em", ...HEADER },
        ],
        ...rows.map((r) => [
          { value: `CPG-${String(r.ticket_number).padStart(4, "0")}` },
          { value: r.title },
          { value: TICKET_TYPE_LABELS[r.type] ?? r.type },
          { value: TICKET_STATUS_LABELS[r.status] ?? r.status },
          { value: r.assigned_to_name ?? "Não atribuído" },
          { value: r.created_by_name },
          { value: new Date(r.created_at), type: Date, format: "dd/mm/yyyy hh:mm" },
        ]),
      ],
    });
  }

  if (requested.includes("erros")) {
    let errorsQuery = client.from("error_reports").select("page_url, description, email, status, created_at").order("created_at", { ascending: false });
    if (since) errorsQuery = errorsQuery.gte("created_at", since);
    if (until) errorsQuery = errorsQuery.lte("created_at", until);
    const { data: errorsData } = await errorsQuery;
    const rows = (errorsData ?? []) as Pick<ErrorReport, "page_url" | "description" | "email" | "status" | "created_at">[];

    const ERROR_STATUS_LABELS: Record<string, string> = { new: "Novo", reviewing: "Em análise", resolved: "Resolvido" };

    sheets.push({
      sheet: "Erros reportados",
      data: [
        [
          { value: "Página", ...HEADER },
          { value: "Descrição", ...HEADER },
          { value: "E-mail", ...HEADER },
          { value: "Status", ...HEADER },
          { value: "Criado em", ...HEADER },
        ],
        ...rows.map((r) => [
          { value: r.page_url },
          { value: r.description },
          { value: r.email ?? "Anônimo" },
          { value: ERROR_STATUS_LABELS[r.status] ?? r.status },
          { value: new Date(r.created_at), type: Date, format: "dd/mm/yyyy hh:mm" },
        ]),
      ],
    });
  }

  if (requested.includes("atividade")) {
    let activityQuery = client.from("activity_log").select("*").order("created_at", { ascending: false }).limit(5000);
    if (since) activityQuery = activityQuery.gte("created_at", since);
    if (until) activityQuery = activityQuery.lte("created_at", until);
    if (userFilter) activityQuery = activityQuery.eq("user_email", userFilter);

    // user_profiles only lets a session see its own row (RLS) — resolving
    // display names for every actor needs the service role, same as the
    // page itself does for this tab.
    const admin = await createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adminClient = admin as any;
    const [{ data: activityData }, { data: allUsersData }] = await Promise.all([
      activityQuery,
      adminClient.from("user_profiles").select("email, author_id"),
    ]);
    const profiles = (allUsersData ?? []) as { email: string; author_id: string | null }[];
    const authorIds = profiles.map((p) => p.author_id).filter((id): id is string => Boolean(id));
    let authorNamesById = new Map<string, string>();
    if (authorIds.length > 0) {
      const { data: authorsData } = await adminClient.from("authors").select("id, name").in("id", authorIds);
      authorNamesById = new Map(((authorsData ?? []) as { id: string; name: string }[]).map((a) => [a.id, a.name]));
    }
    const nameByEmail = new Map(profiles.map((p) => [p.email, (p.author_id && authorNamesById.get(p.author_id)) || p.email]));

    const ACTION_LABELS: Record<string, string> = { create: "Criou", update: "Atualizou", delete: "Excluiu", publish: "Publicou", login: "Entrou", logout: "Saiu" };
    const rows = (activityData ?? []) as { created_at: string; user_email: string; action: string; entity_type: string; entity_label: string | null }[];

    sheets.push({
      sheet: "Log de atividade",
      data: [
        [{ value: "Quando", ...HEADER }, { value: "Usuário", ...HEADER }, { value: "Ação", ...HEADER }, { value: "Tipo", ...HEADER }, { value: "Detalhe", ...HEADER }],
        ...rows.map((r) => [
          { value: new Date(r.created_at), type: Date, format: "dd/mm/yyyy hh:mm" },
          { value: nameByEmail.get(r.user_email) ?? r.user_email },
          { value: ACTION_LABELS[r.action] ?? r.action },
          { value: r.entity_type },
          { value: r.entity_label ?? "" },
        ]),
      ],
    });
  }

  const buffer = await writeExcelFile(sheets).toBuffer();

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="relatorio.xlsx"',
    },
  });
}
