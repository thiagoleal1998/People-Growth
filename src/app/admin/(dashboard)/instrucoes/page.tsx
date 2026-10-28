import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import { InstructionsClient } from "./InstructionsClient";
import type { InstructionItem } from "@/types/database.types";

export default async function InstrucoesAdminPage() {
  const supabase = await createClient();
  const { data } = await (supabase as any).from("instruction_items").select("*").order("sort_order", { ascending: true });
  const items = (data ?? []) as InstructionItem[];

  return (
    <div>
      <PageHeader title="Canal de Instruções" subtitle="FAQ e passo a passo para o colunista — aparece no painel do autor." />
      <InstructionsClient items={items} />
    </div>
  );
}
