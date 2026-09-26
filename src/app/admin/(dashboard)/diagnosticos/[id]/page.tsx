import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FormShell, Badge, ConfirmDeleteButton } from "@/components/admin/ui";
import { LeadershipNineBox } from "@/components/LeadershipNineBox";
import { COMPETENCIES, quadrantLabel, type CompetencyRatings } from "@/lib/leadership-assessment";
import { deleteAssessment } from "../actions";
import type { LeadershipAssessment, Lead } from "@/types/database.types";

type AssessmentDetail = LeadershipAssessment & { leads: Lead | null };
type Milestones = { short: string[]; medium: string[]; long: string[] };

const RATING_LABEL: Record<number, string> = { 1: "Abaixo dos padrões", 2: "Dentro dos padrões", 3: "Excelente" };

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

export default async function DiagnosticoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("leadership_assessments").select("*, leads(*)").eq("id", id).single();
  if (!data) notFound();
  const item = data as AssessmentDetail;
  const ratings = item.competencies as CompetencyRatings;
  const milestones = item.milestones as Milestones;
  // quadrant_label persists the pt-BR text at submission time for the list
  // view; the mark (★●■▲✕) isn't stored separately, so it's recomputed here
  // from the same scores — single source of truth, matches the lib's logic.
  const quadrant = quadrantLabel(item.performance_score, item.behavior_score);

  return (
    <FormShell
      title={item.evaluated_name}
      backHref="/admin/diagnosticos"
      action={<ConfirmDeleteButton confirmText={`Excluir o diagnóstico de "${item.evaluated_name}"?`} onDelete={deleteAssessment.bind(null, item.id)} />}
    >
      <div style={{ marginBottom: "1.5rem" }}>
        <Badge>{item.quadrant_label}</Badge>
        <span style={{ marginLeft: "0.75rem", color: "var(--admin-muted)", fontSize: "0.875rem" }}>
          {item.evaluated_role ? `${item.evaluated_role} · ` : ""}
          {formatDate(item.created_at)}
        </span>
      </div>

      {item.leads && (
        <div style={{ backgroundColor: "var(--admin-surface-alt)", borderRadius: "0.75rem", padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-faint)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.25rem" }}>Lead</div>
          <div style={{ fontWeight: 600, color: "var(--admin-text)" }}>{item.leads.name}</div>
          <div style={{ color: "var(--admin-muted)", fontSize: "0.875rem" }}>{item.leads.email}</div>
          {item.evaluator_name && <div style={{ color: "var(--admin-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>Avaliador: {item.evaluator_name}</div>}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
        <LeadershipNineBox
          performanceScore={item.performance_score}
          behaviorScore={item.behavior_score}
          personLabel={item.evaluated_name}
          legendMark={quadrant.legendMark}
          locale="pt"
        />
      </div>

      <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--admin-text)", marginBottom: "0.75rem" }}>Ficha de avaliação</h3>
      <div style={{ display: "grid", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {COMPETENCIES.map((c) => (
          <div key={c.key} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", fontSize: "0.875rem", borderBottom: "1px solid var(--admin-border)", paddingBottom: "0.5rem" }}>
            <span style={{ color: "var(--admin-muted)" }}>{c.labelPt}</span>
            <span style={{ fontWeight: 700, color: "var(--admin-text)" }}>{RATING_LABEL[ratings[c.key] ?? 0] ?? "—"}</span>
          </div>
        ))}
      </div>

      {[
        { label: "Pontos altos de desempenho", value: item.strengths },
        { label: "Necessidades de desenvolvimento", value: item.development_needs },
        { label: "Plano de desenvolvimento", value: item.development_plan },
        { label: "Próximas ações possíveis", value: item.next_actions },
      ].map(
        (f) =>
          f.value && (
            <div key={f.label} style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-faint)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.25rem" }}>{f.label}</div>
              <p style={{ fontSize: "0.875rem", color: "var(--admin-text)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{f.value}</p>
            </div>
          )
      )}

      <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--admin-text)", margin: "1.5rem 0 0.75rem" }}>Marcos da estratégia</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1.25rem" }}>
        {[
          { title: "Curto prazo (0-2 anos)", items: milestones?.short ?? [] },
          { title: "Médio prazo (2-5 anos)", items: milestones?.medium ?? [] },
          { title: "Longo prazo (5+ anos)", items: milestones?.long ?? [] },
        ].map((m) => (
          <div key={m.title}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-faint)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.5rem" }}>{m.title}</div>
            {m.items.length === 0 ? (
              <p style={{ fontSize: "0.8125rem", color: "var(--admin-faint)" }}>—</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: "1.125rem", fontSize: "0.8125rem", color: "var(--admin-text)", lineHeight: 1.6 }}>
                {m.items.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </FormShell>
  );
}
