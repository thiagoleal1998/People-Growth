"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/admin/ui";
import { TrendingUp, Building2, HandCoins, Users, Save, Info } from "lucide-react";
import { saveProjection } from "./actions";
import type { Columnist, FinanceProjection } from "@/types/database.types";

// Estimativas ilustrativas, não contábeis — cada empresa tem alíquotas e
// benefícios diferentes; use como ponto de partida e ajuste pro regime e
// porte reais, de preferência com o contador.
const REGIME_EXAMPLES = [
  { label: "CLT (Lucro Presumido/Real)", pct: 90, hint: "INSS patronal 20% + FGTS 8% + 13º/férias+1/3 ~12% + RAT/terceiros ~5% + provisão de rescisão/multa FGTS ~4% — soma ≈ 90%." },
  { label: "CLT (Simples Nacional)", pct: 60, hint: "INSS patronal normalmente incluído na guia única do Simples — sobra FGTS 8% + 13º/férias+1/3 ~12% + provisões ≈ 60%." },
  { label: "Estágio (CLT não se aplica)", pct: 15, hint: "Sem FGTS nem 13º/férias obrigatórios — só seguro contra acidentes + eventual auxílio transporte/alimentação." },
  { label: "PJ / Autônomo", pct: 0, hint: "Sem encargos trabalhistas — o valor pago já é o custo total (ajuste o 'salário' pra ser o valor da nota/contrato)." },
] as const;

// Faturamento bruto anual — não é o mesmo limite do lucro em si, mas é o
// que decide em qual regime a empresa pode/deve estar, o que por sua vez
// decide qual exemplo de encargo acima se aplica. Valores de referência
// (Lei Complementar 123/2006 e legislação do IRPJ) — mudam por lei de tempos
// em tempos, confirme com o contador antes de decidir qualquer coisa.
const REVENUE_BRACKETS = [
  { label: "Simples Nacional", limit: "até R$ 4.800.000,00/ano", hint: "Faturamento bruto nos últimos 12 meses — acima disso a empresa é obrigada a sair do regime." },
  { label: "Lucro Presumido", limit: "até R$ 78.000.000,00/ano", hint: "Faturamento bruto no ano anterior — acima disso, a apuração pelo Lucro Real passa a ser obrigatória." },
  { label: "Lucro Real", limit: "sem limite superior", hint: "Obrigatório acima do teto do Lucro Presumido, mas qualquer empresa pode optar por ele mesmo abaixo disso." },
] as const;

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function formatCentsToBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const fieldBoxStyle = { width: "100%", padding: "0.625rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--admin-border-strong)", fontSize: "0.9rem", boxSizing: "border-box" as const, fontFamily: "inherit", backgroundColor: "var(--admin-surface)", color: "var(--admin-text)" };

// A plain `<input type="number">` bound straight to a numeric prop shows a
// literal "0" the instant the field is cleared (e.target.value === "" →
// Number("") === 0), and that "0" then sits in the way of typing a fresh
// value — so this keeps its OWN text while the person is mid-edit (letting
// it sit empty) and only reconciles back to the outside `value` when that
// changes for a reason other than this field's own onChange (a regime
// preset button, loading a saved projection).
function NumberField({ label, hint, value, onChange, suffix }: { label: string; hint?: string; value: number; onChange: (v: number) => void; suffix?: string }) {
  const [text, setText] = useState(String(value));
  // Re-syncing from a changed outside `value` (a regime preset button,
  // loading a saved projection) during render — not in a useEffect — is
  // the pattern React itself recommends for "adjust state when a prop
  // changes": it only fires on an actual change, so it never fights the
  // user's own typing, and it skips the extra effect-triggered re-render.
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
    <div style={{ marginBottom: "1.125rem" }}>
      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--admin-text-secondary)", marginBottom: "0.375rem" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input type="text" inputMode="decimal" value={text} onChange={handleChange} style={suffix ? { ...fieldBoxStyle, paddingRight: "2.25rem" } : fieldBoxStyle} />
        {suffix && (
          <span style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--admin-faint)", fontSize: "0.875rem", pointerEvents: "none" }}>{suffix}</span>
        )}
      </div>
      {hint && <div style={{ fontSize: "0.75rem", color: "var(--admin-faint)", marginTop: "0.25rem" }}>{hint}</div>}
    </div>
  );
}

// A masked money field that behaves like a calculator or bank app's amount
// field — digits always accumulate from the right (typing "1","0","0","0"
// reads as R$ 10,00, then R$ 100,00, then R$ 1.000,00) — by intercepting
// the actual keystrokes and computing `cents` directly, rather than
// letting the browser insert the character into the text wherever the
// caret happens to be and then re-parsing the result. That "read it back"
// approach was tried first here and had a real bug: reformatting the
// value on every keystroke (adding/removing "." thousands separators as
// the digit count crosses a threshold) moves the caret somewhere browsers
// don't reliably agree on afterward, so the NEXT digit can land in the
// middle of the string instead of at the end — confirmed with a field
// focused via keyboard/Tab rather than a mouse click landing exactly at
// the end, which scrambled a typed "500000" into 500000000. Never relying
// on caret position at all removes the whole class of bug.
function useMaskedCents(value: number, onChange: (v: number) => void) {
  const [cents, setCents] = useState(() => Math.round(value * 100));
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    const externalCents = Math.round(value * 100);
    if (externalCents !== cents) setCents(externalCents);
  }

  function commit(next: number) {
    const clamped = Math.max(0, next);
    setCents(clamped);
    onChange(clamped / 100);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const hasSelection = e.currentTarget.selectionStart !== e.currentTarget.selectionEnd;
    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      commit(hasSelection ? Number(e.key) : cents * 10 + Number(e.key));
    } else if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      commit(hasSelection ? 0 : Math.floor(cents / 10));
    }
    // Everything else (Tab, arrows, Ctrl+A/C, …) is left alone.
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "");
    if (digits) commit(parseInt(digits, 10));
  }

  // React still wants a controlled <input>'s `value` paired with an
  // `onChange` — every real edit here already goes through onKeyDown/
  // onPaste with preventDefault, so this is just a no-op to satisfy that.
  function handleChange() {}

  return { cents, handleKeyDown, handlePaste, handleChange };
}

function CurrencyField({ label, hint, value, onChange }: { label: string; hint?: string; value: number; onChange: (v: number) => void }) {
  const { cents, handleKeyDown, handlePaste, handleChange } = useMaskedCents(value, onChange);

  return (
    <div style={{ marginBottom: "1.125rem" }}>
      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--admin-text-secondary)", marginBottom: "0.375rem" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--admin-faint)", fontSize: "0.875rem", pointerEvents: "none" }}>R$</span>
        <input
          type="text"
          inputMode="numeric"
          value={formatCentsToBRL(cents)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onChange={handleChange}
          style={{ ...fieldBoxStyle, paddingLeft: "2.25rem" }}
        />
      </div>
      {hint && <div style={{ fontSize: "0.75rem", color: "var(--admin-faint)", marginTop: "0.25rem" }}>{hint}</div>}
    </div>
  );
}

function BucketCard({ icon, label, pct, amount, color }: { icon: React.ReactNode; label: string; pct?: number; amount: number; color: string }) {
  return (
    <div style={{ backgroundColor: "var(--admin-surface)", border: "1px solid var(--admin-border)", borderRadius: "0.875rem", padding: "1.25rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color, marginBottom: "0.5rem" }}>
        {icon}
        <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--admin-text)" }}>{label}</span>
        {pct !== undefined && <span style={{ marginLeft: "auto", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)" }}>{pct}%</span>}
      </div>
      <div style={{ fontSize: "1.375rem", fontWeight: 800, color: "var(--admin-text)" }}>{formatBRL(amount)}</div>
    </div>
  );
}

// Resumo rápido's per-person breakdown — unlike the detailed tab's
// "Divisão entre os sócios" (custom % per founder), this one is always a
// plain equal split, per the request: the point of the quick tab is a
// faster back-of-envelope number, not another set of %s to maintain.
function EqualSplitList({ title, people, totalAmount, color }: { title: string; people: Columnist[]; totalAmount: number; color: string }) {
  const perPerson = people.length > 0 ? totalAmount / people.length : 0;
  return (
    <div style={{ backgroundColor: "var(--admin-surface)", border: "1px solid var(--admin-border)", borderRadius: "0.875rem", padding: "1.25rem" }}>
      <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--admin-text)", marginBottom: "0.875rem" }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
        {people.map((p) => (
          <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "0.875rem", color: "var(--admin-text)" }}>{p.name}</span>
            <span style={{ fontSize: "0.9375rem", fontWeight: 800, color }}>{formatBRL(perPerson)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const TABS = [
  { id: "detalhada", label: "Projeção detalhada" },
  { id: "rapida", label: "Resumo rápido" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export function ProjectionCalculator({
  founders,
  team,
  defaultRevenue,
  defaultExpense,
  saved,
}: {
  founders: Columnist[];
  team: Columnist[];
  defaultRevenue: number;
  defaultExpense: number;
  saved?: FinanceProjection | null;
}) {
  const [tab, setTab] = useState<TabId>("detalhada");

  const [revenue, setRevenue] = useState(saved?.revenue ?? defaultRevenue);
  const [expense, setExpense] = useState(saved?.expense ?? defaultExpense);
  const [companyPct, setCompanyPct] = useState(saved?.company_pct ?? 50);
  const [partnersPct, setPartnersPct] = useState(saved?.partners_pct ?? 50);

  // Projeto de folha: salário bruto por pessoa da Equipe (puxada do mesmo
  // cadastro do organograma — columnists com org_chart_manager_id) mais um
  // encargo único sobre todos, já que simular uma alíquota diferente por
  // pessoa não muda a mecânica, só a planilha — 80% é uma estimativa comum
  // de CLT completo (INSS patronal, FGTS, 13º, férias, RAT/terceiros), não
  // um valor oficial — ajuste pro regime real da empresa (veja os exemplos
  // de regime abaixo da tabela).
  const [salaries, setSalaries] = useState<Record<string, number>>(() => Object.fromEntries(team.map((t) => [t.id, saved?.salaries?.[t.id] ?? 0])));
  const [payrollTaxPct, setPayrollTaxPct] = useState(saved?.payroll_tax_pct ?? 80);

  // Equal split by default — editable per founder so an unequal stake (e.g.
  // different equity %) can still be modeled, just defaulting to the common
  // case of splitting evenly among however many founders exist today. The
  // last share absorbs the rounding remainder so the defaults sum to
  // exactly 100 (e.g. 33.3/33.3/33.4 for three), not 99.9-with-a-tail from
  // floating point.
  const [partnerShares, setPartnerShares] = useState<Record<string, number>>(() => {
    if (founders.length === 0) return {};
    if (saved?.partner_shares) {
      const fromSaved = Object.fromEntries(founders.map((f) => [f.id, saved.partner_shares[f.id] ?? 0]));
      if (Object.values(fromSaved).some((v) => v > 0)) return fromSaved;
    }
    const base = Math.floor(1000 / founders.length) / 10;
    const entries = founders.map((f, i) => [f.id, i === founders.length - 1 ? Math.round((100 - base * (founders.length - 1)) * 10) / 10 : base] as const);
    return Object.fromEntries(entries);
  });

  // Second tab — a standalone Lucro - Gastos = Margem split between sócios
  // e equipe, independent of the detailed payroll table above (no per-person
  // breakdown, just two blunt percentages) for a faster back-of-envelope
  // scenario.
  const [quickProfit, setQuickProfit] = useState(saved?.quick_profit ?? 0);
  const [quickCosts, setQuickCosts] = useState(saved?.quick_costs ?? 0);
  const [quickPartnersPct, setQuickPartnersPct] = useState(saved?.quick_partners_pct ?? 50);
  const [quickTeamPct, setQuickTeamPct] = useState(saved?.quick_team_pct ?? 50);

  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  async function handleSave() {
    setSaving(true);
    try {
      await saveProjection({ revenue, expense, companyPct, partnersPct, payrollTaxPct, salaries, partnerShares, quickProfit, quickCosts, quickPartnersPct, quickTeamPct });
      setSavedAt(new Date());
    } finally {
      setSaving(false);
    }
  }

  const payrollTotal = useMemo(
    () => Object.values(salaries).reduce((sum, s) => sum + s * (1 + payrollTaxPct / 100), 0),
    [salaries, payrollTaxPct]
  );

  const result = revenue - expense - payrollTotal;
  const splitTotal = Math.round((companyPct + partnersPct) * 10) / 10;
  const companyAmount = (result * companyPct) / 100;
  const partnersAmount = (result * partnersPct) / 100;
  const partnersShareTotal = useMemo(() => Math.round(Object.values(partnerShares).reduce((s, v) => s + v, 0) * 10) / 10, [partnerShares]);

  const quickMargin = quickProfit - quickCosts;
  const quickMarginPct = quickProfit > 0 ? (quickMargin / quickProfit) * 100 : 0;
  const quickSplitTotal = Math.round((quickPartnersPct + quickTeamPct) * 10) / 10;
  const quickPartnersAmount = (quickMargin * quickPartnersPct) / 100;
  const quickTeamAmount = (quickMargin * quickTeamPct) / 100;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
        <PageHeader title="Projeção" subtitle="Simulação de como o resultado se dividiria entre empresa e sócios, já descontando a folha de pagamento da equipe." />
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.25rem" }}>
          {savedAt && <span style={{ fontSize: "0.8125rem", color: "var(--admin-muted)" }}>Salvo às {savedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "#315E9C",
              color: "white",
              padding: "0.625rem 1.125rem",
              borderRadius: "0.625rem",
              fontWeight: 700,
              fontSize: "0.875rem",
              border: "none",
              cursor: saving ? "default" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            <Save size={16} /> {saving ? "Salvando..." : "Salvar projeção"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.25rem", borderBottom: "1px solid var(--admin-border)", margin: "1.25rem 0 1.5rem" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            style={{
              padding: "0.75rem 1.125rem",
              fontSize: "0.875rem",
              fontWeight: 700,
              color: tab === t.id ? "#315E9C" : "var(--admin-muted)",
              background: "none",
              border: "none",
              borderBottom: tab === t.id ? "2px solid #315E9C" : "2px solid transparent",
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "detalhada" ? (
        <div>
          {team.length > 0 && (
            <div style={{ backgroundColor: "var(--admin-surface)", border: "1px solid var(--admin-border)", borderRadius: "1rem", padding: "1.5rem", marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.125rem" }}>
                <Users size={17} color="#A07B3B" />
                <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--admin-text)" }}>Equipe e folha de pagamento</h2>
              </div>
              <div style={{ maxWidth: "220px" }}>
                <NumberField label="Encargos sobre a folha (%)" hint="Estimativa de INSS patronal, FGTS, 13º, férias etc. somados — ajuste pro regime real." value={payrollTaxPct} onChange={setPayrollTaxPct} suffix="%" />
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "0.625rem" }}>
                  <Info size={14} color="var(--admin-muted)" />
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Exemplos de regime (clique pra usar)</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem" }}>
                  {REGIME_EXAMPLES.map((r) => (
                    <button
                      key={r.label}
                      type="button"
                      title={r.hint}
                      onClick={() => setPayrollTaxPct(r.pct)}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: "0.125rem",
                        padding: "0.5rem 0.875rem",
                        borderRadius: "0.625rem",
                        border: payrollTaxPct === r.pct ? "1px solid #315E9C" : "1px solid var(--admin-border-strong)",
                        backgroundColor: payrollTaxPct === r.pct ? "rgba(49, 94, 156,0.08)" : "var(--admin-surface)",
                        cursor: "pointer",
                        textAlign: "left",
                        maxWidth: "15rem",
                      }}
                    >
                      <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: payrollTaxPct === r.pct ? "#315E9C" : "var(--admin-text)" }}>{r.label} — {r.pct}%</span>
                      <span style={{ fontSize: "0.7rem", color: "var(--admin-faint)", lineHeight: 1.4 }}>{r.hint}</span>
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--admin-faint)", marginTop: "0.5rem" }}>
                  Estimativas ilustrativas, não é orientação contábil — confirme as alíquotas reais com o contador da empresa.
                </div>
              </div>

              <div style={{ marginBottom: "0.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "0.625rem" }}>
                  <Info size={14} color="var(--admin-muted)" />
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Faixas de faturamento dos regimes (referência)</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem" }}>
                  {REVENUE_BRACKETS.map((r) => (
                    <div
                      key={r.label}
                      title={r.hint}
                      style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.125rem", padding: "0.5rem 0.875rem", borderRadius: "0.625rem", border: "1px solid var(--admin-border-strong)", maxWidth: "15rem" }}
                    >
                      <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--admin-text)" }}>{r.label} — {r.limit}</span>
                      <span style={{ fontSize: "0.7rem", color: "var(--admin-faint)", lineHeight: 1.4 }}>{r.hint}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--admin-faint)", marginTop: "0.5rem" }}>
                  Valores de referência (podem mudar por lei) — não é orientação contábil, confirme com o contador qual regime se aplica.
                </div>
              </div>

              <div style={{ overflowX: "auto", marginTop: "1.25rem" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "var(--admin-surface-alt)" }}>
                      {["Pessoa", "Cargo", "Salário bruto (R$)", "Custo total c/ encargos"].map((h) => (
                        <th key={h} style={{ padding: "0.625rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {team.map((t) => {
                      const salary = salaries[t.id] ?? 0;
                      const cost = salary * (1 + payrollTaxPct / 100);
                      return (
                        <tr key={t.id} style={{ borderTop: "1px solid var(--admin-border)" }}>
                          <td style={{ padding: "0.625rem 1rem", fontWeight: 700, color: "var(--admin-text)", fontSize: "0.875rem" }}>{t.name}</td>
                          <td style={{ padding: "0.625rem 1rem", fontSize: "0.8125rem", color: "var(--admin-muted)" }}>{t.org_chart_role || t.role_pt || "—"}</td>
                          <td style={{ padding: "0.625rem 1rem" }}>
                            <SalaryCell value={salary} onChange={(v) => setSalaries((prev) => ({ ...prev, [t.id]: v }))} />
                          </td>
                          <td style={{ padding: "0.625rem 1rem", fontWeight: 700, fontSize: "0.875rem", color: "var(--admin-text)", whiteSpace: "nowrap" }}>{formatBRL(cost)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: "1rem", padding: "0.875rem 1rem", borderRadius: "0.625rem", backgroundColor: "rgba(200,154,74,0.08)", border: "1px solid rgba(200,154,74,0.25)" }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--admin-faint)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Folha de pagamento total (com encargos)</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#A07B3B" }}>{formatBRL(payrollTotal)}</div>
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))", gap: "1.25rem", alignItems: "start" }}>
            <div style={{ backgroundColor: "var(--admin-surface)", border: "1px solid var(--admin-border)", borderRadius: "1rem", padding: "1.5rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--admin-text)", marginBottom: "1.125rem" }}>Base da projeção</h2>
              <CurrencyField label="Faturamento mensal projetado" hint="Começa com o MRR atual (clientes ativos) — ajuste pra simular outro cenário." value={revenue} onChange={setRevenue} />
              <CurrencyField label="Despesas fixas projetadas" hint="Começa com a média das despesas recentes — não inclui a folha, que já é descontada à parte abaixo." value={expense} onChange={setExpense} />
              <div style={{ padding: "0.875rem 1rem", borderRadius: "0.625rem", backgroundColor: "rgba(49, 94, 156,0.05)", border: "1px solid rgba(49, 94, 156,0.15)" }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--admin-faint)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>
                  Resultado a distribuir <span style={{ fontWeight: 500, textTransform: "none" }}>(faturamento − despesas − folha)</span>
                </div>
                <div style={{ fontSize: "1.375rem", fontWeight: 800, color: result >= 0 ? "#16A34A" : "#dc2626" }}>{formatBRL(result)}</div>
              </div>
            </div>

            <div style={{ backgroundColor: "var(--admin-surface)", border: "1px solid var(--admin-border)", borderRadius: "1rem", padding: "1.5rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--admin-text)", marginBottom: "1.125rem" }}>Divisão do resultado</h2>
              <NumberField label="Reserva da empresa (%)" value={companyPct} onChange={setCompanyPct} suffix="%" />
              <NumberField label="Sócios (%)" value={partnersPct} onChange={setPartnersPct} suffix="%" />
              {splitTotal !== 100 && (
                <div style={{ fontSize: "0.8125rem", color: "#b45309", backgroundColor: "rgba(217,119,6,0.1)", padding: "0.625rem 0.875rem", borderRadius: "0.5rem" }}>
                  As duas porcentagens somam {splitTotal}%, não 100% — os valores abaixo refletem exatamente o que foi digitado mesmo assim.
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: "1rem", margin: "1.25rem 0" }}>
            <BucketCard icon={<Building2 size={16} />} label="Empresa" pct={companyPct} amount={companyAmount} color="#315E9C" />
            <BucketCard icon={<HandCoins size={16} />} label="Sócios (total)" pct={partnersPct} amount={partnersAmount} color="#16A34A" />
            <BucketCard icon={<Users size={16} />} label="Folha (já descontada do resultado)" amount={payrollTotal} color="#A07B3B" />
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
                      <div style={{ marginBottom: "0.625rem" }}>
                        <ShareField value={share} onChange={(v) => setPartnerShares((prev) => ({ ...prev, [f.id]: v }))} />
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
      ) : (
        <div>
          <div style={{ backgroundColor: "var(--admin-surface)", border: "1px solid var(--admin-border)", borderRadius: "1rem", padding: "1.5rem", marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--admin-text)", marginBottom: "1.125rem" }}>Lucro, gastos e margem</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))", gap: "1.25rem" }}>
              <CurrencyField label="Lucro" value={quickProfit} onChange={setQuickProfit} />
              <CurrencyField label="Gastos" value={quickCosts} onChange={setQuickCosts} />
            </div>
            <div style={{ padding: "0.875rem 1rem", borderRadius: "0.625rem", backgroundColor: "rgba(49, 94, 156,0.05)", border: "1px solid rgba(49, 94, 156,0.15)" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--admin-faint)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>
                Margem <span style={{ fontWeight: 500, textTransform: "none" }}>(lucro − gastos)</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.625rem" }}>
                <div style={{ fontSize: "1.375rem", fontWeight: 800, color: quickMargin >= 0 ? "#16A34A" : "#dc2626" }}>{formatBRL(quickMargin)}</div>
                {quickProfit > 0 && <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--admin-muted)" }}>({quickMarginPct.toFixed(1)}%)</div>}
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: "var(--admin-surface)", border: "1px solid var(--admin-border)", borderRadius: "1rem", padding: "1.5rem", marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--admin-text)", marginBottom: "1.125rem" }}>Divisão da margem</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))", gap: "1.25rem" }}>
              <NumberField label="Sócios (%)" value={quickPartnersPct} onChange={setQuickPartnersPct} suffix="%" />
              <NumberField label="Equipe (%)" value={quickTeamPct} onChange={setQuickTeamPct} suffix="%" />
            </div>
            {quickSplitTotal !== 100 && (
              <div style={{ fontSize: "0.8125rem", color: "#b45309", backgroundColor: "rgba(217,119,6,0.1)", padding: "0.625rem 0.875rem", borderRadius: "0.5rem" }}>
                As duas porcentagens somam {quickSplitTotal}%, não 100% — os valores abaixo refletem exatamente o que foi digitado mesmo assim.
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: "1rem", marginBottom: founders.length > 0 || team.length > 0 ? "1.25rem" : 0 }}>
            <BucketCard icon={<HandCoins size={16} />} label="Sócios" pct={quickPartnersPct} amount={quickPartnersAmount} color="#16A34A" />
            <BucketCard icon={<Users size={16} />} label="Equipe" pct={quickTeamPct} amount={quickTeamAmount} color="#A07B3B" />
          </div>

          {(founders.length > 0 || team.length > 0) && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))", gap: "1rem" }}>
              {founders.length > 0 && (
                <EqualSplitList title="Sócios — dividido igualmente" people={founders} totalAmount={quickPartnersAmount} color="#16A34A" />
              )}
              {team.length > 0 && (
                <EqualSplitList title="Equipe — dividido igualmente" people={team} totalAmount={quickTeamAmount} color="#A07B3B" />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Salary cells are per-row in a table, narrower than the stacked form
// fields above — same masked-currency behavior, just a compact layout.
function SalaryCell({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const { cents, handleKeyDown, handlePaste, handleChange } = useMaskedCents(value, onChange);

  return (
    <div style={{ position: "relative", width: "11rem" }}>
      <span style={{ position: "absolute", left: "0.625rem", top: "50%", transform: "translateY(-50%)", color: "var(--admin-faint)", fontSize: "0.8125rem", pointerEvents: "none" }}>R$</span>
      <input
        type="text"
        inputMode="numeric"
        value={formatCentsToBRL(cents)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onChange={handleChange}
        style={{ width: "100%", padding: "0.4375rem 0.625rem 0.4375rem 2rem", borderRadius: "0.5rem", border: "1px solid var(--admin-border-strong)", fontSize: "0.875rem", backgroundColor: "var(--admin-surface)", color: "var(--admin-text)", boxSizing: "border-box" }}
      />
    </div>
  );
}

// Per-founder share, same "don't show a stuck 0" fix as NumberField but
// inline (no label/hint) to fit the compact partner card layout.
function ShareField({ value, onChange }: { value: number; onChange: (v: number) => void }) {
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
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <input
        type="text"
        inputMode="decimal"
        value={text}
        onChange={handleChange}
        style={{ width: "5rem", padding: "0.375rem 0.5rem", borderRadius: "0.375rem", border: "1px solid var(--admin-border-strong)", fontSize: "0.875rem", backgroundColor: "var(--admin-surface)", color: "var(--admin-text)" }}
      />
      <span style={{ fontSize: "0.8125rem", color: "var(--admin-muted)" }}>% do bloco de sócios</span>
    </div>
  );
}
