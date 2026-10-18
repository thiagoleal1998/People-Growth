import { redirect } from "next/navigation";

// Autores moved onto the Usuários page as its second tab, instead of its
// own sidebar entry — this keeps the old URL (any bookmark, external link)
// working by landing on that tab directly.
export default function AutoresAdminPage() {
  redirect("/admin/usuarios?tab=autores");
}
