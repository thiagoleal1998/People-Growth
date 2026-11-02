import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./LoginForm";
import type { Columnist } from "@/types/database.types";

export default async function AdminLoginPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const [{ data: configData }, { data: columnistsData }] = await Promise.all([
    client.from("site_config").select("value").eq("key", "logo_url").maybeSingle(),
    client.from("columnists").select("*").eq("status", "active").order("order"),
  ]);

  const logoUrl = configData?.value as string | undefined;
  // Only the founders are shown on the login panel, matching the home page.
  const columnists = ((columnistsData ?? []) as Columnist[]).filter((columnist) => columnist.is_founder);

  return <LoginForm logoUrl={logoUrl} columnists={columnists} />;
}
