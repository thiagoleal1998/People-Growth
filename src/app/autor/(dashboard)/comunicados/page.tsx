import { Megaphone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { PageHeader, Card, EmptyState } from "@/components/admin/ui";
import type { Announcement } from "@/types/database.types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function ComunicadosAutorPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { data } = await client.from("announcements").select("*").order("created_at", { ascending: false });
  const announcements = (data ?? []) as Announcement[];

  // Visiting this page counts as reading everything on it — one insert per
  // announcement not yet marked read, ignoring ones already marked (the
  // primary key on announcement_reads makes a duplicate insert redundant, but
  // skipping it here avoids sending rows that would just be discarded).
  if (profile?.id && announcements.length > 0) {
    const { data: alreadyRead } = await client.from("announcement_reads").select("announcement_id").eq("user_id", profile.id);
    const readIds = new Set(((alreadyRead ?? []) as { announcement_id: string }[]).map((r) => r.announcement_id));
    const toMark = announcements.filter((a) => !readIds.has(a.id)).map((a) => ({ announcement_id: a.id, user_id: profile.id }));
    if (toMark.length > 0) await client.from("announcement_reads").insert(toMark);
  }

  return (
    <div>
      <PageHeader title="Comunicados" subtitle="Mensagens enviadas pelos admins para toda a equipe." />
      {announcements.length === 0 ? (
        <Card>
          <EmptyState text="Nenhum comunicado ainda." />
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {announcements.map((item) => (
            <div key={item.id} style={{ backgroundColor: "var(--admin-surface)", borderRadius: "1rem", border: "1px solid var(--admin-border)", padding: "1.25rem 1.5rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.625rem", backgroundColor: "rgba(67,97,238,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Megaphone size={16} color="#4361EE" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: "0.9375rem", color: "var(--admin-text)" }}>{item.title}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--admin-faint)", marginTop: "0.125rem" }}>{formatDate(item.created_at)}</div>
                </div>
              </div>
              <p style={{ fontSize: "0.875rem", color: "var(--admin-text-secondary)", marginTop: "0.75rem", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{item.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
