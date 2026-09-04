import { createAdminClient } from "@/lib/supabase/server";

export type ActivityAction = "create" | "update" | "delete" | "publish" | "login" | "logout";

export type FieldChange = { field: string; before: string; after: string };

/** Best-effort audit trail write — never let a logging failure break the
 * action it's describing. Called from server actions/routes right after
 * the real write succeeds, using getCurrentProfile()'s id/email. */
export async function logActivity(params: {
  userId: string | null;
  userEmail: string;
  action: ActivityAction;
  entityType: string;
  entityLabel?: string | null;
  details?: FieldChange[];
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
      details: params.details && params.details.length > 0 ? params.details : null,
    });
  } catch (err) {
    console.error("Activity log write failed:", err);
  }
}

export const ARTICLE_TRACKED_FIELDS: { key: string; label: string }[] = [
  { key: "title_pt", label: "Título (PT)" },
  { key: "title_en", label: "Título (EN)" },
  { key: "slug", label: "Slug" },
  { key: "excerpt_pt", label: "Linha fina (PT)" },
  { key: "excerpt_en", label: "Linha fina (EN)" },
  { key: "summary_pt", label: "Resumo (PT)" },
  { key: "summary_en", label: "Resumo (EN)" },
  { key: "content_pt", label: "Conteúdo (PT)" },
  { key: "content_en", label: "Conteúdo (EN)" },
  { key: "video_url", label: "Vídeo" },
  { key: "cover_image_caption", label: "Legenda da imagem" },
  { key: "cover_image_credit", label: "Crédito da imagem" },
  { key: "status", label: "Status" },
  { key: "format", label: "Tipo de conteúdo" },
];

/** Compares the tracked fields of an old row against a new payload and
 * returns only the ones that actually changed — the raw material for
 * showing "exactly what was edited" instead of just "something changed". */
export function diffFields(
  before: Record<string, unknown> | null | undefined,
  after: Record<string, unknown>,
  fields: { key: string; label: string }[]
): FieldChange[] {
  if (!before) return [];
  const changes: FieldChange[] = [];
  for (const { key, label } of fields) {
    const beforeValue = before[key];
    const afterValue = after[key];
    const beforeStr = beforeValue == null ? "" : String(beforeValue);
    const afterStr = afterValue == null ? "" : String(afterValue);
    if (beforeStr !== afterStr) {
      changes.push({ field: label, before: beforeStr, after: afterStr });
    }
  }
  return changes;
}
