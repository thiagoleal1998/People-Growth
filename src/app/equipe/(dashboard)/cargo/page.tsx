import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { PageHeader, Card, EmptyState } from "@/components/admin/ui";
import { renderMarkdownLite } from "@/lib/markdown-lite";
import type { RoleProfile } from "@/types/database.types";

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

export default async function MeuCargoPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { data } = profile?.columnist_id
    ? await client.from("role_profiles").select("*").eq("columnist_id", profile.columnist_id).maybeSingle()
    : { data: null };
  const role = data as RoleProfile | null;

  return (
    <div>
      <PageHeader title="Meu cargo" subtitle="Sua função e responsabilidades em Cargos e Funções." />
      <Card>
        {!role ? (
          <EmptyState text="Você ainda não tem um cargo vinculado em Cargos e Funções. Fale com um fundador." />
        ) : (
          <div style={{ padding: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "1.5rem" }}>
              {role.acronym && <span style={{ fontWeight: 800, fontSize: "1.0625rem", color: "#315E9C" }}>{role.acronym}</span>}
              <span style={{ fontWeight: 800, fontSize: "1.0625rem", color: "var(--admin-text)" }}>{role.title_en || role.title_pt || "—"}</span>
            </div>
            {role.title_pt && role.title_en && (
              <div style={{ fontSize: "0.875rem", color: "var(--admin-muted)", marginBottom: "1.5rem" }}>{role.title_pt}</div>
            )}
            <Field label="Função" text={role.function_summary} />
            <Field label="Responsabilidades gerais" text={role.general_responsibilities} />
            <Field label="Responsabilidades primárias" text={role.primary_responsibilities} />
            <Field label="Responsabilidades secundárias" text={role.secondary_responsibilities} />
            <Field label="Responsabilidades terciárias" text={role.tertiary_responsibilities} />
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
