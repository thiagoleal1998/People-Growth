import { PanelDashboardLayout } from "@/components/colunista/PanelDashboardLayout";

export default async function EquipeDashboardLayout({ children }: { children: React.ReactNode }) {
  return <PanelDashboardLayout panel="equipe">{children}</PanelDashboardLayout>;
}
