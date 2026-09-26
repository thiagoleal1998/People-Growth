import Link from "next/link";

// Same tab split as the public Recursos section
// (src/components/ResourcesSubNav.tsx), mirrored here for the admin CRUD:
// the diagnostic tool's submissions live under their own list instead of
// being just another row in the resources table.
export function ResourcesSubNav({ active }: { active: "all" | "tool" }) {
  const tabs = [
    { key: "all" as const, href: "/admin/recursos", label: "Todos os recursos" },
    { key: "tool" as const, href: "/admin/diagnosticos", label: "Diagnósticos de liderança" },
  ];

  return (
    <div style={{ display: "flex", gap: "0.625rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
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
              border: isActive ? "none" : "1px solid var(--admin-border-strong)",
              backgroundColor: isActive ? "#4361EE" : "transparent",
              color: isActive ? "white" : "var(--admin-muted)",
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
