import type { Metadata } from "next";

// Only reached by an unauthenticated visitor (a real logged-in person
// redirects straight to their own panel from page.tsx, never rendering
// this) — chiefly link-preview crawlers (WhatsApp, Slack, etc.), which
// never send the session cookie. The page's own generateMetadata fills
// in the task-specific title/description; this is just the fallback and
// the <html>/<body> this route needs (the real root layout, src/app/
// layout.tsx, is just `return children`, same reasoning as admin/equipe/
// colunista each owning their own here).
export const metadata: Metadata = {
  title: "Tarefa | Grupo Festina",
  robots: { index: false, follow: false },
};

export default function TarefasLinkLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>{children}</body>
    </html>
  );
}
