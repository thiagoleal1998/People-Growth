import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PromoForm } from "../PromoForm";
import type { Promo } from "@/types/database.types";

export default async function EditarPromocaoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ imageError?: string }>;
}) {
  const { id } = await params;
  const { imageError } = await searchParams;

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { data } = await client.from("promos").select("*").eq("id", id).single();
  const item = data as Promo | null;
  if (!item) notFound();

  return <PromoForm item={item} imageError={imageError} />;
}
