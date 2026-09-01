import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: { default: "Admin | People & Growth", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", backgroundColor: "#f0f4f8" }}>
        <NextTopLoader color="#4361EE" height={3} showSpinner={false} />
        {children}
        <style>{`
          @keyframes admin-spin { to { transform: rotate(360deg); } }
          .admin-spin { animation: admin-spin 0.7s linear infinite; }
        `}</style>
      </body>
    </html>
  );
}
