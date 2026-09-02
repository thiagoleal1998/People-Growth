import { AuthorSidebar } from "@/components/autor/AuthorSidebar";

export default function AuthorDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AuthorSidebar />
      <main style={{ flex: 1, padding: "2rem", overflow: "auto" }}>{children}</main>
    </div>
  );
}
