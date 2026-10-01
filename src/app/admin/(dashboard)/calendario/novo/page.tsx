import { CalendarItemForm } from "../CalendarItemForm";
import { monthParamKey, parseMonthParam } from "@/lib/calendar-grid";

export default async function NovoItemCalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; month?: string }>;
}) {
  const { date, month } = await searchParams;
  const { year, month: m } = parseMonthParam(month);
  return <CalendarItemForm date={date} month={monthParamKey(year, m)} />;
}
