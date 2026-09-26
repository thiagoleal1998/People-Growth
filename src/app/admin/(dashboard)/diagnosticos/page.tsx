import Link from "next/link";
import { Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Card, EmptyState, Badge } from "@/components/admin/ui";
import { ResourcesSubNav } from "@/components/admin/ResourcesSubNav";
import type { LeadershipAssessment, Lead } from "@/types/database.types";

type AssessmentRow = LeadershipAssessment & { leads: Pick<Lead, "name" | "email" | "status"> | null };

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

export default async function DiagnosticosPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("leadership_assessments")
    .select("*, leads(name, email, status)")
    .order("created_at", { ascending: false });
  const items = (data ?? []) as AssessmentRow[];

  return (
    <div>
      <PageHeader title="Diagnósticos de Liderança" subtitle={`${items.length} diagnóstico${items.length === 1 ? "" : "s"} preenchido${items.length === 1 ? "" : "s"}`} />

      <ResourcesSubNav active="tool" />

      <Card>
        {items.length === 0 ? (
          <EmptyState text="Nenhum diagnóstico preenchido ainda." />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--admin-surface-alt)" }}>
                {["Pessoa avaliada", "Cargo", "Classificação", "Avaliador", "Lead", "Data", ""].map((h) => (
                  <th key={h} style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} style={{ borderTop: "1px solid var(--admin-border)" }}>
                  <td style={{ padding: "0.875rem 1.25rem", fontWeight: 600, color: "var(--admin-text)", fontSize: "0.875rem" }}>{item.evaluated_name}</td>
                  <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-muted)", fontSize: "0.875rem" }}>{item.evaluated_role ?? "—"}</td>
                  <td style={{ padding: "0.875rem 1.25rem" }}><Badge>{item.quadrant_label}</Badge></td>
                  <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-muted)", fontSize: "0.875rem" }}>{item.evaluator_name ?? "—"}</td>
                  <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-muted)", fontSize: "0.8125rem" }}>
                    {item.leads ? (
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--admin-text)" }}>{item.leads.name}</div>
                        <div>{item.leads.email}</div>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={{ padding: "0.875rem 1.25rem", color: "var(--admin-faint)", fontSize: "0.8125rem", whiteSpace: "nowrap" }}>{formatDate(item.created_at)}</td>
                  <td style={{ padding: "0.875rem 1.25rem" }}>
                    <Link href={`/admin/diagnosticos/${item.id}`} style={{ padding: "0.375rem", color: "#4361EE", borderRadius: "0.375rem" }} title="Ver detalhes">
                      <Eye size={15} />
                    </Link>
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
