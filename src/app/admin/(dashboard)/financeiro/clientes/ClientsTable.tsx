import Link from "next/link";
import { Plus, Edit } from "lucide-react";
import { Card, EmptyState, PrimaryLinkButton, ConfirmDeleteButton, Badge } from "@/components/admin/ui";
import { deleteFinanceClient } from "./actions";
import type { FinanceClient } from "@/types/database.types";

const statusTone: Record<FinanceClient["status"], "success" | "warning" | "neutral"> = {
  active: "success",
  paused: "warning",
  completed: "neutral",
};
const statusLabel: Record<FinanceClient["status"], string> = {
  active: "Ativo",
  paused: "Pausado",
  completed: "Encerrado",
};

function formatBRL(value: number | null) {
  if (value === null) return "—";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function ClientsTable({ clients }: { clients: FinanceClient[] }) {
  const activeMrr = clients.filter((c) => c.status === "active").reduce((sum, c) => sum + (c.contract_value ?? 0), 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ fontSize: "0.875rem", color: "var(--admin-muted)" }}>
          MRR dos clientes ativos: <strong style={{ color: "var(--admin-text)" }}>{formatBRL(activeMrr)}</strong>
        </div>
        <PrimaryLinkButton href="/admin/financeiro/clientes/novo">
          <Plus size={16} /> Novo cliente
        </PrimaryLinkButton>
      </div>
      <Card>
        {clients.length === 0 ? (
          <EmptyState text="Nenhum cliente cadastrado ainda." />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--admin-surface-alt)" }}>
                  {["Nome", "Status", "Contrato (R$/mês)", "Início", "Fim", ""].map((h) => (
                    <th key={h} style={{ padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id} style={{ borderTop: "1px solid var(--admin-border)" }}>
                    <td style={{ padding: "0.875rem 1.25rem", fontWeight: 700, color: "var(--admin-text)", fontSize: "0.875rem" }}>{c.name}</td>
                    <td style={{ padding: "0.875rem 1.25rem" }}><Badge tone={statusTone[c.status]}>{statusLabel[c.status]}</Badge></td>
                    <td style={{ padding: "0.875rem 1.25rem", fontSize: "0.875rem", color: "var(--admin-text-secondary)" }}>{formatBRL(c.contract_value)}</td>
                    <td style={{ padding: "0.875rem 1.25rem", fontSize: "0.8125rem", color: "var(--admin-muted)" }}>{c.start_date ?? "—"}</td>
                    <td style={{ padding: "0.875rem 1.25rem", fontSize: "0.8125rem", color: "var(--admin-muted)" }}>{c.end_date ?? "—"}</td>
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      <div style={{ display: "flex", gap: "0.25rem" }}>
                        <Link href={`/admin/financeiro/clientes/${c.id}`} style={{ padding: "0.375rem", color: "#315E9C", borderRadius: "0.375rem" }} title="Editar">
                          <Edit size={15} />
                        </Link>
                        <ConfirmDeleteButton confirmText={`Excluir o cliente "${c.name}"?`} onDelete={deleteFinanceClient.bind(null, c.id)} />
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
