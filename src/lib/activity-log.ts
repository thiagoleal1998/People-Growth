import { createAdminClient } from "@/lib/supabase/server";

export type ActivityAction = "create" | "update" | "delete" | "publish" | "login" | "logout";

/** Best-effort audit trail write — never let a logging failure break the
 * action it's describing. Called from server actions/routes right after
 * the real write succeeds, using getCurrentProfile()'s id/email. */
export async function logActivity(params: {
  userId: string | null;
  userEmail: string;
  action: ActivityAction;
  entityType: string;
  entityLabel?: string | null;
}): Promise<void> {
  try {
    const admin = await createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from("activity_log").insert({
      user_id: params.userId,
      user_email: params.userEmail,
      action: params.action,
      entity_type: params.entityType,
      entity_label: params.entityLabel?.slice(0, 300) ?? null,
    });
  } catch (err) {
    console.error("Activity log write failed:", err);
  }
}
