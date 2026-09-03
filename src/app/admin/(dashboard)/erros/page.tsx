import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import { ErrorReportsClient } from "./ErrorReportsClient";
import type { ErrorReport } from "@/types/database.types";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function ErrosPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("error_reports").select("*").order("created_at", { ascending: false });
  const reports = (data ?? []) as ErrorReport[];

  return (
    <div>
      <PageHeader title="Erros reportados" subtitle={`${reports.length} report${reports.length === 1 ? "" : "s"} recebido${reports.length === 1 ? "" : "s"} pelo botão "Comunicar erro"`} />
      <ErrorReportsClient reports={reports} />
    </div>
  );
}
