import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).from("site_config").select("value").eq("key", "favicon_url").single();
  const faviconUrl = data?.value as string | undefined;

  return {
    title: { default: "Painel do Autor | People & Growth", template: "%s | Painel do Autor" },
    robots: { index: false, follow: false },
    icons: faviconUrl ? { icon: faviconUrl } : undefined,
  };
}

export default function AuthorRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" data-scroll-behavior="smooth">
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
