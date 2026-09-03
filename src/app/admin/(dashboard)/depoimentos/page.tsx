import Link from "next/link";
import { Plus, Edit } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, PrimaryLinkButton, Card, EmptyState, Badge, ConfirmDeleteButton } from "@/components/admin/ui";
import { SavedToast } from "@/components/admin/SavedToast";
import { deleteTestimonial } from "./actions";
import type { Testimonial } from "@/types/database.types";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function DepoimentosPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("testimonials").select("*").order("order");
  const items = (data ?? []) as Testimonial[];

  return (
    <div>
      <SavedToast show={saved === "1"} />
      <PageHeader
        title="Depoimentos"
        subtitle={`${items.length} depoimento${items.length === 1 ? "" : "s"}`}
        action={<PrimaryLinkButton href="/admin/depoimentos/novo"><Plus size={16} /> Novo depoimento</PrimaryLinkButton>}
      />

      <Card>
        {items.length === 0 ? (
          <EmptyState text="Nenhum depoimento cadastrado." />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--admin-surface-alt)" }}>
                {["Nome", "Empresa", "Status", ""].map((h) => (
                  <th key={h} style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} style={{ borderTop: "1px solid var(--admin-border)" }}>
                  <td style={{ padding: "0.875rem 1.25rem", fontWeight: 600, color: "var(--admin-text)", fontSize: "0.875rem" }}>{s.name}</td>
                  <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-muted)", fontSize: "0.875rem" }}>{s.company ?? "—"}</td>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <Badge tone={s.status === "active" ? "success" : "neutral"}>{s.status === "active" ? "Ativo" : "Inativo"}</Badge>
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Link href={`/admin/depoimentos/${s.id}`} style={{ padding: "0.375rem", color: "#4361EE", borderRadius: "0.375rem" }} title="Editar"><Edit size={15} /></Link>
                      <ConfirmDeleteButton confirmText={`Excluir o depoimento de "${s.name}"?`} onDelete={deleteTestimonial.bind(null, s.id)} />
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
