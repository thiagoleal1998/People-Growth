import Link from "next/link";
import { Edit } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Card, Badge } from "@/components/admin/ui";
import { SavedToast } from "@/components/admin/SavedToast";
import { AD_SLOT_DEFS } from "./ad-slots";
import type { AdSlot, AdEvent } from "@/types/database.types";

export default async function PublicidadePage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const [{ data: slotsData }, { data: eventsData }] = await Promise.all([
    client.from("ad_slots").select("*"),
    client.from("ad_events").select("ad_slot_key, event_type").gte("created_at", since),
  ]);

  const slots = new Map(((slotsData ?? []) as AdSlot[]).map((s) => [s.key, s]));

  const statsByKey = new Map<string, { impressions: number; clicks: number }>();
  for (const e of (eventsData ?? []) as Pick<AdEvent, "ad_slot_key" | "event_type">[]) {
    const s = statsByKey.get(e.ad_slot_key) ?? { impressions: 0, clicks: 0 };
    if (e.event_type === "impression") s.impressions++;
    else s.clicks++;
    statsByKey.set(e.ad_slot_key, s);
  }

  return (
    <div>
      <SavedToast show={saved === "1"} />
      <PageHeader title="Publicidade" subtitle="Espaços de banner do site — impressões e cliques dos últimos 30 dias." />

      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "var(--admin-surface-alt)" }}>
              {["Espaço", "Status", "Impressões (30d)", "Cliques (30d)", "CTR", ""].map((h) => (
                <th key={h} style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AD_SLOT_DEFS.map(({ key, label }) => {
              const slot = slots.get(key);
              const stats = statsByKey.get(key) ?? { impressions: 0, clicks: 0 };
              const ctr = stats.impressions > 0 ? ((stats.clicks / stats.impressions) * 100).toFixed(1) : "—";
              const isLive = Boolean(slot?.active && slot?.image_url);
              return (
                <tr key={key} style={{ borderTop: "1px solid var(--admin-border)" }}>
                  <td style={{ padding: "0.875rem 1.25rem", fontWeight: 600, color: "var(--admin-text)", fontSize: "0.875rem" }}>{label}</td>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    {isLive ? <Badge tone="success">No ar</Badge> : <Badge tone="neutral">{slot?.active ? "Sem imagem" : "Desativado"}</Badge>}
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-text-secondary)", fontSize: "0.875rem" }}>{stats.impressions.toLocaleString("pt-BR")}</td>
                  <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-text-secondary)", fontSize: "0.875rem" }}>{stats.clicks.toLocaleString("pt-BR")}</td>
                  <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-faint)", fontSize: "0.8125rem" }}>{ctr === "—" ? ctr : `${ctr}%`}</td>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <Link href={`/admin/publicidade/${key}`} style={{ padding: "0.375rem", color: "#4361EE", borderRadius: "0.375rem" }} title="Editar">
                      <Edit size={15} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
