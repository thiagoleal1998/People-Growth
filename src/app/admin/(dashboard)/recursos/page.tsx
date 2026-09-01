import Link from "next/link";
import { Plus, Edit, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, PrimaryLinkButton, Card, EmptyState, Badge, ConfirmDeleteButton } from "@/components/admin/ui";
import { deleteResource } from "./actions";
import type { Resource } from "@/types/database.types";

export default async function RecursosPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("resources").select("*").order("created_at", { ascending: false });
  const items = (data ?? []) as Resource[];

  return (
    <div>
      <PageHeader
        title="Recursos"
        subtitle={`${items.length} recurso${items.length === 1 ? "" : "s"}`}
        action={<PrimaryLinkButton href="/admin/recursos/novo"><Plus size={16} /> Novo recurso</PrimaryLinkButton>}
      />

      <Card>
        {items.length === 0 ? (
          <EmptyState text="Nenhum recurso cadastrado." />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                {["Título", "Tipo", "Downloads", "Status", ""].map((h) => (
                  <th key={h} style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "0.875rem 1.25rem", fontWeight: 600, color: "#0d1b2a", fontSize: "0.875rem" }}>{s.title_pt}</td>
                  <td style={{ padding: "0.875rem 1.25rem" }}><Badge>{s.type}</Badge></td>
                  <td style={{ padding: "0.875rem 1.25rem", color: "#64748b", fontSize: "0.875rem" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}><Download size={13} /> {s.download_count}</span>
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <Badge tone={s.status === "active" ? "success" : "neutral"}>{s.status === "active" ? "Ativo" : "Rascunho"}</Badge>
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Link href={`/admin/recursos/${s.id}`} style={{ padding: "0.375rem", color: "#4361EE", borderRadius: "0.375rem" }} title="Editar"><Edit size={15} /></Link>
                      <ConfirmDeleteButton confirmText={`Excluir o recurso "${s.title_pt}"?`} onDelete={deleteResource.bind(null, s.id)} />
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
