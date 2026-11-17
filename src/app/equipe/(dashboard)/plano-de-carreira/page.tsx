import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { PageHeader, Card, EmptyState } from "@/components/admin/ui";
import { renderMarkdownLite } from "@/lib/markdown-lite";
import type { CareerPlan } from "@/types/database.types";

function Field({ label, text }: { label: string; text: string | null }) {
  if (!text) return null;
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.5rem" }}>{label}</div>
      {/* eslint-disable-next-line react/no-danger */}
      <div className="role-profile-cell" dangerouslySetInnerHTML={{ __html: renderMarkdownLite(text) }} />
    </div>
  );
}

export default async function MeuPlanoDeCarreiraPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { data } = profile?.columnist_id
    ? await client.from("career_plans").select("*").eq("columnist_id", profile.columnist_id).maybeSingle()
    : { data: null };
  const plan = data as CareerPlan | null;

  return (
    <div>
      <PageHeader title="Meu plano de carreira" subtitle="Preenchido pelos fundadores — leitura apenas." />
      <Card>
        {!plan || (!plan.current_summary && !plan.goals) ? (
          <EmptyState text="Seu plano de carreira ainda não foi preenchido." />
        ) : (
          <div style={{ padding: "1.75rem" }}>
            <Field label="Situação atual" text={plan.current_summary} />
            <Field label="Objetivos e próximos passos" text={plan.goals} />
            {plan.next_review_at && (
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.5rem" }}>Próxima revisão</div>
                <div style={{ fontSize: "0.875rem", color: "var(--admin-text)" }}>{new Date(`${plan.next_review_at}T00:00:00`).toLocaleDateString("pt-BR")}</div>
              </div>
            )}
          </div>
        )}
      </Card>
      <style>{`
        .role-profile-cell p { margin: 0 0 0.5rem; }
        .role-profile-cell p:last-child { margin-bottom: 0; }
        .role-profile-cell ul { margin: 0; padding-left: 1.125rem; }
        .role-profile-cell li { margin-bottom: 0.375rem; }
        .role-profile-cell li:last-child { margin-bottom: 0; }
        .role-profile-cell strong { color: var(--admin-text); }
      `}</style>
    </div>
  );
}
