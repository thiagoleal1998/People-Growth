import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin | People & Growth", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", backgroundColor: "#f0f4f8" }}>
        {children}
      </body>
    </html>
  );
}
