"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { logActivity } from "@/lib/activity-log";

export async function createUser(formData: FormData) {
  const actor = await getCurrentProfile();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = (String(formData.get("role") ?? "author")) as "admin" | "author";
  const authorId = String(formData.get("author_id") ?? "") || null;

  if (!email || !password) {
    redirect(`/admin/usuarios?userError=${encodeURIComponent("E-mail e senha são obrigatórios.")}`);
  }
  if (password.length < 6) {
    redirect(`/admin/usuarios?userError=${encodeURIComponent("A senha precisa ter pelo menos 6 caracteres.")}`);
  }

  const admin = await createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data.user) {
    redirect(`/admin/usuarios?userError=${encodeURIComponent(error?.message ?? "Erro ao criar usuário.")}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = admin as any;
  await client.from("user_profiles").insert({ id: data.user!.id, email, role, author_id: authorId });

  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: "create", entityType: "usuário", entityLabel: email });
  }

  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios?saved=1");
}

export async function updateUserRole(id: string, role: "admin" | "author") {
  const actor = await getCurrentProfile();
  const admin = await createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = admin as any;
  const { data: target } = await client.from("user_profiles").select("email").eq("id", id).single();
  await client.from("user_profiles").update({ role }).eq("id", id);
  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: "update", entityType: "usuário", entityLabel: `${target?.email} → papel: ${role}` });
  }
  revalidatePath("/admin/usuarios");
}

export async function updateUserAuthorLink(id: string, authorId: string | null) {
  const admin = await createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any).from("user_profiles").update({ author_id: authorId }).eq("id", id);
  revalidatePath("/admin/usuarios");
}

export async function deleteUser(id: string) {
  const actor = await getCurrentProfile();
  const admin = await createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = admin as any;
  const { data: target } = await client.from("user_profiles").select("email").eq("id", id).single();
  await admin.auth.admin.deleteUser(id);
  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: "delete", entityType: "usuário", entityLabel: target?.email });
  }
  revalidatePath("/admin/usuarios");
}

export async function resetUserPassword(userId: string, newPassword: string, requestId: string | null) {
  if (newPassword.length < 6) {
    throw new Error("A senha precisa ter pelo menos 6 caracteres.");
  }

  const actor = await getCurrentProfile();
  const admin = await createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = admin as any;
  const { data: target } = await client.from("user_profiles").select("email").eq("id", userId).single();
  const { error } = await admin.auth.admin.updateUserById(userId, { password: newPassword });
  if (error) throw error;

  if (requestId) {
    await client
      .from("password_reset_requests")
      .update({ status: "resolved", resolved_at: new Date().toISOString() })
      .eq("id", requestId);
  }

  if (actor) {
    await logActivity({ userId: actor.id, userEmail: actor.email, action: "update", entityType: "usuário", entityLabel: `Senha redefinida: ${target?.email}` });
  }

  revalidatePath("/admin/usuarios");
}

export async function dismissPasswordResetRequest(requestId: string) {
  const admin = await createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any)
    .from("password_reset_requests")
    .update({ status: "resolved", resolved_at: new Date().toISOString() })
    .eq("id", requestId);
  revalidatePath("/admin/usuarios");
}
