import Link from "next/link";
import { Plus, Edit, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { Card, EmptyState, PrimaryLinkButton, ConfirmDeleteButton } from "@/components/admin/ui";
import { deleteFinanceEntry } from "./actions";
import type { FinanceEntry } from "@/types/database.types";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("pt-BR");
}

export function EntriesTable({ entries, clientNameById }: { entries: FinanceEntry[]; clientNameById: Map<string, string> }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <PrimaryLinkButton href="/admin/financeiro/lancamentos/novo">
          <Plus size={16} /> Novo lançamento
        </PrimaryLinkButton>
      </div>
      <Card>
        {entries.length === 0 ? (
          <EmptyState text="Nenhum lançamento cadastrado ainda." />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--admin-surface-alt)" }}>
                  {["", "Descrição", "Categoria", "Cliente", "Recorrência", "Data", "Valor", ""].map((h) => (
                    <th key={h} style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} style={{ borderTop: "1px solid var(--admin-border)" }}>
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      {e.type === "income" ? <ArrowUpCircle size={16} color="#16A34A" /> : <ArrowDownCircle size={16} color="#dc2626" />}
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem", fontWeight: 600, color: "var(--admin-text)", fontSize: "0.875rem" }}>{e.description}</td>
                    <td style={{ padding: "0.875rem 1.25rem", fontSize: "0.8125rem", color: "var(--admin-muted)" }}>{e.category ?? "—"}</td>
                    <td style={{ padding: "0.875rem 1.25rem", fontSize: "0.8125rem", color: "var(--admin-muted)" }}>{e.client_id ? clientNameById.get(e.client_id) ?? "—" : "—"}</td>
                    <td style={{ padding: "0.875rem 1.25rem", fontSize: "0.8125rem", color: "var(--admin-muted)" }}>{e.recurrence === "monthly" ? "Mensal" : "Única"}</td>
                    <td style={{ padding: "0.875rem 1.25rem", fontSize: "0.8125rem", color: "var(--admin-muted)", whiteSpace: "nowrap" }}>{formatDate(e.entry_date)}</td>
                    <td style={{ padding: "0.875rem 1.25rem", fontWeight: 700, fontSize: "0.875rem", color: e.type === "income" ? "#16A34A" : "#dc2626", whiteSpace: "nowrap" }}>
                      {e.type === "income" ? "+" : "-"}{formatBRL(e.amount)}
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      <div style={{ display: "flex", gap: "0.25rem" }}>
                        <Link href={`/admin/financeiro/lancamentos/${e.id}`} style={{ padding: "0.375rem", color: "#315E9C", borderRadius: "0.375rem" }} title="Editar">
                          <Edit size={15} />
                        </Link>
                        <ConfirmDeleteButton confirmText={`Excluir o lançamento "${e.description}"?`} onDelete={deleteFinanceEntry.bind(null, e.id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
