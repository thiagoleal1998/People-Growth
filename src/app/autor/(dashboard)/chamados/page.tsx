import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import { InternalTicketsClient } from "@/components/tickets/InternalTicketsClient";
import { createInternalTicket } from "./actions";
import type { InternalTicket } from "@/types/database.types";

export default async function ChamadosAutorPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("internal_tickets").select("*").order("created_at", { ascending: false });
  const tickets = (data ?? []) as InternalTicket[];

  return (
    <div>
      <PageHeader
        title="Chamados"
        subtitle="Reporte um erro que você encontrou ou sugira uma melhoria para o site e o painel"
      />
      <InternalTicketsClient tickets={tickets} canManage={false} createAction={createInternalTicket} />
    </div>
  );
}
