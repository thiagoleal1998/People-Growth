import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./LoginForm";
import type { Author } from "@/types/database.types";

export default async function AdminLoginPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const [{ data: configData }, { data: authorsData }] = await Promise.all([
    client.from("site_config").select("value").eq("key", "logo_url").maybeSingle(),
    client.from("authors").select("*").eq("status", "active").order("order"),
  ]);

  const logoUrl = configData?.value as string | undefined;
  // Only the founders are shown on the login panel, matching the home page.
  const authors = ((authorsData ?? []) as Author[]).filter((author) => author.is_founder);

  return <LoginForm logoUrl={logoUrl} authors={authors} />;
}
