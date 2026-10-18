import { redirect } from "next/navigation";

// Comentários moved onto the Artigos page as a second tab, instead of its
// own sidebar entry — this keeps the old URL (any bookmark, external link)
// working by landing on that tab directly.
export default function ComentariosAdminPage() {
  redirect("/admin/artigos?tab=comentarios");
}
