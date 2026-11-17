"use client";

import { useState } from "react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Edit, Users2 } from "lucide-react";
import { Card, EmptyState } from "@/components/admin/ui";
import { ROLE_LEVELS } from "@/lib/role-levels";
import type { Columnist, RoleProfile, CareerPlan } from "@/types/database.types";

const GENDER_LABEL: Record<string, string> = {
  masculino: "Masculino",
  feminino: "Feminino",
  nao_binario: "Não-binário",
  genero_fluido: "Gênero fluido",
  agenero: "Agênero",
  prefiro_nao_dizer: "Prefiro não dizer",
};

const GENDER_COLOR: Record<string, string> = {
  masculino: "#3B82F6",
  feminino: "#EC4899",
  nao_binario: "#8B5CF6",
  genero_fluido: "#14B8A6",
  agenero: "#F59E0B",
  prefiro_nao_dizer: "#94A3B8",
};

const LEVEL_COLOR: Record<string, string> = {
  c_level: "#315E9C",
  diretoria: "#7C3AED",
  heads: "#0EA5E9",
  gerentes: "#16A34A",
  coordenadores: "#F59E0B",
  supervisores: "#EA580C",
  analistas: "#DB2777",
  assistentes: "#64748B",
  colunistas: "#94A3B8",
};

// The "Cargos e Funções" level ids plus a synthetic "colunistas" group for
// active people with no role_profiles row at all — a columnist who only
// writes articles, with no assigned cargo.
const GROUPS = [...ROLE_LEVELS, { id: "colunistas" as const, label: "Colunistas" }];

const STAT_CARD_STYLE: CSSProperties = { borderRadius: "1rem", border: "1px solid var(--admin-border)", padding: "1.5rem" };
const CELL_STYLE: CSSProperties = { padding: "0.875rem 1rem", verticalAlign: "top", fontSize: "0.8125rem", color: "var(--admin-text-secondary)" };
const HEADER_STYLE: CSSProperties = { padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" };

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{ ...STAT_CARD_STYLE, backgroundColor: `${color}12`, borderColor: `${color}35` }}>
      <div style={{ fontSize: "0.8125rem", color, fontWeight: 700, marginBottom: "0.5rem" }}>{label}</div>
      <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--admin-text)" }}>{value}</div>
    </div>
  );
}

// Classic CSS-tricks donut-chart technique: a circle with circumference
// ~100 (r=15.9155), each segment drawn as its own stroked circle with
// stroke-dasharray "{pct} {100-pct}" and a cumulative dashoffset so
// segments chain around starting from 12 o'clock.
function GenderDonut({ counts, total }: { counts: [string, number][]; total: number }) {
  const r = 15.915494309189535;
  const segments = counts.reduce<{ gender: string; pct: number; dashoffset: number }[]>((acc, [gender, count]) => {
    const pct = total > 0 ? (count / total) * 100 : 0;
    const cumulative = acc.reduce((sum, s) => sum + s.pct, 0);
    return [...acc, { gender, pct, dashoffset: 25 - cumulative }];
  }, []);
  return (
    <svg viewBox="0 0 42 42" width="140" height="140" style={{ flexShrink: 0 }}>
      <circle cx="21" cy="21" r={r} fill="transparent" stroke="var(--admin-border)" strokeWidth="6" />
      {segments.map(({ gender, pct, dashoffset }) => (
        <circle
          key={gender}
          cx="21"
          cy="21"
          r={r}
          fill="transparent"
          stroke={GENDER_COLOR[gender] ?? "#94A3B8"}
          strokeWidth="6"
          strokeDasharray={`${pct} ${100 - pct}`}
          strokeDashoffset={dashoffset}
        />
      ))}
      <text x="21" y="19.5" textAnchor="middle" fontSize="7" fontWeight="800" fill="var(--admin-text)">{total}</text>
      <text x="21" y="26" textAnchor="middle" fontSize="3.2" fill="var(--admin-muted)">pessoas</text>
    </svg>
  );
}

function GenderStackedBar({ counts, total }: { counts: [string, number][]; total: number }) {
  if (total === 0) {
    return <div style={{ height: "0.875rem", borderRadius: "9999px", backgroundColor: "var(--admin-border)" }} />;
  }
  return (
    <div style={{ display: "flex", height: "0.875rem", borderRadius: "9999px", overflow: "hidden", width: "100%" }}>
      {counts.map(([gender, count]) => (
        <div key={gender} title={`${GENDER_LABEL[gender] ?? gender}: ${count}`} style={{ width: `${(count / total) * 100}%`, backgroundColor: GENDER_COLOR[gender] ?? "#94A3B8" }} />
      ))}
    </div>
  );
}

function genderCountsOf(members: Columnist[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const c of members) counts.set(c.gender, (counts.get(c.gender) ?? 0) + 1);
  return [...counts.entries()];
}

export function RHPanel({ columnists, roleProfiles, careerPlans }: { columnists: Columnist[]; roleProfiles: RoleProfile[]; careerPlans: CareerPlan[] }) {
  const [group, setGroup] = useState<(typeof GROUPS)[number]["id"]>("c_level");

  const active = columnists.filter((c) => c.status === "active");
  const levelByColumnist = new Map(roleProfiles.filter((r) => r.columnist_id).map((r) => [r.columnist_id as string, r.level]));
  const groupOf = (c: Columnist) => levelByColumnist.get(c.id) ?? "colunistas";

  const membersByGroup = new Map<string, Columnist[]>();
  for (const c of active) {
    const g = groupOf(c);
    membersByGroup.set(g, [...(membersByGroup.get(g) ?? []), c]);
  }

  const overallGenderCounts = genderCountsOf(active);
  const titleByColumnist = new Map(roleProfiles.filter((r) => r.columnist_id).map((r) => [r.columnist_id as string, r.title_pt ?? r.title_en ?? r.acronym ?? "—"]));
  const planByColumnist = new Map(careerPlans.map((p) => [p.columnist_id, p]));

  const visibleMembers = membersByGroup.get(group) ?? [];

  return (
    <div>
      {/* ===== Índices ===== */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
        <Users2 size={18} color="#315E9C" />
        <h2 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "var(--admin-text)" }}>Índices de gênero</h2>
      </div>

      <div style={{ display: "flex", gap: "1.75rem", flexWrap: "wrap", marginBottom: "1.75rem", alignItems: "center" }}>
        <GenderDonut counts={overallGenderCounts} total={active.length} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem", flex: 1, minWidth: "260px" }}>
          {overallGenderCounts.map(([gender, count]) => (
            <StatCard key={gender} label={GENDER_LABEL[gender] ?? gender} value={`${count} (${Math.round((count / active.length) * 100)}%)`} color={GENDER_COLOR[gender] ?? "#94A3B8"} />
          ))}
        </div>
      </div>

      <Card>
        <div style={{ padding: "1.25rem 1.5rem" }}>
          {GROUPS.map((g) => {
            const members = membersByGroup.get(g.id) ?? [];
            const counts = genderCountsOf(members);
            return (
              <div key={g.id} style={{ display: "grid", gridTemplateColumns: "140px 1fr 70px", alignItems: "center", gap: "1rem", padding: "0.625rem 0", borderTop: g.id === GROUPS[0].id ? "none" : "1px solid var(--admin-border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ width: "0.5rem", height: "0.5rem", borderRadius: "9999px", backgroundColor: LEVEL_COLOR[g.id], flexShrink: 0 }} />
                  <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--admin-text)" }}>{g.label}</span>
                </div>
                <GenderStackedBar counts={counts} total={members.length} />
                <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--admin-muted)", textAlign: "right" }}>{members.length}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ===== Plano de carreira ===== */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "2.5rem 0 1.25rem", paddingTop: "2rem", borderTop: "1px solid var(--admin-border)" }}>
        <Edit size={18} color="#315E9C" />
        <h2 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "var(--admin-text)" }}>Plano de carreira</h2>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
        {GROUPS.map((g) => {
          const count = (membersByGroup.get(g.id) ?? []).length;
          const isActive = group === g.id;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => setGroup(g.id)}
              style={{
                padding: "0.5rem 0.875rem",
                fontSize: "0.8125rem",
                fontWeight: 700,
                color: isActive ? "white" : "var(--admin-text-secondary)",
                backgroundColor: isActive ? LEVEL_COLOR[g.id] : "var(--admin-surface)",
                border: `1px solid ${isActive ? LEVEL_COLOR[g.id] : "var(--admin-border-strong)"}`,
                borderRadius: "9999px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
              }}
            >
              {g.label}
              <span style={{ fontSize: "0.6875rem", fontWeight: 800, color: isActive ? "white" : "var(--admin-muted)", backgroundColor: isActive ? "rgba(255,255,255,0.25)" : "var(--admin-border)", borderRadius: "9999px", padding: "0 0.4375rem" }}>{count}</span>
            </button>
          );
        })}
      </div>

      <Card>
        {visibleMembers.length === 0 ? (
          <EmptyState text="Ninguém cadastrado nesse grupo ainda." />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--admin-surface-alt)" }}>
                  {["Nome", "Cargo", "Gênero", "Plano de carreira", "Próxima revisão", ""].map((h) => (
                    <th key={h} style={HEADER_STYLE}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleMembers.map((c) => {
                  const plan = planByColumnist.get(c.id);
                  return (
                    <tr key={c.id} style={{ borderTop: "1px solid var(--admin-border)" }}>
                      <td style={{ ...CELL_STYLE, fontWeight: 800, color: "var(--admin-text)" }}>{c.name}</td>
                      <td style={CELL_STYLE}>{titleByColumnist.get(c.id) ?? "—"}</td>
                      <td style={CELL_STYLE}>{GENDER_LABEL[c.gender] ?? c.gender}</td>
                      <td style={CELL_STYLE}>{plan?.current_summary ? "Definido" : "Não definido"}</td>
                      <td style={CELL_STYLE}>{plan?.next_review_at ? new Date(`${plan.next_review_at}T00:00:00`).toLocaleDateString("pt-BR") : "—"}</td>
                      <td style={{ ...CELL_STYLE, minWidth: "auto" }}>
                        <Link href={`/admin/empresa/rh/${c.id}`} style={{ padding: "0.375rem", color: "#315E9C", borderRadius: "0.375rem", display: "inline-flex" }} title="Editar plano de carreira">
                          <Edit size={15} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
