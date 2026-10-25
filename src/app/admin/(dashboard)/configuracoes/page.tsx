import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import { SavedToast } from "@/components/admin/SavedToast";
import { ConfiguracoesTabs } from "./ConfiguracoesTabs";
import { updateSeoConfig } from "../seo/actions";
import { ADMIN_MENU_DEFAULTS, AUTHOR_MENU_DEFAULTS, applyMenuOverrides, isMenuGroup, type MenuOverride } from "@/lib/menu-registry";
import { formatName, getGovernorRace, getPresidentRace, raceStatus, UF_IN_RUNOFF, UF_OPTIONS, type TseRace } from "@/lib/tse";
import type { MenuEditorItem } from "./MenuEditor";
import type { Category } from "@/types/database.types";
import type { ElectionStatusRow } from "./ConfiguracoesTabs";

type SiteConfigRow = { key: string; value: string | null };

// Read-only status for the "Eleições 2026" tab — there's nothing to configure
// here (round detection is automatic, see lib/tse.ts), just a way to see at a
// glance which races are currently in a 2nd round without opening the site.
function electionRow(label: string, race: TseRace | null): ElectionStatusRow | null {
  if (!race) return null;
  const status = raceStatus(race, true);
  const statusText =
    status.kind === "elected"
      ? `Eleito: ${status.names.map(formatName).join(" e ")}`
      : status.kind === "runoff"
        ? `Segundo turno: ${status.names.map(formatName).join(" x ")}`
        : race.round === 2
          ? "Segundo turno em apuração"
          : "Apuração em andamento";
  return { label, round: race.round, statusText, sectionsPct: race.sectionsPct };
}

export default async function ConfiguracoesPage({ searchParams }: { searchParams: Promise<{ saved?: string; logoError?: string; faviconError?: string; tab?: string }> }) {
  const { saved, logoError, faviconError, tab } = await searchParams;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const [{ data }, { data: categoriesData }, { data: articlesData }, { data: extraCategoriesData }, { data: adminMenuOverrides }, { data: authorMenuOverrides }] = await Promise.all([
    client.from("site_config").select("*") as Promise<{ data: SiteConfigRow[] | null }>,
    client.from("categories").select("*").order("name_pt"),
    client.from("articles").select("id, category_id"),
    client.from("article_categories").select("article_id, category_id"),
    client.from("menu_items").select("id,label,sort_order").eq("panel", "admin"),
    client.from("menu_items").select("id,label,sort_order").eq("panel", "autor"),
  ]);
  const values = Object.fromEntries((data ?? []).map((row) => [row.key, row.value ?? ""]));
  const categories = (categoriesData ?? []) as Category[];

  // Flattened to top-level rows for the editor — a group (Marketing) shows
  // as one reorderable/renamable row; its own children keep their built-in
  // order, out of scope for this editor (see menu-registry.ts).
  const adminMenu = applyMenuOverrides(ADMIN_MENU_DEFAULTS, (adminMenuOverrides ?? []) as MenuOverride[]);
  const authorMenu = applyMenuOverrides(AUTHOR_MENU_DEFAULTS, (authorMenuOverrides ?? []) as MenuOverride[]);
  const adminMenuItems: MenuEditorItem[] = adminMenu.map((item) => ({ id: item.id, label: item.label, href: isMenuGroup(item) ? undefined : item.href }));
  const authorMenuItems: MenuEditorItem[] = authorMenu.map((item) => ({ id: item.id, label: item.label, href: item.href }));

  // How many articles sit under each category — shown so deleting one isn't a
  // guess, and counting both an article's primary category and any additional
  // ones, same as the public category pages. Every article counts here, not
  // only published ones, since this is about what a delete would affect.
  const articleCounts: Record<string, number> = {};
  const counted = new Map<string, Set<string>>();
  const bump = (categoryId: string, articleId: string) => {
    if (!counted.has(categoryId)) counted.set(categoryId, new Set());
    counted.get(categoryId)!.add(articleId);
  };
  for (const article of (articlesData ?? []) as { id: string; category_id: string | null }[]) {
    if (article.category_id) bump(article.category_id, article.id);
  }
  for (const row of (extraCategoriesData ?? []) as { article_id: string; category_id: string }[]) {
    bump(row.category_id, row.article_id);
  }
  for (const [categoryId, ids] of counted) articleCounts[categoryId] = ids.size;

  const [presidentRace, ...governorRaces] = await Promise.all([getPresidentRace(), ...UF_IN_RUNOFF.map((uf) => getGovernorRace(uf))]);
  const electionsStatus: ElectionStatusRow[] = [
    electionRow("Presidente", presidentRace),
    ...governorRaces.map((race, i) => electionRow(`Governador — ${UF_OPTIONS.find((o) => o.code === UF_IN_RUNOFF[i])?.name ?? UF_IN_RUNOFF[i]}`, race)),
  ].filter((row): row is ElectionStatusRow => row !== null);

  return (
    <div>
      <SavedToast show={saved === "1"} />
      <PageHeader title="Configurações" subtitle="Identidade visual, contato e conteúdo exibido no site público" />

      <ConfiguracoesTabs
        values={values}
        categories={categories}
        articleCounts={articleCounts}
        logoError={logoError}
        faviconError={faviconError}
        initialTab={tab}
        updateSeoConfigAction={updateSeoConfig}
        siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? "https://grupofestina.com.br"}
        adminMenuItems={adminMenuItems}
        authorMenuItems={authorMenuItems}
        electionsStatus={electionsStatus}
      />
    </div>
  );
}
