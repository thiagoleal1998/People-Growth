import { createClient } from "@/lib/supabase/server";
import { PageHeader, PrimaryLinkButton, Card, EmptyState, Badge, ConfirmDeleteButton } from "@/components/admin/ui";
import { Plus, Edit } from "lucide-react";
import Link from "next/link";
import { deleteService } from "./actions";
import type { Service } from "@/types/database.types";

export default async function ServicosPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("services").select("*").order("order");
  const services = (data ?? []) as Service[];

  return (
    <div>
      <PageHeader
        title="Serviços"
        subtitle={`${services.length} serviço${services.length === 1 ? "" : "s"}`}
        action={<PrimaryLinkButton href="/admin/servicos/novo"><Plus size={16} /> Novo serviço</PrimaryLinkButton>}
      />

      <Card>
        {services.length === 0 ? (
          <EmptyState text="Nenhum serviço cadastrado." />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                {["Ordem", "Título", "Status", ""].map((h) => (
                  <th key={h} style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "0.875rem 1.25rem", color: "#94a3b8", fontSize: "0.875rem" }}>{s.order}</td>
                  <td style={{ padding: "0.875rem 1.25rem", fontWeight: 600, color: "#0d1b2a", fontSize: "0.875rem" }}>{s.title_pt}</td>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <Badge tone={s.status === "active" ? "success" : "neutral"}>{s.status === "active" ? "Ativo" : "Rascunho"}</Badge>
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Link href={`/admin/servicos/${s.id}`} style={{ padding: "0.375rem", color: "#4361EE", borderRadius: "0.375rem" }} title="Editar"><Edit size={15} /></Link>
                      <ConfirmDeleteButton confirmText={`Excluir o serviço "${s.title_pt}"?`} onDelete={() => deleteService(s.id)} />
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
