import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

// Tab-style sub-navigation shown at the top of both the Recursos listing
// and the Diagnóstico de Liderança tool page, so visitors can move between
// them without going back through the main nav.
export async function ResourcesSubNav({ active }: { active: "all" | "tool" }) {
  const t = await getTranslations("resources");
  const tabs = [
    { key: "all" as const, href: "/recursos" as const, label: t("allResources") },
    { key: "tool" as const, href: "/recursos/diagnostico-lideranca" as const, label: t("leadershipToolNav") },
  ];

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
              backgroundColor: isActive ? "#4361EE" : "transparent",
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
