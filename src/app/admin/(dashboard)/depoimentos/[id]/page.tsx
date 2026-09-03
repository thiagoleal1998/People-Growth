import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TestimonialForm } from "../TestimonialForm";
import type { Testimonial } from "@/types/database.types";

export default async function EditarDepoimentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: item } = await (supabase as any).from("testimonials").select("*").eq("id", id).single();

  if (!item) notFound();

  return <TestimonialForm item={item as Testimonial} />;
}
