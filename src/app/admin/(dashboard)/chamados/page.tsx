import { Suspense } from "react";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import { ChamadosTabs } from "./ChamadosTabs";
import type { ErrorReport, InternalTicket, UserProfile, Columnist } from "@/types/database.types";

export default async function ChamadosPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  // user_profiles has no "admins see everyone" RLS policy (only "read own
  // row") — the admin client bypasses that, same as /admin/usuarios.
  const admin = await createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminClient = admin as any;

  const [{ data: reportsData }, { data: ticketsData }, { data: usersData }, { data: columnistsData }] = await Promise.all([
    client.from("error_reports").select("*").order("created_at", { ascending: false }),
    client.from("internal_tickets").select("*").order("created_at", { ascending: false }),
    adminClient.from("user_profiles").select("*").order("created_at"),
    adminClient.from("columnists").select("id, name"),
  ]);

  const reports = (reportsData ?? []) as ErrorReport[];
  const tickets = (ticketsData ?? []) as InternalTicket[];
  const users = (usersData ?? []) as UserProfile[];
  const columnists = (columnistsData ?? []) as Pick<Columnist, "id" | "name">[];
  const columnistNameById = new Map(columnists.map((a) => [a.id, a.name]));
  // Only admins can be the "responsible" person on a ticket — columnists
  // (including the ticket's own creator) shouldn't show up in that picker.
  const members = users
    .filter((u) => u.role === "admin")
    .map((u) => ({ id: u.id, name: (u.columnist_id && columnistNameById.get(u.columnist_id)) || u.email }));

  return (
    <div>
      <PageHeader
        title="Chamados"
        subtitle="Erros reportados pelo site e chamados internos de colunistas e administradores"
      />
      <Suspense fallback={null}>
        <ChamadosTabs reports={reports} tickets={tickets} members={members} />
      </Suspense>
    </div>
  );
}
