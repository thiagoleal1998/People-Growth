import { PanelDashboardLayout } from "@/components/colunista/PanelDashboardLayout";

export default async function ColumnistDashboardLayout({ children }: { children: React.ReactNode }) {
  return <PanelDashboardLayout panel="colunista">{children}</PanelDashboardLayout>;
}
