import Link from "next/link";
import { Plus, Edit } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, PrimaryLinkButton, Card, EmptyState, Badge, ConfirmDeleteButton } from "@/components/admin/ui";
import { deleteMediaItem } from "./actions";
import type { MediaItem } from "@/types/database.types";

export default async function MidiaPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("media_items").select("*").order("order");
  const items = (data ?? []) as MediaItem[];

  return (
    <div>
      <PageHeader
        title="Na Mídia"
        subtitle={`${items.length} menç${items.length === 1 ? "ão" : "ões"}`}
        action={<PrimaryLinkButton href="/admin/midia/novo"><Plus size={16} /> Nova menção</PrimaryLinkButton>}
      />

      <Card>
        {items.length === 0 ? (
          <EmptyState text="Nenhuma menção cadastrada." />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                {["Título", "Veículo", "Tipo", "Data", ""].map((h) => (
                  <th key={h} style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "0.875rem 1.25rem", fontWeight: 600, color: "#0d1b2a", fontSize: "0.875rem" }}>{s.title}</td>
                  <td style={{ padding: "0.875rem 1.25rem", color: "#64748b", fontSize: "0.875rem" }}>{s.outlet ?? "—"}</td>
                  <td style={{ padding: "0.875rem 1.25rem" }}><Badge>{s.type}</Badge></td>
                  <td style={{ padding: "0.875rem 1.25rem", color: "#94a3b8", fontSize: "0.8125rem" }}>{s.date ? new Date(s.date).toLocaleDateString("pt-BR") : "—"}</td>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Link href={`/admin/midia/${s.id}`} style={{ padding: "0.375rem", color: "#4361EE", borderRadius: "0.375rem" }} title="Editar"><Edit size={15} /></Link>
                      <ConfirmDeleteButton confirmText={`Excluir "${s.title}"?`} onDelete={() => deleteMediaItem(s.id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
