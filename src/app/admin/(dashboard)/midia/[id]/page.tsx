import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MediaForm } from "../MediaForm";
import type { MediaItem } from "@/types/database.types";

export default async function EditarMidiaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: item } = await (supabase as any).from("media_items").select("*").eq("id", id).single();

  if (!item) notFound();

  return <MediaForm item={item as MediaItem} />;
}
