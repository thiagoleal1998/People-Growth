import { redirect } from "next/navigation";

// SEO, GEO & AEO moved onto the Configurações page as one of its tabs,
// instead of its own sidebar entry — this keeps the old URL (any bookmark,
// external link) working by landing on that tab directly.
export default function SeoAdminPage() {
  redirect("/admin/configuracoes?tab=seo");
}
