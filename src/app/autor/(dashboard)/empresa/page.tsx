import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import { OrganogramaCard } from "@/components/OrganogramaCard";
import type { Author } from "@/types/database.types";

export default async function EmpresaPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("authors").select("*").order("order");
  const authors = (data ?? []) as Author[];

  return (
    <div>
      <PageHeader title="A empresa" subtitle="Como o Grupo Festina é organizado." />
      <OrganogramaCard authors={authors} />
    </div>
  );
}
