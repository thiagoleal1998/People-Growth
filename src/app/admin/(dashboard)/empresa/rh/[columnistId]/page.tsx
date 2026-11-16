import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CareerPlanForm } from "../CareerPlanForm";
import type { Columnist, CareerPlan } from "@/types/database.types";

export default async function CareerPlanPage({ params }: { params: Promise<{ columnistId: string }> }) {
  const { columnistId } = await params;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const [{ data: columnist }, { data: plan }] = await Promise.all([
    client.from("columnists").select("*").eq("id", columnistId).single(),
    client.from("career_plans").select("*").eq("columnist_id", columnistId).maybeSingle(),
  ]);

  if (!columnist) notFound();

  return <CareerPlanForm columnist={columnist as Columnist} plan={(plan as CareerPlan) ?? null} />;
}
