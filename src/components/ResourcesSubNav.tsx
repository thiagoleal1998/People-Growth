import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

// Shown at the top of both the Recursos listing and the Diagnóstico de
// Liderança tool page. Only one tab now — "Diagnósticos de liderança"
// was removed because it pointed to the exact same page as the "Ferramenta
// Interativa" card already in the resources grid below, so the two links
// led somewhere identical; this one tab doubles as a "back to all
// resources" link when standing on the tool page itself.
export async function ResourcesSubNav({ active }: { active: "all" | "tool" }) {
  const t = await getTranslations("resources");
  const tabs = [{ key: "all" as const, href: "/recursos" as const, label: t("allResources") }];

  return (
    <div style={{ display: "flex", gap: "0.625rem", marginBottom: "2rem", flexWrap: "wrap" }}>
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            style={{
              padding: "0.5rem 1.125rem",
              borderRadius: "9999px",
              fontSize: "0.875rem",
              fontWeight: 700,
              textDecoration: "none",
              border: isActive ? "none" : "1px solid var(--site-border-strong)",
              backgroundColor: isActive ? "#315E9C" : "transparent",
              color: isActive ? "white" : "var(--site-muted)",
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
