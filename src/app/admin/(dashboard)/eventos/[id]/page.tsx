import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EventForm } from "../EventForm";
import type { Event } from "@/types/database.types";

export default async function EditarEventoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: item } = await (supabase as any).from("events").select("*").eq("id", id).single();

  if (!item) notFound();

  return <EventForm item={item as Event} />;
}
