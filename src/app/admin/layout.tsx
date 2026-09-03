import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import { createClient } from "@/lib/supabase/server";
import "../globals.css";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const THEME_SCRIPT = `
(function () {
  try {
    var theme = localStorage.getItem("admin-theme");
    if (theme === "dark") document.documentElement.setAttribute("data-theme", "dark");
  } catch (e) {}
})();
`;

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("site_config").select("value").eq("key", "favicon_url").single();
  const faviconUrl = data?.value as string | undefined;

  return {
    title: { default: "Admin | People & Growth", template: "%s | Admin" },
    robots: { index: false, follow: false },
    icons: faviconUrl ? { icon: faviconUrl } : undefined,
  };
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", backgroundColor: "var(--admin-bg)", color: "var(--admin-text)" }}>
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
