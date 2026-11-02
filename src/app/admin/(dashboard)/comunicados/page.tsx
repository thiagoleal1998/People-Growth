import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import { AnnouncementsClient } from "./AnnouncementsClient";
import type { Announcement } from "@/types/database.types";

export default async function ComunicadosPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("announcements").select("*").order("created_at", { ascending: false });
  const announcements = (data ?? []) as Announcement[];

  return (
    <div>
      <PageHeader title="Comunicados" subtitle="Mensagens enviadas a todos os colunistas e admins. Aparecem na home do painel do colunista." />
      <AnnouncementsClient announcements={announcements} />
    </div>
  );
}
