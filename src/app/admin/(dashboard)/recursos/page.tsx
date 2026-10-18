import { redirect } from "next/navigation";

// Recursos moved onto the Consultoria page as one of its four tabs, instead
// of its own sidebar entry — this keeps the old URL (any bookmark, external
// link) working by landing on that tab directly.
export default function RecursosAdminPage() {
  redirect("/admin/consultoria?tab=recursos");
}
