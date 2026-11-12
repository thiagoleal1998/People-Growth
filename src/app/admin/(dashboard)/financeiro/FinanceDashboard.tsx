import Link from "next/link";
import { PageHeader, Card, EmptyState } from "@/components/admin/ui";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import type { FinanceEntry } from "@/types/database.types";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function Tile({ label, value, tone }: { label: string; value: string; tone?: "positive" | "negative" }) {
  return (
    <div style={{ backgroundColor: "var(--admin-surface)", border: "1px solid var(--admin-border)", borderRadius: "0.875rem", padding: "1.25rem 1.5rem" }}>
      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
      <div style={{ fontSize: "1.625rem", fontWeight: 800, marginTop: "0.375rem", color: tone === "positive" ? "#16A34A" : tone === "negative" ? "#dc2626" : "var(--admin-text)" }}>
        {value}
      </div>
    </div>
  );
}

// Grouped horizontal bars, two series (receita/despesa) per month, scaled to
// the largest single value across the whole window — a plain stat
// comparison, not a full chart library, consistent with the rest of this
// codebase's hand-rolled inline-style components.
function MonthlyBars({ months }: { months: { label: string; income: number; expense: number }[] }) {
  const max = Math.max(1, ...months.flatMap((m) => [m.income, m.expense]));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {months.map((m) => (
        <div key={m.label}>
          <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--admin-text)", marginBottom: "0.375rem" }}>{m.label}</div>
          {([
            { key: "income", value: m.income, color: "#315E9C" },
            { key: "expense", value: m.expense, color: "#C89A4A" },
          ] as const).map((s) => (
            <div key={s.key} style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.25rem" }}>
              <div style={{ flex: 1, backgroundColor: "var(--admin-surface-alt)", borderRadius: "0.25rem", overflow: "hidden", height: "0.875rem" }}>
                <div style={{ width: `${(s.value / max) * 100}%`, backgroundColor: s.color, height: "100%", borderRadius: "0.25rem" }} />
              </div>
              <div style={{ width: "6.5rem", flexShrink: 0, fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-text-secondary)", textAlign: "right" }}>
                {formatBRL(s.value)}
              </div>
            </div>
          ))}
        </div>
      ))}
      <div style={{ display: "flex", gap: "1.25rem", marginTop: "0.25rem", fontSize: "0.75rem", color: "var(--admin-muted)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}><span style={{ width: "0.625rem", height: "0.625rem", borderRadius: "9999px", backgroundColor: "#315E9C", display: "inline-block" }} /> Receita</span>
        <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}><span style={{ width: "0.625rem", height: "0.625rem", borderRadius: "9999px", backgroundColor: "#C89A4A", display: "inline-block" }} /> Despesa</span>
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("pt-BR");
}

export function FinanceDashboard({
  monthIncome,
  monthExpense,
  mrr,
  months,
  recentEntries,
  clientNameById,
}: {
  monthIncome: number;
  monthExpense: number;
  mrr: number;
  months: { label: string; income: number; expense: number }[];
  recentEntries: FinanceEntry[];
  clientNameById: Map<string, string>;
}) {
  const profit = monthIncome - monthExpense;
  const margin = monthIncome > 0 ? (profit / monthIncome) * 100 : 0;

  return (
    <div>
      <PageHeader title="Financeiro" subtitle="Visão geral do contexto financeiro do Grupo Festina — visível só para o C-level." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <Tile label="Receita do mês" value={formatBRL(monthIncome)} />
        <Tile label="Despesa do mês" value={formatBRL(monthExpense)} />
        <Tile label="Lucro do mês" value={formatBRL(profit)} tone={profit >= 0 ? "positive" : "negative"} />
        <Tile label="Margem" value={`${margin.toFixed(1)}%`} tone={margin >= 0 ? "positive" : "negative"} />
        <Tile label="MRR (clientes ativos)" value={formatBRL(mrr)} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(420px, 100%), 1fr))", gap: "1.25rem", alignItems: "start" }}>
        <div style={{ backgroundColor: "var(--admin-surface)", border: "1px solid var(--admin-border)", borderRadius: "1rem", padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--admin-text)", marginBottom: "1.25rem" }}>Receita x despesa — últimos 6 meses</h2>
          <MonthlyBars months={months} />
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.875rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--admin-text)" }}>Lançamentos recentes</h2>
            <Link href="/admin/financeiro/lancamentos" style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#315E9C", textDecoration: "none" }}>Ver todos →</Link>
          </div>
          <Card>
            {recentEntries.length === 0 ? (
              <EmptyState text="Nenhum lançamento ainda." />
            ) : (
              <div>
                {recentEntries.map((e, i) => (
                  <div key={e.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.875rem 1.25rem", borderTop: i === 0 ? "none" : "1px solid var(--admin-border)" }}>
                    {e.type === "income" ? <ArrowUpCircle size={16} color="#16A34A" style={{ flexShrink: 0 }} /> : <ArrowDownCircle size={16} color="#dc2626" style={{ flexShrink: 0 }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--admin-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.description}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--admin-muted)" }}>
                        {formatDate(e.entry_date)}{e.client_id ? ` · ${clientNameById.get(e.client_id) ?? ""}` : ""}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "0.8125rem", color: e.type === "income" ? "#16A34A" : "#dc2626", flexShrink: 0 }}>
                      {e.type === "income" ? "+" : "-"}{formatBRL(e.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
