import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import { SavedToast } from "@/components/admin/SavedToast";
import { EventosTabs } from "./EventosTabs";
import type { Event } from "@/types/database.types";

export default async function EventosAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; saved?: string }>;
}) {
  const { tab, saved } = await searchParams;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data } = await client.from("events").select("*").order("order").order("date_start");
  const events = (data ?? []) as Event[];

  return (
    <div>
      <SavedToast show={saved === "1"} />
      <PageHeader title="Feiras e Eventos" subtitle="Planejamento de participação em feiras, congressos e eventos de relacionamento." />
      <EventosTabs events={events} initialTab={tab} />
    </div>
  );
}
