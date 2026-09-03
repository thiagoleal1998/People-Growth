import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import { ChamadosTabs } from "./ChamadosTabs";
import type { ErrorReport, InternalTicket } from "@/types/database.types";

export default async function ChamadosPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const [{ data: reportsData }, { data: ticketsData }] = await Promise.all([
    client.from("error_reports").select("*").order("created_at", { ascending: false }),
    client.from("internal_tickets").select("*").order("created_at", { ascending: false }),
  ]);

  const reports = (reportsData ?? []) as ErrorReport[];
  const tickets = (ticketsData ?? []) as InternalTicket[];

  return (
    <div>
      <PageHeader
        title="Chamados"
        subtitle="Erros reportados pelo site e chamados internos de autores e administradores"
      />
      <ChamadosTabs reports={reports} tickets={tickets} />
    </div>
  );
}
