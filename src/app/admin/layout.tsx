import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: { default: "Admin | People & Growth", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", backgroundColor: "#f0f4f8" }}>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <AdminSidebar />
          <main style={{ flex: 1, padding: "2rem", overflow: "auto" }}>{children}</main>
        </div>
      </body>
    </html>
  );
}
