import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getClientIp, checkRateLimit, looksLikeBot } from "@/lib/rate-limit";
import { COMPETENCIES, computeAssessment, type CompetencyRatings } from "@/lib/leadership-assessment";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      name,
      email,
      website,
      renderedAt,
      evaluatedName,
      evaluatedRole,
      evaluatorName,
      competencies,
      strengths,
      developmentNeeds,
      developmentPlan,
      nextActions,
      milestones,
    } = body as Record<string, unknown>;

    if (looksLikeBot(website, renderedAt)) {
      return NextResponse.json({ error: "Não foi possível processar." }, { status: 400 });
    }

    const ip = getClientIp(req);
    const { limited } = await checkRateLimit(ip, "leadership-assessment", { maxAttempts: 10, windowMinutes: 60 });
    if (limited) {
      return NextResponse.json({ error: "Muitas tentativas. Tente novamente mais tarde." }, { status: 429 });
    }

    if (typeof name !== "string" || !name.trim() || typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "Nome e e-mail são obrigatórios." }, { status: 400 });
    }
    if (typeof evaluatedName !== "string" || !evaluatedName.trim()) {
      return NextResponse.json({ error: "Nome da pessoa avaliada é obrigatório." }, { status: 400 });
    }
    if (typeof competencies !== "object" || competencies === null) {
      return NextResponse.json({ error: "Avaliação de competências é obrigatória." }, { status: 400 });
    }
    const ratings = competencies as CompetencyRatings;
    for (const c of COMPETENCIES) {
      const v = ratings[c.key];
      if (v !== 1 && v !== 2 && v !== 3) {
        return NextResponse.json({ error: "Todas as competências precisam de uma nota." }, { status: 400 });
      }
    }

    const result = computeAssessment(ratings);

    const supabase = await createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase as any;

    const { data: lead } = await client
      .from("leads")
      .insert({
        name: name.trim().slice(0, 120),
        email: email.trim().slice(0, 200),
        phone: null,
        message: null,
        service_interest: null,
        source: "Ferramenta: Diagnóstico de Liderança",
        status: "new",
        notes: null,
      })
      .select("id")
      .single();

    const safeMilestones =
      typeof milestones === "object" && milestones !== null
        ? milestones
        : { short: [], medium: [], long: [] };

    await client.from("leadership_assessments").insert({
      lead_id: lead?.id ?? null,
      evaluated_name: evaluatedName.trim().slice(0, 200),
      evaluated_role: typeof evaluatedRole === "string" ? evaluatedRole.trim().slice(0, 200) || null : null,
      evaluator_name: typeof evaluatorName === "string" ? evaluatorName.trim().slice(0, 200) || null : null,
      competencies: ratings,
      strengths: typeof strengths === "string" ? strengths.slice(0, 4000) || null : null,
      development_needs: typeof developmentNeeds === "string" ? developmentNeeds.slice(0, 4000) || null : null,
      development_plan: typeof developmentPlan === "string" ? developmentPlan.slice(0, 4000) || null : null,
      next_actions: typeof nextActions === "string" ? nextActions.slice(0, 4000) || null : null,
      milestones: safeMilestones,
      performance_score: result.performanceScore,
      behavior_score: result.behaviorScore,
      quadrant_label: result.quadrant.labelPt,
    });

    return NextResponse.json({
      performanceScore: result.performanceScore,
      behaviorScore: result.behaviorScore,
      quadrant: result.quadrant,
    });
  } catch (err) {
    console.error("Leadership assessment submit error:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
