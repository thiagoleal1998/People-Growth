import Link from "next/link";
import type { CSSProperties } from "react";
import { Users, Edit } from "lucide-react";
import { Card, EmptyState } from "@/components/admin/ui";
import type { Columnist, RoleProfile, CareerPlan } from "@/types/database.types";

const GENDER_LABEL: Record<string, string> = {
  masculino: "Masculino",
  feminino: "Feminino",
  nao_binario: "Não-binário",
  genero_fluido: "Gênero fluido",
  agenero: "Agênero",
  prefiro_nao_dizer: "Prefiro não dizer",
};

const STAT_CARD_STYLE: CSSProperties = { backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", padding: "1.5rem" };
const CELL_STYLE: CSSProperties = { padding: "0.875rem 1rem", verticalAlign: "top", fontSize: "0.8125rem", color: "var(--admin-text-secondary)" };
const HEADER_STYLE: CSSProperties = { padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" };

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={STAT_CARD_STYLE}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.75rem" }}>
        <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.625rem", backgroundColor: "#315E9C18", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Users size={17} color="#315E9C" />
        </div>
        <span style={{ fontSize: "0.8125rem", color: "var(--admin-muted)", fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--admin-text)" }}>{value}</div>
      {sub && <div style={{ fontSize: "0.75rem", color: "var(--admin-faint)", marginTop: "0.25rem" }}>{sub}</div>}
    </div>
  );
}

export function RHPanel({ columnists, roleProfiles, careerPlans }: { columnists: Columnist[]; roleProfiles: RoleProfile[]; careerPlans: CareerPlan[] }) {
  const active = columnists.filter((c) => c.status === "active");
  const founders = active.filter((c) => c.is_founder);
  const team = active.filter((c) => !c.is_founder);

  const genderCounts = new Map<string, number>();
  for (const c of active) genderCounts.set(c.gender, (genderCounts.get(c.gender) ?? 0) + 1);

  const titleByColumnist = new Map(roleProfiles.filter((r) => r.columnist_id).map((r) => [r.columnist_id as string, r.title_pt ?? r.acronym ?? "—"]));
  const planByColumnist = new Map(careerPlans.map((p) => [p.columnist_id, p]));

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.75rem" }}>
        <StatCard label="Pessoas ativas" value={active.length} />
        <StatCard label="Fundadores" value={founders.length} />
        <StatCard label="Equipe" value={team.length} />
        {[...genderCounts.entries()].map(([gender, count]) => (
          <StatCard key={gender} label={GENDER_LABEL[gender] ?? gender} value={count} sub={active.length > 0 ? `${Math.round((count / active.length) * 100)}% do total` : undefined} />
        ))}
      </div>

      <Card>
        {active.length === 0 ? (
          <EmptyState text="Nenhuma pessoa ativa cadastrada ainda." />
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
                {active.map((c) => {
                  const plan = planByColumnist.get(c.id);
                  return (
                    <tr key={c.id} style={{ borderTop: "1px solid var(--admin-border)" }}>
                      <td style={{ ...CELL_STYLE, fontWeight: 800, color: "var(--admin-text)" }}>{c.name}</td>
                      <td style={CELL_STYLE}>{titleByColumnist.get(c.id) ?? "—"}</td>
                      <td style={CELL_STYLE}>{GENDER_LABEL[c.gender] ?? c.gender}</td>
                      <td style={CELL_STYLE}>{plan?.current_summary ? "Definido" : "Não definido"}</td>
                      <td style={CELL_STYLE}>{plan?.next_review_at ? new Date(plan.next_review_at).toLocaleDateString("pt-BR") : "—"}</td>
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
