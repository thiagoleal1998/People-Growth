import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui";
import { NewsletterClient } from "./NewsletterClient";
import type { NewsletterSub } from "@/types/database.types";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function NewsletterPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("newsletter_subs").select("*").order("subscribed_at", { ascending: false });
  const subs = (data ?? []) as NewsletterSub[];

  return (
    <div>
      <PageHeader title="Newsletter" subtitle={`${subs.length} inscrito${subs.length === 1 ? "" : "s"}`} />
      <NewsletterClient subs={subs} />
    </div>
  );
}
