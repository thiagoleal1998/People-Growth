"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/admin/ui";
import { TrendingUp, Building2, Users, HandCoins } from "lucide-react";
import type { Columnist } from "@/types/database.types";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function NumberField({ label, hint, value, onChange }: { label: string; hint?: string; value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ marginBottom: "1.125rem" }}>
      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--admin-text-secondary)", marginBottom: "0.375rem" }}>{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        style={{ width: "100%", padding: "0.625rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--admin-border-strong)", fontSize: "0.9rem", boxSizing: "border-box", fontFamily: "inherit", backgroundColor: "var(--admin-surface)", color: "var(--admin-text)" }}
      />
      {hint && <div style={{ fontSize: "0.75rem", color: "var(--admin-faint)", marginTop: "0.25rem" }}>{hint}</div>}
    </div>
  );
}

function BucketCard({ icon, label, pct, amount, color }: { icon: React.ReactNode; label: string; pct: number; amount: number; color: string }) {
  return (
    <div style={{ backgroundColor: "var(--admin-surface)", border: "1px solid var(--admin-border)", borderRadius: "0.875rem", padding: "1.25rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color, marginBottom: "0.5rem" }}>
        {icon}
        <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--admin-text)" }}>{label}</span>
        <span style={{ marginLeft: "auto", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)" }}>{pct}%</span>
      </div>
      <div style={{ fontSize: "1.375rem", fontWeight: 800, color: "var(--admin-text)" }}>{formatBRL(amount)}</div>
    </div>
  );
}

export function ProjectionCalculator({ founders, defaultRevenue, defaultExpense }: { founders: Columnist[]; defaultRevenue: number; defaultExpense: number }) {
  const [revenue, setRevenue] = useState(Math.round(defaultRevenue));
  const [expense, setExpense] = useState(Math.round(defaultExpense));
  const [companyPct, setCompanyPct] = useState(30);
  const [payrollPct, setPayrollPct] = useState(30);
  const [partnersPct, setPartnersPct] = useState(40);

  // Equal split by default — editable per founder so an unequal stake (e.g.
  // different equity %) can still be modeled, just defaulting to the common
  // case of splitting evenly among however many founders exist today. The
  // last share absorbs the rounding remainder so the defaults sum to
  // exactly 100 (e.g. 33.3/33.3/33.4 for three), not 99.9-with-a-tail from
  // floating point.
  const [partnerShares, setPartnerShares] = useState<Record<string, number>>(() => {
    if (founders.length === 0) return {};
    const base = Math.floor((1000 / founders.length)) / 10;
    const entries = founders.map((f, i) => [f.id, i === founders.length - 1 ? Math.round((100 - base * (founders.length - 1)) * 10) / 10 : base] as const);
    return Object.fromEntries(entries);
  });

  const result = revenue - expense;
  const splitTotal = Math.round((companyPct + payrollPct + partnersPct) * 10) / 10;
  const companyAmount = (result * companyPct) / 100;
  const payrollAmount = (result * payrollPct) / 100;
  const partnersAmount = (result * partnersPct) / 100;
  const partnersShareTotal = useMemo(() => Math.round(Object.values(partnerShares).reduce((s, v) => s + v, 0) * 10) / 10, [partnerShares]);

  return (
    <div>
      <PageHeader title="Projeção" subtitle="Simulação de como o resultado se dividiria entre empresa, funcionários e sócios — não altera nem salva nada, é só uma calculadora." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))", gap: "1.25rem", alignItems: "start" }}>
        <div style={{ backgroundColor: "var(--admin-surface)", border: "1px solid var(--admin-border)", borderRadius: "1rem", padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--admin-text)", marginBottom: "1.125rem" }}>Base da projeção</h2>
          <NumberField label="Faturamento mensal projetado (R$)" hint="Começa com o MRR atual (clientes ativos) — ajuste pra simular outro cenário." value={revenue} onChange={setRevenue} />
          <NumberField label="Despesas fixas projetadas (R$)" hint="Começa com a média das despesas recentes." value={expense} onChange={setExpense} />
          <div style={{ padding: "0.875rem 1rem", borderRadius: "0.625rem", backgroundColor: "rgba(49, 94, 156,0.05)", border: "1px solid rgba(49, 94, 156,0.15)" }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--admin-faint)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Resultado a distribuir</div>
            <div style={{ fontSize: "1.375rem", fontWeight: 800, color: result >= 0 ? "#16A34A" : "#dc2626" }}>{formatBRL(result)}</div>
          </div>
        </div>

        <div style={{ backgroundColor: "var(--admin-surface)", border: "1px solid var(--admin-border)", borderRadius: "1rem", padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--admin-text)", marginBottom: "1.125rem" }}>Divisão do resultado</h2>
          <NumberField label="Reserva da empresa (%)" value={companyPct} onChange={setCompanyPct} />
          <NumberField label="Funcionários / folha (%)" value={payrollPct} onChange={setPayrollPct} />
          <NumberField label="Sócios (%)" value={partnersPct} onChange={setPartnersPct} />
          {splitTotal !== 100 && (
            <div style={{ fontSize: "0.8125rem", color: "#b45309", backgroundColor: "rgba(217,119,6,0.1)", padding: "0.625rem 0.875rem", borderRadius: "0.5rem" }}>
              As três porcentagens somam {splitTotal}%, não 100% — os valores abaixo refletem exatamente o que foi digitado mesmo assim.
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: "1rem", margin: "1.25rem 0" }}>
        <BucketCard icon={<Building2 size={16} />} label="Empresa" pct={companyPct} amount={companyAmount} color="#315E9C" />
        <BucketCard icon={<Users size={16} />} label="Funcionários" pct={payrollPct} amount={payrollAmount} color="#A07B3B" />
        <BucketCard icon={<HandCoins size={16} />} label="Sócios (total)" pct={partnersPct} amount={partnersAmount} color="#16A34A" />
      </div>

      {founders.length > 0 && (
        <div style={{ backgroundColor: "var(--admin-surface)", border: "1px solid var(--admin-border)", borderRadius: "1rem", padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.125rem" }}>
            <TrendingUp size={17} color="#315E9C" />
            <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--admin-text)" }}>Divisão entre os sócios</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", gap: "1rem" }}>
            {founders.map((f) => {
              const share = partnerShares[f.id] ?? 0;
              const amount = (partnersAmount * share) / 100;
              return (
                <div key={f.id} style={{ border: "1px solid var(--admin-border)", borderRadius: "0.75rem", padding: "1rem" }}>
                  <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--admin-text)", marginBottom: "0.5rem" }}>{f.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.625rem" }}>
                    <input
                      type="number"
                      value={share}
                      onChange={(e) => setPartnerShares((prev) => ({ ...prev, [f.id]: Number(e.target.value) || 0 }))}
                      style={{ width: "5rem", padding: "0.375rem 0.5rem", borderRadius: "0.375rem", border: "1px solid var(--admin-border-strong)", fontSize: "0.875rem", backgroundColor: "var(--admin-surface)", color: "var(--admin-text)" }}
                    />
                    <span style={{ fontSize: "0.8125rem", color: "var(--admin-muted)" }}>% do bloco de sócios</span>
                  </div>
                  <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "#16A34A" }}>{formatBRL(amount)}</div>
                </div>
              );
            })}
          </div>
          {partnersShareTotal !== 100 && (
            <div style={{ fontSize: "0.8125rem", color: "#b45309", marginTop: "0.875rem" }}>
              As participações dos sócios somam {partnersShareTotal}%, não 100%.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
