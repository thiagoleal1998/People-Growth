import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./LoginForm";

export default async function AdminLoginPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("site_config").select("value").eq("key", "logo_url").maybeSingle();
  const logoUrl = data?.value as string | undefined;

  return <LoginForm logoUrl={logoUrl} />;
}
