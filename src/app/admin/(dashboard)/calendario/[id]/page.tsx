import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CalendarItemForm } from "../CalendarItemForm";
import { monthParamKey, parseMonthParam } from "@/lib/calendar-grid";
import type { ContentCalendarItem } from "@/types/database.types";

export default async function EditarItemCalendarioPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ month?: string }>;
}) {
  const { id } = await params;
  const { month } = await searchParams;
  const { year, month: m } = parseMonthParam(month);
  const monthKey = monthParamKey(year, m);

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  const { data } = await client.from("content_calendar_items").select("*").eq("id", id).single();
  const item = data as ContentCalendarItem | null;
  if (!item) notFound();

  return <CalendarItemForm item={item} month={monthKey} />;
}
