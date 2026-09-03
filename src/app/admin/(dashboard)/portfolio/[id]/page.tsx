import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PortfolioForm } from "../PortfolioForm";
import type { PortfolioCase } from "@/types/database.types";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function EditarPortfolioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: item } = await (supabase as any).from("portfolio_cases").select("*").eq("id", id).single();

  if (!item) notFound();

  return <PortfolioForm item={item as PortfolioCase} />;
}
