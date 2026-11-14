"use client";

import { useState } from "react";
import { PageHeader } from "@/components/admin/ui";
import { Save, Info } from "lucide-react";
import { savePayoutParams } from "./actions";
import type { ColumnistPayout } from "@/lib/columnist-payout";
import type { Columnist } from "@/types/database.types";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

const fieldBoxStyle = { width: "100%", padding: "0.625rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--admin-border-strong)", fontSize: "0.9rem", boxSizing: "border-box" as const, fontFamily: "inherit", backgroundColor: "var(--admin-surface)", color: "var(--admin-text)" };

// Same "don't show a stuck 0 while clearing the field" fix as the
// Projeção calculator's NumberField — adjusting state from a changed prop
// during render (not inside a useEffect) is the pattern React itself
// recommends for this.
function RateField({ label, value, onChange, suffix }: { label: string; value: number; onChange: (v: number) => void; suffix?: string }) {
  const [text, setText] = useState(String(value));
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    if (Number(text) !== value) setText(String(value));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setText(raw);
    if (raw.trim() === "") {
      onChange(0);
      return;
    }
    const parsed = Number(raw.replace(",", "."));
    if (!Number.isNaN(parsed)) onChange(parsed);
  }

  return (
    <div>
      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--admin-text-secondary)", marginBottom: "0.375rem" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input type="text" inputMode="decimal" value={text} onChange={handleChange} style={suffix ? { ...fieldBoxStyle, paddingRight: "2.25rem" } : fieldBoxStyle} />
        {suffix && <span style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--admin-faint)", fontSize: "0.875rem", pointerEvents: "none" }}>{suffix}</span>}
      </div>
    </div>
  );
}

export function ParametrosForm({
  perArticleRate,
  weeklyRankBonuses,
  columnists,
  payouts,
  monthLabel,
}: {
  perArticleRate: number;
  weeklyRankBonuses: number[];
  columnists: Pick<Columnist, "id" | "name">[];
  payouts: Record<string, ColumnistPayout>;
  monthLabel: string;
}) {
  const [rate, setRate] = useState(perArticleRate);
  const [bonuses, setBonuses] = useState(weeklyRankBonuses);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  async function handleSave() {
    setSaving(true);
    try {
      await savePayoutParams({ perArticleRate: rate, weeklyRankBonuses: bonuses });
      setSavedAt(new Date());
    } finally {
      setSaving(false);
    }
  }

  const rows = columnists
    .map((c) => ({ columnist: c, payout: payouts[c.id] }))
    .filter((r) => r.payout && (r.payout.articlesCount > 0 || r.payout.weeklyBonusTotal > 0));
  const grandTotal = rows.reduce((sum, r) => sum + (r.payout?.total ?? 0), 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
        <PageHeader title="Parâmetros" subtitle="Tabela de remuneração dos colunistas — por artigo publicado e por aparição no ranking semanal de mais lidas." />
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.25rem" }}>
          {savedAt && <span style={{ fontSize: "0.8125rem", color: "var(--admin-muted)" }}>Salvo às {savedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#315E9C", color: "white", padding: "0.625rem 1.125rem", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.875rem", border: "none", cursor: saving ? "default" : "pointer", opacity: saving ? 0.7 : 1 }}
          >
            <Save size={16} /> {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: "var(--admin-surface)", border: "1px solid var(--admin-border)", borderRadius: "1rem", padding: "1.5rem", marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--admin-text)", marginBottom: "0.375rem" }}>Por artigo publicado</h2>
        <p style={{ fontSize: "0.8125rem", color: "var(--admin-muted)", marginBottom: "1rem" }}>Valor pago por cada artigo publicado no mês, multiplicado pela quantidade.</p>
        <div style={{ maxWidth: "220px" }}>
          <RateField label="Valor por artigo" value={rate} onChange={setRate} suffix="R$" />
        </div>
      </div>

      <div style={{ backgroundColor: "var(--admin-surface)", border: "1px solid var(--admin-border)", borderRadius: "1rem", padding: "1.5rem", marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--admin-text)", marginBottom: "0.375rem" }}>Ranking semanal de mais lidas</h2>
        <p style={{ fontSize: "0.8125rem", color: "var(--admin-muted)", marginBottom: "1rem" }}>
          Bônus pago ao colunista de cada artigo que ficar entre as 5 mais lidas da semana — somado nas 4 semanas do mês (dias 1–7, 8–14, 15–21 e 22 até o fim).
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(140px, 100%), 1fr))", gap: "1rem" }}>
          {bonuses.map((b, i) => (
            <RateField
              key={i}
              label={`${i + 1}º lugar`}
              value={b}
              onChange={(v) => setBonuses((prev) => prev.map((x, idx) => (idx === i ? v : x)))}
              suffix="R$"
            />
          ))}
        </div>
      </div>

      <div style={{ backgroundColor: "var(--admin-surface)", border: "1px solid var(--admin-border)", borderRadius: "1rem", padding: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
          <Info size={15} color="var(--admin-muted)" />
          <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--admin-text)" }}>Remuneração calculada — {monthLabel}</h2>
        </div>
        <p style={{ fontSize: "0.8125rem", color: "var(--admin-muted)", marginBottom: "1.125rem" }}>
          Calculado com os valores acima e puxado automaticamente pra &quot;Despesa do mês&quot; na Visão geral — não precisa lançar à parte.
        </p>
        {rows.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem 1rem", color: "var(--admin-faint)", fontSize: "0.875rem" }}>Nenhum colunista com artigo publicado neste mês ainda.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--admin-surface-alt)" }}>
                  {["Colunista", "Artigos no mês", "Bônus semanal", "Total"].map((h) => (
                    <th key={h} style={{ padding: "0.625rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(({ columnist, payout }) => (
                  <tr key={columnist.id} style={{ borderTop: "1px solid var(--admin-border)" }}>
                    <td style={{ padding: "0.625rem 1rem", fontWeight: 700, color: "var(--admin-text)", fontSize: "0.875rem" }}>{columnist.name}</td>
                    <td style={{ padding: "0.625rem 1rem", fontSize: "0.8125rem", color: "var(--admin-muted)" }}>{payout!.articlesCount} ({formatBRL(payout!.articlesAmount)})</td>
                    <td style={{ padding: "0.625rem 1rem", fontSize: "0.8125rem", color: "var(--admin-muted)" }}>{formatBRL(payout!.weeklyBonusTotal)}</td>
                    <td style={{ padding: "0.625rem 1rem", fontWeight: 800, fontSize: "0.9375rem", color: "#A07B3B", whiteSpace: "nowrap" }}>{formatBRL(payout!.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "2px solid var(--admin-border-strong)" }}>
                  <td colSpan={3} style={{ padding: "0.75rem 1rem", fontWeight: 700, fontSize: "0.8125rem", color: "var(--admin-text)" }}>Total</td>
                  <td style={{ padding: "0.75rem 1rem", fontWeight: 800, fontSize: "1rem", color: "var(--admin-text)" }}>{formatBRL(grandTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
