"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ErrorReport } from "@/types/database.types";

export async function updateErrorReportStatus(id: string, status: ErrorReport["status"]) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("error_reports").update({ status }).eq("id", id);
  revalidatePath("/admin/erros");
}

export async function deleteErrorReport(id: string) {
  const supabase = await createClient();
  await supabase.from("error_reports").delete().eq("id", id);
  revalidatePath("/admin/erros");
}
