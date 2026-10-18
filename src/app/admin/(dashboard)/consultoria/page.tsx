import { createClient } from "@/lib/supabase/server";
import { SavedToast } from "@/components/admin/SavedToast";
import { ConsultoriaTabs } from "./ConsultoriaTabs";
import type { Service, PortfolioCase, Course, Resource } from "@/types/database.types";

export default async function ConsultoriaAdminPage({ searchParams }: { searchParams: Promise<{ saved?: string; tab?: string }> }) {
  const { saved, tab } = await searchParams;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const [{ data: servicesData }, { data: portfolioData }, { data: coursesData }, { data: resourcesData }] = await Promise.all([
    client.from("services").select("*").order("order"),
    client.from("portfolio_cases").select("*").order("order"),
    client.from("courses").select("*").order("order"),
    client.from("resources").select("*").order("created_at", { ascending: false }),
  ]);

  return (
    <div>
      <SavedToast show={saved === "1"} />
      <ConsultoriaTabs
        services={(servicesData ?? []) as Service[]}
        portfolioCases={(portfolioData ?? []) as PortfolioCase[]}
        courses={(coursesData ?? []) as Course[]}
        resources={(resourcesData ?? []) as Resource[]}
        initialTab={tab}
      />
    </div>
  );
}
