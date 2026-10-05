import { UF_OPTIONS } from "@/lib/tse";

// A state picker that opens as a styled list of links, instead of the browser's own
// dropdown. Choosing a state reloads the page for that state. Native <details>, so it
// needs no JavaScript and works the same on phones.
export function StateMenu({ cargo, uf }: { cargo: string; uf: string }) {
  const current = UF_OPTIONS.find((option) => option.code === uf)?.name ?? "";
  return (
    <details className="state-menu" style={{ position: "relative", display: "inline-block" }}>
      <summary
        style={{
          listStyle: "none",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.5rem 0.875rem",
          borderRadius: "9999px",
          border: "1px solid var(--site-border-strong)",
          backgroundColor: "var(--site-card)",
          color: "var(--site-text)",
          fontWeight: 700,
          fontSize: "0.875rem",
          boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
          userSelect: "none",
        }}
      >
        <span style={{ color: "var(--site-muted)", fontWeight: 600 }}>Estado</span>
        {current}
        <span className="state-menu-chevron" aria-hidden style={{ display: "inline-block", transition: "transform 150ms", color: "#4361EE" }}>
          ▾
        </span>
      </summary>
      <div
        style={{
          position: "absolute",
          top: "calc(100% + 0.375rem)",
          left: 0,
          zIndex: 50,
          width: "220px",
          maxHeight: "320px",
          overflowY: "auto",
          padding: "0.375rem",
          borderRadius: "0.75rem",
          border: "1px solid var(--site-border-strong)",
          backgroundColor: "var(--site-card)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
        }}
      >
        {UF_OPTIONS.map((option) => (
          <a
            key={option.code}
            href={`?cargo=${cargo}&uf=${option.code}`}
            aria-current={option.code === uf ? "true" : undefined}
            style={{
              display: "block",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: option.code === uf ? 800 : 500,
              color: option.code === uf ? "#4361EE" : "var(--site-text-secondary)",
              backgroundColor: option.code === uf ? "rgba(67,97,238,0.08)" : "transparent",
            }}
          >
            {option.name}
          </a>
        ))}
      </div>
      <style>{`
        .state-menu > summary::-webkit-details-marker { display: none; }
        .state-menu[open] .state-menu-chevron { transform: rotate(180deg); }
      `}</style>
    </details>
  );
}
