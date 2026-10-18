import { redirect } from "next/navigation";

// Portfólio moved onto the Consultoria page as one of its four tabs, instead
// of its own sidebar entry — this keeps the old URL (any bookmark, external
// link) working by landing on that tab directly.
export default function PortfolioAdminPage() {
  redirect("/admin/consultoria?tab=portfolio");
}
