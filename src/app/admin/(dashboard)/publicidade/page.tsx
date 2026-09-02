import { Plus, Edit } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, PrimaryLinkButton, Card, EmptyState, Badge, ConfirmDeleteButton } from "@/components/admin/ui";
import { SavedToast } from "@/components/admin/SavedToast";
import { AD_SLOT_DEFS } from "./ad-slots";
import { deleteAd } from "./actions";
import Link from "next/link";
import type { Ad, AdEvent } from "@/types/database.types";

export default async function PublicidadePage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const [{ data: adsData }, { data: eventsData }] = await Promise.all([
    client.from("ads").select("*").order("created_at", { ascending: false }),
    client.from("ad_events").select("ad_id, event_type").gte("created_at", since),
  ]);

  const ads = (adsData ?? []) as Ad[];
  const slotLabels = new Map<string, string>(AD_SLOT_DEFS.map((s) => [s.key, s.label]));

  const statsByAd = new Map<string, { impressions: number; clicks: number }>();
  for (const e of (eventsData ?? []) as Pick<AdEvent, "ad_id" | "event_type">[]) {
    if (!e.ad_id) continue;
    const s = statsByAd.get(e.ad_id) ?? { impressions: 0, clicks: 0 };
    if (e.event_type === "impression") s.impressions++;
    else s.clicks++;
    statsByAd.set(e.ad_id, s);
  }

  return (
    <div>
      <SavedToast show={saved === "1"} />
      <PageHeader
        title="Publicidade"
        subtitle="Anúncios do site — impressões e cliques dos últimos 30 dias."
        action={<PrimaryLinkButton href="/admin/publicidade/novo"><Plus size={16} /> Novo anúncio</PrimaryLinkButton>}
      />

      <Card>
        {ads.length === 0 ? (
          <EmptyState text="Nenhum anúncio cadastrado ainda." />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--admin-surface-alt)" }}>
                {["Anúncio", "Espaço", "Direcionamento", "Status", "Impressões (30d)", "Cliques (30d)", "CTR", ""].map((h) => (
                  <th key={h} style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ads.map((ad) => {
                const stats = statsByAd.get(ad.id) ?? { impressions: 0, clicks: 0 };
                const ctr = stats.impressions > 0 ? ((stats.clicks / stats.impressions) * 100).toFixed(1) : "—";
                const isLive = Boolean(ad.active && ad.image_url);
                return (
                  <tr key={ad.id} style={{ borderTop: "1px solid var(--admin-border)" }}>
                    <td style={{ padding: "0.875rem 1.25rem", fontWeight: 600, color: "var(--admin-text)", fontSize: "0.875rem", maxWidth: "220px" }}>
                      <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ad.title}</div>
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-text-secondary)", fontSize: "0.8125rem" }}>{slotLabels.get(ad.slot_key) ?? ad.slot_key}</td>
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      <Badge tone={ad.target_mode === "all" ? "neutral" : "warning"}>{ad.target_mode === "all" ? "Todas" : "Específicas"}</Badge>
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      {isLive ? <Badge tone="success">No ar</Badge> : <Badge tone="neutral">{ad.active ? "Sem imagem" : "Desativado"}</Badge>}
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-text-secondary)", fontSize: "0.875rem" }}>{stats.impressions.toLocaleString("pt-BR")}</td>
                    <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-text-secondary)", fontSize: "0.875rem" }}>{stats.clicks.toLocaleString("pt-BR")}</td>
                    <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-faint)", fontSize: "0.8125rem" }}>{ctr === "—" ? ctr : `${ctr}%`}</td>
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <Link href={`/admin/publicidade/${ad.id}`} style={{ padding: "0.375rem", color: "#4361EE", borderRadius: "0.375rem" }} title="Editar">
                          <Edit size={15} />
                        </Link>
                        <ConfirmDeleteButton confirmText={`Excluir o anúncio "${ad.title}"?`} onDelete={deleteAd.bind(null, ad.id)} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
